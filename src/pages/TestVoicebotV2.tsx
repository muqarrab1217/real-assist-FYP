import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, Square } from "lucide-react";
import { speakWithUplift, stopUpliftTTS } from "@/services/ttsService";

// Helper to determine the backend URL
const getApiBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/$/, "");
  }
  return "";
};
const API_BASE_URL = getApiBaseUrl();

// ── Status type ──────────────────────────────────────────────────────────────
type Status = "idle" | "listening" | "processing" | "speaking";

export const TestVoicebotV2: React.FC = () => {
  const [transcript, setTranscript] = useState("");
  const [AIResponse, setAIResponse] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  // ── Refs (never stale inside callbacks) ──────────────────────────────────
  const statusRef = useRef<Status>("idle");          // mirrors status state, always current
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const vadActiveRef = useRef(false);               // prevents VAD from firing during grace period

  // Helper to update both the state AND the ref together
  const setStatusSync = (s: Status) => {
    statusRef.current = s;
    setStatus(s);
  };

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
    return () => {
      cleanupMic();
      stopUpliftTTS();
      window.speechSynthesis.cancel();
    };
  }, []);

  // ── Mic / VAD cleanup ────────────────────────────────────────────────────
  const cleanupMic = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    vadActiveRef.current = false;
  };

  // ── VAD loop (uses refs only — never stale) ──────────────────────────────
  const startVAD = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const tick = () => {
      // Stop loop if we left "listening" state
      if (statusRef.current !== "listening") return;

      analyserRef.current!.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      const avg = sum / dataArray.length;

      // Only act on silence if the grace period is over
      if (vadActiveRef.current) {
        if (avg < 12) {
          // Silence detected – start countdown if not already started
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              console.log("[VAD] Silence confirmed → submitting audio");
              triggerStopAndSend();
            }, 1800);
          }
        } else {
          // User is speaking – cancel any pending silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  // ── Start listening ──────────────────────────────────────────────────────
  const startListening = useCallback(async () => {
    // Guard: only start from idle or speaking state
    if (statusRef.current === "listening" || statusRef.current === "processing") return;

    try {
      setStatusSync("listening");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Build Web Audio context for VAD
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      // Set up MediaRecorder
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.start(250);

      // Grace period: activate VAD only after 1 second so the user has time to start speaking
      vadActiveRef.current = false;
      setTimeout(() => {
        if (statusRef.current === "listening") {
          vadActiveRef.current = true;
        }
      }, 1000);

      startVAD();
    } catch (err) {
      console.error("[Mic] Error:", err);
      setStatusSync("idle");
    }
  }, [startVAD]);

  // ── Stop recorder & send audio ───────────────────────────────────────────
  const triggerStopAndSend = useCallback(() => {
    // Cancel VAD loop
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      setStatusSync("idle");
      return;
    }

    setStatusSync("processing");

    recorder.onstop = async () => {
      // Stop mic tracks
      recorder.stream.getTracks().forEach((t) => t.stop());
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }

      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

      // Reject blobs that are too small (empty/noise recording)
      if (blob.size < 2000) {
        console.log("[VAD] Blob too small, restarting listening...");
        setStatusSync("idle");
        startListening();
        return;
      }

      await processAudio(blob);
    };

    recorder.stop();
  }, [startListening]);

  // ── Manual toggle button ─────────────────────────────────────────────────
  const toggleListening = () => {
    if (statusRef.current === "listening") {
      triggerStopAndSend();
    } else if (statusRef.current === "idle") {
      startListening();
    }
  };

  // ── Send audio to backend ─────────────────────────────────────────────────
  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "record.webm");

      const url = API_BASE_URL
        ? `${API_BASE_URL}/api/gemini/audio-query`
        : "/api/gemini/audio-query";

      const res = await fetch(url, { method: "POST", body: formData });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      const userTranscript = data.transcript || "Could not transcribe.";
      const botDisplay = data.display_text || "No response.";
      const botSpeak = data.speak_text || botDisplay;

      // Update conversation on screen
      setTranscript(userTranscript);
      setAIResponse(botDisplay);

      // Speak the response, then auto-resume listening
      await speak(botSpeak);
    } catch (err: any) {
      console.error("[processAudio]", err);
      setTranscript(`Error: ${err.message}`);
      setStatusSync("idle");
    }
  };

  // ── TTS: Uplift → Browser fallback, then auto-resume listening ──────────
  const speak = async (text: string) => {
    setStatusSync("speaking");

    const isUrdu = /[\u0600-\u06FF]/.test(text);
    const upliftKey = (import.meta as any).env?.VITE_UPLIFT_API_KEY || "";
    const urduVoiceId = (import.meta as any).env?.VITE_UPLIFT_VOICE_UR || "v_8eelc901";
    const enVoiceId = (import.meta as any).env?.VITE_UPLIFT_VOICE_EN || "v_8eelc901";

    const resumeListening = () => {
      // Small buffer so the mic doesn't catch the last millisecond of audio
      setTimeout(() => startListening(), 500);
    };

    if (upliftKey) {
      try {
        await speakWithUplift(text, isUrdu ? urduVoiceId : enVoiceId, upliftKey);
        console.log("[TTS] Uplift done → resuming listening");
        resumeListening();
        return;
      } catch (e) {
        console.warn("[TTS] Uplift failed, falling back to browser TTS", e);
      }
    }

    // ── Browser TTS Fallback ─────────────────────────────────────────────
    if (!("speechSynthesis" in window)) {
      resumeListening();
      return;
    }

    window.speechSynthesis.cancel();
    const clean = text.replace(/\*\*/g, "").replace(/\*/g, "");
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    let voice = isUrdu
      ? voices.find((v) => v.lang.includes("ur") || v.lang.includes("ar"))
      : null;

    if (!voice) {
      voice =
        voices.find((v) => v.name.includes("Google") && v.lang.includes("en")) ||
        voices.find((v) => v.lang.includes("en-US")) ||
        voices[0];
    }

    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    }

    utter.onend = () => {
      console.log("[TTS] Browser TTS done → resuming listening");
      resumeListening();
    };

    utter.onerror = () => {
      console.warn("[TTS] Browser TTS error → resuming listening");
      resumeListening();
    };

    window.speechSynthesis.speak(utter);
  };

  // ── UI ───────────────────────────────────────────────────────────────────
  const statusLabel: Record<Status, string> = {
    idle: "Tap the microphone to start.",
    listening: "Listening… (speak now)",
    processing: "Thinking…",
    speaking: "Speaking…",
  };

  const buttonStyle: Record<Status, string> = {
    idle: "bg-gradient-to-tr from-[#00ffff] to-[#008080] shadow-cyan-600/20",
    listening: "bg-red-500 shadow-red-500/50 animate-pulse",
    processing: "bg-cyan-600 shadow-cyan-600/50 opacity-50 cursor-wait",
    speaking: "bg-green-500 shadow-green-500/40 opacity-70 cursor-wait",
  };

  const labelColor: Record<Status, string> = {
    idle: "text-zinc-500",
    listening: "text-red-400 animate-pulse",
    processing: "text-cyan-400 animate-pulse",
    speaking: "text-green-400 animate-pulse",
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white pt-20">
      <div className="max-w-xl w-full flex flex-col items-center space-y-8 bg-zinc-900 border border-zinc-800 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent pointer-events-none" />

        <h1 className="text-3xl font-light text-center tracking-wide" style={{ color: "#00ffff" }}>
          Voice Assistant V2
        </h1>
        <p className="text-zinc-400 text-center text-sm">
          Gemini AI · Uplift TTS · Hands-free conversation
        </p>

        {/* Mic button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleListening}
          disabled={status === "processing" || status === "speaking"}
          className={`h-32 w-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl z-10 ${buttonStyle[status]}`}
        >
          {status === "listening" ? (
            <Square className="h-12 w-12 text-white fill-current" />
          ) : (
            <Mic className={`h-12 w-12 ${status === "idle" ? "text-black" : "text-white"}`} />
          )}
        </motion.button>

        {/* Status label */}
        <div className="text-center min-h-[24px]">
          <p className={`text-sm transition-colors duration-300 ${labelColor[status]}`}>
            {statusLabel[status]}
          </p>
        </div>

        {/* Conversation display */}
        {(transcript || AIResponse) && (
          <div className="w-full bg-black/50 rounded-xl p-6 border border-zinc-800 space-y-4">
            {transcript && (
              <div className="w-full">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                  You said:
                </span>
                <p className="text-zinc-200 mt-1">{transcript}</p>
              </div>
            )}
            {AIResponse && (
              <div className="w-full pt-4 border-t border-zinc-800">
                <span className="text-xs text-[#00ffff] uppercase tracking-wider font-semibold">
                  Agent replied:
                </span>
                <p className="text-zinc-200 mt-1 whitespace-pre-wrap">{AIResponse}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

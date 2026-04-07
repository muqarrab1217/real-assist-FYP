import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Square } from "lucide-react";
import { speakWithUplift, stopUpliftTTS } from "@/services/ttsService";

const getApiBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== "") return envUrl.trim().replace(/\/$/, "");
  return "";
};
const API_BASE_URL = getApiBaseUrl();

export const TestVoicebotV2Manual: React.FC = () => {
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<"idle" | "listening" | "processing">("idle");
  const [AIResponse, setAIResponse] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
    return () => {
      stopRecordingTracks();
      stopUpliftTTS();
      window.speechSynthesis.cancel();
    };
  }, []);

  const stopRecordingTracks = () => {
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
  };

  const startListening = async () => {
    try {
      setTranscript("");
      setAIResponse("");
      setStatus("listening");
      stopUpliftTTS();
      window.speechSynthesis.cancel();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.start(250);
    } catch (err) {
      console.error("[Mic] Error:", err);
      setStatus("idle");
      setTranscript("Microphone access denied or error occurred.");
    }
  };

  const stopListening = () => {
    setStatus("processing");
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      setStatus("idle");
      return;
    }

    recorder.onstop = async () => {
      stopRecordingTracks();
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      if (blob.size < 4000) {
        setStatus("idle");
        setTranscript("Recording too short. Please speak louder and longer.");
        return;
      }
      await processAudio(blob);
    };

    recorder.stop();
  };

  const toggleListening = () => {
    if (status === "listening") stopListening();
    else if (status === "idle") startListening();
  };

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

      setTranscript(userTranscript);
      setAIResponse(botDisplay);

      speak(botSpeak);
    } catch (err: any) {
      console.error("[processAudio]", err);
      setTranscript(`Error: ${err.message}`);
    } finally {
      setStatus("idle");
    }
  };

  const speak = async (text: string) => {
    const isUrdu = /[\u0600-\u06FF]/.test(text);
    const upliftKey = (import.meta as any).env?.VITE_UPLIFT_API_KEY || "";
    const urduVoiceId = (import.meta as any).env?.VITE_UPLIFT_VOICE_UR || "v_8eelc901";
    const enVoiceId = (import.meta as any).env?.VITE_UPLIFT_VOICE_EN || "v_8eelc901";

    if (upliftKey) {
      try {
        await speakWithUplift(text, isUrdu ? urduVoiceId : enVoiceId, upliftKey);
        console.log("[TTS] Uplift done");
        return;
      } catch (e) {
        console.warn("[TTS] Uplift failed, falling back to browser TTS", e);
      }
    }

    if (!("speechSynthesis" in window)) return;
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
    if (voice) { utter.voice = voice; utter.lang = voice.lang; }

    console.log("[TTS] Browser TTS (Voice: " + (voice?.name || "default") + ")");
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white pt-20">
      <div className="max-w-xl w-full flex flex-col items-center space-y-8 bg-zinc-900 border border-zinc-800 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-transparent pointer-events-none" />

        <h1 className="text-3xl font-light text-center tracking-wide" style={{ color: "#a78bfa" }}>
          Voice Assistant V2.0
        </h1>
        <p className="text-zinc-400 text-center text-sm">
          Gemini AI · Uplift TTS · Manual push-to-talk
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleListening}
          disabled={status === "processing"}
          className={`h-32 w-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl z-10 ${
            status === "listening"
              ? "bg-red-500 shadow-red-500/50 animate-pulse"
              : status === "processing"
              ? "bg-violet-600 shadow-violet-600/50 opacity-50 cursor-wait"
              : "bg-gradient-to-tr from-[#a78bfa] to-[#7c3aed] shadow-violet-600/20"
          }`}
        >
          {status === "listening" ? (
            <Square className="h-12 w-12 text-white fill-current" />
          ) : (
            <Mic className={`h-12 w-12 ${status === "processing" ? "text-white" : "text-white"}`} />
          )}
        </motion.button>

        <div className="text-center min-h-[24px]">
          {status === "listening" && (
            <p className="text-red-400 animate-pulse">
              Recording… tap the button to stop and send.
            </p>
          )}
          {status === "processing" && (
            <p className="text-violet-400 animate-pulse">Thinking…</p>
          )}
          {status === "idle" && (
            <p className="text-zinc-500">Tap the microphone to start recording.</p>
          )}
        </div>

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
                <span className="text-xs text-[#a78bfa] uppercase tracking-wider font-semibold">
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

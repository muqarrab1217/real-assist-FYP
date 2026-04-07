import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper to determine the backend URL
const getApiBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/$/, "");
  }
  return "";
};
const API_BASE_URL = getApiBaseUrl();

export const TestVoicebot: React.FC = () => {
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<"idle" | "listening" | "processing">("idle");
  const [AIResponse, setAIResponse] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      stopRecordingTracks();
      window.speechSynthesis.cancel();
    };
  }, []);

  const stopRecordingTracks = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
  };

  const startListening = async () => {
    try {
      setTranscript("");
      setAIResponse("");
      setStatus("listening");
      window.speechSynthesis.cancel();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // timeslice captures chunks every 250ms natively
      mediaRecorder.start(250); 
    } catch (err) {
      console.error("Mic error:", err);
      setStatus("idle");
      setTranscript("Microphone access denied or error occurred.");
    }
  };

  const stopListening = () => {
    setStatus("processing");
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = async () => {
        stopRecordingTracks();

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        
        // Under ~5000 bytes usually means it recorded empty metadata and virtually 0 frames.
        // Whisper hallucinates "Thank you" when given empty audio.
        if (audioBlob.size < 4000) {
          setStatus("idle");
          setTranscript("Recording too short. Please speak louder and longer.");
          return;
        }

        await processAudio(audioBlob);
      };

      mediaRecorderRef.current.stop();
    } else {
      setStatus("idle");
    }
  };

  const toggleListening = () => {
    if (status === "listening") {
      stopListening();
    } else {
      startListening();
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "record.webm");

      const sttUrl = API_BASE_URL ? `${API_BASE_URL}/api/groq/stt` : "/api/groq/stt";
      const sttRes = await fetch(sttUrl, { method: "POST", body: formData });

      if (!sttRes.ok) {
        const errData = await sttRes.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${sttRes.status}`);
      }

      const sttData = await sttRes.json();
      const transcribedText = sttData.text;
      setTranscript(transcribedText);

      await submitToGemini(transcribedText);
    } catch (err: any) {
      console.error(err);
      setTranscript(`Error transcribing audio: ${err.message}`);
      setStatus("idle");
    }
  };

  const submitToGemini = async (text: string) => {
    if (!text || !text.trim()) {
      setStatus("idle");
      return;
    }
    try {
      const url = API_BASE_URL ? `${API_BASE_URL}/api/gemini/query` : "/api/gemini/query";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) throw new Error("Failed to reach backend");
      const data = await response.json();
      const botText = data.response;

      setAIResponse(botText);
      playTTS(botText);
    } catch (err) {
      console.error(err);
      setAIResponse("Sorry, an error occurred while connecting to the AI.");
    } finally {
      setStatus("idle");
    }
  };

  const playTTS = (text: string) => {
    // Basic clean up of markdown symbols (like **, *, etc) before talking
    const cleanText = text.replace(/\\*\\*/g, "").replace(/\\*/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.rate = 1.0;

    // Optional: try to find a nice female voice like standard Google standard
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((v) => v.name.includes("Female") || v.name.includes("Google UK English Female") || v.name.includes("Google US English"));
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white pt-20">
      <div className="max-w-xl w-full flex flex-col items-center space-y-8 bg-zinc-900 border border-zinc-800 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Aesthetic Glow Background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 to-transparent pointer-events-none" />

        <h1 className="text-3xl font-light text-center tracking-wide" style={{ color: "#d4af37" }}>
          Voice Assistant
        </h1>
        <p className="text-zinc-400 text-center text-sm">A completely sandboxed Speech-to-Text and Text-to-Speech implementation.</p>

        {/* The Giant Microphone Button */}
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleListening} className={`h-32 w-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl z-10 ${status === "listening" ? "bg-red-500 shadow-red-500/50 animate-pulse" : status === "processing" ? "bg-yellow-600 shadow-yellow-600/50 opacity-50 cursor-wait" : "bg-gradient-to-tr from-[#d4af37] to-[#f4e68c] shadow-yellow-600/20"}`} disabled={status === "processing"}>
          {status === "listening" ? <Square className="h-12 w-12 text-white fill-current" /> : <Mic className={`h-12 w-12 ${status === "processing" ? "text-white" : "text-black"}`} />}
        </motion.button>

        {/* Status Text Component */}
        <div className="text-center min-h-[24px]">
          {status === "listening" && <p className="text-red-400 animate-pulse">Listening... (Speak now)</p>}
          {status === "processing" && <p className="text-yellow-400 animate-pulse">Thinking... (Asking Gemini)</p>}
          {status === "idle" && <p className="text-zinc-500">Tap the microphone to start.</p>}
        </div>

        {/* Live Subtitle Transcripts Box */}
        {(transcript || AIResponse) && (
          <div className="w-full bg-black/50 rounded-xl p-6 border border-zinc-800 space-y-4">
            {transcript && (
              <div className="w-full">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">You said:</span>
                <p className="text-zinc-200 mt-1">{transcript}</p>
              </div>
            )}

            {AIResponse && (
              <div className="w-full pt-4 border-t border-zinc-800">
                <span className="text-xs text-[#d4af37] uppercase tracking-wider font-semibold">Agent replied:</span>
                <p className="text-zinc-200 mt-1 whitespace-pre-wrap">{AIResponse}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

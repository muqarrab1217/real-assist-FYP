import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, MicrophoneIcon, StopIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { speakWithUplift, stopUpliftTTS } from "@/services/ttsService";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

type VoiceStatus = "idle" | "listening" | "processing" | "speaking";

const STORAGE_KEY = "rag-chat-sessions";

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  text: "Hello! I'm your AI assistant. How can I help you with your real estate investment today?",
  isUser: false,
  timestamp: new Date(),
};

const getApiBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/$/, "");
  }
  return "";
};

const API_BASE_URL = getApiBaseUrl();

export const RagChatbot: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ── Voice State (Semi-Manual Mode) ──────────────────────────────────────
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Voice Refs ──────────────────────────────────────────────────────────
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, voiceStatus]);

  // Initial Load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: ChatSession[] = JSON.parse(raw);
        setSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
          setMessages(parsed[0].messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })));
          return;
        }
      }
    } catch (err) {
      console.error("Failed to load chat sessions", err);
    }
    createNewSession();
  }, []);

  // Sync state to local storage when sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    return () => {
      cleanupVoice();
    };
  }, []);

  const cleanupVoice = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    stopUpliftTTS();
    window.speechSynthesis.cancel();
    setVoiceStatus("idle");
  };

  const createNewSession = () => {
    if (!isAuthenticated && sessions.length > 0) return null;
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: "New chat",
      messages: [INITIAL_MESSAGE],
      updatedAt: new Date().toISOString(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setMessages(newSession.messages);
    return newId;
  };

  const updateActiveSession = useCallback(
    (updatedMessages: Message[]) => {
      if (!activeSessionId) return;
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: updatedMessages,
                title: s.title === "New chat" && updatedMessages.length > 1 ? updatedMessages.find((m) => m.isUser)?.text.slice(0, 40) || "New chat" : s.title,
                updatedAt: new Date().toISOString(),
              }
            : s,
        ),
      );
      setMessages(updatedMessages);
    },
    [activeSessionId],
  );

  // ── Voice Implementation (Semi-Manual) ──────────────────────────────────

  const startVoiceRecording = async () => {
    if (voiceStatus !== "idle") return;
    try {
      setVoiceStatus("listening");
      stopUpliftTTS();
      window.speechSynthesis.cancel();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      // Better compatibility for MIME types
      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/mp4"; // iOS Fallback
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start(250);

      const checkWave = () => {
        if (voiceStatus === "listening") {
          animFrameRef.current = requestAnimationFrame(checkWave);
        }
      };
      animFrameRef.current = requestAnimationFrame(checkWave);
    } catch (err) {
      console.error("Voice init error:", err);
      setVoiceStatus("idle");
    }
  };

  const stopVoiceAndProcess = () => {
    if (voiceStatus !== "listening") return;
    setVoiceStatus("processing");

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = async () => {
        recorder.stream.getTracks().forEach((t) => t.stop());
        if (audioCtxRef.current) {
          audioCtxRef.current.close().catch(() => {});
          audioCtxRef.current = null;
        }

        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
        if (blob.size < 1000) {
          // Reduced threshold for short words
          setVoiceStatus("idle");
          return;
        }
        await handleVoiceQuery(blob);
      };
      recorder.stop();
    }
  };

  const handleVoiceQuery = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "query.webm");

      const url = API_BASE_URL ? `${API_BASE_URL}/api/gemini/audio-query` : "/api/gemini/audio-query";
      const res = await fetch(url, { method: "POST", body: formData });

      if (!res.ok) throw new Error("Voice query failed. Please check server.");
      const data = await res.json();

      const userMsg: Message = { id: Date.now().toString(), text: data.transcript || "Spoken Message", isUser: true, timestamp: new Date() };
      const aiMsg: Message = { id: (Date.now() + 1).toString() + "-ai", text: data.display_text, isUser: false, timestamp: new Date() };

      const nextMessages = [...messages, userMsg, aiMsg];
      updateActiveSession(nextMessages);

      if (data.speak_text) {
        await speakVoiceResult(data.speak_text);
      } else {
        setVoiceStatus("idle");
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [...prev, { id: "err-" + Date.now(), text: "Sorry, I couldn't hear that clearly. " + err.message, isUser: false, timestamp: new Date() }]);
      setVoiceStatus("idle");
    }
  };

  const speakVoiceResult = async (text: string) => {
    setVoiceStatus("speaking");
    const isUrdu = /[\u0600-\u06FF]/.test(text);
    const apiKey = (import.meta as any).env?.VITE_UPLIFT_API_KEY;

    const finish = () => setVoiceStatus("idle");

    if (apiKey) {
      try {
        await speakWithUplift(text, isUrdu ? "v_8eelc901" : "v_8eelc901", apiKey);
        finish();
        return;
      } catch (e) {
        console.error("Uplift Failed. Using Fallback TTS.", e);
      }
    }

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text.replace(/\*/g, ""));
    utter.onend = finish;
    window.speechSynthesis.speak(utter);
  };

  const toggleVoiceMode = () => {
    if (voiceStatus === "idle") startVoiceRecording();
    else if (voiceStatus === "listening") stopVoiceAndProcess();
    else cleanupVoice();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const ensuredSessionId = activeSessionId || createNewSession();
    if (!ensuredSessionId) return;

    const userMessage: Message = { id: Date.now().toString(), text: inputValue, isUser: true, timestamp: new Date() };
    const newMessages = [...messages, userMessage];
    updateActiveSession(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const url = API_BASE_URL ? `${API_BASE_URL}/api/gemini/query` : "/api/gemini/query";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) throw new Error("Fetch failed");
      const data = await response.json();

      const aiResponse: Message = { id: (Date.now() + 1).toString() + "-ai", text: data.response, isUser: false, timestamp: new Date() };
      updateActiveSession([...newMessages, aiResponse]);
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <>
      <motion.button className="fixed bottom-6 right-6 h-14 w-14 text-black rounded-full shadow-lg z-40 flex items-center justify-center" style={{ backgroundImage: "linear-gradient(135deg, #d4af37, #f4e68c)" }} onClick={() => setIsOpen(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 w-96 h-[500px] rounded-lg shadow-2xl z-50 flex flex-col transition-all duration-500 ${voiceStatus !== "idle" ? "shadow-[0_0_35px_rgba(212,175,55,0.3)]" : ""}`}
            style={{
              background: "rgba(0, 0, 0, 0.93)",
              backdropFilter: "blur(20px)",
              border: voiceStatus !== "idle" ? "1.5px solid rgba(212, 175, 55, 0.5)" : "1px solid rgba(212, 175, 55, 0.2)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 rounded-t-lg" style={{ borderBottom: "1px solid rgba(212, 175, 55, 0.2)" }}>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundImage: "linear-gradient(135deg, #d4af37, #f4e68c)" }}>
                  <span className="text-xs font-bold" style={{ color: "#000" }}>
                    AI
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: "#d4af37" }}>
                    AI Assistant
                  </h3>
                  <div className="flex items-center space-x-1">
                    <div className={`h-1.5 w-1.5 rounded-full ${voiceStatus === "idle" ? "bg-green-500" : "bg-red-500 animate-pulse"}`} />
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{voiceStatus}</p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-zinc-400">
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[85%] px-3 py-2 rounded-lg text-sm" style={message.isUser ? { backgroundImage: "linear-gradient(135deg, #d4af37, #f4e68c)", color: "#000" } : { background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)", color: "#fff" }}>
                    {message.text}
                  </div>
                </motion.div>
              ))}
              {(isLoading || voiceStatus === "processing") && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800/50 rounded-lg p-2 flex space-x-1">
                    <motion.div animate={{ opacity: [0.1, 1, 0.1] }} transition={{ repeat: Infinity, duration: 1 }} className="h-2 w-2 rounded-full bg-[#d4af37]" />
                    <motion.div animate={{ opacity: [0.1, 1, 0.1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-2 w-2 rounded-full bg-[#d4af37]" />
                    <motion.div animate={{ opacity: [0.1, 1, 0.1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-2 w-2 rounded-full bg-[#d4af37]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Actions Bar */}
            <div className="p-4 bg-black/50" style={{ borderTop: "1px solid rgba(212, 175, 55, 0.1)" }}>
              <div className="flex items-center space-x-3">
                <AnimatePresence mode="wait">
                  {voiceStatus === "idle" ? (
                    <motion.input key="text-bar" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask about properties..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#d4af37] outline-none" />
                  ) : (
                    <motion.div key="voice-wave" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex justify-center items-center h-10 space-x-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                        <motion.div key={i} animate={{ height: voiceStatus === "listening" ? [6, 20, 6] : 4 }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }} className="w-1.5 bg-[#d4af37] rounded-full opacity-60" />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button onClick={toggleVoiceMode} size="icon" className={`h-11 w-11 rounded-full border-2 transition-transform duration-300 transform ${voiceStatus === "listening" ? "scale-110 bg-red-600 border-red-500" : "bg-transparent border-[#d4af37] text-[#d4af37] hover:scale-105"}`}>
                  {voiceStatus === "listening" ? <StopIcon className="h-6 w-6 text-white" /> : <MicrophoneIcon className="h-6 w-6" />}
                </Button>

                {voiceStatus === "idle" && (
                  <Button onClick={handleSendMessage} size="icon" disabled={!inputValue.trim() || isLoading} className="h-11 w-11 rounded-full text-black" style={{ backgroundImage: "linear-gradient(135deg, #d4af37, #f4e68c)" }}>
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

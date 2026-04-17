import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { speakWithUplift, stopUpliftTTS } from "@/services/ttsService";
import { supabase } from "@/lib/supabase";

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
  // Supabase-side chat session ID for saving messages on the backend
  const [supabaseChatId, setSupabaseChatId] = useState<string | null>(null);

  // ── Voice State ──────────────────────────────────────────────────────────
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Voice Refs ───────────────────────────────────────────────────────────
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, voiceStatus]);

  // Load sessions from localStorage on mount
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

  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      } catch (err) {
        console.error("Failed to persist sessions", err);
      }
    }
  }, [sessions]);

  // Cleanup voice on unmount
  useEffect(() => {
    return () => {
      cleanupVoice();
    };
  }, []);

  const cleanupVoice = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    stopUpliftTTS();
    window.speechSynthesis?.cancel();
    setVoiceStatus("idle");
  };

  /** Get the current Supabase access token for backend auth */
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch {
      return null;
    }
  };

  /** Create a Supabase chat session on the backend and return its ID */
  const createBackendChatSession = async (token: string): Promise<string | null> => {
    try {
      const url = API_BASE_URL ? `${API_BASE_URL}/api/chatbot/chat/create` : "/api/chatbot/chat/create";
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: "New Chat" }),
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      return data.chat?.id || null;
    } catch {
      return null;
    }
  };

  const createNewSession = () => {
    if (!isAuthenticated && sessions.length > 0) {
      return null;
    }
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New chat",
      messages: [INITIAL_MESSAGE],
      updatedAt: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setMessages(newSession.messages);
    setSupabaseChatId(null); // reset backend session for new chat
    return newSession.id;
  };

  const updateActiveSession = useCallback(
    (updatedMessages: Message[]) => {
      if (!activeSessionId) return;
      setSessions((prev) =>
        prev.map((session) =>
          session.id === activeSessionId
            ? {
                ...session,
                messages: updatedMessages,
                title:
                  session.title === "New chat" && updatedMessages.length > 1
                    ? updatedMessages.find((m) => m.isUser)?.text.slice(0, 40) || "New chat"
                    : session.title,
                updatedAt: new Date().toISOString(),
              }
            : session
        )
      );
      setMessages(updatedMessages);
    },
    [activeSessionId]
  );

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.start(100);
      setVoiceStatus("listening");
    } catch (err) {
      console.error("Mic access denied:", err);
      setVoiceStatus("idle");
    }
  };

  const stopVoiceAndProcess = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        handleVoiceQuery(blob);
      };
      mediaRecorderRef.current.stop();
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setVoiceStatus("processing");
  };

  const handleVoiceQuery = async (blob: Blob) => {
    setVoiceStatus("processing");
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const url = API_BASE_URL
        ? `${API_BASE_URL}/api/gemini/audio-query`
        : "/api/gemini/audio-query";

      // Pass auth headers if authenticated
      const fetchHeaders: Record<string, string> = {};
      let activeChatId = supabaseChatId;

      if (isAuthenticated) {
        const token = await getAuthToken();
        if (token) {
          fetchHeaders["Authorization"] = `Bearer ${token}`;
          // Reuse existing session or create one
          if (!activeChatId) {
            activeChatId = await createBackendChatSession(token);
            if (activeChatId) setSupabaseChatId(activeChatId);
          }
          if (activeChatId) formData.append("chatId", activeChatId);
        }
      }

      console.log("[VoiceBot] Sending audio to:", url);
      const response = await fetch(url, { method: "POST", headers: fetchHeaders, body: formData });
      if (!response.ok) {
        const errText = await response.text();
        console.error("[VoiceBot] API error response:", errText);
        throw new Error(`Audio query failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("[VoiceBot] Raw API response:", data);

      const { transcript, display_text, speak_text } = data;
      console.log("[VoiceBot] transcript:", transcript);
      console.log("[VoiceBot] display_text:", display_text);
      console.log("[VoiceBot] speak_text:", speak_text);

      // Detect if the response is in Urdu script
      const isUrduResponse = /[\u0600-\u06FF]/.test(speak_text || "");
      console.log("[VoiceBot] Urdu script detected in speak_text:", isUrduResponse);

      // For Urdu: use display_text (Roman Urdu) for TTS — Uplift AI can pronounce Latin script.
      // For English: use speak_text directly.
      const ttsText = isUrduResponse
        ? (display_text || speak_text)
        : (speak_text || display_text);
      console.log("[VoiceBot] TTS text selected:", ttsText);

      if (transcript) {
        const userMsg: Message = {
          id: Date.now().toString(),
          text: transcript,
          isUser: true,
          timestamp: new Date(),
        };
        const withUser = [...messages, userMsg];
        updateActiveSession(withUser);

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: display_text || speak_text || "I processed your voice query.",
          isUser: false,
          timestamp: new Date(),
        };
        const withAi = [...withUser, aiMsg];
        updateActiveSession(withAi);

        await speakVoiceResult(ttsText || aiMsg.text);
      } else {
        console.warn("[VoiceBot] No transcript returned from API.");
        setVoiceStatus("idle");
      }
    } catch (err) {
      console.error("[VoiceBot] Voice query error:", err);
      setVoiceStatus("idle");
    }
  };

  const speakVoiceResult = async (text: string) => {
    if (!text) {
      console.warn("[TTS] Empty text, skipping TTS.");
      setVoiceStatus("idle");
      return;
    }
    setVoiceStatus("speaking");
    const apiKey = (import.meta as any).env?.VITE_UPLIFT_API_KEY;
    // Check if text has actual Urdu/Arabic script characters (not Roman Urdu)
    const hasUrduScript = /[\u0600-\u06FF]/.test(text);
    console.log("[TTS] Text to speak:", text);
    console.log("[TTS] Contains Urdu script:", hasUrduScript);
    console.log("[TTS] Uplift API key present:", !!apiKey);

    // Uplift AI handles both English AND Roman Urdu (Latin script).
    // Only skip it if text contains actual Urdu/Arabic script characters.
    if (apiKey && !hasUrduScript) {
      console.log("[TTS] Using Uplift AI TTS (voice: v_8eelc901)");
      try {
        await speakWithUplift(text, "v_8eelc901", apiKey);
        console.log("[TTS] Uplift TTS completed successfully.");
        setVoiceStatus("idle");
        return;
      } catch (err) {
        console.warn("[TTS] Uplift TTS failed, falling back to browser SpeechSynthesis:", err);
      }
    } else if (hasUrduScript) {
      console.warn("[TTS] Text contains Urdu script — Uplift cannot handle it. Using browser SpeechSynthesis.");
    } else {
      console.warn("[TTS] No Uplift API key found. Using browser SpeechSynthesis.");
    }

    if ("speechSynthesis" in window) {
      const lang = hasUrduScript ? "ur-PK" : "en-US";
      console.log("[TTS] Browser SpeechSynthesis lang:", lang);
      // Log available voices for debugging
      const voices = window.speechSynthesis.getVoices();
      const urduVoices = voices.filter((v) => v.lang.startsWith("ur"));
      console.log("[TTS] Available Urdu voices:", urduVoices.map((v) => `${v.name} (${v.lang})`));
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.onend = () => {
        console.log("[TTS] SpeechSynthesis finished.");
        setVoiceStatus("idle");
      };
      utterance.onerror = (e) => {
        console.error("[TTS] SpeechSynthesis error:", e.error, e);
        setVoiceStatus("idle");
      };
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("[TTS] SpeechSynthesis not available in this browser.");
      setVoiceStatus("idle");
    }
  };

  const toggleVoiceMode = () => {
    if (voiceStatus === "idle") {
      startVoiceRecording();
    } else if (voiceStatus === "listening") {
      stopVoiceAndProcess();
    } else {
      cleanupVoice();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const ensuredSessionId = activeSessionId || createNewSession();
    if (!ensuredSessionId) return;
    if (activeSessionId !== ensuredSessionId) {
      setActiveSessionId(ensuredSessionId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    updateActiveSession(newMessages);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const url = API_BASE_URL ? `${API_BASE_URL}/api/chatbot/query` : "/api/chatbot/query";
      console.log("Sending request to:", url, "API_BASE_URL:", API_BASE_URL || "(using proxy)");

      // Build auth headers and get/create a backend chat session for authenticated users
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      let activeChatId = supabaseChatId;

      if (isAuthenticated) {
        const token = await getAuthToken();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
          // Create a server-side chat session on first message
          if (!activeChatId) {
            activeChatId = await createBackendChatSession(token);
            if (activeChatId) setSupabaseChatId(activeChatId);
          }
        }
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: currentInput, chatId: activeChatId || undefined }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        if (text.includes("<!DOCTYPE") || text.includes("<html")) {
          throw new Error("Backend server is not running. Please start it with: npm run dev:backend");
        }
        throw new Error(`Server returned invalid response. Expected JSON but got: ${contentType}`);
      }

      if (!response.ok) {
        let errorMessage = "Failed to get response";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text:
          data.response ||
          "Thank you for your message! I'm here to help with any questions about your investment, payments, or project updates. What would you like to know more about?",
        isUser: false,
        timestamp: new Date(),
      };
      updateActiveSession([...newMessages, aiResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      let errorText = "Sorry, there was an error processing your request.";
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        errorText =
          "Unable to connect to the server. Please make sure the backend server is running on " +
          API_BASE_URL +
          ". Start it with: npm run dev:backend";
      } else if (error instanceof Error) {
        errorText = `I apologize, but I encountered an issue: ${error.message}. Please ensure the backend server is running.`;
      }
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date(),
      };
      updateActiveSession([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const voiceStatusLabel: Record<VoiceStatus, string> = {
    idle: "Online",
    listening: "Listening...",
    processing: "Processing...",
    speaking: "Speaking...",
  };

  const voiceStatusColor: Record<VoiceStatus, string> = {
    idle: "#22c55e",
    listening: "#ef4444",
    processing: "#f59e0b",
    speaking: "#3b82f6",
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 h-14 w-14 text-black rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 z-40 flex items-center justify-center"
        style={{ backgroundImage: "linear-gradient(135deg, #d4af37, #f4e68c)" }}
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(212, 175, 55, 0.4)",
            "0 0 0 10px rgba(212, 175, 55, 0)",
            "0 0 0 0 rgba(212, 175, 55, 0)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] rounded-lg shadow-2xl z-50 flex flex-col"
            style={{
              background:
                "linear-gradient(135deg, rgba(212, 175, 55, 0.04) 0%, rgba(0, 0, 0, 0.95) 100%)",
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(20px)",
              border:
                voiceStatus !== "idle"
                  ? `1px solid ${voiceStatusColor[voiceStatus]}`
                  : "1px solid rgba(212, 175, 55, 0.25)",
              boxShadow:
                voiceStatus !== "idle"
                  ? `0 0 20px ${voiceStatusColor[voiceStatus]}40`
                  : "inset 0 0 200px rgba(212, 175, 55, 0.04)",
              transition: "border 0.3s ease, box-shadow 0.3s ease",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 rounded-t-lg"
              style={{
                borderBottom: "1px solid rgba(212, 175, 55, 0.25)",
                background:
                  "linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(0, 0, 0, 0.9) 100%)",
              }}
            >
              <div className="flex items-center space-x-2">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center"
                  style={{ backgroundImage: "linear-gradient(135deg, #d4af37, #f4e68c)" }}
                >
                  <span className="text-xs font-bold" style={{ color: "#000000" }}>
                    AI
                  </span>
                </div>
                <div>
                  <h3
                    className="font-semibold"
                    style={{ fontFamily: "Playfair Display, serif", color: "#d4af37" }}
                  >
                    AI Assistant
                  </h3>
                  <div className="flex items-center space-x-1">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: voiceStatusColor[voiceStatus],
                        transition: "background-color 0.3s ease",
                      }}
                    />
                    <p
                      className="text-xs"
                      style={{
                        color: voiceStatusColor[voiceStatus],
                        transition: "color 0.3s ease",
                      }}
                    >
                      {voiceStatusLabel[voiceStatus]}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={createNewSession}
                  className="h-8 text-xs"
                  disabled={!isAuthenticated}
                  title={isAuthenticated ? "Start a new chat" : "Login to start a new chat"}
                >
                  New chat
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[85%] px-3 py-2 rounded-lg text-sm"
                    style={
                      message.isUser
                        ? {
                            backgroundImage: "linear-gradient(135deg, #d4af37, #f4e68c)",
                            color: "#000000",
                          }
                        : {
                            background:
                              "linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(0, 0, 0, 0.8) 100%)",
                            border: "1px solid rgba(212, 175, 55, 0.2)",
                            color: "#ffffff",
                          }
                    }
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div
                    className="max-w-[85%] px-3 py-2 rounded-lg text-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(0, 0, 0, 0.8) 100%)",
                      border: "1px solid rgba(212, 175, 55, 0.2)",
                      color: "#ffffff",
                    }}
                  >
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: "#d4af37", animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: "#d4af37", animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: "#d4af37", animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input / Voice Actions */}
            <div className="p-4" style={{ borderTop: "1px solid rgba(212, 175, 55, 0.25)" }}>
              <div className="flex space-x-2 items-center">
                <AnimatePresence mode="wait">
                  {voiceStatus === "listening" ? (
                    <motion.div
                      key="waveform"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex items-center justify-center space-x-0.5 h-10"
                    >
                      {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 rounded-full"
                          style={{ backgroundColor: "#d4af37" }}
                          animate={{
                            height: [
                              `${8 + Math.random() * 24}px`,
                              `${8 + Math.random() * 24}px`,
                              `${8 + Math.random() * 24}px`,
                            ],
                          }}
                          transition={{
                            duration: 0.4 + Math.random() * 0.4,
                            repeat: Infinity,
                            repeatType: "mirror",
                            delay: i * 0.05,
                          }}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.input
                      key="textinput"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 rounded-lg text-sm"
                      style={{
                        background: "#000000",
                        border: "1px solid rgba(212, 175, 55, 0.25)",
                        color: "#ffffff",
                      }}
                      disabled={isLoading || voiceStatus !== "idle"}
                    />
                  )}
                </AnimatePresence>

                {/* Mic / Stop button */}
                <motion.button
                  onClick={toggleVoiceMode}
                  disabled={isLoading || voiceStatus === "processing"}
                  className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      voiceStatus === "listening"
                        ? "linear-gradient(135deg, #ef4444, #dc2626)"
                        : voiceStatus === "speaking"
                        ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                        : "linear-gradient(135deg, #d4af37, #f4e68c)",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={
                    voiceStatus === "listening"
                      ? {
                          boxShadow: [
                            "0 0 0 0 rgba(239,68,68,0.5)",
                            "0 0 0 8px rgba(239,68,68,0)",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {voiceStatus === "listening" ? (
                    <StopIcon className="h-4 w-4 text-white" />
                  ) : (
                    <MicrophoneIcon className="h-4 w-4 text-black" />
                  )}
                </motion.button>

                {/* Send button */}
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="text-black font-semibold flex-shrink-0"
                  style={{ backgroundImage: "linear-gradient(135deg, #d4af37, #f4e68c)" }}
                  disabled={isLoading || !inputValue.trim() || voiceStatus !== "idle"}
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


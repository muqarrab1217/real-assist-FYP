import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string | Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

const STORAGE_KEY = 'rag-chat-sessions';
const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  text: "Hello! I'm your AI assistant. How can I help you with your real estate investment today?",
  isUser: false,
  timestamp: new Date(),
};

const getApiBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '');
  }
  return '';
};

const API_BASE_URL = getApiBaseUrl();

export const RagChatHistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: ChatSession[] = JSON.parse(raw);
        setSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load chat sessions', err);
    }
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const formatTime = (value: string) => {
    const date = new Date(value);
    return date.toLocaleString();
  };

  const persistSessions = (next: ChatSession[]) => {
    setSessions(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      console.error('Failed to persist sessions', err);
    }
  };

  const updateSessionMessages = (sessionId: string, messages: Message[]) => {
    const next = sessions.map((s) =>
      s.id === sessionId
        ? { ...s, messages, updatedAt: new Date().toISOString(), title: s.title !== 'New chat' || messages.length <= 1 ? s.title : messages.find(m => m.isUser)?.text.slice(0, 40) || s.title }
        : s
    );
    persistSessions(next);
  };

  const ensureSession = () => {
    if (activeSessionId) return activeSessionId;
    if (sessions.length > 0) return sessions[0].id;
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New chat',
      messages: [INITIAL_MESSAGE],
      updatedAt: new Date().toISOString(),
    };
    const next = [newSession, ...sessions];
    persistSessions(next);
    setActiveSessionId(newSession.id);
    return newSession.id;
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const sessionId = ensureSession();
    const session = sessions.find((s) => s.id === sessionId) || {
      id: sessionId,
      title: 'New chat',
      messages: [INITIAL_MESSAGE],
      updatedAt: new Date().toISOString(),
    };

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    const currentMessages = [...session.messages, userMessage];
    updateSessionMessages(sessionId, currentMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const url = API_BASE_URL ? `${API_BASE_URL}/api/gemini/query` : '/api/gemini/query';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text, includeFiles: true }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(text || 'Server returned non-JSON response');
      }
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${response.status}`);
      }

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          data.response ||
          'Thank you for your message! I\'m here to help with any questions about your investment, payments, or project updates.',
        isUser: false,
        timestamp: new Date(),
      };

      updateSessionMessages(sessionId, [...currentMessages, aiMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, there was an error: ${err?.message || 'Unknown error'}`,
        isUser: false,
        timestamp: new Date(),
      };
      updateSessionMessages(sessionId, [...currentMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{
            fontFamily: 'Playfair Display, serif',
            backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}>
            RAG Chatbot History
          </h1>
          <p style={{ color: 'rgba(156, 163, 175, 0.9)' }} className="text-sm">
            View stored conversations from the chatbot widget. Data is persisted locally in the browser.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
        <Card className="md:col-span-3 h-[75vh] flex flex-col abs-card overflow-hidden">
          <CardHeader className="p-4 border-b border-gold-500/10">
            <CardTitle className="text-lg font-bold text-white" style={{ fontFamily: 'Playfair Display, serif', color: '#d4af37' }}>
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0 custom-scrollbar">
            <div className="divide-y divide-gold-500/10">
              {sessions.length === 0 && (
                <p className="p-6 text-sm text-gray-500 text-center italic">No conversations yet.</p>
              )}
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`w-full text-left p-4 hover:bg-gold-500/10 transition-all group ${session.id === activeSessionId ? 'bg-gold-500/20 border-l-4 border-gold-400' : ''
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className={cn(
                      "font-bold truncate group-hover:text-gold-400 transition-colors",
                      session.id === activeSessionId ? "text-gold-400" : "text-white"
                    )}>
                      {session.title.length > 30 ? `${session.title.slice(0, 30)}...` : session.title}
                    </div>
                    <span className="text-[10px] text-gray-500 shrink-0">
                      {formatTime(session.updatedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {session.messages.find((m) => m.isUser)?.text || 'No messages yet'}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-7 h-[75vh] flex flex-col abs-card overflow-hidden">
          <CardHeader className="p-4 border-b border-gold-500/10 flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white truncate max-w-[70%]" style={{ fontFamily: 'Playfair Display, serif', color: '#d4af37' }}>
              {activeSession?.title || 'Select session'}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSessionId(activeSession?.id || null)}
              disabled={!activeSession}
              className="border-gold-500/30 text-gold-400 hover:bg-gold-500/10 h-8 font-semibold"
            >
              Refresh
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {!activeSession && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 rounded-full bg-gold-500/5 border border-gold-500/10">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gold-500/30" />
                </div>
                <p className="text-gray-500 max-w-xs">Choose a conversation from the sidebar or start a new chat below.</p>
              </div>
            )}

            {activeSession?.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-5 py-4 shadow-xl text-sm leading-relaxed",
                    message.isUser
                      ? "bg-gradient-to-br from-gold-500 to-gold-400 text-black font-semibold rounded-tr-none"
                      : "bg-[#0a0a0a] border border-gold-500/20 text-white rounded-tl-none backdrop-blur-sm"
                  )}
                >
                  <div className={cn(
                    "text-[10px] mb-2 font-bold uppercase tracking-wider",
                    message.isUser ? "text-black/50" : "text-gold-400/70"
                  )}>
                    {formatTime(message.timestamp.toString())}
                  </div>
                  <div className="whitespace-pre-wrap">{message.text}</div>
                </div>
              </div>
            ))}
          </CardContent>

          <div className="p-4 bg-black/40 border-t border-gold-500/10">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                placeholder="Ask a question or continue the chat..."
                className="w-full bg-black/50 border border-gold-500/20 text-white pl-4 pr-24 py-3 rounded-xl focus:outline-none focus:border-gold-500/50 transition-all placeholder:text-gray-600"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="absolute right-2 px-4 py-1.5 bg-gradient-to-r from-gold-500 to-gold-400 text-black font-bold rounded-lg text-xs hover:shadow-lg hover:shadow-gold-500/20 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

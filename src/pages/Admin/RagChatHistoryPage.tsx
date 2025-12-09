import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
        // includeFiles flag hints backend to include Gemini file search context
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
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">RAG Chatbot History</h1>
          <p className="text-sm text-muted-foreground">
            View stored conversations from the chatbot widget. Data is persisted locally in the browser.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
        <Card className="md:col-span-2 h-[80vh] flex flex-col">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <div className="h-full overflow-y-auto">
              <div className="divide-y">
                {sessions.length === 0 && (
                  <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
                )}
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={`w-full text-left p-4 hover:bg-muted transition ${
                      session.id === activeSessionId ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {session.title.length > 40 ? `${session.title.slice(0, 40)}...` : session.title}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(session.updatedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {session.messages.find((m) => m.isUser)?.text?.slice(0, 60) || 'No messages yet'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-8 h-[80vh] flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{activeSession?.title || 'Select a conversation'}</CardTitle>
            <Button
              variant="outline"
              onClick={() => setActiveSessionId(activeSession?.id || null)}
              disabled={!activeSession}
            >
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!activeSession && <p className="text-sm text-muted-foreground">Choose a conversation to view history.</p>}
              {activeSession?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-xl rounded-lg px-4 py-3 shadow-sm text-sm"
                    style={
                      message.isUser
                        ? {
                            backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
                            color: '#000000',
                          }
                        : {
                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(0, 0, 0, 0.85) 100%)',
                            border: '1px solid rgba(212, 175, 55, 0.25)',
                            color: '#ffffff',
                          }
                    }
                  >
                    <div className="text-xs opacity-70 mb-1">{formatTime(message.timestamp.toString())}</div>
                    <div>{message.text}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue conversation inside right panel */}
            <div className="border-t border-muted-foreground/20 p-4 space-y-3 sticky bottom-0 bg-background">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend();
                  }}
                  placeholder="Ask a question or continue the chat..."
                  className="flex-1 px-3 py-2 rounded-md border border-muted-foreground/30 bg-background text-foreground"
                  disabled={isLoading}
                />
                <Button onClick={handleSend} disabled={isLoading || !inputValue.trim()}>
                  {isLoading ? 'Sending...' : 'Send'}
                </Button>
              </div>
              {!activeSession && <p className="text-xs text-muted-foreground">Select a conversation or send a message to create one.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};



import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon 
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';

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

const STORAGE_KEY = 'rag-chat-sessions';

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  text: "Hello! I'm your AI assistant. How can I help you with your real estate investment today?",
  isUser: false,
  timestamp: new Date(),
};

// Get API base URL from environment or use default
// In development, Vite proxy will handle /api routes, so we can use empty string or relative path
// For production, set VITE_API_BASE_URL in .env
const getApiBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  // If env variable is set and not empty, use it
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '');
  }
  // In development with Vite proxy, we can use empty string (relative path)
  // This will use the Vite proxy configured in vite.config.ts
  // For production, this should be set to the actual backend URL
  return '';
};

const API_BASE_URL = getApiBaseUrl();

export const RagChatbot: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load sessions from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: ChatSession[] = JSON.parse(raw);
        setSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
          setMessages(parsed[0].messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
          return;
        }
      }
    } catch (err) {
      console.error('Failed to load chat sessions', err);
    }
    // ensure a default session exists
    createNewSession();
  }, []);

  const persistSessions = (nextSessions: ChatSession[]) => {
    setSessions(nextSessions);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSessions));
    } catch (err) {
      console.error('Failed to persist sessions', err);
    }
  };

  const createNewSession = () => {
    // Allow seeding the first session for all users; additional sessions only if authenticated
    if (!isAuthenticated && sessions.length > 0) {
      return null;
    }
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New chat',
      messages: [INITIAL_MESSAGE],
      updatedAt: new Date().toISOString(),
    };
    const nextSessions = [newSession, ...sessions];
    persistSessions(nextSessions);
    setActiveSessionId(newSession.id);
    setMessages(newSession.messages);
    return newSession.id;
  };

  const updateActiveSession = (updatedMessages: Message[]) => {
    if (!activeSessionId) return;
    const nextSessions = sessions.map(session =>
      session.id === activeSessionId
        ? {
            ...session,
            messages: updatedMessages,
            title:
              session.title === 'New chat' && updatedMessages.length > 1
                ? updatedMessages.find(m => m.isUser)?.text.slice(0, 40) || 'New chat'
                : session.title,
            updatedAt: new Date().toISOString(),
          }
        : session
    );
    persistSessions(nextSessions);
    setMessages(updatedMessages);
  };

  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    setActiveSessionId(sessionId);
    setMessages(session.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
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
    setInputValue('');
    setIsLoading(true);

    try {
      // Construct the full URL
      const url = API_BASE_URL ? `${API_BASE_URL}/api/gemini/query` : '/api/gemini/query';
      console.log('Sending request to:', url, 'API_BASE_URL:', API_BASE_URL || '(using proxy)'); // Debug log
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentInput }),
      });

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // If we get HTML back, the backend is likely not running
        const text = await response.text();
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          throw new Error('Backend server is not running. Please start it with: npm run dev:backend');
        }
        throw new Error(`Server returned invalid response. Expected JSON but got: ${contentType}`);
      }

      if (!response.ok) {
        let errorMessage = 'Failed to get response';
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
        text: data.response || 'Thank you for your message! I\'m here to help with any questions about your investment, payments, or project updates. What would you like to know more about?',
        isUser: false,
        timestamp: new Date(),
      };
      
      updateActiveSession([...newMessages, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      let errorText = 'Sorry, there was an error processing your request.';
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorText = 'Unable to connect to the server. Please make sure the backend server is running on ' + API_BASE_URL + '. Start it with: npm run dev:backend';
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
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 h-14 w-14 text-black rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 z-40 flex items-center justify-center"
        style={{
          backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
        }}
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          boxShadow: [
            "0 0 0 0 rgba(212, 175, 55, 0.4)",
            "0 0 0 10px rgba(212, 175, 55, 0)",
            "0 0 0 0 rgba(212, 175, 55, 0)"
          ]
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
            className="fixed bottom-6 right-6 w-200 h-96 rounded-lg shadow-2xl z-50 flex flex-col"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.04) 0%, rgba(0, 0, 0, 0.95) 100%)',
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              boxShadow: 'inset 0 0 200px rgba(212, 175, 55, 0.04)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 rounded-t-lg" style={{
              borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(0, 0, 0, 0.9) 100%)'
            }}>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{
                  backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
                }}>
                  <span className="text-xs font-bold" style={{ color: '#000000' }}>AI</span>
                </div>
                <div>
                  <h3 className="font-semibold" style={{ 
                    fontFamily: 'Playfair Display, serif',
                    color: '#d4af37'
                  }}>AI Assistant</h3>
                  <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={createNewSession}
                  className="h-8 text-xs"
                  disabled={!isAuthenticated}
                  title={isAuthenticated ? 'Start a new chat' : 'Login to start a new chat'}
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
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-xs px-3 py-2 rounded-lg text-sm"
                    style={message.isUser ? {
                      backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
                      color: '#000000'
                    } : {
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(0, 0, 0, 0.8) 100%)',
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                      color: '#ffffff'
                    }}
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
                    className="max-w-xs px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(0, 0, 0, 0.8) 100%)',
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                      color: '#ffffff'
                    }}
                  >
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.25)' }}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: '#000000',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    color: '#ffffff'
                  }}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="text-black font-semibold"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
                  }}
                  disabled={isLoading || !inputValue.trim()}
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


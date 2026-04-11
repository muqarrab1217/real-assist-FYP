import React, { useEffect, useRef, useState } from 'react';
import { Send, Loader } from 'lucide-react';
import { ChatMessage, ChatSession } from '@/hooks/useChat';

interface ChatWindowProps {
  currentChat: ChatSession | null;
  messages: ChatMessage[];
  loading: boolean;
  onSendMessage: (message: string) => Promise<void>;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  currentChat,
  messages,
  loading,
  onSendMessage
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    try {
      setIsSending(true);
      const message = inputValue.trim();
      setInputValue('');
      await onSendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!currentChat) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)' }}
      >
        <div className="text-center p-8">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d4af37, #f4e68c)' }}
          >
            <span className="text-2xl font-bold text-black">AI</span>
          </div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: '#d4af37', fontFamily: 'Playfair Display, serif' }}
          >
            Welcome to RealAssist Chat
          </h2>
          <p style={{ color: 'rgba(156, 163, 175, 0.8)' }}>
            Create a new chat or select an existing one to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col"
      style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)' }}
    >
      {/* Chat Header */}
      <div
        className="p-4"
        style={{
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }}
      >
        <h2
          className="text-lg font-bold"
          style={{ color: '#d4af37', fontFamily: 'Playfair Display, serif' }}
        >
          {currentChat.title}
        </h2>
        {currentChat.description && (
          <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>
            {currentChat.description}
          </p>
        )}
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: 'rgba(156, 163, 175, 0.5)' }} className="text-center">
              Start a conversation by typing a message below
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className="max-w-md px-4 py-3 rounded-lg"
                style={
                  message.role === 'user'
                    ? {
                        background: 'linear-gradient(135deg, #d4af37, #f4e68c)',
                        color: '#000',
                        borderBottomRightRadius: '4px'
                      }
                    : {
                        backgroundColor: 'rgba(55, 65, 81, 0.8)',
                        color: '#e5e7eb',
                        borderBottomLeftRadius: '4px',
                        border: '1px solid rgba(212, 175, 55, 0.1)'
                      }
                }
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.created_at && (
                  <p
                    className="text-xs mt-2"
                    style={{
                      opacity: 0.7,
                      color: message.role === 'user' ? '#000' : 'rgba(156, 163, 175, 0.8)'
                    }}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div
              className="px-4 py-3 rounded-lg"
              style={{
                backgroundColor: 'rgba(55, 65, 81, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.1)',
                borderBottomLeftRadius: '4px'
              }}
            >
              <div className="flex items-center gap-2">
                <Loader size={16} className="animate-spin" style={{ color: '#d4af37' }} />
                <span className="text-sm" style={{ color: '#e5e7eb' }}>Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className="p-4"
        style={{
          borderTop: '1px solid rgba(212, 175, 55, 0.15)',
          backgroundColor: 'rgba(0, 0, 0, 0.4)'
        }}
      >
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={loading || isSending}
            className="flex-1 px-4 py-2.5 rounded-lg focus:outline-none transition-all"
            style={{
              backgroundColor: 'rgba(55, 65, 81, 0.6)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              color: '#e5e7eb',
              fontSize: '14px'
            }}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={loading || isSending || !inputValue.trim()}
            className="px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #f4e68c)',
              color: '#000',
              fontWeight: '600'
            }}
          >
            {isSending ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
        <p className="text-xs mt-2" style={{ color: 'rgba(156, 163, 175, 0.5)' }}>
          {inputValue.length}/500 characters
        </p>
      </div>
    </div>
  );
};

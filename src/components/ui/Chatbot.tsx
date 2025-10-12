import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon 
} from '@heroicons/react/24/outline';
import { Button } from './button';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you with your real estate investment today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your message! I\'m here to help with any questions about your investment, payments, or project updates. What would you like to know more about?',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
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
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="text-black font-semibold"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
                  }}
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

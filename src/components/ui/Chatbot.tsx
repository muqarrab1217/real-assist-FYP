import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { Button } from './button';
import { useChat } from '@/hooks/useChat';
import { ChatSidebar } from '../Chat/ChatSidebar';
import { ChatWindow } from '../Chat/ChatWindow';
import { Link } from 'react-router-dom';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const {
    chats,
    currentChat,
    messages,
    loading,
    createChat,
    loadChats,
    selectChat,
    sendMessage,
    deleteChat,
    newChat,
    error,
    isAuthenticated
  } = useChat();

  useEffect(() => {
    if (isOpen) {
      loadChats();
    }
  }, [isOpen, loadChats]);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  const handleNewChat = async () => {
    const chat = await createChat();
    if (chat) {
      await selectChat(chat.id);
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
            className="fixed bottom-6 right-6 w-full max-w-4xl h-[600px] rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{
              background: 'rgba(17, 24, 39, 0.98)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(212, 175, 55, 0.1)'
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 rounded-t-lg"
              style={{
                borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)'
              }}
            >
              <div className="flex items-center space-x-2">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
                  }}
                >
                  <span className="text-xs font-bold text-black">AI</span>
                </div>
                <div>
                  <h3
                    className="font-semibold"
                    style={{
                      fontFamily: 'Playfair Display, serif',
                      color: '#d4af37'
                    }}
                  >
                    RealAssist Chat
                  </h3>
                  <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Chat History Enabled</p>
                  {!isAuthenticated && (
                    <p className="text-[11px]" style={{ color: 'rgba(244, 230, 140, 0.8)' }}>
                      Guest mode: Sign in to save chat history and get personalized project context.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="h-8 w-8 hover:bg-white/10"
                  style={{ color: 'rgba(156, 163, 175, 0.8)' }}
                  title="Toggle sidebar"
                >
                  <Bars3Icon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 hover:bg-white/10"
                  style={{ color: 'rgba(156, 163, 175, 0.8)' }}
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              {showSidebar && (
                <ChatSidebar
                  chats={chats}
                  currentChat={currentChat}
                  loading={loading}
                  onSelectChat={selectChat}
                  onNewChat={handleNewChat}
                  onDeleteChat={deleteChat}
                  onLoadChats={loadChats}
                />
              )}

              {/* Chat Window */}
              <ChatWindow
                currentChat={currentChat}
                messages={messages}
                loading={loading}
                onSendMessage={handleSendMessage}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div
                className="px-4 py-3 text-sm"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  borderTop: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5'
                }}
              >
                {error}
              </div>
            )}
            {!isAuthenticated && (
              <div
                className="px-4 py-2 text-xs"
                style={{
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  borderTop: '1px solid rgba(212, 175, 55, 0.25)',
                  color: '#f4e68c'
                }}
              >
                Your guest chat is temporary. <Link to="/auth/login" className="underline">Login</Link> to save chats in database.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

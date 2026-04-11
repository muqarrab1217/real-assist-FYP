import React, { useEffect } from 'react';
import { Trash2, Plus, MessageSquare } from 'lucide-react';
import { ChatSession } from '@/hooks/useChat';

interface ChatSidebarProps {
  chats: ChatSession[];
  currentChat: ChatSession | null;
  loading: boolean;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onLoadChats: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  currentChat,
  loading,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onLoadChats
}) => {
  useEffect(() => {
    onLoadChats();
  }, [onLoadChats]);

  return (
    <div
      className="w-56 flex flex-col h-full"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRight: '1px solid rgba(212, 175, 55, 0.2)'
      }}
    >
      {/* Header - New Chat Button */}
      <div className="p-3" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.15)' }}>
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, #d4af37, #f4e68c)',
            color: '#000',
            fontWeight: '600',
            fontSize: '13px'
          }}
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading && chats.length === 0 ? (
          <div className="p-4 text-center" style={{ color: 'rgba(156, 163, 175, 0.7)', fontSize: '13px' }}>
            Loading chats...
          </div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-center" style={{ color: 'rgba(156, 163, 175, 0.7)', fontSize: '13px' }}>
            No chats yet. Create one!
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className="group p-2.5 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-2"
                style={{
                  backgroundColor: currentChat?.id === chat.id
                    ? 'rgba(212, 175, 55, 0.15)'
                    : 'transparent',
                  border: currentChat?.id === chat.id
                    ? '1px solid rgba(212, 175, 55, 0.3)'
                    : '1px solid transparent'
                }}
              >
                <MessageSquare
                  size={14}
                  className="flex-shrink-0"
                  style={{ color: currentChat?.id === chat.id ? '#d4af37' : 'rgba(156, 163, 175, 0.7)' }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="truncate font-medium"
                    style={{
                      color: currentChat?.id === chat.id ? '#d4af37' : '#e5e7eb',
                      fontSize: '13px'
                    }}
                  >
                    {chat.title}
                  </p>
                  <p
                    className="truncate"
                    style={{
                      color: 'rgba(156, 163, 175, 0.6)',
                      fontSize: '11px'
                    }}
                  >
                    {chat.total_messages || 0} messages
                  </p>
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-all p-1 rounded"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444'
                  }}
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="p-3"
        style={{
          borderTop: '1px solid rgba(212, 175, 55, 0.15)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }}
      >
        <p style={{ color: 'rgba(156, 163, 175, 0.5)', fontSize: '10px' }}>
          RealAssist AI Chat
        </p>
      </div>
    </div>
  );
};

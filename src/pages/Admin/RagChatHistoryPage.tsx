import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageSquare, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChat } from '@/hooks/useChat';

export const RagChatHistoryPage: React.FC = () => {
  const {
    chats: sessions,
    currentChat,
    messages,
    loading,
    error,
    createChat,
    loadChats,
    selectChat,
    sendMessage
  } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Load authenticated user's own chat sessions
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending || !currentChat) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    try {
      await sendMessage(userMessage);
      await loadChats();
      await selectChat(currentChat.id);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleNewChat = async () => {
    const chat = await createChat();
    if (chat) {
      await selectChat(chat.id);
    }
  };

  const formatTime = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleString();
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
            View your own conversations. All chats are saved in the database per user.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleNewChat}
            className="border-gold-500/30 text-gold-400 hover:bg-gold-500/10"
            variant="outline"
          >
            New Chat
          </Button>
          <Button
            onClick={loadChats}
            disabled={loading}
            className="border-gold-500/30 text-gold-400 hover:bg-gold-500/10"
            variant="outline"
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
        <Card className="md:col-span-3 h-[75vh] flex flex-col abs-card overflow-hidden">
          <CardHeader className="p-4 border-b border-gold-500/10">
              <CardTitle className="text-lg font-bold text-white" style={{ fontFamily: 'Playfair Display, serif', color: '#d4af37' }}>
                Conversations ({sessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0 custom-scrollbar">
              <div className="divide-y divide-gold-500/10">
                {loading && sessions.length === 0 && (
                  <div className="p-6 text-center">
                    <Loader className="animate-spin mx-auto mb-2" size={24} style={{ color: '#d4af37' }} />
                    <p className="text-sm text-gray-500 italic">Loading conversations...</p>
                  </div>
                )}
                {!loading && sessions.length === 0 && (
                  <p className="p-6 text-sm text-gray-500 text-center italic">No conversations found.</p>
                )}
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => selectChat(session.id)}
                    className={`w-full text-left p-4 hover:bg-gold-500/10 transition-all group ${
                      session.id === currentChat?.id ? 'bg-gold-500/20 border-l-4 border-gold-400' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className={cn(
                        "font-bold truncate group-hover:text-gold-400 transition-colors",
                        session.id === currentChat?.id ? "text-gold-400" : "text-white"
                      )}>
                        {session.title.length > 30 ? `${session.title.slice(0, 30)}...` : session.title}
                      </div>
                    <span className="text-[10px] text-gray-500 shrink-0">
                      {formatTime(session.last_message_at || session.created_at)}
                    </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{session.total_messages} messages</p>
                  </button>
                ))}
              </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-7 h-[75vh] flex flex-col abs-card overflow-hidden">
          <CardHeader className="p-4 border-b border-gold-500/10 flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white truncate max-w-[70%]" style={{ fontFamily: 'Playfair Display, serif', color: '#d4af37' }}>
              {currentChat?.title || 'Select a conversation'}
            </CardTitle>
            {currentChat && (
              <div className="text-xs text-gray-500">
                {currentChat.total_messages} messages
              </div>
            )}
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {!currentChat && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 rounded-full bg-gold-500/5 border border-gold-500/10">
                  <MessageSquare className="h-12 w-12 text-gold-500/30" />
                </div>
                <p className="text-gray-500 max-w-xs">Select a conversation from the sidebar to view messages.</p>
              </div>
            )}

            {loading && !messages.length && (
              <div className="h-full flex items-center justify-center">
                <Loader className="animate-spin" size={32} style={{ color: '#d4af37' }} />
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-5 py-4 shadow-xl text-sm leading-relaxed",
                    message.role === 'user'
                      ? "bg-gradient-to-br from-gold-500 to-gold-400 text-black font-semibold rounded-tr-none"
                      : "bg-[#0a0a0a] border border-gold-500/20 text-white rounded-tl-none backdrop-blur-sm"
                  )}
                >
                  <div className={cn(
                    "text-[10px] mb-2 font-bold uppercase tracking-wider",
                    message.role === 'user' ? "text-black/50" : "text-gold-400/70"
                  )}>
                    {message.role === 'user' ? 'User' : 'Assistant'} • {formatTime(message.created_at)}
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
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
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={currentChat ? "Continue the conversation..." : "Select a chat first"}
                className="w-full bg-black/50 border border-gold-500/20 text-white pl-4 pr-24 py-3 rounded-xl focus:outline-none focus:border-gold-500/50 transition-all placeholder:text-gray-600"
                disabled={isSending || !currentChat}
              />
              <button
                onClick={handleSend}
                disabled={isSending || !inputValue.trim() || !currentChat}
                className="absolute right-2 px-4 py-1.5 bg-gradient-to-r from-gold-500 to-gold-400 text-black font-bold rounded-lg text-xs hover:shadow-lg hover:shadow-gold-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <Loader className="animate-spin" size={14} />
                ) : (
                  'Send'
                )}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

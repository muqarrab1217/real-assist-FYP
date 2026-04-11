import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
  token_count?: number;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  total_messages: number;
  is_summarized: boolean;
  status: 'active' | 'archived' | 'deleted';
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  model_used?: string;
  messages?: ChatMessage[];
}

export interface UseChartReturn {
  chats: ChatSession[];
  currentChat: ChatSession | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  createChat: (title?: string, description?: string) => Promise<ChatSession | null>;
  loadChats: () => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  sendMessage: (message: string) => Promise<string | null>;
  deleteChat: (chatId: string) => Promise<void>;
  newChat: () => void;
  isAuthenticated: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';
const GUEST_CHAT_PREFIX = 'guest-local-';

// Helper to get auth headers with JWT token
const getAuthHeaders = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      };
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return { 'Content-Type': 'application/json' };
};

const getSessionToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

export const useChat = (): UseChartReturn => {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getCurrentUserId = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setIsAuthenticated(false);
      return null;
    }
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user?.id) {
      setIsAuthenticated(false);
      return null;
    }
    setIsAuthenticated(true);
    return data.user.id;
  }, []);

  // Load all chats for user
  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await getCurrentUserId();
      if (!userId) {
        setChats([]);
        setCurrentChat(null);
        setMessages([]);
        setError(null);
        return;
      }

      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/chatbot/chats/me?limit=50&status=active`, { headers });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to load chats:', errorData);
        throw new Error('Failed to load chats');
      }

      const data = await response.json();
      setChats(data.chats || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load chats';
      setError(message);
      console.error('Load chats error:', err);
    } finally {
      setLoading(false);
    }
  }, [getCurrentUserId]);

  useEffect(() => {
    let mounted = true;
    let initialLoadDone = false;

    const syncAuth = async () => {
      const token = await getSessionToken();
      if (!mounted) return;
      const authed = !!token;
      setIsAuthenticated(authed);
      if (!authed) {
        setChats([]);
        setCurrentChat(null);
        setMessages([]);
      } else {
        initialLoadDone = true;
        await loadChats();
      }
    };

    syncAuth();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      const authed = !!session?.access_token;
      setIsAuthenticated(authed);
      if (!authed) {
        setChats([]);
        setCurrentChat(null);
        setMessages([]);
      } else if (!initialLoadDone) {
        initialLoadDone = true;
        await loadChats();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadChats]);

  // Create new chat session
  const createChat = useCallback(
    async (title?: string, description?: string): Promise<ChatSession | null> => {
      try {
        setLoading(true);
        const userId = await getCurrentUserId();

        // Guest mode (public pages): local-only chat session, no DB persistence
        if (!userId) {
          const guestChat: ChatSession = {
            id: `${GUEST_CHAT_PREFIX}${Date.now()}`,
            user_id: 'guest',
            title: title || 'Guest Chat',
            description,
            total_messages: 0,
            is_summarized: false,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setChats([guestChat]);
          setCurrentChat(guestChat);
          setMessages([]);
          setError(null);
          return guestChat;
        }

        const headers = await getAuthHeaders();

        const response = await fetch(`${API_BASE_URL}/api/chatbot/chat/create`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: title || 'New Chat',
            description: description || null
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to create chat:', errorData);
          throw new Error('Failed to create chat');
        }

        const data = await response.json();
        const newChat = data.chat;

        setChats(prev => [newChat, ...prev]);
        setCurrentChat(newChat);
        setMessages([]);
        setError(null);

        return newChat;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create chat';
        setError(message);
        console.error('Create chat error:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getCurrentUserId]
  );

  // Select and load specific chat
  const selectChat = useCallback(async (chatId: string) => {
    try {
      if (chatId.startsWith(GUEST_CHAT_PREFIX)) {
        const guest = chats.find(c => c.id === chatId) || null;
        setCurrentChat(guest);
        setMessages([]);
        setError(null);
        return;
      }

      setLoading(true);
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/api/chatbot/chat/${chatId}`, { headers });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to load chat:', errorData);
        throw new Error('Failed to load chat');
      }

      const data = await response.json();
      const chat = data.chat;

      setCurrentChat(chat);
      setMessages(chat.messages || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load chat';
      setError(message);
      console.error('Select chat error:', err);
    } finally {
      setLoading(false);
    }
  }, [chats]);

  // Send message and get response
  const sendMessage = useCallback(
    async (message: string): Promise<string | null> => {
      if (!currentChat) {
        setError('No chat selected');
        return null;
      }

      try {
        setLoading(true);
        const userId = await getCurrentUserId();

        // Add user message to local state
        const userMessage: ChatMessage = {
          role: 'user',
          content: message,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);

        // Get auth headers
        const headers = await getAuthHeaders();

        // Send to backend
        const response = await fetch(`${API_BASE_URL}/api/chatbot/query`, {
          method: 'POST',
          headers,
          body: JSON.stringify(
            userId && !currentChat.id.startsWith(GUEST_CHAT_PREFIX)
              ? { message, chatId: currentChat.id }
              : { message }
          )
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to send message:', errorData);
          throw new Error(errorData.error || 'Failed to send message');
        }

        const data = await response.json();
        const assistantResponse = data.response;

        // Add assistant message to local state
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: assistantResponse,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);

        setError(null);
        return assistantResponse;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send message';
        setError(message);
        console.error('Send message error:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [currentChat, getCurrentUserId]
  );

  // Delete chat
  const deleteChat = useCallback(async (chatId: string) => {
    try {
      if (chatId.startsWith(GUEST_CHAT_PREFIX)) {
        setChats([]);
        setCurrentChat(null);
        setMessages([]);
        setError(null);
        return;
      }
      setLoading(true);
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/api/chatbot/chat/${chatId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to delete chat:', errorData);
        throw new Error('Failed to delete chat');
      }

      // Remove from chats list
      setChats(prev => prev.filter(c => c.id !== chatId));

      // Clear current chat if it was the deleted one
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }

      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete chat';
      setError(message);
      console.error('Delete chat error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentChat]);

  // Create new chat (clear current selection)
  const newChat = useCallback(() => {
    setCurrentChat(null);
    setMessages([]);
  }, []);

  return {
    chats,
    currentChat,
    messages,
    loading,
    error,
    createChat,
    loadChats,
    selectChat,
    sendMessage,
    deleteChat,
    newChat,
    isAuthenticated
  };
};

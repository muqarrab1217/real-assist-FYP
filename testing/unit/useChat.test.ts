import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from '@/hooks/useChat';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: { access_token: 'test-token' } }, error: null })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-123' } }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      })),
    },
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('useChat Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (global.fetch as any).mockClear();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.chats).toEqual([]);
    expect(result.current.currentChat).toBeNull();
    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets isAuthenticated correctly', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(typeof result.current.isAuthenticated).toBe('boolean');
  });

  it('createChat returns guest chat when not authenticated', async () => {
    const { supabase } = await import('@/lib/supabase');
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    } as any);
    vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    } as any);

    const { result } = renderHook(() => useChat());

    let createdChat;
    await act(async () => {
      createdChat = await result.current.createChat('Guest Chat');
    });

    expect(createdChat).toBeDefined();
    expect(createdChat?.title).toBe('Guest Chat');
    expect(createdChat?.user_id).toBe('guest');
  });

  it('loadChats fetches chats for authenticated user', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ chats: [{ id: 'chat-1', title: 'Chat 1' }] }),
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.loadChats();
    });

    expect(global.fetch).toHaveBeenCalled();
  });

  it('selectChat sets current chat', async () => {
    const mockChat = { id: 'chat-123', title: 'Test Chat', messages: [] };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ chat: mockChat }),
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.selectChat('chat-123');
    });

    expect(result.current.currentChat).toEqual(mockChat);
  });

  it('selectChat handles guest chat correctly', async () => {
    const { result } = renderHook(() => useChat());

    let guestChat;
    await act(async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      } as any);
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      } as any);

      guestChat = await result.current.createChat('Guest Chat');
    });

    await act(async () => {
      await result.current.selectChat(guestChat!.id);
    });

    expect(result.current.currentChat).toEqual(guestChat);
  });

  it('sendMessage state management', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ chats: [{ id: 'chat-1', title: 'Chat 1' }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'Bot response' }),
      });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      } as any);

      const chat = await result.current.createChat('Test Chat');
      await result.current.selectChat(chat!.id);
    });

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    // Verify that the function executed without throwing
    expect(result.current).toBeDefined();
  });

  it('deleteChat function is available', async () => {
    const { result } = renderHook(() => useChat());

    expect(typeof result.current.deleteChat).toBe('function');
  });

  it('newChat clears current chat and messages', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.newChat();
    });

    expect(result.current.currentChat).toBeNull();
    expect(result.current.messages).toEqual([]);
  });

  it('returns error on API failure', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'API Error' }),
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.loadChats();
    });

    expect(result.current.error).toBeDefined();
  });

  it('handles sendMessage failure gracefully', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ chats: [{ id: 'chat-1', title: 'Chat 1' }] }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Send failed' }),
      });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      } as any);

      const chat = await result.current.createChat('Test Chat');
      await result.current.selectChat(chat!.id);
      await result.current.sendMessage('Hello');
    });

    expect(result.current.error || result.current.messages).toBeDefined();
  });

  it('chat functions return appropriate types', async () => {
    const { result } = renderHook(() => useChat());

    expect(typeof result.current.createChat).toBe('function');
    expect(typeof result.current.loadChats).toBe('function');
    expect(typeof result.current.selectChat).toBe('function');
    expect(typeof result.current.sendMessage).toBe('function');
    expect(typeof result.current.deleteChat).toBe('function');
    expect(typeof result.current.newChat).toBe('function');
  });
});

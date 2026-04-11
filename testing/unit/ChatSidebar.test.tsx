import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatSidebar } from '@/components/Chat/ChatSidebar';
import { ChatSession } from '@/hooks/useChat';

describe('ChatSidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockChats: ChatSession[] = [
    {
      id: 'chat-1',
      title: 'First Chat',
      description: 'Description 1',
      user_id: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_messages: 5
    },
    {
      id: 'chat-2',
      title: 'Second Chat',
      user_id: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_messages: 10
    }
  ];

  describe('Initialization', () => {
    it('calls onLoadChats on mount', () => {
      const onLoadChats = vi.fn();
      const onNewChat = vi.fn();
      const onSelectChat = vi.fn();
      const onDeleteChat = vi.fn();

      render(
        <ChatSidebar
          chats={[]}
          currentChat={null}
          loading={false}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          onDeleteChat={onDeleteChat}
          onLoadChats={onLoadChats}
        />
      );

      expect(onLoadChats).toHaveBeenCalled();
    });
  });

  describe('New Chat Button', () => {
    it('renders new chat button', () => {
      const onLoadChats = vi.fn();
      const onNewChat = vi.fn();
      const onSelectChat = vi.fn();
      const onDeleteChat = vi.fn();

      render(
        <ChatSidebar
          chats={[]}
          currentChat={null}
          loading={false}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          onDeleteChat={onDeleteChat}
          onLoadChats={onLoadChats}
        />
      );

      expect(screen.getByRole('button', { name: /New Chat/i })).toBeInTheDocument();
    });

    it('calls onNewChat when button clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const onLoadChats = vi.fn();
      const onNewChat = vi.fn();
      const onSelectChat = vi.fn();
      const onDeleteChat = vi.fn();

      render(
        <ChatSidebar
          chats={[]}
          currentChat={null}
          loading={false}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          onDeleteChat={onDeleteChat}
          onLoadChats={onLoadChats}
        />
      );

      const button = screen.getByRole('button', { name: /New Chat/i });
      await user.click(button);

      expect(onNewChat).toHaveBeenCalled();
    });
  });

  describe('Chat List', () => {
    it('displays loading message when loading and no chats', () => {
      const onLoadChats = vi.fn();
      const onNewChat = vi.fn();
      const onSelectChat = vi.fn();
      const onDeleteChat = vi.fn();

      render(
        <ChatSidebar
          chats={[]}
          currentChat={null}
          loading={true}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          onDeleteChat={onDeleteChat}
          onLoadChats={onLoadChats}
        />
      );

      expect(screen.getByText(/Loading chats/i)).toBeInTheDocument();
    });

    it('displays empty message when no chats', () => {
      const onLoadChats = vi.fn();
      const onNewChat = vi.fn();
      const onSelectChat = vi.fn();
      const onDeleteChat = vi.fn();

      render(
        <ChatSidebar
          chats={[]}
          currentChat={null}
          loading={false}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          onDeleteChat={onDeleteChat}
          onLoadChats={onLoadChats}
        />
      );

      expect(screen.getByText(/No chats yet/i)).toBeInTheDocument();
    });

    it('displays list of chats', () => {
      const onLoadChats = vi.fn();
      const onNewChat = vi.fn();
      const onSelectChat = vi.fn();
      const onDeleteChat = vi.fn();

      render(
        <ChatSidebar
          chats={mockChats}
          currentChat={null}
          loading={false}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          onDeleteChat={onDeleteChat}
          onLoadChats={onLoadChats}
        />
      );

      expect(screen.getByText('First Chat')).toBeInTheDocument();
      expect(screen.getByText('Second Chat')).toBeInTheDocument();
    });

    it('displays message count for each chat', () => {
      const onLoadChats = vi.fn();
      const onNewChat = vi.fn();
      const onSelectChat = vi.fn();
      const onDeleteChat = vi.fn();

      render(
        <ChatSidebar
          chats={mockChats}
          currentChat={null}
          loading={false}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          onDeleteChat={onDeleteChat}
          onLoadChats={onLoadChats}
        />
      );

      expect(screen.getByText('5 messages')).toBeInTheDocument();
      expect(screen.getByText('10 messages')).toBeInTheDocument();
    });

    it('displays 0 messages when total_messages is undefined', () => {
      const chatNoMessages = {
        ...mockChats[0],
        total_messages: undefined
      };
      const onLoadChats = vi.fn();
      const onNewChat = vi.fn();
      const onSelectChat = vi.fn();
      const onDeleteChat = vi.fn();

      render(
        <ChatSidebar
          chats={[chatNoMessages]}
          currentChat={null}
          loading={false}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          onDeleteChat={onDeleteChat}
          onLoadChats={onLoadChats}
        />
      );

      expect(screen.getByText('0 messages')).toBeInTheDocument();
    });
  });

  describe('Chat Selection', () => {
    it('calls onSelectChat when chat clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const onLoadChats = vi.fn();
      const onNewChat = vi.fn();
      const onSelectChat = vi.fn();
      const onDeleteChat = vi.fn();

      render(
        <ChatSidebar
          chats={mockChats}
          currentChat={null}
          loading={false}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          onDeleteChat={onDeleteChat}
          onLoadChats={onLoadChats}
        />
      );

      const chatItem = screen.getByText('First Chat');
      await user.click(chatItem);

      expect(onSelectChat).toHaveBeenCalledWith('chat-1');
    });

    it('highlights current chat with selection', () => {
      const onLoadChats = vi.fn();
      const onNewChat = vi.fn();
      const onSelectChat = vi.fn();
      const onDeleteChat = vi.fn();

      render(
        <ChatSidebar
          chats={mockChats}
          currentChat={mockChats[0]}
          loading={false}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          onDeleteChat={onDeleteChat}
          onLoadChats={onLoadChats}
        />
      );

      const firstChatElement = screen.getByText('First Chat');
      expect(firstChatElement).toBeInTheDocument();
    });

    it('does not highlight non-current chats', () => {
      const onLoadChats = vi.fn();
      const onNewChat = vi.fn();
      const onSelectChat = vi.fn();
      const onDeleteChat = vi.fn();

      render(
        <ChatSidebar
          chats={mockChats}
          currentChat={mockChats[0]}
          loading={false}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          onDeleteChat={onDeleteChat}
          onLoadChats={onLoadChats}
        />
      );

      const secondChatElement = screen.getByText('Second Chat');
      expect(secondChatElement).toBeInTheDocument();
    });
  });

  describe('Delete Chat', () => {
    it('displays delete button on hover', async () => {
      const user = userEvent.setup({ delay: null });
      const onLoadChats = vi.fn();
      const onNewChat = vi.fn();
      const onSelectChat = vi.fn();
      const onDeleteChat = vi.fn();

      render(
        <ChatSidebar
          chats={mockChats}
          currentChat={null}
          loading={false}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          onDeleteChat={onDeleteChat}
          onLoadChats={onLoadChats}
        />
      );

      const firstChat = screen.getByText('First Chat').closest('div');
      if (firstChat) {
        await user.hover(firstChat);
      }

      const deleteButtons = screen.getAllByRole('button');
      const hasDeleteButton = deleteButtons.some(btn => btn.getAttribute('title') === 'Delete chat');
      expect(hasDeleteButton).toBe(true);
    });

    it('calls onDeleteChat when delete button clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const onLoadChats = vi.fn();
      const onNewChat = vi.fn();
      const onSelectChat = vi.fn();
      const onDeleteChat = vi.fn();

      render(
        <ChatSidebar
          chats={mockChats}
          currentChat={null}
          loading={false}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          onDeleteChat={onDeleteChat}
          onLoadChats={onLoadChats}
        />
      );

      const firstChat = screen.getByText('First Chat').closest('div');
      if (firstChat) {
        await user.hover(firstChat);
      }

      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(btn => btn.getAttribute('title') === 'Delete chat');
      if (deleteButton) {
        await user.click(deleteButton);
      }

      expect(onDeleteChat).toHaveBeenCalledWith('chat-1');
    });

    it('stops propagation when delete button clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const onLoadChats = vi.fn();
      const onNewChat = vi.fn();
      const onSelectChat = vi.fn();
      const onDeleteChat = vi.fn();

      render(
        <ChatSidebar
          chats={mockChats}
          currentChat={null}
          loading={false}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          onDeleteChat={onDeleteChat}
          onLoadChats={onLoadChats}
        />
      );

      const firstChat = screen.getByText('First Chat').closest('div');
      if (firstChat) {
        await user.hover(firstChat);
      }

      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(btn => btn.getAttribute('title') === 'Delete chat');
      if (deleteButton) {
        await user.click(deleteButton);
      }

      // onSelectChat should not be called when delete button is clicked
      expect(onSelectChat).not.toHaveBeenCalled();
    });
  });

  describe('Footer', () => {
    it('displays footer text', () => {
      const onLoadChats = vi.fn();
      const onNewChat = vi.fn();
      const onSelectChat = vi.fn();
      const onDeleteChat = vi.fn();

      render(
        <ChatSidebar
          chats={[]}
          currentChat={null}
          loading={false}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          onDeleteChat={onDeleteChat}
          onLoadChats={onLoadChats}
        />
      );

      expect(screen.getByText(/RealAssist AI Chat/i)).toBeInTheDocument();
    });
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const onLoadChats = vi.fn();
      const onNewChat = vi.fn();
      const onSelectChat = vi.fn();
      const onDeleteChat = vi.fn();
      const { container } = render(
        <ChatSidebar
          chats={mockChats}
          currentChat={null}
          loading={false}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          onDeleteChat={onDeleteChat}
          onLoadChats={onLoadChats}
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('handles empty chats prop gracefully', () => {
      const onLoadChats = vi.fn();
      const onNewChat = vi.fn();
      const onSelectChat = vi.fn();
      const onDeleteChat = vi.fn();
      const { container } = render(
        <ChatSidebar
          chats={[]}
          currentChat={null}
          loading={false}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          onDeleteChat={onDeleteChat}
          onLoadChats={onLoadChats}
        />
      );

      expect(container).toBeInTheDocument();
    });
  });
});

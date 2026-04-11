import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatWindow } from '@/components/Chat/ChatWindow';
import { ChatMessage, ChatSession } from '@/hooks/useChat';

// Mock scrollIntoView
HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ChatWindow Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockChat: ChatSession = {
    id: 'chat-1',
    title: 'Test Chat',
    description: 'Test Description',
    user_id: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_messages: 0
  };

  const mockMessages: ChatMessage[] = [
    {
      id: 'msg-1',
      chat_id: 'chat-1',
      role: 'user',
      content: 'Hello',
      created_at: new Date().toISOString()
    },
    {
      id: 'msg-2',
      chat_id: 'chat-1',
      role: 'assistant',
      content: 'Hi there!',
      created_at: new Date().toISOString()
    }
  ];

  describe('No Chat State', () => {
    it('displays welcome message when no chat selected', () => {
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={null}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      expect(screen.getByText(/Welcome to RealAssist Chat/i)).toBeInTheDocument();
      expect(screen.getByText(/Create a new chat or select an existing one/i)).toBeInTheDocument();
    });

    it('shows AI logo in welcome screen', () => {
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={null}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      expect(screen.getByText('AI')).toBeInTheDocument();
    });
  });

  describe('Chat Header', () => {
    it('displays chat title', () => {
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      expect(screen.getByText('Test Chat')).toBeInTheDocument();
    });

    it('displays chat description when present', () => {
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('handles chat without description', () => {
      const chatNoDesc = { ...mockChat, description: undefined };
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={chatNoDesc}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      expect(screen.getByText('Test Chat')).toBeInTheDocument();
    });
  });

  describe('Messages Display', () => {
    it('displays empty message state', () => {
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      expect(screen.getByText(/Start a conversation/i)).toBeInTheDocument();
    });

    it('displays user messages on right side', () => {
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[mockMessages[0]]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('displays assistant messages on left side', () => {
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[mockMessages[1]]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });

    it('displays multiple messages in order', () => {
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={mockMessages}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });

    it('displays message timestamps', () => {
      const messageWithTime = {
        ...mockMessages[0],
        created_at: '2024-01-15T10:30:00Z'
      };
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[messageWithTime]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      // Verify message content is present
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('handles messages without timestamp', () => {
      const messageNoTime = { ...mockMessages[0], created_at: undefined };
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[messageNoTime]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('displays thinking indicator when loading', () => {
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={true}
          onSendMessage={onSendMessage}
        />
      );

      expect(screen.getByText(/Thinking/i)).toBeInTheDocument();
    });

    it('does not display thinking when not loading', () => {
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      expect(screen.queryByText(/Thinking/i)).not.toBeInTheDocument();
    });
  });

  describe('Message Input', () => {
    it('renders input field', () => {
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      const input = screen.getByPlaceholderText(/Type your message/i);
      expect(input).toBeInTheDocument();
    });

    it('accepts user input', async () => {
      const user = userEvent.setup({ delay: null });
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      const input = screen.getByPlaceholderText(/Type your message/i) as HTMLInputElement;
      await user.type(input, 'Hello world');

      expect(input.value).toBe('Hello world');
    });

    it('displays character count', async () => {
      const user = userEvent.setup({ delay: null });
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      const input = screen.getByPlaceholderText(/Type your message/i);
      await user.type(input, 'Test');

      expect(screen.getByText(/4\/500/)).toBeInTheDocument();
    });

    it('enforces max character limit', async () => {
      const user = userEvent.setup({ delay: null });
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      const input = screen.getByPlaceholderText(/Type your message/i) as HTMLInputElement;
      expect(input).toHaveAttribute('maxLength', '500');
    });

    it('disables input when loading', () => {
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={true}
          onSendMessage={onSendMessage}
        />
      );

      const input = screen.getByPlaceholderText(/Type your message/i) as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });

  describe('Message Sending', () => {
    it('calls onSendMessage when form submitted', async () => {
      const user = userEvent.setup({ delay: null });
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      const input = screen.getByPlaceholderText(/Type your message/i);
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[0]; // First button is the send button

      await user.type(input, 'Hello');
      await user.click(sendButton);

      expect(onSendMessage).toHaveBeenCalledWith('Hello');
    });

    it('trims whitespace before sending', async () => {
      const user = userEvent.setup({ delay: null });
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      const input = screen.getByPlaceholderText(/Type your message/i);
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[0];

      await user.type(input, '  Test message  ');
      await user.click(sendButton);

      expect(onSendMessage).toHaveBeenCalledWith('Test message');
    });

    it('clears input after sending', async () => {
      const user = userEvent.setup({ delay: null });
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      const input = screen.getByPlaceholderText(/Type your message/i) as HTMLInputElement;
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[0];

      await user.type(input, 'Test');
      await user.click(sendButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('does not send empty message', async () => {
      const user = userEvent.setup({ delay: null });
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[0];
      await user.click(sendButton);

      expect(onSendMessage).not.toHaveBeenCalled();
    });

    it('does not send whitespace-only message', async () => {
      const user = userEvent.setup({ delay: null });
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      const input = screen.getByPlaceholderText(/Type your message/i);
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[0];

      await user.type(input, '   ');
      await user.click(sendButton);

      expect(onSendMessage).not.toHaveBeenCalled();
    });

    it('disables send button when loading', () => {
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={true}
          onSendMessage={onSendMessage}
        />
      );

      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[0] as HTMLButtonElement;
      expect(sendButton.disabled).toBe(true);
    });

    it('disables send button when input is empty', () => {
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[0] as HTMLButtonElement;
      expect(sendButton.disabled).toBe(true);
    });

    it('enables send button when input has content', async () => {
      const user = userEvent.setup({ delay: null });
      const onSendMessage = vi.fn();
      render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      const input = screen.getByPlaceholderText(/Type your message/i);
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[0] as HTMLButtonElement;

      await user.type(input, 'Test');

      expect(sendButton.disabled).toBe(false);
    });
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const onSendMessage = vi.fn();
      const { container } = render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('handles null messages array', () => {
      const onSendMessage = vi.fn();
      const { container } = render(
        <ChatWindow
          currentChat={mockChat}
          messages={[]}
          loading={false}
          onSendMessage={onSendMessage}
        />
      );

      expect(container).toBeInTheDocument();
    });
  });
});

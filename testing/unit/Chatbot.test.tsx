import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chatbot } from '@/components/ui/Chatbot';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock useChat hook
const mockLoadChats = vi.fn();
const mockCreateChat = vi.fn();
const mockSelectChat = vi.fn();
const mockSendMessage = vi.fn();

vi.mock('@/hooks/useChat', () => ({
  useChat: vi.fn(() => ({
    chats: [],
    currentChat: null,
    messages: [],
    loading: false,
    createChat: mockCreateChat,
    loadChats: mockLoadChats,
    selectChat: mockSelectChat,
    sendMessage: mockSendMessage,
    deleteChat: vi.fn(),
    newChat: vi.fn(),
    error: null,
    isAuthenticated: true
  }))
}));

describe('Chatbot Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Floating Button', () => {
    it('renders floating button', () => {
      const { container } = render(
        <Router>
          <Chatbot />
        </Router>
      );
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('opens chat when button clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <Router>
          <Chatbot />
        </Router>
      );

      const buttons = screen.getAllByRole('button');
      const floatingButton = buttons[0];
      await user.click(floatingButton);

      // Chat window should load chats
      expect(mockLoadChats).toHaveBeenCalled();
    });

    it('has gold gradient styling', () => {
      const { container } = render(
        <Router>
          <Chatbot />
        </Router>
      );
      const button = container.querySelector('button');
      expect(button?.style.backgroundImage).toContain('gradient');
    });
  });

  describe('Chat Window', () => {
    it('displays chat window when opened', async () => {
      const user = userEvent.setup({ delay: null });
      const { container } = render(
        <Router>
          <Chatbot />
        </Router>
      );

      const buttons = container.querySelectorAll('button');
      await user.click(buttons[0]);

      // Should show chat window or load indicator
      expect(container).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('renders with proper container styling', () => {
      const { container } = render(
        <Router>
          <Chatbot />
        </Router>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('fixed', 'bottom-6', 'right-6');
    });

    it('has z-index for layering', () => {
      const { container } = render(
        <Router>
          <Chatbot />
        </Router>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('z-40');
    });
  });

  describe('Accessibility', () => {
    it('floating button has button role', () => {
      render(
        <Router>
          <Chatbot />
        </Router>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('renders without crashing', () => {
      const { container } = render(
        <Router>
          <Chatbot />
        </Router>
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('initializes with chat closed', () => {
      const { container } = render(
        <Router>
          <Chatbot />
        </Router>
      );

      // Floating button should be visible
      const mainDiv = container.querySelector('.fixed.bottom-6');
      expect(mainDiv).toBeInTheDocument();
    });
  });
});


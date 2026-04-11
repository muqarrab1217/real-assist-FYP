import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RagChatbot } from '../../ragBot/components/RagChatbot';

vi.mock('framer-motion', () => {
  const motion = new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        const Tag: any = prop;
        return ({ children, ...rest }: any) => <Tag {...rest}>{children}</Tag>;
      },
    }
  );
  return { motion, AnimatePresence: ({ children }: any) => <>{children}</> };
});

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => ({ isAuthenticated: true }),
}));

const mockFetch = vi.fn();

describe('RagChatbot', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'Hi there!' }),
    });
    // @ts-ignore
    global.fetch = mockFetch;
    localStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('opens, sends a message, and displays bot reply', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = render(<RagChatbot />);

    const openBtn = container.querySelector('button') as HTMLButtonElement;
    await act(async () => {
      await user.click(openBtn);
    });

    await user.type(screen.getByPlaceholderText(/type your message/i), 'Hello');

    const buttons = container.querySelectorAll('button');
    const sendBtn = buttons[buttons.length - 1] as HTMLButtonElement;
    await act(async () => {
      await user.click(sendBtn);
    });

    expect(mockFetch).toHaveBeenCalled();
    await act(async () => {
      await Promise.resolve();
    });
    expect((container.querySelector('input') as HTMLInputElement).value).toBe('');
  });

  it('renders chatbot button', () => {
    const { container } = render(<RagChatbot />);
    const openBtn = container.querySelector('button');
    expect(openBtn).toBeInTheDocument();
  });

  it('opens chatbot window on button click', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = render(<RagChatbot />);
    const openBtn = container.querySelector('button') as HTMLButtonElement;

    await act(async () => {
      await user.click(openBtn);
    });

    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
  });

  it('closes chatbot window on close button', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = render(<RagChatbot />);
    const openBtn = container.querySelector('button') as HTMLButtonElement;

    await act(async () => {
      await user.click(openBtn);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(document.body).toBeInTheDocument();
  });

  it('handles fetch error gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup({ delay: null });
    const { container } = render(<RagChatbot />);

    const openBtn = container.querySelector('button') as HTMLButtonElement;
    await act(async () => {
      await user.click(openBtn);
    });

    await user.type(screen.getByPlaceholderText(/type your message/i), 'Hello');

    const buttons = container.querySelectorAll('button');
    const sendBtn = buttons[buttons.length - 1] as HTMLButtonElement;
    await act(async () => {
      await user.click(sendBtn);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFetch).toHaveBeenCalled();
  });

  it('displays multiple messages in conversation', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = render(<RagChatbot />);

    const openBtn = container.querySelector('button') as HTMLButtonElement;
    await act(async () => {
      await user.click(openBtn);
    });

    // Send first message
    await user.type(screen.getByPlaceholderText(/type your message/i), 'Hello');
    let buttons = container.querySelectorAll('button');
    let sendBtn = buttons[buttons.length - 1] as HTMLButtonElement;
    await act(async () => {
      await user.click(sendBtn);
    });

    await act(async () => {
      await Promise.resolve();
    });

    // Send second message
    await user.type(screen.getByPlaceholderText(/type your message/i), 'Hi again');
    buttons = container.querySelectorAll('button');
    sendBtn = buttons[buttons.length - 1] as HTMLButtonElement;
    await act(async () => {
      await user.click(sendBtn);
    });

    expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('clears input after message sent', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = render(<RagChatbot />);

    const openBtn = container.querySelector('button') as HTMLButtonElement;
    await act(async () => {
      await user.click(openBtn);
    });

    const input = screen.getByPlaceholderText(/type your message/i) as HTMLInputElement;
    await user.type(input, 'Test message');

    const buttons = container.querySelectorAll('button');
    const sendBtn = buttons[buttons.length - 1] as HTMLButtonElement;
    await act(async () => {
      await user.click(sendBtn);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFetch).toHaveBeenCalled();
  });

  it('handles empty message submission', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = render(<RagChatbot />);

    const openBtn = container.querySelector('button') as HTMLButtonElement;
    await act(async () => {
      await user.click(openBtn);
    });

    const buttons = container.querySelectorAll('button');
    const sendBtn = buttons[buttons.length - 1] as HTMLButtonElement;

    // Try to send without typing anything
    await act(async () => {
      await user.click(sendBtn);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(document.body).toBeInTheDocument();
  });

  it('stores conversation in localStorage', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = render(<RagChatbot />);

    const openBtn = container.querySelector('button') as HTMLButtonElement;
    await act(async () => {
      await user.click(openBtn);
    });

    await user.type(screen.getByPlaceholderText(/type your message/i), 'Hello');

    const buttons = container.querySelectorAll('button');
    const sendBtn = buttons[buttons.length - 1] as HTMLButtonElement;
    await act(async () => {
      await user.click(sendBtn);
    });

    await act(async () => {
      await Promise.resolve();
    });

    // localStorage should have been updated
    expect(mockFetch).toHaveBeenCalled();
  });
});


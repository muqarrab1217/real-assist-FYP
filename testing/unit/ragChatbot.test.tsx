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
});


import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

describe('UI components', () => {
  it('renders Button variants and handles clicks', async () => {
    const onClick = vi.fn();
    render(
      <Button variant="destructive" size="sm" onClick={onClick}>
        Delete
      </Button>
    );

    const btn = screen.getByRole('button', { name: /delete/i });
    expect(btn).toHaveClass('bg-red-600');
    expect(btn).toHaveClass('h-9');

    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('supports rendering Button as child element', () => {
    render(
      <Button asChild>
        <a href="/test">Link Child</a>
      </Button>
    );

    const link = screen.getByRole('link', { name: /link child/i });
    expect(link).toHaveAttribute('href', '/test');
    expect(link.className).toContain('inline-flex');
  });

  it('renders Input with merged classes and attributes', () => {
    render(<Input placeholder="Email" type="email" className="custom" />);
    const input = screen.getByPlaceholderText(/email/i);
    expect(input).toHaveAttribute('type', 'email');
    expect(input.className).toContain('custom');
  });
});


import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

describe('UI components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('Button renders default variant when not specified', () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
  });

  it('Button is clickable', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Test</Button>);

    await userEvent.click(screen.getByRole('button', { name: /test/i }));
    expect(onClick).toHaveBeenCalled();
  });

  it('Button can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole('button', { name: /disabled/i });
    expect(btn).toBeDisabled();
  });

  it('Input renders with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument();
  });

  it('Input accepts user input', async () => {
    const user = userEvent.setup({ delay: null });
    render(<Input placeholder="Type here" />);

    const input = screen.getByPlaceholderText(/type here/i) as HTMLInputElement;
    await user.type(input, 'hello');

    expect(input.value).toBe('hello');
  });

  it('Input type attribute is respected', () => {
    render(<Input type="password" placeholder="Enter password" />);
    const input = screen.getByPlaceholderText(/enter password/i) as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('Button with different sizes render correctly', () => {
    render(
      <>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
      </>
    );

    expect(screen.getByRole('button', { name: /small/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /large/i })).toBeInTheDocument();
  });
});



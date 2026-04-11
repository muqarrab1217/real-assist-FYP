import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ExperienceVision } from '@/components/LandingPage/ExperienceVision';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('ExperienceVision Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ExperienceVision />);
    expect(container).toBeInTheDocument();
  });

  it('displays default title in content', () => {
    const { container } = render(<ExperienceVision />);
    expect(container.textContent).toContain('Experience Our Vision');
  });

  it('renders video element', () => {
    const { container } = render(<ExperienceVision />);
    const videos = container.querySelectorAll('video');
    expect(videos.length).toBeGreaterThan(0);
  });

  it('displays video thumbnails', () => {
    const { container } = render(<ExperienceVision />);
    const images = container.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('accepts custom className prop', () => {
    const { container } = render(<ExperienceVision className="custom-class" />);
    const section = container.querySelector('section');
    expect(section?.className).toContain('custom-class');
  });

  it('renders gallery buttons', () => {
    const { container } = render(<ExperienceVision />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('shows video duration badges', () => {
    const { container } = render(<ExperienceVision />);
    expect(container.textContent).toContain('0:55');
  });

  it('renders section element', () => {
    const { container } = render(<ExperienceVision />);
    const section = container.querySelector('section[aria-labelledby="vision-title"]');
    expect(section).toBeInTheDocument();
  });

  it('displays multiple video entries', () => {
    const { container } = render(<ExperienceVision />);
    expect(container.textContent).toContain('Pearl One');
    expect(container.textContent).toContain('ABS Mall');
  });

  it('accepts custom title prop', () => {
    const { container } = render(<ExperienceVision title="My Custom Title" />);
    expect(container.textContent).toContain('My Custom Title');
  });

  it('renders with proper heading hierarchy', () => {
    const { container } = render(<ExperienceVision />);
    const h2 = container.querySelector('h2#vision-title');
    expect(h2).toBeInTheDocument();
  });
});

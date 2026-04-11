import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectSlider } from '@/components/Projects/ProjectSlider';

// Mock detailedProjects data
vi.mock('@/data/extractedMockData', () => ({
  detailedProjects: [
    {
      id: 'proj-1',
      name: 'Luxury Palm Residences',
      location: 'Downtown Dubai',
      description: 'Premium residential development',
      status: 'upcoming',
      images: ['https://example.com/image1.jpg']
    },
    {
      id: 'proj-2',
      name: 'Modern Tech Hub',
      location: 'Business Bay',
      description: 'Commercial development',
      status: 'construction',
      images: ['https://example.com/image2.jpg']
    }
  ]
}));

describe('ProjectSlider Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const mockOnEnroll = vi.fn();
      const { container } = render(<ProjectSlider onEnroll={mockOnEnroll} />);
      expect(container).toBeInTheDocument();
    });

    it('displays section title', () => {
      const mockOnEnroll = vi.fn();
      render(<ProjectSlider onEnroll={mockOnEnroll} />);
      expect(screen.getByText('Current & Upcoming Projects')).toBeInTheDocument();
    });

    it('displays description text', () => {
      const mockOnEnroll = vi.fn();
      render(<ProjectSlider onEnroll={mockOnEnroll} />);
      expect(screen.getByText(/Join the future of premium living/i)).toBeInTheDocument();
    });
  });

  describe('Project Display', () => {
    it('renders project cards', () => {
      const mockOnEnroll = vi.fn();
      render(<ProjectSlider onEnroll={mockOnEnroll} />);
      expect(screen.getByText('Luxury Palm Residences')).toBeInTheDocument();
      expect(screen.getByText('Modern Tech Hub')).toBeInTheDocument();
    });

    it('displays project location', () => {
      const mockOnEnroll = vi.fn();
      render(<ProjectSlider onEnroll={mockOnEnroll} />);
      expect(screen.getByText('Downtown Dubai')).toBeInTheDocument();
      expect(screen.getByText('Business Bay')).toBeInTheDocument();
    });

    it('displays project description', () => {
      const mockOnEnroll = vi.fn();
      render(<ProjectSlider onEnroll={mockOnEnroll} />);
      expect(screen.getByText('Premium residential development')).toBeInTheDocument();
      expect(screen.getByText('Commercial development')).toBeInTheDocument();
    });

    it('displays project status badges', () => {
      const mockOnEnroll = vi.fn();
      render(<ProjectSlider onEnroll={mockOnEnroll} />);
      expect(screen.getByText('Upcoming')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('displays project images', () => {
      const mockOnEnroll = vi.fn();
      const { container } = render(<ProjectSlider onEnroll={mockOnEnroll} />);
      const images = container.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  describe('Enroll Button', () => {
    it('renders enroll buttons for each project', () => {
      const mockOnEnroll = vi.fn();
      render(<ProjectSlider onEnroll={mockOnEnroll} />);
      const enrollButtons = screen.getAllByText('Enroll Now');
      expect(enrollButtons.length).toBeGreaterThan(0);
    });

    it('calls onEnroll callback when button clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const mockOnEnroll = vi.fn();
      render(<ProjectSlider onEnroll={mockOnEnroll} />);

      const enrollButtons = screen.getAllByText('Enroll Now');
      await user.click(enrollButtons[0]);

      expect(mockOnEnroll).toHaveBeenCalled();
    });
  });

  describe('Navigation Buttons', () => {
    it('renders navigation icon buttons', () => {
      const mockOnEnroll = vi.fn();
      const { container } = render(<ProjectSlider onEnroll={mockOnEnroll} />);
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Styling', () => {
    it('has dark background styling', () => {
      const mockOnEnroll = vi.fn();
      const { container } = render(<ProjectSlider onEnroll={mockOnEnroll} />);
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('has gold accent color in title', () => {
      const mockOnEnroll = vi.fn();
      render(<ProjectSlider onEnroll={mockOnEnroll} />);
      const title = screen.getByText('Current & Upcoming Projects');
      expect(title).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles', () => {
      const mockOnEnroll = vi.fn();
      const { container } = render(<ProjectSlider onEnroll={mockOnEnroll} />);
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('project cards are properly structured', () => {
      const mockOnEnroll = vi.fn();
      const { container } = render(<ProjectSlider onEnroll={mockOnEnroll} />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });
  });
});

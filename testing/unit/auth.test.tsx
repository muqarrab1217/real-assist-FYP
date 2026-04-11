import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthLoader } from '@/components/auth/AuthLoader';

describe('Auth Components', () => {
  describe('AuthLoader', () => {
    it('renders loading spinner', () => {
      const { container } = render(<AuthLoader />);
      expect(container).toBeInTheDocument();
    });

    it('displays loading text', () => {
      render(<AuthLoader />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('has loading animation element', () => {
      const { container } = render(<AuthLoader />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('has full screen height', () => {
      const { container } = render(<AuthLoader />);
      const wrapper = container.querySelector('.min-h-screen');
      expect(wrapper).toBeInTheDocument();
    });

    it('centers content vertically and horizontally', () => {
      const { container } = render(<AuthLoader />);
      const centerDiv = container.querySelector('.flex.items-center.justify-center');
      expect(centerDiv).toBeInTheDocument();
    });

    it('renders without crashing', () => {
      const { container } = render(<AuthLoader />);
      expect(container).toBeInTheDocument();
    });

    it('has text-center alignment', () => {
      const { container } = render(<AuthLoader />);
      const textDiv = container.querySelector('.text-center');
      expect(textDiv).toBeInTheDocument();
    });

    it('displays only one loading message', () => {
      render(<AuthLoader />);
      const loadingTexts = screen.getAllByText('Loading...');
      expect(loadingTexts.length).toBe(1);
    });
  });
});



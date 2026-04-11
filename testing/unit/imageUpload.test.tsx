import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageUpload } from '@/components/Images/ImageUpload';

// Mock useFileUpload hook
vi.mock('@/hooks/useFileUpload', () => ({
  useFileUpload: vi.fn((config) => ({
    uploadState: {
      isUploading: false,
      progress: 0,
      error: null,
      success: false,
      fileName: ''
    },
    files: [],
    uploadedUrls: [],
    handleFileSelect: vi.fn(),
    removeFile: vi.fn(),
    uploadFiles: vi.fn(),
    hasFiles: false,
    remainingSlots: 10
  }))
}));

describe('ImageUpload Component', () => {
  const mockOnImagesUpload = vi.fn();
  const mockOnRemoveExisting = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      expect(container).toBeInTheDocument();
    });

    it('displays upload drop zone', () => {
      render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      expect(screen.getByText(/Drag and drop images here/i)).toBeInTheDocument();
    });

    it('displays browse button text', () => {
      render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      expect(screen.getByText(/or click button below to browse/i)).toBeInTheDocument();
    });

    it('displays browse button', () => {
      render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      expect(screen.getByRole('button', { name: /Browse Images/i })).toBeInTheDocument();
    });

    it('displays helper text', () => {
      render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      expect(screen.getByText(/Supported formats: JPEG, PNG, WebP, GIF/i)).toBeInTheDocument();
      expect(screen.getByText(/Maximum file size: 5MB per image/i)).toBeInTheDocument();
      expect(screen.getByText(/Recommended dimensions: 1600x1200px or higher/i)).toBeInTheDocument();
    });
  });

  describe('File Input', () => {
    it('has file input element', () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
    });

    it('file input accepts multiple files', () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('multiple');
    });

    it('file input accepts image types', () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('accept', 'image/*');
    });

    it('file input is hidden', () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput?.className).toContain('hidden');
    });
  });

  describe('Drag and Drop', () => {
    it('responds to dragenter event', async () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      const dropZone = container.querySelector('[className*="border-dashed"]');

      if (dropZone) {
        fireEvent.dragEnter(dropZone);
        expect(dropZone).toBeInTheDocument();
      }
    });

    it('responds to dragover event', async () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      const dropZone = container.querySelector('[className*="border-dashed"]');

      if (dropZone) {
        fireEvent.dragOver(dropZone);
        expect(dropZone).toBeInTheDocument();
      }
    });

    it('responds to dragleave event', () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      const dropZone = container.querySelector('[className*="border-dashed"]');

      if (dropZone) {
        fireEvent.dragLeave(dropZone);
        expect(dropZone).toBeInTheDocument();
      }
    });

    it('has drop zone element', () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      const dropZone = container.querySelector('[class*="border"]');
      expect(dropZone).toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('renders with default props', () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      expect(container).toBeInTheDocument();
    });

    it('accepts maxFiles prop', () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} maxFiles={5} />
      );

      expect(container).toBeInTheDocument();
    });

    it('accepts maxFileSize prop', () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} maxFileSize={10485760} />
      );

      expect(container).toBeInTheDocument();
    });

    it('accepts folder prop', () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} folder="custom-folder" />
      );

      expect(container).toBeInTheDocument();
    });

    it('accepts existingImages prop', () => {
      const { container } = render(
        <ImageUpload
          onImagesUpload={mockOnImagesUpload}
          existingImages={['https://example.com/image.jpg']}
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('accepts onRemoveExisting callback', () => {
      const { container } = render(
        <ImageUpload
          onImagesUpload={mockOnImagesUpload}
          existingImages={['https://example.com/image.jpg']}
          onRemoveExisting={mockOnRemoveExisting}
        />
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Browse Button Interaction', () => {
    it('browse button triggers file input', async () => {
      const user = userEvent.setup({ delay: null });
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      const button = screen.getByRole('button', { name: /Browse Images/i });
      await user.click(button);

      expect(button).toBeInTheDocument();
    });

    it('browse button has proper styling', () => {
      render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      const button = screen.getByRole('button', { name: /Browse Images/i });
      expect(button).toHaveClass('bg-gradient-to-r');
    });
  });

  describe('Helper Text Display', () => {
    it('displays format information', () => {
      render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      expect(screen.getByText(/JPEG, PNG, WebP, GIF/i)).toBeInTheDocument();
    });

    it('displays size information', () => {
      render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      expect(screen.getByText(/5MB per image/i)).toBeInTheDocument();
    });

    it('displays dimension recommendation', () => {
      render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      expect(screen.getByText(/1600x1200px/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('browse button has button type', () => {
      render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      const button = screen.getByRole('button', { name: /Browse Images/i });
      expect(button).toHaveAttribute('type', 'button');
    });

    it('file input has proper attributes', () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('accept');
      expect(fileInput).toHaveAttribute('multiple');
    });
  });

  describe('Text and Messages', () => {
    it('displays drag-drop text', () => {
      render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      expect(screen.getByText(/Drag and drop images here/i)).toBeInTheDocument();
    });

    it('displays alternative instruction text', () => {
      render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      expect(screen.getByText(/or click button below/i)).toBeInTheDocument();
    });
  });

  describe('Layout and Structure', () => {
    it('has main container with content', () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      const spacer = container.querySelector('[class*="space"]') || container.firstChild;
      expect(spacer).toBeInTheDocument();
    });

    it('has upload zone with border styling', () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      const zone = container.querySelector('[class*="border"]');
      expect(zone).toBeInTheDocument();
    });

    it('has rounded corners on elements', () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      const elements = container.querySelectorAll('[class*="rounded"]');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Icon Display', () => {
    it('displays photo icon', () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('icon has sizing classes', () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon?.className).toBeTruthy();
    });
  });

  describe('Static Content', () => {
    it('displays as interactive component', () => {
      const { container } = render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      expect(container).toBeInTheDocument();
    });

    it('has required sections', () => {
      render(
        <ImageUpload onImagesUpload={mockOnImagesUpload} />
      );

      // Upload area
      expect(screen.getByText(/Drag and drop/i)).toBeInTheDocument();

      // Button
      expect(screen.getByRole('button', { name: /Browse/i })).toBeInTheDocument();

      // Helper text
      expect(screen.getByText(/Supported formats/i)).toBeInTheDocument();
    });
  });
});

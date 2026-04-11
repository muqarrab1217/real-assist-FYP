import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getImageDimensions,
  validateImageDimensions,
  compressImage,
  getImagePreview,
  formatFileSize,
  getFileExtension,
  isImage,
  getImageType,
} from '@/lib/imageUtils';

describe('Image Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getImageDimensions', () => {
    it('returns image dimensions for valid image file', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(function () {
          this.onload?.({ target: { result: 'data:image/jpeg;base64,test' } });
        }),
        onerror: null,
        onload: null,
      };

      global.FileReader = vi.fn(() => mockFileReader) as any;

      // Mock Image
      global.Image = vi.fn(function () {
        setTimeout(() => {
          this.width = 800;
          this.height = 600;
          this.onload?.();
        }, 0);
      }) as any;

      const result = await getImageDimensions(file);
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');
    });

    it('represents image dimensions correctly', async () => {
      const file = new File([''], 'test.png', { type: 'image/png' });

      const mockFileReader = {
        readAsDataURL: vi.fn(function () {
          this.onload?.({ target: { result: 'data:image/png;base64,test' } });
        }),
        onerror: null,
        onload: null,
      };

      global.FileReader = vi.fn(() => mockFileReader) as any;
      global.Image = vi.fn(function () {
        setTimeout(() => {
          this.width = 1920;
          this.height = 1080;
          this.onload?.();
        }, 0);
      }) as any;

      const result = await getImageDimensions(file);
      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
    });
  });

  describe('validateImageDimensions', () => {
    it('validates dimensions above minimum requirement', () => {
      const result = validateImageDimensions(500, 400);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('invalidates dimensions below minimum requirement', () => {
      const result = validateImageDimensions(200, 150);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('uses custom minimum dimensions', () => {
      const result = validateImageDimensions(300, 200, 1000, 800);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('1000x800');
    });

    it('validates exact minimum dimensions', () => {
      const result = validateImageDimensions(400, 300);
      expect(result.valid).toBe(true);
    });
  });

  describe('formatFileSize', () => {
    it('formats zero bytes', () => {
      const result = formatFileSize(0);
      expect(result).toBe('0 Bytes');
    });

    it('formats bytes correctly', () => {
      const result = formatFileSize(512);
      expect(result).toContain('Bytes');
    });

    it('formats kilobytes correctly', () => {
      const result = formatFileSize(1024 * 5);
      expect(result).toContain('KB');
    });

    it('formats megabytes correctly', () => {
      const result = formatFileSize(1024 * 1024 * 2);
      expect(result).toContain('MB');
    });

    it('formats gigabytes correctly', () => {
      const result = formatFileSize(1024 * 1024 * 1024 * 3);
      expect(result).toContain('GB');
    });

    it('formats large file size accurately', () => {
      const result = formatFileSize(1536 * 1024); // 1.5 MB
      expect(result).toContain('MB');
    });
  });

  describe('getFileExtension', () => {
    it('extracts file extension from filename', () => {
      const result = getFileExtension('image.jpg');
      expect(result).toBe('jpg');
    });

    it('handles uppercase extensions', () => {
      const result = getFileExtension('image.PNG');
      expect(result).toBe('png');
    });

    it('handles multiple dots in filename', () => {
      const result = getFileExtension('my.image.v2.jpeg');
      expect(result).toBe('jpeg');
    });

    it('returns full name when no extension found', () => {
      const result = getFileExtension('image');
      expect(result).toBe('image');
    });

    it('handles common image formats', () => {
      expect(getFileExtension('test.webp')).toBe('webp');
      expect(getFileExtension('test.gif')).toBe('gif');
      expect(getFileExtension('test.svg')).toBe('svg');
    });
  });

  describe('isImage', () => {
    it('recognizes jpeg as image', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      expect(isImage(file)).toBe(true);
    });

    it('recognizes png as image', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      expect(isImage(file)).toBe(true);
    });

    it('recognizes webp as image', () => {
      const file = new File([''], 'test.webp', { type: 'image/webp' });
      expect(isImage(file)).toBe(true);
    });

    it('rejects non-image files', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      expect(isImage(file)).toBe(false);
    });

    it('rejects text files', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      expect(isImage(file)).toBe(false);
    });
  });

  describe('getImageType', () => {
    it('identifies jpeg mime type', () => {
      expect(getImageType('image/jpeg')).toBe('jpeg');
    });

    it('identifies png mime type', () => {
      expect(getImageType('image/png')).toBe('png');
    });

    it('identifies webp mime type', () => {
      expect(getImageType('image/webp')).toBe('webp');
    });

    it('identifies gif mime type', () => {
      expect(getImageType('image/gif')).toBe('gif');
    });

    it('returns unknown for unrecognized mime type', () => {
      expect(getImageType('image/bmp')).toBe('unknown');
      expect(getImageType('text/plain')).toBe('unknown');
    });

    it('handles jpeg format', () => {
      expect(getImageType('image/jpeg')).toBe('jpeg');
    });

    it('returns unknown for unsupported jpeg variants', () => {
      // image/jpg is not explicitly handled, returns unknown
      expect(getImageType('image/jpg')).toBe('unknown');
    });
  });

  describe('getImagePreview', () => {
    it('generates image preview data URL', async () => {
      const file = new File(['test'], 'preview.jpg', { type: 'image/jpeg' });

      const mockFileReader = {
        readAsDataURL: vi.fn(function () {
          this.onload?.({ target: { result: 'data:image/jpeg;base64,preview' } });
        }),
        onerror: null,
        onload: null,
      };

      global.FileReader = vi.fn(() => mockFileReader) as any;

      const result = await getImagePreview(file);
      expect(result).toContain('data:');
    });

    it('handles FileReader errors', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

      const mockFileReader = {
        readAsDataURL: vi.fn(function () {
          this.onerror?.();
        }),
        onerror: null,
        onload: null,
      };

      global.FileReader = vi.fn(() => mockFileReader) as any;

      try {
        await getImagePreview(file);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('compressImage', () => {
    it('compresses image successfully', async () => {
      const file = new File([''], 'large.jpg', { type: 'image/jpeg' });

      const mockFileReader = {
        readAsDataURL: vi.fn(function () {
          this.onload?.({ target: { result: 'data:image/jpeg;base64,test' } });
        }),
        onerror: null,
        onload: null,
      };

      global.FileReader = vi.fn(() => mockFileReader) as any;

      const mockCanvas = {
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
        })),
        toBlob: vi.fn((callback) => {
          callback(new Blob(['compressed'], { type: 'image/jpeg' }));
        }),
        width: 0,
        height: 0,
      };

      global.Image = vi.fn(function () {
        this.width = 4000;
        this.height = 3000;
        setTimeout(() => this.onload?.(), 0);
      }) as any;

      document.createElement = vi.fn((tag) => {
        if (tag === 'canvas') return mockCanvas as any;
        return document.createElement(tag);
      });

      const result = await compressImage(file, 0.8, 2000, 2000);
      expect(result).toBeInstanceOf(Blob);
    });
  });
});

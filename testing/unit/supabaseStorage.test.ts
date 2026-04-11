import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateFile,
  generateFileName,
  uploadImageFile,
  uploadMultipleImages,
  getImagePublicUrl,
  deleteImageFile,
  deleteMultipleImages,
  initalizeBucket,
  UploadResponse,
  UploadProgress
} from '@/lib/supabaseStorage';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn((bucket) => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
        remove: vi.fn(),
        list: vi.fn()
      }))
    }
  }
}));

describe('Supabase Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateFile', () => {
    it('validates jpeg file correctly', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('validates png file correctly', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it('validates webp file correctly', () => {
      const file = new File([''], 'test.webp', { type: 'image/webp' });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it('validates gif file correctly', () => {
      const file = new File([''], 'test.gif', { type: 'image/gif' });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it('rejects files exceeding 5MB size limit', () => {
      const largeContent = new ArrayBuffer(6 * 1024 * 1024); // 6MB
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('5MB');
      expect(result.error).toContain('exceeds');
    });

    it('displays formatted file size in error message', () => {
      const content = new ArrayBuffer(6 * 1024 * 1024);
      const file = new File([content], 'large.jpg', { type: 'image/jpeg' });
      const result = validateFile(file);
      expect(result.error).toMatch(/\d+\.\d+MB/);
    });

    it('rejects non-image file types', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Only JPEG, PNG, WebP, and GIF');
    });

    it('rejects text files', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
    });

    it('accepts file at exactly 5MB', () => {
      const content = new ArrayBuffer(5 * 1024 * 1024);
      const file = new File([content], 'exact.jpg', { type: 'image/jpeg' });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });
  });

  describe('generateFileName', () => {
    it('generates filename with extension', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const fileName = generateFileName(file);
      expect(fileName).toContain('.jpg');
    });

    it('generates unique filenames', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const fileName1 = generateFileName(file);
      const fileName2 = generateFileName(file);
      expect(fileName1).not.toBe(fileName2);
    });

    it('includes timestamp in filename', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const fileName = generateFileName(file);
      const parts = fileName.split('-');
      expect(parts.length).toBeGreaterThanOrEqual(2);
      expect(/^\d+$/.test(parts[0])).toBe(true);
    });

    it('handles various file extensions', () => {
      expect(generateFileName(new File([''], 'image.png', { type: 'image/png' }))).toContain('.png');
      expect(generateFileName(new File([''], 'image.webp', { type: 'image/webp' }))).toContain('.webp');
      expect(generateFileName(new File([''], 'image.gif', { type: 'image/gif' }))).toContain('.gif');
    });

    it('handles files with multiple dots in name', () => {
      const file = new File([''], 'my.image.v2.jpg', { type: 'image/jpeg' });
      const fileName = generateFileName(file);
      expect(fileName).toContain('.jpg');
    });
  });

  describe('uploadImageFile', () => {
    it('validates file before uploading', async () => {
      const invalidFile = new File([''], 'test.txt', { type: 'text/plain' });
      const result = await uploadImageFile(invalidFile);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error for oversized file', async () => {
      const content = new ArrayBuffer(6 * 1024 * 1024);
      const file = new File([content], 'large.jpg', { type: 'image/jpeg' });
      const result = await uploadImageFile(file);
      expect(result.success).toBe(false);
      expect(result.error).toContain('5MB');
    });

    it('calls progress callback at multiple stages', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockFrom = vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'projects/test.jpg' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } })
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const progressCallback = vi.fn();

      await uploadImageFile(file, 'projects', progressCallback);

      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({ progress: 30, fileName: 'test.jpg' })
      );
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({ progress: 70, fileName: 'test.jpg' })
      );
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({ progress: 100, fileName: 'test.jpg' })
      );
    });

    it('returns success with URL on successful upload', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockFrom = vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'projects/test.jpg' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } })
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await uploadImageFile(file, 'projects');

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://example.com/test.jpg');
      expect(result.fileName).toBeDefined();
    });

    it('handles upload errors with helpful messages', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockFrom = vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Bucket not found' }
        }),
        getPublicUrl: vi.fn()
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await uploadImageFile(file);

      expect(result.success).toBe(false);
      expect(result.error).toContain('project-images');
    });

    it('uses custom folder path', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockUpload = vi.fn().mockResolvedValue({ data: { path: 'custom/test.jpg' }, error: null });
      const mockFrom = vi.fn(() => ({
        upload: mockUpload,
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } })
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await uploadImageFile(file, 'custom-folder');

      expect(mockUpload).toHaveBeenCalled();
      const uploadCall = mockUpload.mock.calls[0];
      expect(uploadCall[0]).toContain('custom-folder');
    });

    it('catches and handles exception errors', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockFrom = vi.fn(() => {
        throw new Error('Connection failed');
      });
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await uploadImageFile(file);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection failed');
    });
  });

  describe('uploadMultipleImages', () => {
    it('uploads multiple files sequentially', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockFrom = vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'projects/test.jpg' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } })
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
      ];

      const results = await uploadMultipleImages(files);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });

    it('returns results for each file', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockFrom = vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'projects/test.jpg' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } })
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.png', { type: 'image/png' })
      ];

      const results = await uploadMultipleImages(files);

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBe(files.length);
    });

    it('handles mixed success and failure', async () => {
      const { supabase } = await import('@/lib/supabase');
      let callCount = 0;
      const mockFrom = vi.fn(() => ({
        upload: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({ data: { path: 'projects/test.jpg' }, error: null });
          }
          return Promise.resolve({ data: null, error: { message: 'Upload failed' } });
        }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } })
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
      ];

      const results = await uploadMultipleImages(files);

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });

    it('uses custom folder', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockUpload = vi.fn().mockResolvedValue({ data: { path: 'custom/test.jpg' }, error: null });
      const mockFrom = vi.fn(() => ({
        upload: mockUpload,
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } })
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const files = [new File(['test'], 'test.jpg', { type: 'image/jpeg' })];
      await uploadMultipleImages(files, 'custom');

      const uploadCall = mockUpload.mock.calls[0];
      expect(uploadCall[0]).toContain('custom');
    });
  });

  describe('getImagePublicUrl', () => {
    it('returns public URL for file', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockFrom = vi.fn(() => ({
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/image.jpg' } })
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const url = getImagePublicUrl('projects/test.jpg');

      expect(url).toBe('https://example.com/image.jpg');
    });

    it('uses provided file path', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockGetPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } });
      const mockFrom = vi.fn(() => ({
        getPublicUrl: mockGetPublicUrl
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      getImagePublicUrl('custom/path/file.png');

      expect(mockGetPublicUrl).toHaveBeenCalledWith('custom/path/file.png');
    });
  });

  describe('deleteImageFile', () => {
    it('deletes file successfully', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockFrom = vi.fn(() => ({
        remove: vi.fn().mockResolvedValue({ error: null })
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const result = await deleteImageFile('projects/test.jpg');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('returns error on deletion failure', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockFrom = vi.fn(() => ({
        remove: vi.fn().mockResolvedValue({ error: { message: 'File not found' } })
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const result = await deleteImageFile('projects/test.jpg');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('handles exception errors', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockFrom = vi.fn(() => ({
        remove: vi.fn().mockRejectedValue(new Error('Connection error'))
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const result = await deleteImageFile('projects/test.jpg');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection error');
    });
  });

  describe('deleteMultipleImages', () => {
    it('deletes multiple files successfully', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockFrom = vi.fn(() => ({
        remove: vi.fn().mockResolvedValue({ error: null })
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const result = await deleteMultipleImages(['projects/test1.jpg', 'projects/test2.jpg']);

      expect(result.success).toBe(true);
    });

    it('passes array of paths to remove', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockRemove = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn(() => ({
        remove: mockRemove
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const paths = ['projects/test1.jpg', 'projects/test2.jpg'];
      await deleteMultipleImages(paths);

      expect(mockRemove).toHaveBeenCalledWith(paths);
    });

    it('returns error on deletion failure', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockFrom = vi.fn(() => ({
        remove: vi.fn().mockResolvedValue({ error: { message: 'Batch delete failed' } })
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const result = await deleteMultipleImages(['projects/test.jpg']);

      expect(result.success).toBe(false);
    });
  });

  describe('initalizeBucket', () => {
    it('succeeds when bucket exists', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockFrom = vi.fn(() => ({
        list: vi.fn().mockResolvedValue({ data: [], error: null })
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const result = await initalizeBucket();

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('succeeds even if bucket list fails', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockFrom = vi.fn(() => ({
        list: vi.fn().mockResolvedValue({ data: null, error: { message: 'Bucket not found' } })
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const result = await initalizeBucket();

      expect(result.success).toBe(true);
    });

    it('handles exception errors', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockFrom = vi.fn(() => ({
        list: vi.fn().mockRejectedValue(new Error('Network error'))
      }));
      vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

      const result = await initalizeBucket();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });
});

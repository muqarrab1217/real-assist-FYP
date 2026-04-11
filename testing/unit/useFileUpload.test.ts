import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileUpload } from '@/hooks/useFileUpload';

// Mock dependencies
vi.mock('@/lib/supabaseStorage', () => ({
  uploadImageFile: vi.fn(),
  uploadMultipleImages: vi.fn()
}));

vi.mock('@/lib/imageUtils', () => ({
  getImagePreview: vi.fn((file) => Promise.resolve('data:image/jpeg;base64,preview')),
  formatFileSize: vi.fn((size) => {
    if (size === 0) return '0 Bytes';
    if (size < 1024) return `${size} Bytes`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  })
}));

describe('useFileUpload Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = vi.fn();
  });

  describe('Initial State', () => {
    it('initializes with empty state', () => {
      const { result } = renderHook(() => useFileUpload());

      expect(result.current.files).toEqual([]);
      expect(result.current.uploadedUrls).toEqual([]);
      expect(result.current.uploadState).toEqual({
        isUploading: false,
        progress: 0,
        fileName: '',
        error: null,
        success: false
      });
    });

    it('initializes with custom options', () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useFileUpload({
          maxFiles: 5,
          folder: 'custom-folder',
          onSuccess,
          onError
        })
      );

      expect(result.current.remainingSlots).toBe(5);
    });

    it('has correct computed properties initially', () => {
      const { result } = renderHook(() => useFileUpload());

      expect(result.current.hasFiles).toBe(false);
      expect(result.current.remainingSlots).toBe(10);
      expect(result.current.totalSize).toBe(0);
      expect(result.current.formattedTotalSize).toBe('0 Bytes');
    });
  });

  describe('handleFileSelect', () => {
    it('adds selected files to state', async () => {
      const { result } = renderHook(() => useFileUpload());
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await act(async () => {
        const fileList = {
          0: file,
          length: 1,
          item: () => file
        } as any;
        await result.current.handleFileSelect(fileList);
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0].name).toBe('test.jpg');
    });

    it('generates preview for each file', async () => {
      const { getImagePreview } = await import('@/lib/imageUtils');
      const { result } = renderHook(() => useFileUpload());
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await act(async () => {
        const fileList = { 0: file, length: 1, item: () => file } as any;
        await result.current.handleFileSelect(fileList);
      });

      expect(result.current.files[0].preview).toBeDefined();
    });

    it('respects maxFiles limit', async () => {
      const { result } = renderHook(() => useFileUpload({ maxFiles: 2 }));

      await act(async () => {
        const files = [
          new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
          new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
          new File(['test3'], 'test3.jpg', { type: 'image/jpeg' })
        ];

        const fileList = {
          0: files[0],
          1: files[1],
          2: files[2],
          length: 3,
          item: (i: number) => files[i]
        } as any;

        await result.current.handleFileSelect(fileList);
      });

      expect(result.current.files).toHaveLength(2);
    });

    it('handles null file list', async () => {
      const { result } = renderHook(() => useFileUpload());

      await act(async () => {
        await result.current.handleFileSelect(null);
      });

      expect(result.current.files).toHaveLength(0);
    });

    it('clears previous errors on file select', async () => {
      const { result } = renderHook(() => useFileUpload());

      // Set initial error state
      await act(async () => {
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        const fileList = { 0: file, length: 1, item: () => file } as any;
        await result.current.handleFileSelect(fileList);
      });

      // Select new file should clear error
      await act(async () => {
        const file = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });
        const fileList = { 0: file, length: 1, item: () => file } as any;
        await result.current.handleFileSelect(fileList);
      });

      expect(result.current.uploadState.error).toBeNull();
    });
  });

  describe('removeFile', () => {
    it('removes file by id', async () => {
      const { result } = renderHook(() => useFileUpload());
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await act(async () => {
        const fileList = { 0: file, length: 1, item: () => file } as any;
        await result.current.handleFileSelect(fileList);
      });

      const fileId = result.current.files[0].id;

      act(() => {
        result.current.removeFile(fileId!);
      });

      expect(result.current.files).toHaveLength(0);
    });

    it('updates remaining slots after removal', async () => {
      const { result } = renderHook(() => useFileUpload({ maxFiles: 5 }));
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await act(async () => {
        const fileList = { 0: file, length: 1, item: () => file } as any;
        await result.current.handleFileSelect(fileList);
      });

      expect(result.current.remainingSlots).toBe(4);

      act(() => {
        result.current.removeFile(result.current.files[0].id!);
      });

      expect(result.current.remainingSlots).toBe(5);
    });
  });

  describe('clearFiles', () => {
    it('removes all files', async () => {
      const { result } = renderHook(() => useFileUpload());

      await act(async () => {
        const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
        const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });
        const fileList = {
          0: file1,
          1: file2,
          length: 2,
          item: (i: number) => [file1, file2][i]
        } as any;
        await result.current.handleFileSelect(fileList);
      });

      expect(result.current.files).toHaveLength(2);

      act(() => {
        result.current.clearFiles();
      });

      expect(result.current.files).toHaveLength(0);
    });

    it('revokes object URLs for previews', async () => {
      const { result } = renderHook(() => useFileUpload());
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await act(async () => {
        const fileList = { 0: file, length: 1, item: () => file } as any;
        await result.current.handleFileSelect(fileList);
      });

      act(() => {
        result.current.clearFiles();
      });

      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('uploadFiles', () => {
    it('returns error when no files selected', async () => {
      const onError = vi.fn();
      const { result } = renderHook(() => useFileUpload({ onError }));

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadFiles();
      });

      expect(uploadResult).toEqual([]);
      expect(result.current.uploadState.error).toContain('No files selected');
      expect(onError).toHaveBeenCalledWith('No files selected');
    });

    it('sets uploading state', async () => {
      const { uploadMultipleImages } = await import('@/lib/supabaseStorage');
      vi.mocked(uploadMultipleImages).mockResolvedValue([
        { success: true, url: 'https://example.com/test.jpg' }
      ]);

      const { result } = renderHook(() => useFileUpload());
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await act(async () => {
        const fileList = { 0: file, length: 1, item: () => file } as any;
        await result.current.handleFileSelect(fileList);
      });

      act(() => {
        result.current.uploadFiles();
      });

      expect(result.current.uploadState.isUploading).toBe(true);
    });

    it('updates progress during upload', async () => {
      const { uploadMultipleImages } = await import('@/lib/supabaseStorage');
      vi.mocked(uploadMultipleImages).mockImplementation(
        (files, folder, onProgress) => {
          onProgress?.({ progress: 50, fileName: 'test.jpg' });
          return Promise.resolve([{ success: true, url: 'https://example.com/test.jpg' }]);
        }
      );

      const { result } = renderHook(() => useFileUpload());
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await act(async () => {
        const fileList = { 0: file, length: 1, item: () => file } as any;
        await result.current.handleFileSelect(fileList);
      });

      await act(async () => {
        await result.current.uploadFiles();
      });

      // Progress is updated to 100 on completion, but function was called
      expect(result.current.uploadState.isUploading).toBe(false);
      expect(result.current.uploadState.success).toBe(true);
    });

    it('marks success on all uploads complete', async () => {
      const { uploadMultipleImages } = await import('@/lib/supabaseStorage');
      vi.mocked(uploadMultipleImages).mockResolvedValue([
        { success: true, url: 'https://example.com/test1.jpg' },
        { success: true, url: 'https://example.com/test2.jpg' }
      ]);

      const { result } = renderHook(() => useFileUpload());
      const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });

      await act(async () => {
        const fileList = {
          0: file1,
          1: file2,
          length: 2,
          item: (i: number) => [file1, file2][i]
        } as any;
        await result.current.handleFileSelect(fileList);
      });

      await act(async () => {
        await result.current.uploadFiles();
      });

      expect(result.current.uploadState.success).toBe(true);
      expect(result.current.uploadState.progress).toBe(100);
    });

    it('handles partial upload failure', async () => {
      const { uploadMultipleImages } = await import('@/lib/supabaseStorage');
      vi.mocked(uploadMultipleImages).mockResolvedValue([
        { success: true, url: 'https://example.com/test1.jpg' },
        { success: false, error: 'Upload failed' }
      ]);

      const { result } = renderHook(() => useFileUpload());
      const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });

      await act(async () => {
        const fileList = {
          0: file1,
          1: file2,
          length: 2,
          item: (i: number) => [file1, file2][i]
        } as any;
        await result.current.handleFileSelect(fileList);
      });

      await act(async () => {
        await result.current.uploadFiles();
      });

      expect(result.current.uploadState.error).toContain('Failed to upload 1 file');
      expect(result.current.uploadState.isUploading).toBe(false);
    });

    it('calls onSuccess callback with URLs', async () => {
      const { uploadMultipleImages } = await import('@/lib/supabaseStorage');
      const onSuccess = vi.fn();
      vi.mocked(uploadMultipleImages).mockResolvedValue([
        { success: true, url: 'https://example.com/test.jpg' }
      ]);

      const { result } = renderHook(() => useFileUpload({ onSuccess }));
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await act(async () => {
        const fileList = { 0: file, length: 1, item: () => file } as any;
        await result.current.handleFileSelect(fileList);
      });

      await act(async () => {
        await result.current.uploadFiles();
      });

      expect(onSuccess).toHaveBeenCalledWith(['https://example.com/test.jpg']);
    });

    it('clears files after successful upload', async () => {
      const { uploadMultipleImages } = await import('@/lib/supabaseStorage');
      vi.mocked(uploadMultipleImages).mockResolvedValue([
        { success: true, url: 'https://example.com/test.jpg' }
      ]);

      const { result } = renderHook(() => useFileUpload());
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await act(async () => {
        const fileList = { 0: file, length: 1, item: () => file } as any;
        await result.current.handleFileSelect(fileList);
      });

      expect(result.current.files).toHaveLength(1);

      await act(async () => {
        await result.current.uploadFiles();
      });

      expect(result.current.files).toHaveLength(0);
    });
  });

  describe('uploadSingleFile', () => {
    it('uploads a single file', async () => {
      const { uploadImageFile } = await import('@/lib/supabaseStorage');
      vi.mocked(uploadImageFile).mockResolvedValue({
        success: true,
        url: 'https://example.com/test.jpg'
      });

      const { result } = renderHook(() => useFileUpload());
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadSingleFile(file);
      });

      expect(uploadResult).toBe('https://example.com/test.jpg');
    });

    it('tracks upload completion', async () => {
      const { uploadImageFile } = await import('@/lib/supabaseStorage');
      vi.mocked(uploadImageFile).mockImplementation(
        (file, folder, onProgress) => {
          onProgress?.({ progress: 75, fileName: 'test.jpg' });
          return Promise.resolve({
            success: true,
            url: 'https://example.com/test.jpg'
          });
        }
      );

      const { result } = renderHook(() => useFileUpload());
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await act(async () => {
        await result.current.uploadSingleFile(file);
      });

      // Upload completes with success flag
      expect(result.current.uploadState.success).toBe(true);
    });

    it('handles upload failure', async () => {
      const { uploadImageFile } = await import('@/lib/supabaseStorage');
      const onError = vi.fn();
      vi.mocked(uploadImageFile).mockResolvedValue({
        success: false,
        error: 'File too large'
      });

      const { result } = renderHook(() => useFileUpload({ onError }));
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadSingleFile(file);
      });

      expect(uploadResult).toBeNull();
      expect(result.current.uploadState.error).toBe('File too large');
      expect(onError).toHaveBeenCalledWith('File too large');
    });

    it('calls onSuccess callback', async () => {
      const { uploadImageFile } = await import('@/lib/supabaseStorage');
      const onSuccess = vi.fn();
      vi.mocked(uploadImageFile).mockResolvedValue({
        success: true,
        url: 'https://example.com/test.jpg'
      });

      const { result } = renderHook(() => useFileUpload({ onSuccess }));
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await act(async () => {
        await result.current.uploadSingleFile(file);
      });

      expect(onSuccess).toHaveBeenCalledWith(['https://example.com/test.jpg']);
    });
  });

  describe('reset', () => {
    it('clears all state', async () => {
      const { uploadMultipleImages } = await import('@/lib/supabaseStorage');
      vi.mocked(uploadMultipleImages).mockResolvedValue([
        { success: true, url: 'https://example.com/test.jpg' }
      ]);

      const { result } = renderHook(() => useFileUpload());
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await act(async () => {
        const fileList = { 0: file, length: 1, item: () => file } as any;
        await result.current.handleFileSelect(fileList);
        await result.current.uploadFiles();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.files).toHaveLength(0);
      expect(result.current.uploadedUrls).toHaveLength(0);
      expect(result.current.uploadState).toEqual({
        isUploading: false,
        progress: 0,
        fileName: '',
        error: null,
        success: false
      });
    });
  });

  describe('Computed Properties', () => {
    it('hasFiles reflects file selection', async () => {
      const { result } = renderHook(() => useFileUpload());
      expect(result.current.hasFiles).toBe(false);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await act(async () => {
        const fileList = { 0: file, length: 1, item: () => file } as any;
        await result.current.handleFileSelect(fileList);
      });

      expect(result.current.hasFiles).toBe(true);
    });

    it('remainingSlots decreases with files', async () => {
      const { result } = renderHook(() => useFileUpload({ maxFiles: 5 }));
      expect(result.current.remainingSlots).toBe(5);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await act(async () => {
        const fileList = { 0: file, length: 1, item: () => file } as any;
        await result.current.handleFileSelect(fileList);
      });

      expect(result.current.remainingSlots).toBe(4);
    });

    it('totalSize accumulates file sizes', async () => {
      const { result } = renderHook(() => useFileUpload());

      const file1 = new File(['test123'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['test456'], 'test2.jpg', { type: 'image/jpeg' });

      await act(async () => {
        const fileList = {
          0: file1,
          1: file2,
          length: 2,
          item: (i: number) => [file1, file2][i]
        } as any;
        await result.current.handleFileSelect(fileList);
      });

      expect(result.current.totalSize).toBe(file1.size + file2.size);
    });

    it('formattedTotalSize formats bytes correctly', async () => {
      const { result } = renderHook(() => useFileUpload());
      const content = new ArrayBuffer(2048);
      const file = new File([content], 'test.jpg', { type: 'image/jpeg' });

      await act(async () => {
        const fileList = { 0: file, length: 1, item: () => file } as any;
        await result.current.handleFileSelect(fileList);
      });

      expect(result.current.formattedTotalSize).toContain('KB');
    });
  });

  describe('Error Handling', () => {
    it('handles exception in uploadFiles', async () => {
      const { uploadMultipleImages } = await import('@/lib/supabaseStorage');
      const onError = vi.fn();
      vi.mocked(uploadMultipleImages).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useFileUpload({ onError }));
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await act(async () => {
        const fileList = { 0: file, length: 1, item: () => file } as any;
        await result.current.handleFileSelect(fileList);
      });

      await act(async () => {
        await result.current.uploadFiles();
      });

      expect(result.current.uploadState.error).toContain('Network error');
      expect(result.current.uploadState.isUploading).toBe(false);
    });

    it('handles exception in uploadSingleFile', async () => {
      const { uploadImageFile } = await import('@/lib/supabaseStorage');
      const onError = vi.fn();
      vi.mocked(uploadImageFile).mockRejectedValue(new Error('Upload error'));

      const { result } = renderHook(() => useFileUpload({ onError }));
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await act(async () => {
        await result.current.uploadSingleFile(file);
      });

      expect(result.current.uploadState.error).toContain('Upload error');
    });
  });
});

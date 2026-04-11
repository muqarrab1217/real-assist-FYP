/**
 * Custom React Hook for File Uploads
 * Handles upload state, progress, and error management
 */

import { useState, useCallback } from 'react';
import { uploadImageFile, uploadMultipleImages, UploadResponse } from '@/lib/supabaseStorage';
import { getImagePreview, formatFileSize } from '@/lib/imageUtils';

export interface FileWithPreview extends File {
  preview?: string;
  id?: string;
}

export interface UploadState {
  isUploading: boolean;
  progress: number;
  fileName: string;
  error: string | null;
  success: boolean;
}

export interface UseFileUploadOptions {
  maxFiles?: number;
  folder?: string;
  onSuccess?: (urls: string[]) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for handling file uploads with state management
 */
export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    maxFiles = 10,
    folder = 'projects',
    onSuccess,
    onError
  } = options;

  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    fileName: '',
    error: null,
    success: false
  });

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  /**
   * Handle file selection from input
   */
  const handleFileSelect = useCallback(
    async (selectedFiles: FileList | null) => {
      if (!selectedFiles || selectedFiles.length === 0) return;

      const newFiles: FileWithPreview[] = [];

      for (let i = 0; i < Math.min(selectedFiles.length, maxFiles - files.length); i++) {
        const file = selectedFiles[i] as FileWithPreview;

        // Generate preview
        try {
          file.preview = await getImagePreview(file);
          file.id = `${Date.now()}-${i}`;
          newFiles.push(file);
        } catch (error) {
          console.error('Failed to generate preview:', error);
        }
      }

      setFiles((prev) => [...prev, ...newFiles]);
      setUploadState((prev) => ({
        ...prev,
        error: null,
        success: false
      }));
    },
    [files.length, maxFiles]
  );

  /**
   * Remove file from selection (before upload)
   */
  const removeFile = useCallback((id: string | number) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  /**
   * Clear all selected files
   */
  const clearFiles = useCallback(() => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  }, [files]);

  /**
   * Upload all selected files
   */
  const uploadFiles = useCallback(async (): Promise<string[]> => {
    if (files.length === 0) {
      setUploadState((prev) => ({
        ...prev,
        error: 'No files selected'
      }));
      onError?.('No files selected');
      return [];
    }

    setUploadState((prev) => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
      success: false
    }));

    try {
      const results = await uploadMultipleImages(files, folder, (progress) => {
        setUploadState((prev) => ({
          ...prev,
          progress: progress.progress,
          fileName: progress.fileName
        }));
      });

      // Extract successful URLs
      const urls = results
        .filter((r) => r.success && r.url)
        .map((r) => r.url as string);

      // Check for errors
      const errors = results.filter((r) => !r.success);
      if (errors.length > 0) {
        const errorMessage = `Failed to upload ${errors.length} file(s). ${errors[0].error}`;
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          error: errorMessage,
          progress: 0
        }));
        onError?.(errorMessage);
        return urls;
      }

      setUploadedUrls((prev) => [...prev, ...urls]);
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        progress: 100,
        success: true,
        fileName: '',
        error: null
      }));

      onSuccess?.(urls);
      clearFiles();

      return urls;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
        progress: 0
      }));
      onError?.(errorMessage);
      return [];
    }
  }, [files, folder, onSuccess, onError, clearFiles]);

  /**
   * Upload single file
   */
  const uploadSingleFile = useCallback(
    async (file: File): Promise<string | null> => {
      setUploadState((prev) => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
        success: false
      }));

      try {
        const result = await uploadImageFile(file, folder, (progress) => {
          setUploadState((prev) => ({
            ...prev,
            progress: progress.progress,
            fileName: progress.fileName
          }));
        });

        if (!result.success) {
          setUploadState((prev) => ({
            ...prev,
            isUploading: false,
            error: result.error || 'Upload failed',
            progress: 0
          }));
          onError?.(result.error || 'Upload failed');
          return null;
        }

        setUploadedUrls((prev) => [...prev, result.url as string]);
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          progress: 100,
          success: true,
          fileName: '',
          error: null
        }));

        onSuccess?.([result.url as string]);
        return result.url || null;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          error: errorMessage,
          progress: 0
        }));
        onError?.(errorMessage);
        return null;
      }
    },
    [folder, onSuccess, onError]
  );

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    clearFiles();
    setUploadState({
      isUploading: false,
      progress: 0,
      fileName: '',
      error: null,
      success: false
    });
    setUploadedUrls([]);
  }, [clearFiles]);

  return {
    // State
    uploadState,
    files,
    uploadedUrls,

    // Methods
    handleFileSelect,
    removeFile,
    clearFiles,
    uploadFiles,
    uploadSingleFile,
    reset,

    // Computed
    hasFiles: files.length > 0,
    remainingSlots: Math.max(0, maxFiles - files.length),
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
    formattedTotalSize: formatFileSize(files.reduce((sum, f) => sum + f.size, 0))
  };
};

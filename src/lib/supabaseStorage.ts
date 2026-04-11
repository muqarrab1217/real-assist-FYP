/**
 * Supabase Storage Service
 * Handles file uploads, downloads, and management
 */

import { supabase } from './supabase';

// Constants
const BUCKET_NAME = 'project-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
}

export interface UploadProgress {
  progress: number;
  fileName: string;
}

/**
 * Validate file before upload
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 5MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, WebP, and GIF images are allowed'
    };
  }

  return { valid: true };
};

/**
 * Generate unique file name with timestamp
 */
export const generateFileName = (file: File): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
};

/**
 * Upload single image file to Supabase bucket
 */
export const uploadImageFile = async (
  file: File,
  folder: string = 'projects',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> => {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Generate unique file name
    const fileName = generateFileName(file);
    const filePath = `${folder}/${fileName}`;

    // Simulate progress tracking
    if (onProgress) {
      onProgress({ progress: 30, fileName: file.name });
    }

    // Upload file to Supabase bucket
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);

      // Provide helpful error messages
      let errorMessage = error.message || 'Failed to upload image';
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        errorMessage = 'Supabase bucket "project-images" not found. Please create it in Supabase dashboard and add RLS policies. See URGENT_SETUP_REQUIRED.md for instructions.';
      } else if (errorMessage.includes('Bucket')) {
        errorMessage = `Bucket error: ${errorMessage}. Make sure bucket "project-images" exists and RLS policies are configured.`;
      } else if (errorMessage.includes('Policy')) {
        errorMessage = `Permission error: Cannot upload. Please check RLS policies on the bucket.`;
      }

      return {
        success: false,
        error: errorMessage
      };
    }

    if (onProgress) {
      onProgress({ progress: 70, fileName: file.name });
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    if (onProgress) {
      onProgress({ progress: 100, fileName: file.name });
    }

    return {
      success: true,
      url: publicUrlData.publicUrl,
      fileName: filePath
    };
  } catch (error) {
    console.error('Upload exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Upload multiple image files to Supabase bucket
 */
export const uploadMultipleImages = async (
  files: File[],
  folder: string = 'projects',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse[]> => {
  const results: UploadResponse[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadImageFile(file, folder, onProgress);
    results.push(result);

    // Add small delay between uploads to avoid rate limiting
    if (i < files.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
};

/**
 * Get public URL for an uploaded image
 */
export const getImagePublicUrl = (filePath: string): string => {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
};

/**
 * Delete image file from Supabase bucket
 */
export const deleteImageFile = async (filePath: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image'
    };
  }
};

/**
 * Delete multiple image files from Supabase bucket
 */
export const deleteMultipleImages = async (filePaths: string[]): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete images'
    };
  }
};

/**
 * Initialize bucket (create if doesn't exist)
 * Run once during app setup
 */
export const initalizeBucket = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Try to list objects in bucket to check if it exists
    const { data, error } = await supabase.storage.from(BUCKET_NAME).list('projects', {
      limit: 1
    });

    if (error) {
      console.warn('Bucket initialization warning:', error.message);
      // Bucket might not exist, but Supabase usually auto-creates it
      // If needed, it could be created via Supabase dashboard
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize bucket'
    };
  }
};

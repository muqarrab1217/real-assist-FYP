/**
 * Image Upload Component
 * Reusable component for uploading images with preview and drag-and-drop
 */

import React, { useRef, useCallback } from 'react';
import { PhotoIcon, XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Button } from '@/components/ui/button';

export interface ImageUploadProps {
  maxFiles?: number;
  maxFileSize?: number;
  onImagesUpload: (urls: string[]) => void;
  existingImages?: string[];
  onRemoveExisting?: (index: number) => void;
  folder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  maxFiles = 10,
  onImagesUpload,
  existingImages = [],
  onRemoveExisting,
  folder = 'projects'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = React.useState(false);

  const {
    uploadState,
    files,
    uploadedUrls,
    handleFileSelect,
    removeFile,
    uploadFiles,
    hasFiles,
    remainingSlots
  } = useFileUpload({
    maxFiles,
    folder,
    onSuccess: (urls) => {
      onImagesUpload(urls);
    },
    onError: (error) => {
      console.error('Upload error:', error);
    }
  });

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  // Trigger file input
  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? 'border-gold-500 bg-gold-500/10'
            : 'border-gold-500/20 bg-transparent hover:border-gold-500/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        <PhotoIcon className="mx-auto h-12 w-12 text-gold-400 mb-3" />

        <p className="text-sm font-medium text-white mb-1">
          {isDragActive ? 'Drop images here' : 'Drag and drop images here'}
        </p>

        <p className="text-xs text-gray-400 mb-4">
          or click button below to browse
        </p>

        <Button
          type="button"
          onClick={handleClick}
          className="bg-gradient-to-r from-gold-500 to-gold-400 text-black font-bold hover:shadow-lg hover:shadow-gold-500/20 transition-all"
        >
          Browse Images
        </Button>

        {remainingSlots < maxFiles && (
          <p className="text-xs text-gray-500 mt-3">
            {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining
          </p>
        )}
      </div>

      {/* Upload Status */}
      {uploadState.isUploading && (
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-4 w-4 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-400">
                Uploading: {uploadState.fileName}
              </p>
              <p className="text-xs text-blue-300/70">
                {uploadState.progress}% complete
              </p>
            </div>
          </div>
          <div className="w-full h-1 bg-blue-500/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {uploadState.error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 flex gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">Upload Error</p>
            <p className="text-xs text-red-300/70 mt-1">{uploadState.error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadState.success && uploadedUrls.length > 0 && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 flex gap-3">
          <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-400">
              {uploadedUrls.length} image{uploadedUrls.length !== 1 ? 's' : ''} uploaded successfully
            </p>
          </div>
        </div>
      )}

      {/* Selected Files Preview */}
      {files.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gold-400 uppercase tracking-wider">
            Selected ({files.length}/{maxFiles})
          </p>
          <div className="grid grid-cols-2 gap-3">
            {files.map((file, index) => (
              <div
                key={file.id || index}
                className="relative group rounded-lg overflow-hidden border border-gold-500/20 bg-black/30"
              >
                {file.preview && (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-24 object-cover"
                  />
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => removeFile(file.id || index)}
                    className="p-1.5 rounded-full bg-red-500/70 hover:bg-red-500 text-white transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1">
                  <p className="text-xs text-gray-300 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)}KB</p>
                </div>
              </div>
            ))}
          </div>

          {hasFiles && !uploadState.isUploading && (
            <Button
              type="button"
              onClick={uploadFiles}
              disabled={uploadState.isUploading}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-400 text-black font-bold hover:shadow-lg hover:shadow-gold-500/20 transition-all"
            >
              Upload {files.length} Image{files.length !== 1 ? 's' : ''}
            </Button>
          )}
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gold-400 uppercase tracking-wider">
            Uploaded Images ({existingImages.length})
          </p>
          <div className="grid grid-cols-4 gap-3">
            {existingImages.map((url, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border border-gold-500/20 aspect-square"
              >
                <img
                  src={url}
                  alt={`Project ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23333%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23666%22 font-size=%2214%22%3ENo image%3C/text%3E%3C/svg%3E';
                  }}
                />

                {onRemoveExisting && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => onRemoveExisting(index)}
                      className="p-2 rounded-full bg-red-500/70 hover:bg-red-500 text-white transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper text */}
      <div className="text-xs text-gray-400 space-y-1">
        <p>✓ Supported formats: JPEG, PNG, WebP, GIF</p>
        <p>✓ Maximum file size: 5MB per image</p>
        <p>✓ Recommended dimensions: 1600x1200px or higher</p>
      </div>
    </div>
  );
};

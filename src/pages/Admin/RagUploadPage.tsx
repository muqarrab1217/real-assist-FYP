import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CloudArrowUpIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Get API base URL - use empty string for Vite proxy in dev, or env variable
const getApiBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '');
  }
  return ''; // Use Vite proxy in development
};

const API_BASE_URL = getApiBaseUrl();

interface FileUploadStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

export const RagUploadPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileStatuses, setFileStatuses] = useState<FileUploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach((file) => {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        invalidFiles.push(`${file.name} - Invalid file type`);
        return;
      }

      // Validate file size (500MB limit per file)
      if (file.size > 500 * 1024 * 1024) {
        invalidFiles.push(`${file.name} - File size exceeds 500MB limit`);
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      setUploadStatus({
        type: 'error',
        message: `Some files were rejected: ${invalidFiles.join(', ')}`,
      });
    } else {
      setUploadStatus({ type: null, message: '' });
    }

    // Combine with existing files (avoid duplicates by name)
    setSelectedFiles((prev) => {
      const existingNames = new Set(prev.map(f => f.name));
      const newFiles = validFiles.filter(f => !existingNames.has(f.name));
      return [...prev, ...newFiles];
    });

    // Initialize file statuses
    setFileStatuses((prev) => {
      const newStatuses = validFiles.map(file => ({
        file,
        status: 'pending' as const,
      }));
      return [...prev, ...newStatuses];
    });
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles((prev) => prev.filter(f => f.name !== fileName));
    setFileStatuses((prev) => prev.filter(f => f.file.name !== fileName));
  };

  const getTotalSize = () => {
    return selectedFiles.reduce((sum, file) => sum + file.size, 0);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    // Update all files to uploading status
    setFileStatuses((prev) =>
      prev.map(status => ({
        ...status,
        status: 'uploading' as const,
        progress: 0,
      }))
    );

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const url = API_BASE_URL ? `${API_BASE_URL}/api/gemini/upload` : '/api/gemini/upload';
      
      // Note: For progress tracking, you'd typically use XMLHttpRequest
      // For now, we'll use fetch and update status after completion
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // If we get HTML back, the backend is likely not running
        const text = await response.text();
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          throw new Error('Backend server is not running. Please start it with: npm run dev:backend');
        }
        throw new Error(`Server returned invalid response. Expected JSON but got: ${contentType}`);
      }

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `Upload failed: ${response.status} ${response.statusText}`);
        } catch (parseError) {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      // Update file statuses to success
      setFileStatuses((prev) =>
        prev.map(status => {
          const uploadedFile = data.files?.find((f: any) => f.fileName === status.file.name);
          return {
            ...status,
            status: uploadedFile ? ('success' as const) : status.status,
            progress: 100,
          };
        })
      );

      // Show summary
      const successCount = data.successful || data.files?.length || 0;
      const failCount = data.failed || 0;
      
      setUploadStatus({
        type: failCount > 0 ? 'error' : 'success',
        message: failCount > 0
          ? `Uploaded ${successCount} file(s) successfully. ${failCount} file(s) failed.`
          : `Successfully uploaded ${successCount} file(s)! Corpus ID: ${data.corpusId}`,
      });
      
      // Clear successfully uploaded files after a delay
      if (failCount === 0) {
        setTimeout(() => {
          setSelectedFiles([]);
          setFileStatuses([]);
          const fileInput = document.getElementById('file-upload') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Update all files to error status
      setFileStatuses((prev) =>
        prev.map(status => ({
          ...status,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Upload failed',
        }))
      );

      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to upload files. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ 
          fontFamily: 'Playfair Display, serif',
          backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}>RAG Document Upload</h1>
        <p style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
          Upload real estate documents (PDF, DOCX, TXT) to the RAG document store.
          These documents will be used by the chatbot to answer questions.
        </p>
      </motion.div>

      {/* Upload Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="abs-card">
          <CardHeader>
            <CardTitle className="flex items-center" style={{ 
              fontFamily: 'Playfair Display, serif',
              color: '#d4af37'
            }}>
              <CloudArrowUpIcon className="h-5 w-5 mr-2" />
              Upload Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload Area */}
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>
                Select Document
              </label>
              <div 
                className="mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors cursor-pointer"
                style={{
                  borderColor: 'rgba(212,175,55,0.25)',
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)';
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)';
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length > 0) {
                    const fakeEvent = {
                      target: { files: files }
                    } as any;
                    handleFileChange(fakeEvent);
                  }
                }}
              >
                <div className="text-center">
                  <DocumentTextIcon className="mx-auto h-12 w-12" style={{ color: 'rgba(212,175,55,0.6)' }} />
                  <div className="mt-4 flex flex-col items-center text-sm leading-6 space-y-1" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-semibold focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 hover:opacity-80 transition-opacity text-center"
                      style={{
                        color: '#d4af37',
                        '--tw-ring-color': 'rgba(212,175,55,0.3)'
                      } as any}
                    >
                      <span>Choose files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        multiple
                      />
                    </label>
                    <p className="text-center">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 mt-2" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>
                    PDF, DOCX, or TXT files (up to 500MB each, multiple files supported)
                  </p>
                  {selectedFiles.length > 0 && (
                    <p className="text-xs leading-5 mt-1 font-semibold" style={{ color: '#d4af37' }}>
                      {selectedFiles.length} file(s) selected • Total: {(getTotalSize() / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>

              {/* File List */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                  {selectedFiles.map((file) => {
                    const fileStatus = fileStatuses.find(f => f.file.name === file.name);
                    const status = fileStatus?.status || 'pending';
                    const statusColors = {
                      pending: { bg: 'rgba(212, 175, 55, 0.05)', border: 'rgba(212,175,55,0.25)', icon: '#d4af37' },
                      uploading: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', icon: '#3b82f6' },
                      success: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', icon: '#22c55e' },
                      error: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', icon: '#ef4444' },
                    };
                    const colors = statusColors[status];

                    return (
                      <motion.div
                        key={file.name}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg border flex items-center justify-between"
                        style={{
                          background: `linear-gradient(135deg, ${colors.bg} 0%, rgba(0, 0, 0, 0.8) 100%)`,
                          borderColor: colors.border
                        }}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <DocumentTextIcon className="h-6 w-6 flex-shrink-0" style={{ color: colors.icon }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#ffffff' }}>{file.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              {status === 'uploading' && (
                                <span className="text-xs" style={{ color: '#3b82f6' }}>• Uploading...</span>
                              )}
                              {status === 'success' && (
                                <span className="text-xs flex items-center" style={{ color: '#22c55e' }}>
                                  <CheckCircleIcon className="h-3 w-3 mr-1" /> Uploaded
                                </span>
                              )}
                              {status === 'error' && (
                                <span className="text-xs flex items-center" style={{ color: '#ef4444' }}>
                                  <XCircleIcon className="h-3 w-3 mr-1" /> Failed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {!isUploading && status !== 'uploading' && (
                          <button
                            onClick={() => removeFile(file.name)}
                            className="ml-2 p-1 rounded hover:bg-opacity-20 transition-colors"
                            style={{ color: '#ef4444' }}
                            aria-label="Remove file"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upload Status */}
            {uploadStatus.type && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg flex items-start space-x-3 border"
                style={uploadStatus.type === 'success' ? {
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
                  borderColor: 'rgba(34, 197, 94, 0.3)'
                } : {
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
                  borderColor: 'rgba(239, 68, 68, 0.3)'
                }}
              >
                {uploadStatus.type === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 mt-0.5" style={{ color: '#22c55e' }} />
                ) : (
                  <XCircleIcon className="h-5 w-5 mt-0.5" style={{ color: '#ef4444' }} />
                )}
                <p
                  className="text-sm flex-1"
                  style={{ 
                    color: uploadStatus.type === 'success' ? '#22c55e' : '#ef4444'
                  }}
                >
                  {uploadStatus.message}
                </p>
              </motion.div>
            )}

            {/* Upload Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || isUploading}
                className="text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundImage: selectedFiles.length === 0 || isUploading 
                    ? 'none' 
                    : 'linear-gradient(135deg, #d4af37, #f4e68c)',
                  backgroundColor: selectedFiles.length === 0 || isUploading ? 'rgba(212,175,55,0.3)' : undefined
                }}
              >
                {isUploading ? (
                  <>
                    <CloudArrowUpIcon className="h-5 w-5 mr-2 animate-pulse" />
                    Uploading {selectedFiles.length} file(s)...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                    Upload {selectedFiles.length > 0 ? `${selectedFiles.length} file(s)` : 'to Corpus'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="abs-card">
          <CardHeader>
            <CardTitle className="flex items-center" style={{ 
              fontFamily: 'Playfair Display, serif',
              color: '#d4af37'
            }}>
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="mr-3 font-semibold" style={{ color: '#d4af37' }}>•</span>
                <span style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                  Upload multiple PDF, DOCX, or TXT files (up to 500MB each) containing real estate information
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 font-semibold" style={{ color: '#d4af37' }}>•</span>
                <span style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                  Files are processed and added to the RAG document store used by the chatbot
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 font-semibold" style={{ color: '#d4af37' }}>•</span>
                <span style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                  The chatbot will use these documents to answer user questions
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 font-semibold" style={{ color: '#d4af37' }}>•</span>
                <span style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                  Files are indexed automatically - no additional setup needed
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};


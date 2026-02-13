'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image, Video, Music, FileText } from 'lucide-react';
import { formatFileSize } from '@/lib/matrix/media';

export interface FileWithPreview extends File {
  preview?: string;
  uploadProgress?: number;
  uploaded?: boolean;
  error?: string;
}

interface MediaUploadProps {
  onFilesSelected: (files: FileWithPreview[]) => void;
  onFileRemove: (index: number) => void;
  files: FileWithPreview[];
  disabled?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes, default 10MB
  className?: string;
}

const MAX_SIZE_DEFAULT = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = {
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
  'video/*': ['.mp4', '.webm', '.ogg', '.avi', '.mov'],
  'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.flac'],
  'application/pdf': ['.pdf'],
  'text/*': ['.txt', '.md', '.json', '.csv'],
  'application/json': ['.json'],
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
  'application/x-7z-compressed': ['.7z']
};

function getFileIcon(file: File) {
  const type = file.type;
  
  if (type.startsWith('image/')) {
    return <Image className="w-8 h-8 text-blue-500" />;
  }
  if (type.startsWith('video/')) {
    return <Video className="w-8 h-8 text-purple-500" />;
  }
  if (type.startsWith('audio/')) {
    return <Music className="w-8 h-8 text-green-500" />;
  }
  if (type === 'application/pdf' || type.startsWith('text/')) {
    return <FileText className="w-8 h-8 text-red-500" />;
  }
  
  return <File className="w-8 h-8 text-gray-500" />;
}

export function MediaUpload({
  onFilesSelected,
  onFileRemove,
  files = [],
  disabled = false,
  maxFiles = 10,
  maxSize = MAX_SIZE_DEFAULT,
  className = ''
}: MediaUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    const newFiles: FileWithPreview[] = acceptedFiles.map(file => {
      const fileWithPreview = file as FileWithPreview;
      
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      
      return fileWithPreview;
    });

    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      console.warn(`File ${file.name} rejected:`, errors);
    });

    onFilesSelected(newFiles);
    setDragActive(false);
  }, [onFilesSelected]);

  const onDragEnter = useCallback(() => {
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter,
    onDragLeave,
    accept: ACCEPTED_TYPES,
    maxSize,
    maxFiles: maxFiles - files.length,
    disabled,
    noClick: files.length >= maxFiles
  });

  const removeFile = (index: number) => {
    const file = files[index];
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
    onFileRemove(index);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Dropzone */}
      {files.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive || dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-3 w-8 h-8 text-gray-400" />
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">Click to upload</span> or drag and drop
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Images, videos, audio, documents (max {formatFileSize(maxSize)})
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              {/* File Icon/Preview */}
              <div className="flex-shrink-0">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded"
                    onLoad={() => URL.revokeObjectURL(file.preview!)}
                  />
                ) : (
                  getFileIcon(file)
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {file.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                </div>
                
                {/* Upload Progress */}
                {file.uploadProgress !== undefined && !file.uploaded && !file.error && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${file.uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {file.uploadProgress}% uploaded
                    </div>
                  </div>
                )}

                {/* Upload Success */}
                {file.uploaded && (
                  <div className="text-xs text-green-600 mt-1">
                    ✓ Uploaded successfully
                  </div>
                )}

                {/* Upload Error */}
                {file.error && (
                  <div className="text-xs text-red-600 mt-1">
                    ✗ {file.error}
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFile(index)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MediaUpload;
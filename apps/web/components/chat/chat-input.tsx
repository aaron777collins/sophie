'use client';

import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { MediaUpload, FileWithPreview } from './media-upload';
import { uploadFile, MediaUploadResult, getMessageType } from '@/lib/matrix/media';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: MediaUploadResult[]) => void;
  matrixClient?: any; // MatrixClient instance
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  onSendMessage,
  matrixClient,
  disabled = false,
  placeholder = 'Type a message...',
  className = ''
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!message.trim() && files.length === 0) || disabled || isUploading) {
      return;
    }

    let uploadedFiles: MediaUploadResult[] = [];

    // Upload files if any
    if (files.length > 0 && matrixClient) {
      setIsUploading(true);
      
      try {
        uploadedFiles = await Promise.all(
          files.map(async (file, index) => {
            // Update upload progress
            const updatedFiles = [...files];
            updatedFiles[index] = { ...file, uploadProgress: 0 };
            setFiles(updatedFiles);

            const result = await uploadFile(matrixClient, file, (progress) => {
              const newFiles = [...files];
              newFiles[index] = { ...file, uploadProgress: progress.percentage };
              setFiles(newFiles);
            });

            // Mark as uploaded
            const finalFiles = [...files];
            finalFiles[index] = { ...file, uploaded: true };
            setFiles(finalFiles);

            return result;
          })
        );
      } catch (error) {
        console.error('Failed to upload files:', error);
        // Mark files with errors
        const errorFiles = files.map(file => ({
          ...file,
          error: 'Upload failed'
        }));
        setFiles(errorFiles);
        setIsUploading(false);
        return;
      }
      
      setIsUploading(false);
    }

    // Send the message
    onSendMessage(message.trim(), uploadedFiles);
    
    // Clear input
    setMessage('');
    setFiles([]);
    setShowFileUpload(false);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleFilesSelected = (newFiles: FileWithPreview[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    if (newFiles.length > 0 && !showFileUpload) {
      setShowFileUpload(true);
    }
  };

  const handleFileRemove = (index: number) => {
    setFiles(prev => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
    
    // Hide file upload area if no files
    if (files.length <= 1) {
      setShowFileUpload(false);
    }
  };

  const canSend = !disabled && !isUploading && (message.trim() || files.length > 0);

  return (
    <div className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {/* File Upload Area */}
      {showFileUpload && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <MediaUpload
            files={files}
            onFilesSelected={handleFilesSelected}
            onFileRemove={handleFileRemove}
            disabled={disabled || isUploading}
          />
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end gap-2">
          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => setShowFileUpload(!showFileUpload)}
            className={`
              flex-shrink-0 p-2 rounded-lg transition-colors
              ${showFileUpload 
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
            disabled={disabled}
            title="Attach files"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="
                w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 
                dark:focus:ring-blue-400 max-h-[120px]
              "
              rows={1}
              style={{ minHeight: '40px' }}
            />
          </div>

          {/* Emoji Button (placeholder) */}
          <button
            type="button"
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={disabled}
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!canSend}
            className={`
              flex-shrink-0 p-2 rounded-lg transition-colors
              ${canSend
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
            title="Send message"
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Upload Progress Indicator */}
        {isUploading && (
          <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
            Uploading files...
          </div>
        )}
      </form>
    </div>
  );
}

export default ChatInput;
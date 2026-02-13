'use client';

import React, { useEffect, useCallback } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { getMediaUrl, isImage, isVideo, formatFileSize } from '@/lib/matrix/media';

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  contentUri: string;
  filename: string;
  mimetype: string;
  size: number;
  matrixClient?: any; // MatrixClient instance
}

export function MediaViewer({ 
  isOpen, 
  onClose, 
  contentUri, 
  filename, 
  mimetype, 
  size,
  matrixClient 
}: MediaViewerProps) {
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = React.useState({ x: 0, y: 0 });

  const downloadUrl = matrixClient ? getMediaUrl(matrixClient, contentUri) : contentUri;

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset transformations when content changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setImagePosition({ x: 0, y: 0 });
  }, [contentUri]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  }, [zoom, imagePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Header with controls */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 flex items-center justify-between z-10">
        <div className="flex-1">
          <h3 className="text-lg font-medium truncate">{filename}</h3>
          <p className="text-sm text-gray-300">{formatFileSize(size)} • {mimetype}</p>
        </div>
        
        {isImage(mimetype) && (
          <div className="flex items-center gap-2 mx-4">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              title="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              title="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleRotate}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              title="Rotate"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Media content */}
      <div 
        className="flex-1 flex items-center justify-center p-16 cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isImage(mimetype) && (
          <img
            src={downloadUrl}
            alt={filename}
            className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg) translate(${imagePosition.x / zoom}px, ${imagePosition.y / zoom}px)`,
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
            draggable={false}
          />
        )}
        
        {isVideo(mimetype) && (
          <video
            src={downloadUrl}
            controls
            className="max-w-full max-h-full"
            autoPlay
          >
            Your browser does not support the video tag.
          </video>
        )}
        
        {!isImage(mimetype) && !isVideo(mimetype) && (
          <div className="text-center text-white">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-xl mb-2">{filename}</p>
            <p className="text-gray-300 mb-4">Preview not available for this file type</p>
            <button
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
          </div>
        )}
      </div>

      {/* Click anywhere to close */}
      <div 
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
}

export default MediaViewer;
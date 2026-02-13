'use client';

import React, { useState } from 'react';
import { Download, Play, Pause, Volume2, VolumeX, Expand, FileText } from 'lucide-react';
import { formatFileSize, isImage, isVideo, isAudio, getMediaUrl, getThumbnailUrl } from '@/lib/matrix/media';

interface MediaMessageProps {
  contentUri: string; // mxc:// URI
  filename: string;
  mimetype: string;
  size: number;
  matrixClient?: any; // MatrixClient instance
  onMediaClick?: (contentUri: string, mimetype: string) => void; // For lightbox
  className?: string;
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  filename: string;
}

interface AudioPlayerProps {
  src: string;
  filename: string;
}

function VideoPlayer({ src, poster, filename }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="relative group max-w-sm">
      <video
        src={src}
        poster={poster}
        controls
        className="w-full h-auto rounded-lg"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onVolumeChange={(e) => setIsMuted((e.target as HTMLVideoElement).muted)}
      >
        Your browser does not support the video tag.
      </video>
      
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
        {filename}
      </div>
    </div>
  );
}

function AudioPlayer({ src, filename }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-w-sm">
      <div className="flex items-center gap-3 mb-2">
        <Volume2 className="w-5 h-5 text-blue-500" />
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {filename}
          </div>
          <div className="text-xs text-gray-500">
            {duration > 0 && `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`}
          </div>
        </div>
      </div>
      
      <audio
        src={src}
        controls
        className="w-full"
        onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
        onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

function FileDownload({ filename, size, mimetype, downloadUrl }: { 
  filename: string; 
  size: number; 
  mimetype: string; 
  downloadUrl: string; 
}) {
  const getFileIcon = () => {
    if (mimetype.includes('pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    if (mimetype.includes('text')) {
      return <FileText className="w-8 h-8 text-blue-500" />;
    }
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-w-sm">
      <div className="flex items-center gap-3">
        {getFileIcon()}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {filename}
          </div>
          <div className="text-xs text-gray-500">
            {formatFileSize(size)} • {mimetype}
          </div>
        </div>
        <a
          href={downloadUrl}
          download={filename}
          className="flex-shrink-0 p-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          title="Download file"
        >
          <Download className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}

export function MediaMessage({ 
  contentUri, 
  filename, 
  mimetype, 
  size, 
  matrixClient,
  onMediaClick,
  className = ''
}: MediaMessageProps) {
  const [imageError, setImageError] = useState(false);
  
  // Generate URLs (fallback if matrixClient not available)
  const downloadUrl = matrixClient ? getMediaUrl(matrixClient, contentUri) : contentUri;
  const thumbnailUrl = matrixClient && isImage(mimetype) ? getThumbnailUrl(matrixClient, contentUri, 400, 400) : downloadUrl;

  const handleImageClick = () => {
    if (onMediaClick) {
      onMediaClick(contentUri, mimetype);
    }
  };

  if (isImage(mimetype) && !imageError) {
    return (
      <div className={`relative group max-w-sm ${className}`}>
        <img
          src={thumbnailUrl}
          alt={filename}
          className="max-w-full h-auto rounded-lg cursor-pointer transition-opacity hover:opacity-90"
          onClick={handleImageClick}
          onError={() => setImageError(true)}
          loading="lazy"
        />
        
        {/* Expand overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Expand className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {/* Filename overlay */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {filename}
        </div>
      </div>
    );
  }

  if (isVideo(mimetype)) {
    return (
      <div className={className}>
        <VideoPlayer
          src={downloadUrl}
          poster={matrixClient ? getThumbnailUrl(matrixClient, contentUri, 400, 300) : undefined}
          filename={filename}
        />
      </div>
    );
  }

  if (isAudio(mimetype)) {
    return (
      <div className={className}>
        <AudioPlayer src={downloadUrl} filename={filename} />
      </div>
    );
  }

  // Default file download
  return (
    <div className={className}>
      <FileDownload 
        filename={filename}
        size={size}
        mimetype={mimetype}
        downloadUrl={downloadUrl}
      />
    </div>
  );
}

export default MediaMessage;
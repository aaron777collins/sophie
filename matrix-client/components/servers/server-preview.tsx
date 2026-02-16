'use client';

import React, { useState, useEffect } from 'react';
import { ServerDiscoveryService, ServerPreview as ServerPreviewData } from '@/lib/matrix/server-discovery';

interface ServerPreviewProps {
  roomId: string;
  discoveryService: ServerDiscoveryService;
  onClose: () => void;
}

export function ServerPreview({ roomId, discoveryService, onClose }: ServerPreviewProps) {
  const [serverData, setServerData] = useState<ServerPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinResult, setJoinResult] = useState<{ success?: boolean; error?: string } | null>(null);

  useEffect(() => {
    loadServerPreview();
  }, [roomId]);

  const loadServerPreview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const preview = await discoveryService.getServerPreview(roomId);
      if (preview) {
        setServerData(preview);
      } else {
        setError('Failed to load server details');
      }
    } catch (err) {
      setError('Failed to load server details');
      console.error('Preview error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    setIsJoining(true);
    setJoinResult(null);

    try {
      const result = await discoveryService.joinServer(roomId);
      setJoinResult(result);
      
      if (result.success) {
        // Auto-close modal after successful join
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      setJoinResult({
        success: false,
        error: 'Failed to join server'
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="server-preview-overlay" onClick={handleOverlayClick}>
      <div className="server-preview-modal">
        <div className="server-preview-header">
          <h2>Server Preview</h2>
          <button 
            onClick={onClose}
            className="close-button"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        <div className="server-preview-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading server details...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>Error: {error}</p>
              <button onClick={loadServerPreview} className="retry-button">
                Try Again
              </button>
            </div>
          ) : serverData ? (
            <ServerDetails server={serverData} />
          ) : null}
        </div>

        {serverData && !isLoading && !error && (
          <div className="server-preview-footer">
            {joinResult && (
              <div className={`join-result ${joinResult.success ? 'success' : 'error'}`}>
                {joinResult.success ? (
                  <p>✓ Successfully joined {serverData.name}!</p>
                ) : (
                  <p>✗ {joinResult.error}</p>
                )}
              </div>
            )}

            <div className="server-preview-actions">
              <button 
                onClick={onClose}
                className="cancel-button"
              >
                Close
              </button>
              <button 
                onClick={handleJoin}
                disabled={isJoining}
                className="join-button primary"
              >
                {isJoining ? 'Joining...' : `Join ${serverData.name}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ServerDetailsProps {
  server: ServerPreviewData;
}

function ServerDetails({ server }: ServerDetailsProps) {
  const formatMemberCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="server-details">
      <div className="server-header">
        <div className="server-avatar-section">
          {server.avatarUrl ? (
            <img 
              src={server.avatarUrl} 
              alt={`${server.name} avatar`}
              className="server-avatar large"
            />
          ) : (
            <div className="server-avatar large placeholder">
              {server.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="server-title-section">
          <h3 className="server-name">{server.name}</h3>
          {server.canonicalAlias && (
            <p className="server-alias">{server.canonicalAlias}</p>
          )}
          <div className="server-stats">
            <span className="member-count">
              👥 {formatMemberCount(server.memberCount)} members
            </span>
            {server.isEncrypted && (
              <span className="encryption-status">
                🔒 Encrypted
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="server-description">
        <h4>About</h4>
        <p>{server.topic || server.description || 'No description available'}</p>
      </div>

      {server.language && (
        <div className="server-language">
          <h4>Language</h4>
          <span className="language-tag">{server.language}</span>
        </div>
      )}

      {server.category && (
        <div className="server-category">
          <h4>Category</h4>
          <span className="category-tag">{server.category}</span>
        </div>
      )}

      {server.rules && (
        <div className="server-rules">
          <h4>Rules</h4>
          <p>{server.rules}</p>
        </div>
      )}

      {server.recentMessages && server.recentMessages.length > 0 && (
        <div className="recent-activity">
          <h4>Recent Messages</h4>
          <div className="message-list">
            {server.recentMessages.slice(0, 3).map((message, index) => (
              <div key={index} className="recent-message">
                <div className="message-header">
                  <span className="message-sender">{message.sender}</span>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="message-content">{message.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {server.joinedMembers && server.joinedMembers.length > 0 && (
        <div className="server-members">
          <h4>Some Members</h4>
          <div className="member-list">
            {server.joinedMembers.slice(0, 5).map((member, index) => (
              <span key={index} className="member-name">{member}</span>
            ))}
            {server.joinedMembers.length > 5 && (
              <span className="member-count">
                and {server.joinedMembers.length - 5} others...
              </span>
            )}
          </div>
        </div>
      )}

      <div className="server-metadata">
        <div className="metadata-item">
          <span className="metadata-label">Room ID:</span>
          <span className="metadata-value room-id">{server.roomId}</span>
        </div>
        {server.canonicalAlias && (
          <div className="metadata-item">
            <span className="metadata-label">Address:</span>
            <span className="metadata-value">{server.canonicalAlias}</span>
          </div>
        )}
      </div>
    </div>
  );
}
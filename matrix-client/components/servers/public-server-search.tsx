'use client';

import React, { useState, useEffect } from 'react';
import { PublicServer, PublicServerDiscovery } from '@/lib/matrix/public-server-discovery';
import { useMatrixClient } from '@/lib/matrix/matrix-context'; // Assuming this exists

const SERVER_CATEGORIES = [
  'Technology', 'Gaming', 'Art', 'Music', 'Education', 
  'Programming', 'Language Exchange', 'General'
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 
  'Japanese', 'Russian', 'Portuguese', 'Arabic'
];

export function PublicServerSearch() {
  const matrixClient = useMatrixClient();
  const [serverDiscovery, setServerDiscovery] = useState<PublicServerDiscovery | null>(null);
  const [servers, setServers] = useState<PublicServer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('');
  const [minMembers, setMinMembers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewServer, setPreviewServer] = useState<PublicServer | null>(null);

  useEffect(() => {
    if (matrixClient) {
      setServerDiscovery(new PublicServerDiscovery(matrixClient));
    }
  }, [matrixClient]);

  const handleSearch = async () => {
    if (!serverDiscovery) return;

    setIsLoading(true);
    setError(null);

    try {
      const results = await serverDiscovery.searchPublicServers({
        searchTerm,
        category,
        language,
        minMemberCount: minMembers,
        maxResults: 50
      });
      setServers(results);
    } catch (err) {
      setError('Failed to search servers. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewServer = async (roomId: string) => {
    if (!serverDiscovery) return;

    try {
      const preview = await serverDiscovery.previewServer(roomId);
      setPreviewServer(preview);
    } catch (err) {
      setError('Failed to preview server.');
      console.error(err);
    }
  };

  const handleJoinServer = async (roomId: string) => {
    if (!serverDiscovery) return;

    try {
      const joined = await serverDiscovery.joinServer(roomId);
      if (joined) {
        alert(`Successfully joined server ${roomId}`);
      } else {
        setError('Failed to join server.');
      }
    } catch (err) {
      setError('Failed to join server.');
      console.error(err);
    }
  };

  return (
    <div className="public-server-search">
      <h1>Discover Public Servers</h1>
      
      <div className="search-filters">
        <input 
          type="text" 
          placeholder="Search servers..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {SERVER_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="">All Languages</option>
          {LANGUAGES.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>

        <input 
          type="number" 
          placeholder="Min Members" 
          value={minMembers}
          onChange={(e) => setMinMembers(Number(e.target.value))}
          min={0}
        />

        <button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="servers-list">
        {servers.map(server => (
          <div key={server.roomId} className="server-item">
            <h3>{server.name}</h3>
            <p>{server.topic}</p>
            <div className="server-details">
              <span>Members: {server.memberCount}</span>
              <div className="server-actions">
                <button onClick={() => handlePreviewServer(server.roomId)}>
                  Preview
                </button>
                <button onClick={() => handleJoinServer(server.roomId)}>
                  Join
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {previewServer && (
        <div className="server-preview">
          <h2>{previewServer.name}</h2>
          <p>{previewServer.topic}</p>
          {/* Add more preview details */}
        </div>
      )}
    </div>
  );
}
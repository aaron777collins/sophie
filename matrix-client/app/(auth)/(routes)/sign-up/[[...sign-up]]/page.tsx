"use client";

import { useState, useEffect } from 'react';
import { getClientConfig } from "@/lib/matrix/client-config";
import { validateMatrixId, validateInviteCode } from "@/lib/matrix/validation";

export default function SignUpPage() {
  const [homeserver, setHomeserver] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [clientConfig, setClientConfig] = useState<{
    homeserver: string;
    privateMode: boolean;
    inviteRequired: boolean;
  } | null>(null);

  useEffect(() => {
    async function loadClientConfig() {
      try {
        const config = await getClientConfig();
        setClientConfig(config);
        
        // If in private mode, lock homeserver
        if (config.privateMode) {
          setHomeserver(config.homeserver);
        }
      } catch (err) {
        console.error('Failed to load client config', err);
        setError('Unable to load configuration');
      }
    }
    loadClientConfig();
  }, []);

  // Helper function to determine if user is signing up for external homeserver
  const isExternalHomeserver = (): boolean => {
    if (!clientConfig || !homeserver) return false;
    
    try {
      const configuredHomeserver = new URL(clientConfig.homeserver).hostname;
      const selectedHomeserver = new URL(homeserver).hostname;
      return configuredHomeserver !== selectedHomeserver;
    } catch {
      // If URL parsing fails, assume external for safety
      return homeserver !== clientConfig.homeserver;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate inputs
      if (!username) throw new Error('Username is required');
      if (!password) throw new Error('Password is required');
      
      // Validate Matrix ID
      if (!validateMatrixId(`@${username}:${new URL(homeserver).hostname}`)) {
        throw new Error('Invalid username format');
      }

      // Invite code validation for external homeserver users
      if (isExternalHomeserver()) {
        if (!inviteCode) throw new Error('Invite code is required for external homeserver registration');
        if (!validateInviteCode(inviteCode)) {
          throw new Error('Invalid invite code format. Expected format: timestamp_randomstring');
        }
      }

      // TODO: Implement actual sign-up logic
      // const result = await signUp(username, password, homeserver, inviteCode);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sign-up-container">
      <h1 className="sign-up-title">Sign Up</h1>
      
      {clientConfig?.privateMode && (
        <div className="private-mode-badge">
          Private Mode Enabled
        </div>
      )}

      <form onSubmit={handleSubmit} className="sign-up-form">
        {!clientConfig?.privateMode && (
          <input
            type="text"
            placeholder="Homeserver URL"
            value={homeserver}
            onChange={(e) => setHomeserver(e.target.value)}
            disabled={clientConfig?.privateMode}
            className="form-input"
          />
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="form-input"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
        />

        {isExternalHomeserver() && (
          <div className="invite-code-section">
            <input
              type="text"
              placeholder="Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="form-input"
            />
            <p className="invite-help-text">
              External homeserver registration requires an invite code
            </p>
          </div>
        )}

        {error && (
          <p className="error-message">{error}</p>
        )}

        <button 
          type="submit" 
          className="submit-button" 
          disabled={isLoading}
        >
          {isLoading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>

      <style jsx>{`
        .sign-up-container {
          max-width: 400px;
          margin: 40px auto;
          padding: 24px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .sign-up-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 24px;
          text-align: center;
          color: #333;
        }

        .private-mode-badge {
          background: #e3f2fd;
          color: #1565c0;
          padding: 8px 16px;
          border-radius: 4px;
          text-align: center;
          margin-bottom: 16px;
          font-size: 14px;
          border: 1px solid #bbdefb;
        }

        .sign-up-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-input {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #2196f3;
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
        }

        .form-input:disabled {
          background: #f5f5f5;
          color: #666;
          cursor: not-allowed;
        }

        .invite-code-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .invite-help-text {
          font-size: 14px;
          color: #666;
          margin: 0;
        }

        .error-message {
          color: #d32f2f;
          font-size: 14px;
          margin: 0;
          padding: 8px;
          background: #ffebee;
          border: 1px solid #ffcdd2;
          border-radius: 4px;
        }

        .submit-button {
          background: #2196f3;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .submit-button:hover:not(:disabled) {
          background: #1976d2;
        }

        .submit-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .sign-up-container {
            margin: 20px;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
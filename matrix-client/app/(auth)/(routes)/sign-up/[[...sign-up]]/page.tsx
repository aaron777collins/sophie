"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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

      // Invite code validation if required
      if (clientConfig?.inviteRequired) {
        if (!inviteCode) throw new Error('Invite code is required');
        if (!validateInviteCode(inviteCode)) {
          throw new Error('Invalid invite code');
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-background rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
      
      {clientConfig?.privateMode && (
        <Badge 
          variant="secondary" 
          className="mb-4 w-full justify-center"
        >
          Private Mode Enabled
        </Badge>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!clientConfig?.privateMode && (
          <Input
            type="text"
            placeholder="Homeserver URL"
            value={homeserver}
            onChange={(e) => setHomeserver(e.target.value)}
            disabled={clientConfig?.privateMode}
          />
        )}

        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {clientConfig?.inviteRequired && (
          <Input
            type="text"
            placeholder="Invite Code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
        )}

        {error && (
          <p className="text-destructive text-sm">{error}</p>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? 'Signing Up...' : 'Sign Up'}
        </Button>
      </form>
    </div>
  );
}
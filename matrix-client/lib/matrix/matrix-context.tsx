'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MatrixClient, createClient } from 'matrix-js-sdk';

interface MatrixContextType {
  client: MatrixClient | null;
  isConnected: boolean;
  connect: (baseUrl: string, userId: string, accessToken: string) => Promise<void>;
  disconnect: () => void;
}

const MatrixContext = createContext<MatrixContextType | null>(null);

export function MatrixProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<MatrixClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async (baseUrl: string, userId: string, accessToken: string) => {
    try {
      const matrixClient = createClient({
        baseUrl,
        userId,
        accessToken,
      });

      await matrixClient.startClient();
      setClient(matrixClient);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect to Matrix:', error);
      throw error;
    }
  };

  const disconnect = () => {
    if (client) {
      client.stopClient();
      setClient(null);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const value: MatrixContextType = {
    client,
    isConnected,
    connect,
    disconnect,
  };

  return (
    <MatrixContext.Provider value={value}>
      {children}
    </MatrixContext.Provider>
  );
}

export function useMatrixClient(): MatrixClient | null {
  const context = useContext(MatrixContext);
  if (!context) {
    throw new Error('useMatrixClient must be used within a MatrixProvider');
  }
  return context.client;
}

export function useMatrix(): MatrixContextType {
  const context = useContext(MatrixContext);
  if (!context) {
    throw new Error('useMatrix must be used within a MatrixProvider');
  }
  return context;
}
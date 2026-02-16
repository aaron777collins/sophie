'use client';

import React from 'react';
import DiscoveryUI from '@/components/servers/discovery-ui';
import { MatrixServer } from '@/lib/matrix/server-discovery';

export default function ServerDiscoveryPage() {
  const handleServerSelect = (server: MatrixServer) => {
    // For now, we'll just log the selection
    // In the future, this could navigate to server details or join flow
    console.log('Server selected:', server);
    
    // You could implement navigation to server details:
    // router.push(`/servers/${server.homeserver}`);
    
    // Or open external link:
    if (server.website) {
      window.open(server.website, '_blank', 'noopener,noreferrer');
    } else {
      // Show server info in a modal or navigate to join page
      alert(`Selected server: ${server.server_name}\nHomeserver: ${server.homeserver}\n\nClick OK to continue...`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Discover Matrix Servers
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Find and explore public Matrix servers from around the world. 
              Join communities that match your interests and connect with like-minded people.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <DiscoveryUI 
          onServerSelect={handleServerSelect}
          className="mb-8"
        />
        
        {/* Additional Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            About Matrix Servers
          </h2>
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <p>
              Matrix is a decentralized communication protocol where each server (homeserver) 
              can federate with others, allowing users to communicate across different servers 
              seamlessly.
            </p>
            <p>
              When choosing a server, consider factors like:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Server location and performance</li>
              <li>Community guidelines and moderation policies</li>
              <li>Server stability and uptime</li>
              <li>Available features and integrations</li>
              <li>Registration requirements</li>
            </ul>
            <p className="pt-2">
              <strong>Note:</strong> You can communicate with users on any Matrix server 
              regardless of which one you choose, thanks to Matrix&apos;s federated architecture.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              Server data provided by the Matrix community. 
              Server availability and information may vary.
            </p>
            <div className="space-x-4">
              <a 
                href="https://matrix.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Learn about Matrix
              </a>
              <a 
                href="https://matrix.org/docs/homeserver-options" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Homeserver Options
              </a>
              <a 
                href="https://joinmatrix.org/servers/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                More Server Lists
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
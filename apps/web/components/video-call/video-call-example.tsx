'use client';

import React, { useState, useEffect } from 'react';
import { Room, connect, ConnectOptions, RoomOptions } from 'livekit-client';
import { VideoCallLayout } from './video-call-layout';
import { Button } from '@/components/ui';
import { Phone, PhoneOff } from 'lucide-react';

export interface VideoCallExampleProps {
  /** LiveKit server URL */
  serverUrl?: string;
  /** Room token for authentication */
  roomToken?: string;
  /** Room name to join */
  roomName?: string;
  /** Participant name */
  participantName?: string;
}

/**
 * Example component demonstrating the video call layout with screen sharing.
 * This shows how to integrate the screen sharing functionality with LiveKit.
 */
export const VideoCallExample: React.FC<VideoCallExampleProps> = ({
  serverUrl = 'ws://localhost:7880',
  roomToken,
  roomName = 'test-room',
  participantName = 'Test User',
}) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Connect to room
  const connectToRoom = async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const roomInstance = new Room();
      
      // Room options for optimal screen sharing
      const roomOptions: RoomOptions = {
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          videoSimulcastLayers: [
            { resolution: { width: 320, height: 180 }, encoding: { maxBitrate: 150_000 } },
            { resolution: { width: 640, height: 360 }, encoding: { maxBitrate: 500_000 } },
            { resolution: { width: 1280, height: 720 }, encoding: { maxBitrate: 1_500_000 } },
          ],
        },
      };

      // Connect options
      const connectOptions: ConnectOptions = {
        autoSubscribe: true,
        maxRetries: 3,
      };

      // Use token if provided, otherwise generate a simple demo token
      const token = roomToken || generateDemoToken(roomName, participantName);

      await roomInstance.connect(serverUrl, token, connectOptions);
      
      // Enable camera and microphone
      await roomInstance.localParticipant.enableCameraAndMicrophone();
      
      setRoom(roomInstance);
      setIsConnected(true);
      
    } catch (error) {
      console.error('Failed to connect to room:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect from room
  const disconnectFromRoom = async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setIsConnected(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  // Simple demo token generator (for development only)
  const generateDemoToken = (roomName: string, participantName: string): string => {
    // This is a simplified demo token - in production, generate proper JWT tokens server-side
    return btoa(JSON.stringify({
      room: roomName,
      participant: participantName,
      timestamp: Date.now(),
    }));
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900">
      {/* Connection Controls */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white mb-1">
            Video Call with Screen Sharing
          </h1>
          <p className="text-gray-400 text-sm">
            Room: {roomName} | Participant: {participantName}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {connectionError && (
            <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-md text-sm">
              {connectionError}
            </div>
          )}
          
          {!isConnected ? (
            <Button
              onClick={connectToRoom}
              disabled={isConnecting}
              variant="primary"
              className="flex items-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>{isConnecting ? 'Connecting...' : 'Join Call'}</span>
            </Button>
          ) : (
            <Button
              onClick={disconnectFromRoom}
              variant="danger"
              className="flex items-center space-x-2"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Leave Call</span>
            </Button>
          )}
        </div>
      </div>

      {/* Video Call Layout */}
      <div className="flex-1">
        {room ? (
          <VideoCallLayout
            room={room}
            isCallActive={isConnected}
            showScreenShareControls={true}
            layoutMode="grid"
            maxGridParticipants={9}
            showParticipantNames={true}
            onLayoutModeChange={(mode) => {
              console.log('Layout mode changed to:', mode);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Phone className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">Ready to join the call</p>
              <p className="text-gray-500 text-sm max-w-md">
                Click "Join Call" to connect to the video conference. 
                Once connected, you can share your screen with other participants.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Feature Information */}
      {!isConnected && (
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-medium text-white mb-3">
              Screen Sharing Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-200 mb-1">Multiple Sources</h4>
                <p className="text-gray-400">Share your entire screen, specific application window, or browser tab</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-200 mb-1">Audio Sharing</h4>
                <p className="text-gray-400">Optionally include system audio with your screen share</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-200 mb-1">Adaptive Layout</h4>
                <p className="text-gray-400">Automatically adjusts layout when participants share screens</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
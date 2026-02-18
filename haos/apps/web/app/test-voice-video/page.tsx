'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types for testing
interface MockCall {
  callId: string;
  type: 'voice' | 'video';
  status: 'idle' | 'connecting' | 'connected' | 'disconnected';
  error?: string;
}

interface MockIncomingCall {
  callId: string;
  caller: string;
  type: 'voice' | 'video';
}

export default function TestVoiceVideoPage() {
  const [currentCall, setCurrentCall] = useState<MockCall | null>(null);
  const [incomingCall, setIncomingCall] = useState<MockIncomingCall | null>(null);
  const [error, setError] = useState<string>('');
  const [notification, setNotification] = useState<string>('');

  // Expose functions to window for testing
  useEffect(() => {
    (window as any).handleIncomingCall = (mockEvent: any) => {
      const content = mockEvent.getContent();
      setIncomingCall({
        callId: content.call_id,
        caller: mockEvent.getSender(),
        type: content.type || 'voice'
      });
    };

    (window as any).setCallTimeout = () => {
      setTimeout(() => {
        setIncomingCall(null);
        setNotification('Call timed out');
      }, 2000);
    };
  }, []);

  const initiateCall = async (type: 'voice' | 'video') => {
    setError('');
    setNotification('');
    
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setCurrentCall({
      callId,
      type,
      status: 'connecting'
    });

    try {
      // Mock call initiation logic
      if ((window as any).mockLiveKitService) {
        const token = await (window as any).mockLiveKitService.requestToken(`room_${callId}`, 'test-user-id');
        await (window as any).mockLiveKitService.connectToRoom(`room_${callId}`, token);
      }

      // Mock Matrix event sending
      if ((window as any).mockMatrixClient) {
        await (window as any).mockMatrixClient.sendEvent('test-room-id', 'm.call.invite', {
          call_id: callId,
          lifetime: 30000,
          offer: {
            type: 'offer',
            sdp: 'mock-sdp-offer'
          },
          version: 1,
          type: type
        });
      }

      // Simulate connection success after delay
      setTimeout(() => {
        setCurrentCall(prev => prev ? { ...prev, status: 'connected' } : null);
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setCurrentCall(prev => prev ? { ...prev, status: 'disconnected' } : null);
    }
  };

  const endCall = async () => {
    if (!currentCall) return;

    try {
      // Mock Matrix hangup event
      if ((window as any).mockMatrixClient) {
        await (window as any).mockMatrixClient.sendEvent('test-room-id', 'm.call.hangup', {
          call_id: currentCall.callId,
          reason: 'user_hangup',
          version: 1
        });
      }

      // Mock LiveKit disconnect
      if ((window as any).mockLiveKitService) {
        await (window as any).mockLiveKitService.disconnect();
      }

      setCurrentCall(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end call');
    }
  };

  const answerCall = async () => {
    if (!incomingCall) return;

    try {
      // Mock answer logic
      if ((window as any).mockMatrixClient) {
        await (window as any).mockMatrixClient.sendEvent('test-room-id', 'm.call.answer', {
          call_id: incomingCall.callId,
          answer: {
            type: 'answer',
            sdp: 'mock-sdp-answer'
          },
          version: 1
        });
      }

      setCurrentCall({
        callId: incomingCall.callId,
        type: incomingCall.type,
        status: 'connected'
      });
      setIncomingCall(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to answer call');
    }
  };

  const rejectCall = async () => {
    if (!incomingCall) return;

    try {
      // Mock reject logic
      if ((window as any).mockMatrixClient) {
        await (window as any).mockMatrixClient.sendEvent('test-room-id', 'm.call.hangup', {
          call_id: incomingCall.callId,
          reason: 'user_hangup',
          version: 1
        });
      }

      setIncomingCall(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject call');
    }
  };

  const getCallStatus = () => {
    if (!currentCall) return 'Not connected';
    
    switch (currentCall.status) {
      case 'connecting': return 'Connecting';
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      default: return 'Not connected';
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Voice/Video Call Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Call Status */}
          <div className="text-center p-4 border rounded">
            <p className="text-sm text-gray-600">Call Status:</p>
            <p 
              data-testid="call-status" 
              className="text-lg font-semibold"
            >
              {getCallStatus()}
            </p>
          </div>

          {/* Call Controls */}
          <div className="flex gap-4 justify-center">
            <Button
              data-testid="voice-call-button"
              onClick={() => initiateCall('voice')}
              disabled={!!currentCall || !!incomingCall}
              variant="outline"
            >
              Voice Call
            </Button>
            
            <Button
              data-testid="video-call-button"
              onClick={() => initiateCall('video')}
              disabled={!!currentCall || !!incomingCall}
              variant="outline"
            >
              Video Call
            </Button>

            {currentCall && (
              <Button
                data-testid="end-call-button"
                onClick={endCall}
                variant="destructive"
              >
                End Call
              </Button>
            )}
          </div>

          {/* Video Elements (shown when video call is active) */}
          {currentCall?.type === 'video' && currentCall.status === 'connected' && (
            <div className="space-y-4">
              <div 
                data-testid="local-video" 
                className="w-full h-48 bg-gray-200 rounded flex items-center justify-center border-2 border-blue-500"
              >
                <span className="text-gray-600">Local Video Feed</span>
              </div>
              
              <div 
                data-testid="video-controls" 
                className="flex gap-2 justify-center"
              >
                <Button size="sm" variant="outline">Camera</Button>
                <Button size="sm" variant="outline">Mic</Button>
                <Button size="sm" variant="outline">Screen Share</Button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div 
              data-testid="error-message" 
              className="p-3 bg-red-50 border border-red-200 rounded text-red-700"
            >
              {error}
            </div>
          )}

          {/* Notification Display */}
          {notification && (
            <div 
              data-testid="notification" 
              className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-700"
            >
              {notification}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div 
          data-testid="incoming-call-modal"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Incoming {incomingCall.type} Call</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p data-testid="caller-name" className="text-center text-lg">
                {incomingCall.caller}
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button
                  data-testid="accept-call-button"
                  onClick={answerCall}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Accept
                </Button>
                
                <Button
                  data-testid="reject-call-button"
                  onClick={rejectCall}
                  variant="destructive"
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
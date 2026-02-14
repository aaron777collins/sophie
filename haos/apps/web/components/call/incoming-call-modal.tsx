'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCallStore, IncomingCall } from '@/stores/call-store';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Video, 
  PhoneOff, 
  Clock,
  User,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IncomingCallModalProps {
  className?: string;
}

export function IncomingCallModal({ className }: IncomingCallModalProps) {
  const {
    getIncomingCalls,
    acceptIncomingCall,
    rejectIncomingCall,
  } = useCallStore();

  const [timeElapsed, setTimeElapsed] = useState<Record<string, number>>({});

  const incomingCalls = getIncomingCalls();
  const currentCall = incomingCalls[0]; // Handle the first incoming call

  // Update time elapsed for each call
  useEffect(() => {
    if (incomingCalls.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const newTimeElapsed: Record<string, number> = {};
      
      incomingCalls.forEach(call => {
        const elapsed = Math.floor((now.getTime() - call.receivedAt.getTime()) / 1000);
        newTimeElapsed[call.callId] = elapsed;
        
        // Auto-reject calls that have been ringing too long
        if (call.timeout && elapsed >= call.timeout) {
          rejectIncomingCall(call.callId);
        }
      });
      
      setTimeElapsed(newTimeElapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [incomingCalls, rejectIncomingCall]);

  const handleAccept = useCallback((callId: string) => {
    acceptIncomingCall(callId);
  }, [acceptIncomingCall]);

  const handleReject = useCallback((callId: string) => {
    rejectIncomingCall(callId);
  }, [rejectIncomingCall]);

  const formatTimeElapsed = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't render if no incoming calls
  if (!currentCall) {
    return null;
  }

  return (
    <Dialog open={!!currentCall} onOpenChange={() => {}}>
      <DialogContent 
        className={cn(
          "sm:max-w-md p-0 gap-0 overflow-hidden",
          className
        )}
        hideCloseButton
      >
        <div className="relative">
          {/* Animated ring effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 opacity-20 animate-pulse" />
          
          {/* Content */}
          <div className="relative p-6">
            {/* Call info */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                {currentCall.type === 'video' ? (
                  <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Video className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                ) : (
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full animate-bounce">
                    <Phone className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                )}
              </div>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Incoming {currentCall.type === 'video' ? 'Video' : 'Voice'} Call
              </h2>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <Users className="h-4 w-4" />
                <span>{currentCall.roomName}</span>
              </div>

              {/* Caller info */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                  <AvatarImage 
                    src={currentCall.initiator.avatar} 
                    alt={currentCall.initiator.displayName} 
                  />
                  <AvatarFallback>
                    {currentCall.initiator.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {currentCall.initiator.displayName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {currentCall.initiator.userId}
                  </div>
                </div>
              </div>

              {/* Call duration */}
              <div className="flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{formatTimeElapsed(timeElapsed[currentCall.callId] || 0)}</span>
              </div>

              {/* Timeout warning */}
              {currentCall.timeout && (
                <div className="mt-2">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      (timeElapsed[currentCall.callId] || 0) > (currentCall.timeout * 0.8) 
                        ? "border-red-500 text-red-600 dark:text-red-400" 
                        : "border-yellow-500 text-yellow-600 dark:text-yellow-400"
                    )}
                  >
                    Times out in {currentCall.timeout - (timeElapsed[currentCall.callId] || 0)}s
                  </Badge>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleReject(currentCall.callId)}
                className="flex-1 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <PhoneOff className="h-5 w-5 mr-2" />
                Decline
              </Button>
              
              <Button
                size="lg"
                onClick={() => handleAccept(currentCall.callId)}
                className={cn(
                  "flex-1",
                  currentCall.type === 'video'
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                )}
              >
                {currentCall.type === 'video' ? (
                  <Video className="h-5 w-5 mr-2" />
                ) : (
                  <Phone className="h-5 w-5 mr-2" />
                )}
                Accept
              </Button>
            </div>
          </div>

          {/* Additional incoming calls indicator */}
          {incomingCalls.length > 1 && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary">
                +{incomingCalls.length - 1} more
              </Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Separate component for displaying queued incoming calls
export function IncomingCallQueue() {
  const { getIncomingCalls, acceptIncomingCall, rejectIncomingCall } = useCallStore();
  
  const incomingCalls = getIncomingCalls();
  const queuedCalls = incomingCalls.slice(1); // All except the first (which shows in modal)

  if (queuedCalls.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-40">
      {queuedCalls.map((call) => (
        <div
          key={call.callId}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-[280px]"
        >
          <div className="flex items-center gap-2 mb-2">
            {call.type === 'video' ? (
              <Video className="h-4 w-4 text-blue-500" />
            ) : (
              <Phone className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {call.type === 'video' ? 'Video' : 'Voice'} call from {call.roomName}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={call.initiator.avatar} alt={call.initiator.displayName} />
              <AvatarFallback className="text-xs">
                {call.initiator.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {call.initiator.displayName}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => rejectIncomingCall(call.callId)}
              className="flex-1 text-xs border-red-500 text-red-600 hover:bg-red-50"
            >
              <PhoneOff className="h-3 w-3 mr-1" />
              Decline
            </Button>
            <Button
              size="sm"
              onClick={() => acceptIncomingCall(call.callId)}
              className="flex-1 text-xs bg-green-600 hover:bg-green-700"
            >
              <Phone className="h-3 w-3 mr-1" />
              Accept
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default IncomingCallModal;
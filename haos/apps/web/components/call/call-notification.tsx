'use client';

import React, { useEffect } from 'react';
import { useCallStore, CallNotification } from '@/stores/call-store';
import { Toast, ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Video, 
  PhoneOff, 
  UserPlus, 
  UserMinus,
  AlertTriangle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallNotificationProps {
  notification: CallNotification;
  onDismiss: () => void;
  className?: string;
}

function CallNotificationContent({ 
  notification, 
  onDismiss,
  className,
}: CallNotificationProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'call-started':
        return notification.message.includes('Video') 
          ? <Video className="h-5 w-5 text-blue-500" />
          : <Phone className="h-5 w-5 text-green-500" />;
      case 'call-ended':
        return <PhoneOff className="h-5 w-5 text-red-500" />;
      case 'participant-joined':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'participant-left':
        return <UserMinus className="h-5 w-5 text-yellow-500" />;
      case 'call-error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Phone className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTitle = () => {
    switch (notification.type) {
      case 'call-started':
        return 'Call Started';
      case 'call-ended':
        return 'Call Ended';
      case 'participant-joined':
        return 'Participant Joined';
      case 'participant-left':
        return 'Participant Left';
      case 'call-error':
        return 'Call Error';
      default:
        return 'Call Notification';
    }
  };

  const getBadgeVariant = () => {
    switch (notification.type) {
      case 'call-started':
      case 'participant-joined':
        return 'default' as const;
      case 'call-ended':
      case 'participant-left':
        return 'secondary' as const;
      case 'call-error':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[320px] max-w-[400px]",
      className
    )}>
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {getTitle()}
          </h4>
          <Badge variant={getBadgeVariant()} className="text-xs">
            {notification.roomName}
          </Badge>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          {notification.message}
        </p>

        {/* Participant info */}
        {notification.participant && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage 
                src={notification.participant.avatar} 
                alt={notification.participant.displayName} 
              />
              <AvatarFallback className="text-xs">
                {notification.participant.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {notification.participant.displayName}
            </span>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {notification.timestamp.toLocaleTimeString()}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Main notification manager component
export function CallNotificationManager() {
  const { 
    getNotifications, 
    removeNotification,
    getCallForRoom,
    joinCall,
  } = useCallStore();
  
  const { toast, dismiss } = useToast();
  const notifications = getNotifications();

  // Display notifications as toasts
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.autoHide) {
        // Use shadcn toast for auto-hiding notifications
        toast({
          duration: notification.duration || 5000,
          className: "border-l-4 border-blue-500",
          title: (() => {
            switch (notification.type) {
              case 'call-started': return '📞 Call Started';
              case 'call-ended': return '📵 Call Ended';
              case 'participant-joined': return '👋 Participant Joined';
              case 'participant-left': return '👋 Participant Left';
              case 'call-error': return '⚠️ Call Error';
              default: return '📞 Call Notification';
            }
          })(),
          description: `${notification.message} in ${notification.roomName}`,
          action: notification.type === 'call-started' && !getCallForRoom(notification.roomId)?.isLocalUserInCall ? (
            <ToastAction 
              altText="Join call"
              onClick={() => joinCall(notification.roomId)}
            >
              Join
            </ToastAction>
          ) : undefined,
        });

        // Remove from store after showing
        removeNotification(notification.id);
      }
    });
  }, [notifications, toast, removeNotification, getCallForRoom, joinCall]);

  // Render persistent notifications (non-auto-hide)
  const persistentNotifications = notifications.filter(n => !n.autoHide);

  if (persistentNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {persistentNotifications.map((notification) => (
        <CallNotificationContent
          key={notification.id}
          notification={notification}
          onDismiss={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

// Hook for programmatically showing call notifications
export function useCallNotification() {
  const { addNotification } = useCallStore();

  const showCallStarted = (roomId: string, roomName: string, type: 'voice' | 'video') => {
    addNotification({
      type: 'call-started',
      roomId,
      roomName,
      message: `${type === 'video' ? 'Video' : 'Voice'} call started`,
      autoHide: true,
      duration: 3000,
    });
  };

  const showCallEnded = (roomId: string, roomName: string, type: 'voice' | 'video') => {
    addNotification({
      type: 'call-ended',
      roomId,
      roomName,
      message: `${type === 'video' ? 'Video' : 'Voice'} call ended`,
      autoHide: true,
      duration: 3000,
    });
  };

  const showParticipantJoined = (
    roomId: string, 
    roomName: string, 
    participant: { userId: string; displayName: string; avatar?: string }
  ) => {
    addNotification({
      type: 'participant-joined',
      roomId,
      roomName,
      message: `${participant.displayName} joined the call`,
      participant,
      autoHide: true,
      duration: 3000,
    });
  };

  const showParticipantLeft = (
    roomId: string, 
    roomName: string, 
    participant: { userId: string; displayName: string; avatar?: string }
  ) => {
    addNotification({
      type: 'participant-left',
      roomId,
      roomName,
      message: `${participant.displayName} left the call`,
      participant,
      autoHide: true,
      duration: 3000,
    });
  };

  const showCallError = (roomId: string, roomName: string, message: string) => {
    addNotification({
      type: 'call-error',
      roomId,
      roomName,
      message,
      autoHide: false, // Errors should be persistent
    });
  };

  return {
    showCallStarted,
    showCallEnded,
    showParticipantJoined,
    showParticipantLeft,
    showCallError,
  };
}

export default CallNotificationManager;
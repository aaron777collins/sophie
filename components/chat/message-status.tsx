import React from 'react';
import { EventStatus } from 'matrix-js-sdk';

interface MessageStatusProps {
  status: 'sending' | 'sent' | 'failed' | 'delivered' | 'encrypting' | 'encrypted';
  timestamp?: number;
  isEncrypted?: boolean;
  encryptionError?: string;
  eventId?: string;
  readByCount?: number;
  className?: string;
  showTimestamp?: boolean;
  showReadReceipts?: boolean;
  compact?: boolean;
}

interface StatusIconProps {
  status: MessageStatusProps['status'];
  isEncrypted?: boolean;
  className?: string;
}

// Status icon component
const StatusIcon: React.FC<StatusIconProps> = ({ status, isEncrypted, className = '' }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <div className={`status-sending ${className}`}>
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      
      case 'encrypting':
        return (
          <div className={`status-encrypting ${className}`}>
            <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      
      case 'encrypted':
        return (
          <div className={`status-encrypted text-green-500 ${className}`}>
            🔒
          </div>
        );
      
      case 'sent':
        return (
          <div className={`status-sent text-gray-400 ${className}`}>
            {isEncrypted ? '🔒✓' : '✓'}
          </div>
        );
      
      case 'delivered':
        return (
          <div className={`status-delivered text-gray-500 ${className}`}>
            {isEncrypted ? '🔒✓✓' : '✓✓'}
          </div>
        );
      
      case 'failed':
        return (
          <div className={`status-failed text-red-500 ${className}`}>
            ⚠️
          </div>
        );
      
      default:
        return null;
    }
  };

  return getStatusIcon();
};

// Read receipts component
interface ReadReceiptsProps {
  readByCount: number;
  eventId?: string;
  compact?: boolean;
  onClick?: () => void;
}

const ReadReceipts: React.FC<ReadReceiptsProps> = ({ 
  readByCount, 
  eventId, 
  compact = false, 
  onClick 
}) => {
  if (readByCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className={`read-receipts text-xs text-gray-500 hover:text-gray-700 ${
        compact ? 'px-1' : 'px-2 py-1'
      } rounded hover:bg-gray-100 transition-colors`}
      title={`Read by ${readByCount} ${readByCount === 1 ? 'person' : 'people'}`}
    >
      👁 {readByCount}
    </button>
  );
};

// Main message status component
export const MessageStatus: React.FC<MessageStatusProps> = ({
  status,
  timestamp,
  isEncrypted = false,
  encryptionError,
  eventId,
  readByCount = 0,
  className = '',
  showTimestamp = true,
  showReadReceipts = true,
  compact = false
}) => {
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'sending':
        return 'Sending...';
      case 'encrypting':
        return 'Encrypting...';
      case 'encrypted':
        return 'Encrypted';
      case 'sent':
        return isEncrypted ? 'Sent (encrypted)' : 'Sent';
      case 'delivered':
        return isEncrypted ? 'Delivered (encrypted)' : 'Delivered';
      case 'failed':
        return 'Failed to send';
      default:
        return '';
    }
  };

  const statusText = getStatusText();
  const hasError = status === 'failed' || encryptionError;

  if (compact) {
    return (
      <div className={`message-status-compact flex items-center gap-1 ${className}`}>
        <StatusIcon status={status} isEncrypted={isEncrypted} className="w-3 h-3" />
        
        {showTimestamp && timestamp && (
          <span className="timestamp text-xs text-gray-400">
            {formatTimestamp(timestamp)}
          </span>
        )}
        
        {showReadReceipts && readByCount > 0 && (
          <ReadReceipts readByCount={readByCount} eventId={eventId} compact />
        )}
      </div>
    );
  }

  return (
    <div className={`message-status flex items-center gap-2 text-xs ${className}`}>
      <div className="status-info flex items-center gap-1">
        <StatusIcon status={status} isEncrypted={isEncrypted} />
        
        <span className={`status-text ${hasError ? 'text-red-500' : 'text-gray-500'}`}>
          {encryptionError || statusText}
        </span>
      </div>

      {showTimestamp && timestamp && (
        <span className="timestamp text-gray-400">
          {formatTimestamp(timestamp)}
        </span>
      )}

      {showReadReceipts && readByCount > 0 && (
        <ReadReceipts readByCount={readByCount} eventId={eventId} />
      )}

      {eventId && (
        <span className="event-id text-gray-300 font-mono">
          {eventId.slice(-6)}
        </span>
      )}
    </div>
  );
};

// Hook for managing message status
export interface UseMessageStatusOptions {
  trackReadReceipts?: boolean;
  trackDeliveryStatus?: boolean;
}

export interface MessageStatusData {
  status: MessageStatusProps['status'];
  isEncrypted: boolean;
  encryptionError?: string;
  readByCount: number;
  readBy: string[]; // User IDs
  deliveredTo: string[]; // User IDs
  lastReadTimestamp?: number;
  lastDeliveredTimestamp?: number;
}

export function useMessageStatus(
  roomId: string | null,
  eventId: string | null,
  options: UseMessageStatusOptions = {}
) {
  const [statusData, setStatusData] = React.useState<MessageStatusData>({
    status: 'sent',
    isEncrypted: false,
    readByCount: 0,
    readBy: [],
    deliveredTo: []
  });

  const { trackReadReceipts = true, trackDeliveryStatus = false } = options;

  // This would integrate with the Matrix client to track actual message status
  // For now, returning mock data structure
  React.useEffect(() => {
    if (!roomId || !eventId) return;

    // Here you would:
    // 1. Get the actual event from the Matrix client
    // 2. Check its send status
    // 3. Track read receipts if enabled
    // 4. Track delivery status if enabled
    // 5. Listen for status updates

    // Mock implementation:
    setStatusData({
      status: 'sent',
      isEncrypted: false, // Would check event.isEncrypted()
      readByCount: 0,
      readBy: [],
      deliveredTo: []
    });
  }, [roomId, eventId, trackReadReceipts, trackDeliveryStatus]);

  const refreshStatus = React.useCallback(() => {
    // Refresh status data from Matrix client
  }, [roomId, eventId]);

  const markAsRead = React.useCallback(async () => {
    // Send read receipt for this message
  }, [roomId, eventId]);

  return {
    statusData,
    refreshStatus,
    markAsRead
  };
}

// Bulk message status component for displaying multiple message statuses
interface BulkMessageStatusProps {
  messages: Array<{
    id: string;
    status: MessageStatusProps['status'];
    timestamp?: number;
    isEncrypted?: boolean;
  }>;
  className?: string;
}

export const BulkMessageStatus: React.FC<BulkMessageStatusProps> = ({
  messages,
  className = ''
}) => {
  const statusCounts = React.useMemo(() => {
    const counts = {
      sending: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
      encrypting: 0,
      encrypted: 0
    };

    messages.forEach(msg => {
      counts[msg.status] = (counts[msg.status] || 0) + 1;
    });

    return counts;
  }, [messages]);

  const hasFailures = statusCounts.failed > 0;
  const hasPending = statusCounts.sending > 0 || statusCounts.encrypting > 0;

  return (
    <div className={`bulk-message-status flex items-center gap-2 text-xs ${className}`}>
      {hasPending && (
        <div className="pending-messages flex items-center gap-1 text-yellow-600">
          <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
          <span>{statusCounts.sending + statusCounts.encrypting} sending</span>
        </div>
      )}

      {hasFailures && (
        <div className="failed-messages flex items-center gap-1 text-red-500">
          <span>⚠️</span>
          <span>{statusCounts.failed} failed</span>
        </div>
      )}

      <div className="success-messages text-gray-500">
        {statusCounts.sent + statusCounts.delivered + statusCounts.encrypted} sent
      </div>
    </div>
  );
};

export default MessageStatus;
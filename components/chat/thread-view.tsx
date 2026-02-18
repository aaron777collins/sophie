import React, { useState, useRef, useCallback } from 'react';
import { useMessageThread } from './hooks/use-message-thread';
import { useMatrixClient } from '../../matrix-client/lib/matrix/matrix-context';

interface ThreadViewProps {
  roomId: string;
  threadRootId: string;
  onClose?: () => void;
  className?: string;
  enableMarkdown?: boolean;
  maxReplyLength?: number;
}

interface ThreadComposerProps {
  roomId: string;
  threadRootId: string;
  replyToId?: string;
  onSendReply: (content: string, replyToId?: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  maxLength?: number;
  enableMarkdown?: boolean;
  disabled?: boolean;
}

// Thread-specific message composer
const ThreadComposer: React.FC<ThreadComposerProps> = ({
  roomId,
  threadRootId,
  replyToId,
  onSendReply,
  onCancel,
  placeholder = "Reply in thread...",
  maxLength = 4000,
  enableMarkdown = true,
  disabled = false
}) => {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(async () => {
    if (!content.trim() || isSending) return;

    try {
      setIsSending(true);
      await onSendReply(content.trim(), replyToId);
      setContent('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send thread reply:', error);
      // Could show error toast here
    } finally {
      setIsSending(false);
    }
  }, [content, isSending, onSendReply, replyToId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape') {
      onCancel?.();
    }
  }, [handleSend, onCancel]);

  // Auto-resize textarea
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Limit content length
    if (value.length <= maxLength) {
      setContent(value);
      
      // Auto-resize
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [maxLength]);

  return (
    <div className="thread-composer border-t bg-gray-50 p-3">
      {replyToId && (
        <div className="reply-context mb-2 p-2 bg-white rounded text-sm text-gray-600 border-l-2 border-blue-500">
          Replying to message
          <button 
            onClick={() => onCancel?.()}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="composer-input relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
          style={{ minHeight: '60px', maxHeight: '200px' }}
        />
        
        <div className="composer-actions flex justify-between items-center mt-2">
          <div className="composer-info text-xs text-gray-500">
            {content.length}/{maxLength} characters
            {enableMarkdown && " • Markdown supported"}
          </div>
          
          <div className="composer-buttons flex gap-2">
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={isSending}
                className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
              >
                Cancel
              </button>
            )}
            
            <button
              onClick={handleSend}
              disabled={!content.trim() || isSending || disabled}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
            >
              {isSending && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main thread view component
export const ThreadView: React.FC<ThreadViewProps> = ({
  roomId,
  threadRootId,
  onClose,
  className = '',
  enableMarkdown = true,
  maxReplyLength = 4000
}) => {
  const client = useMatrixClient();
  const [replyToId, setReplyToId] = useState<string | undefined>();
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const {
    thread,
    isLoading,
    error,
    sendThreadReply,
    editThreadMessage,
    deleteThreadMessage,
    markThreadRead
  } = useMessageThread(roomId, threadRootId, {
    autoLoad: true,
    maxReplies: 100
  });

  const room = client?.getRoom(roomId);

  // Handle sending replies
  const handleSendReply = useCallback(async (content: string, replyToId?: string) => {
    await sendThreadReply(content, replyToId);
    setReplyToId(undefined);
  }, [sendThreadReply]);

  // Handle editing
  const startEditing = useCallback((messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditingContent(currentContent);
  }, []);

  const handleEditSave = useCallback(async () => {
    if (!editingMessageId) return;
    
    try {
      await editThreadMessage(editingMessageId, editingContent);
      setEditingMessageId(null);
      setEditingContent('');
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  }, [editingMessageId, editingContent, editThreadMessage]);

  const handleEditCancel = useCallback(() => {
    setEditingMessageId(null);
    setEditingContent('');
  }, []);

  // Handle deletion
  const handleDelete = useCallback(async (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await deleteThreadMessage(messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }, [deleteThreadMessage]);

  // Mark thread as read when mounted
  React.useEffect(() => {
    if (thread) {
      markThreadRead();
    }
  }, [thread, markThreadRead]);

  // Render message
  const renderMessage = useCallback((message: any, isRoot = false) => {
    const isOwnMessage = message.senderId === client?.getUserId();
    const senderName = room?.getMember(message.senderId)?.name || message.senderId;
    const isEditing = editingMessageId === message.id;

    return (
      <div 
        key={message.id}
        className={`message p-3 hover:bg-gray-50 ${isRoot ? 'border-b bg-blue-50' : ''}`}
      >
        <div className="message-header flex items-center gap-2 text-xs text-gray-500 mb-2">
          <div className="avatar w-6 h-6 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-xs">
            {senderName.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{senderName}</span>
          <span>{new Date(message.timestamp).toLocaleString()}</span>
          {message.editedAt && <span>(edited)</span>}
          {message.isEncrypted && <span>🔒</span>}
          {isRoot && <span className="bg-blue-200 px-2 py-1 rounded text-xs">Thread Root</span>}
        </div>

        <div className="message-content ml-8">
          {message.redactedAt ? (
            <span className="italic text-gray-500">[Message deleted]</span>
          ) : isEditing ? (
            <div className="editing-form">
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="w-full p-2 border rounded resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleEditSave}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  Save
                </button>
                <button
                  onClick={handleEditCancel}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}

          {/* Message actions */}
          {!message.redactedAt && !isEditing && (
            <div className="message-actions flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setReplyToId(message.id)}
                className="text-xs text-gray-500 hover:text-blue-500"
              >
                Reply
              </button>
              
              {isOwnMessage && (
                <>
                  <button
                    onClick={() => startEditing(message.id, message.content)}
                    className="text-xs text-gray-500 hover:text-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="text-xs text-gray-500 hover:text-red-500"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }, [
    client,
    room,
    editingMessageId,
    editingContent,
    handleEditSave,
    handleEditCancel,
    startEditing,
    handleDelete
  ]);

  if (error) {
    return (
      <div className={`thread-view error ${className}`}>
        <div className="thread-header border-b p-4 flex items-center justify-between">
          <h3 className="font-semibold text-red-600">Thread Error</h3>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
        <div className="p-4 text-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`thread-view flex flex-col h-full ${className}`}>
      {/* Thread header */}
      <div className="thread-header border-b p-4 flex items-center justify-between bg-white">
        <div>
          <h3 className="font-semibold">Thread</h3>
          {thread && (
            <p className="text-sm text-gray-600">
              {thread.totalReplies} {thread.totalReplies === 1 ? 'reply' : 'replies'}
              {thread.participants.size > 1 && 
                ` • ${thread.participants.size} participants`}
            </p>
          )}
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            ✕
          </button>
        )}
      </div>

      {/* Thread messages */}
      <div className="thread-messages flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : thread ? (
          <div className="messages-list">
            {/* Root message */}
            {thread.rootMessage && renderMessage(thread.rootMessage, true)}
            
            {/* Thread replies */}
            {thread.replies.length === 0 ? (
              <div className="text-center text-gray-500 p-8">
                No replies yet. Start the conversation!
              </div>
            ) : (
              thread.replies.map(reply => renderMessage(reply, false))
            )}
          </div>
        ) : null}
      </div>

      {/* Thread composer */}
      <ThreadComposer
        roomId={roomId}
        threadRootId={threadRootId}
        replyToId={replyToId}
        onSendReply={handleSendReply}
        onCancel={() => setReplyToId(undefined)}
        enableMarkdown={enableMarkdown}
        maxLength={maxReplyLength}
      />
    </div>
  );
};

export default ThreadView;
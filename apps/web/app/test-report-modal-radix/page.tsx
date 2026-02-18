'use client';

import React, { useState } from 'react';

const TestReportModalRadix = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const mockMessageData = {
    messageId: '$test-message-id:example.com',
    roomId: '!test-room:example.com',
    eventContent: {
      body: 'This is a test message that needs to be reported',
      sender: '@sender:example.com',
      timestamp: Date.now(),
    },
  };

  const reportReasons = [
    'spam',
    'harassment',
    'inappropriate',
    'violence',
    'hate_speech',
    'other'
  ];

  const handleSubmit = async () => {
    if (!selectedReason) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Simulate API call with different error scenarios for testing
      const shouldSimulateError = (window as any).simulateError;
      
      if (shouldSimulateError === '429') {
        throw new Error('Rate limited. Please try again later.');
      } else if (shouldSimulateError === '403') {
        throw new Error('Permission denied. You are not allowed to report messages.');
      } else if (shouldSimulateError === '404') {
        throw new Error('Message not found or has been deleted.');
      } else if (shouldSimulateError === 'network') {
        throw new Error('Network error. Check your connection.');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store submission data for test verification
      (window as any).reportSubmission = {
        roomId: mockMessageData.roomId,
        messageId: mockMessageData.messageId,
        reason: selectedReason,
        details,
        timestamp: Date.now()
      };
      
      setIsModalOpen(false);
      setSelectedReason('');
      setDetails('');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedReason('');
    setDetails('');
    setError('');
  };

  const handleRetry = () => {
    setError('');
    handleSubmit();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Message Reporting Modal Test Page (Radix UI)</h1>
      
      <button 
        data-testid="open-report-modal" 
        onClick={() => setIsModalOpen(true)}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#ff4444', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Report Message (Radix)
      </button>

      {isModalOpen && (
        <div 
          data-testid="modal-overlay"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div 
            data-testid="modal-content"
            style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              padding: '24px', 
              width: '500px',
              maxWidth: '90vw'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Report Message</h2>
              <button
                data-testid="close-modal"
                onClick={handleCancel}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '20px', 
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            <div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Reported Message:</strong>
                <div style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  padding: '8px', 
                  margin: '8px 0',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div>{mockMessageData.eventContent.body}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    From: {mockMessageData.eventContent.sender}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Reason for report: <span style={{ color: 'red' }}>*</span>
                </label>
                <select 
                  data-testid="report-reason-select"
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px'
                  }}
                >
                  <option value="">Select a reason</option>
                  {reportReasons.map(reason => (
                    <option key={reason} value={reason} data-testid={`reason-${reason}`}>
                      {reason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                {!selectedReason && (
                  <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                    Please select a reason
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Additional details (optional):
                </label>
                <textarea 
                  data-testid="report-details-textarea"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Provide additional context about why you're reporting this message..."
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
                <div data-testid="character-count" style={{ fontSize: '12px', color: '#666', textAlign: 'right' }}>
                  {details.length}/500
                </div>
              </div>

              {error && (
                <div 
                  data-testid="error-message"
                  style={{ 
                    backgroundColor: '#fee', 
                    border: '1px solid #fcc', 
                    padding: '12px', 
                    borderRadius: '4px',
                    marginBottom: '16px',
                    color: '#c00'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Error</div>
                  <div>{error}</div>
                  <button
                    data-testid="retry-button"
                    onClick={handleRetry}
                    style={{
                      marginTop: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#0066cc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button 
                data-testid="cancel-button"
                onClick={handleCancel}
                disabled={isSubmitting}
                style={{ 
                  padding: '8px 16px', 
                  border: '1px solid #ddd', 
                  backgroundColor: 'white', 
                  borderRadius: '4px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                data-testid="submit-report-button"
                onClick={handleSubmit}
                disabled={!selectedReason || isSubmitting}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: selectedReason && !isSubmitting ? '#ff4444' : '#ccc', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: selectedReason && !isSubmitting ? 'pointer' : 'not-allowed'
                }}
              >
                {isSubmitting ? (
                  <span data-testid="loading-spinner">Reporting...</span>
                ) : (
                  'Report Message'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestReportModalRadix;
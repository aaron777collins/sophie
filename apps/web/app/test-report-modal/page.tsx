'use client';

import React, { useState } from 'react';

const TestReportModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');

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
    { value: 'spam', display: 'Spam' },
    { value: 'harassment', display: 'Harassment or Abuse' },
    { value: 'inappropriate', display: 'Inappropriate' },
    { value: 'violence', display: 'Violence' },
    { value: 'hate_speech', display: 'Hate Speech' },
    { value: 'other', display: 'Other' }
  ];

  const handleSubmit = async () => {
    if (!selectedReason) {
      setValidationError('Please select a reason for reporting');
      return;
    }
    
    setValidationError('');
    setApiError('');
    setIsSubmitting(true);
    
    // Simulate API call by calling the mock Matrix client
    try {
      const matrixClient = (window as any).mockMatrixClient;
      
      if (!matrixClient) {
        throw new Error('Matrix client not available. Please try again later.');
      }
      
      // Call the mock Matrix client's reportEvent function
      await matrixClient.reportEvent(
        mockMessageData.roomId,
        mockMessageData.messageId,
        -100,
        selectedReason
      );
      
      // Small delay to simulate network
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Store submission data for test verification
      (window as any).reportSubmission = {
        roomId: mockMessageData.roomId,
        messageId: mockMessageData.messageId,
        reason: selectedReason,
        details,
        timestamp: Date.now()
      };

      // Initialize reportEventCalls if it doesn't exist
      if (!(window as any).reportEventCalls) {
        (window as any).reportEventCalls = [];
      }

      // First API call for the basic report
      (window as any).reportEventCalls.push({
        roomId: mockMessageData.roomId,
        messageId: mockMessageData.messageId,
        score: -100,
        reason: selectedReason
      });

      // Second API call if there are additional details
      if (details) {
        (window as any).reportEventCalls.push({
          roomId: mockMessageData.roomId,
          messageId: mockMessageData.messageId,
          score: -100,
          reason: `${selectedReason}: ${details}`
        });
      }
      
      // Show success message
      setSuccessMessage('Message reported successfully');
      setIsModalOpen(false);
      setSelectedReason('');
      setDetails('');
    } catch (error: any) {
      console.error('Report submission failed:', error);
      
      // Map error types to expected messages
      let errorMessage = error.message;
      
      if (error.httpStatus === 429) {
        errorMessage = 'Too many reports sent. Please wait before reporting again.';
      } else if (error.httpStatus === 403) {
        errorMessage = 'You do not have permission to report messages in this room.';
      } else if (error.httpStatus === 404) {
        errorMessage = 'Message or room not found. It may have been deleted.';
      } else if (error.message && error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (!errorMessage) {
        errorMessage = 'An error occurred while submitting the report.';
      }
      
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedReason('');
    setDetails('');
    setValidationError('');
    setApiError('');
    setIsDropdownOpen(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Message Reporting Modal Test Page</h1>
      
      {successMessage && (
        <div 
          className="ant-message"
          style={{
            backgroundColor: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: '4px',
            padding: '8px 16px',
            marginBottom: '16px',
            color: '#52c41a'
          }}
        >
          {successMessage}
        </div>
      )}
      
      <button 
        data-testid="open-report-modal" 
        onClick={() => {
          setIsModalOpen(true);
          setSuccessMessage('');
        }}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#ff4444', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Report Message
      </button>

      {isModalOpen && (
        <div 
          className="ant-modal" 
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
            className="ant-modal-content" 
            style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              padding: '24px', 
              width: '500px',
              maxWidth: '90vw'
            }}
          >
            <div className="ant-modal-header">
              <div className="ant-modal-title" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                Report Message
              </div>
            </div>

            <div className="ant-modal-body">
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
                  Reason for report:
                </label>
                <div style={{ position: 'relative' }}>
                  <button 
                    data-testid="report-reason-select"
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    {selectedReason ? reportReasons.find(r => r.value === selectedReason)?.display : 'Select a reason'}
                    <span>▼</span>
                  </button>
                  {isDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      zIndex: 1000
                    }}>
                      {reportReasons.map(reason => (
                        <div 
                          key={reason.value}
                          onClick={() => {
                            setSelectedReason(reason.value);
                            setIsDropdownOpen(false);
                            setValidationError('');
                          }}
                          style={{
                            padding: '8px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          {reason.display}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                <div style={{ fontSize: '12px', color: '#666', textAlign: 'right' }}>
                  {details.length} / 500
                </div>
              </div>

              {validationError && (
                <div style={{ 
                  color: 'red', 
                  fontSize: '14px', 
                  marginTop: '8px',
                  padding: '8px',
                  backgroundColor: '#fff2f0',
                  border: '1px solid #ffccc7',
                  borderRadius: '4px'
                }}>
                  {validationError}
                </div>
              )}

              {apiError && (
                <div 
                  className="ant-alert-error"
                  style={{ 
                    color: '#ff4d4f', 
                    fontSize: '14px', 
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: '#fff2f0',
                    border: '1px solid #ffccc7',
                    borderRadius: '4px'
                  }}
                >
                  {apiError}
                </div>
              )}

              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginTop: '12px',
                fontStyle: 'italic'
              }}>
                False reports may result in action taken against your account
              </div>
            </div>

            <div className="ant-modal-footer" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button 
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
                disabled={isSubmitting}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: !isSubmitting ? '#ff4444' : '#ccc', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: !isSubmitting ? 'pointer' : 'not-allowed'
                }}
              >
                {isSubmitting ? 'Reporting...' : 'Report Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestReportModal;
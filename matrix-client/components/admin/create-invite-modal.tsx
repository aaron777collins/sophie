'use client';

import React, { useState } from 'react';
import { 
  validateInviteForm, 
  validateMatrixId as validateMatrixIdComprehensive,
  validateExpiration,
  validateNotes,
  EXPIRATION_PRESETS,
  daysToMilliseconds,
  formatExpirationTime
} from '../../lib/matrix/validation/invite-validation';

interface Invite {
  id: string;
  code: string;
  matrixId: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'used' | 'expired';
  notes?: string;
  createdBy: string;
  usedAt?: string;
  usedBy?: string;
}

interface CreateInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (invite: Invite) => void;
  onError: (error: string) => void;
}

interface CreateInviteRequest {
  matrixId: string;
  expiresIn: number;
  notes: string;
}

export function CreateInviteModal({ isOpen, onClose, onSuccess, onError }: CreateInviteModalProps) {
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<CreateInviteRequest>({
    matrixId: '',
    expiresIn: EXPIRATION_PRESETS.SEVEN_DAYS,
    notes: ''
  });
  const [customExpiration, setCustomExpiration] = useState({
    enabled: false,
    days: 7
  });
  const [validationErrors, setValidationErrors] = useState<{
    matrixId?: string;
    expiration?: string;
    notes?: string;
  }>({});

  const expirationOptions = [
    { label: '7 Days', value: EXPIRATION_PRESETS.SEVEN_DAYS },
    { label: '14 Days', value: EXPIRATION_PRESETS.FOURTEEN_DAYS },
    { label: '30 Days', value: EXPIRATION_PRESETS.THIRTY_DAYS },
    { label: 'Custom', value: -1 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use comprehensive validation
    const finalExpiresIn = customExpiration.enabled 
      ? daysToMilliseconds(customExpiration.days)
      : formData.expiresIn;

    const validationResult = validateInviteForm({
      matrixId: formData.matrixId,
      expiresIn: finalExpiresIn,
      notes: formData.notes
    });

    setValidationErrors(validationResult.errors);

    if (!validationResult.isValid) {
      return;
    }

    setCreating(true);

    try {
      const requestData = {
        matrixId: formData.matrixId.trim(),
        expiresIn: finalExpiresIn,
        notes: formData.notes.trim()
      };

      const response = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create invite`);
      }

      const data = await response.json();
      
      if (!data.invite) {
        throw new Error('Invalid response: missing invite data');
      }

      onSuccess(data.invite);
      resetForm();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the invite';
      console.error('Failed to create invite:', err);
      onError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      matrixId: '',
      expiresIn: EXPIRATION_PRESETS.SEVEN_DAYS,
      notes: ''
    });
    setCustomExpiration({
      enabled: false,
      days: 7
    });
    setValidationErrors({});
  };

  const handleClose = () => {
    if (!creating) {
      resetForm();
      onClose();
    }
  };

  const handleExpirationChange = (value: number) => {
    if (value === -1) {
      // Custom option selected
      setCustomExpiration(prev => ({ ...prev, enabled: true }));
      setFormData(prev => ({ 
        ...prev, 
        expiresIn: daysToMilliseconds(customExpiration.days)
      }));
    } else {
      // Preset option selected
      setCustomExpiration(prev => ({ ...prev, enabled: false }));
      setFormData(prev => ({ ...prev, expiresIn: value }));
    }
    
    // Clear expiration validation error when selection changes
    if (validationErrors.expiration) {
      setValidationErrors(prev => ({ ...prev, expiration: undefined }));
    }
  };

  const handleCustomDaysChange = (days: number) => {
    setCustomExpiration(prev => ({ ...prev, days }));
    setFormData(prev => ({ 
      ...prev, 
      expiresIn: daysToMilliseconds(days)
    }));
    
    // Clear expiration validation error when user types
    if (validationErrors.expiration) {
      setValidationErrors(prev => ({ ...prev, expiration: undefined }));
    }
  };

  const handleMatrixIdChange = (matrixId: string) => {
    setFormData(prev => ({ ...prev, matrixId }));
    
    // Clear matrix ID validation error when user types
    if (validationErrors.matrixId) {
      setValidationErrors(prev => ({ ...prev, matrixId: undefined }));
    }
  };

  const handleNotesChange = (notes: string) => {
    setFormData(prev => ({ ...prev, notes }));
    
    // Clear notes validation error when user types
    if (validationErrors.notes) {
      setValidationErrors(prev => ({ ...prev, notes: undefined }));
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Invite</h3>
          <button 
            onClick={handleClose} 
            className="close-modal"
            disabled={creating}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="matrixId">Matrix User ID *</label>
            <input
              id="matrixId"
              type="text"
              placeholder="@user:matrix.org"
              value={formData.matrixId}
              onChange={(e) => handleMatrixIdChange(e.target.value)}
              required
              disabled={creating}
              className={validationErrors.matrixId ? 'error' : ''}
            />
            {validationErrors.matrixId && (
              <div className="field-error">{validationErrors.matrixId}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="expiresIn">Expiration</label>
            <select
              id="expiresIn"
              value={customExpiration.enabled ? -1 : formData.expiresIn}
              onChange={(e) => handleExpirationChange(Number(e.target.value))}
              disabled={creating}
            >
              {expirationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {customExpiration.enabled && (
              <div className="custom-expiration">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={customExpiration.days}
                  onChange={(e) => handleCustomDaysChange(Number(e.target.value))}
                  disabled={creating}
                  className={validationErrors.expiration ? 'error' : ''}
                />
                <span className="custom-label">days</span>
              </div>
            )}
            {validationErrors.expiration && (
              <div className="field-error">{validationErrors.expiration}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              placeholder="Add a note about this invite..."
              value={formData.notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              disabled={creating}
              rows={3}
              className={validationErrors.notes ? 'error' : ''}
              maxLength={500}
            />
            {validationErrors.notes && (
              <div className="field-error">{validationErrors.notes}</div>
            )}
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={handleClose}
              className="cancel-btn"
              disabled={creating}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Invite'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal {
          background: white;
          border-radius: 8px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
        }

        .close-modal {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6c757d;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background-color 0.2s, color 0.2s;
        }

        .close-modal:hover:not(:disabled) {
          color: #495057;
          background-color: #f8f9fa;
        }

        .close-modal:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .modal-form {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #495057;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        }

        .form-group input.error,
        .form-group select.error,
        .form-group textarea.error {
          border-color: #dc3545;
          box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }

        .custom-expiration {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .custom-expiration input {
          width: 80px;
          flex-shrink: 0;
        }

        .custom-label {
          color: #6c757d;
          font-size: 14px;
        }

        .field-error {
          color: #dc3545;
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }

        .cancel-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #5a6268;
        }

        .submit-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .cancel-btn:disabled,
        .submit-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
          opacity: 0.7;
        }

        @media (max-width: 768px) {
          .modal-backdrop {
            padding: 10px;
          }

          .modal {
            max-height: 95vh;
          }

          .modal-header,
          .modal-form {
            padding: 15px;
          }

          .modal-actions {
            flex-direction: column;
            gap: 8px;
          }

          .cancel-btn,
          .submit-btn {
            width: 100%;
          }

          .custom-expiration {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 480px) {
          .modal-header h3 {
            font-size: 16px;
          }

          .close-modal {
            font-size: 20px;
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { InviteStats } from './invite-stats';
import { InviteList } from './invite-list';
import { CreateInviteModal } from './create-invite-modal';

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

export function AdminInvitesDashboard() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/invites');
      if (!response.ok) {
        throw new Error('Failed to fetch invites');
      }
      const data = await response.json();
      setInvites(data.invites);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const handleCreateSuccess = (invite: Invite) => {
    setInvites(prev => [invite, ...prev]);
    setShowCreateModal(false);
    setError(null);
  };

  const handleCreateError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/admin/invites?id=${inviteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to revoke invite');
      }

      setInvites(prev => 
        prev.map(invite => 
          invite.id === inviteId 
            ? { ...invite, status: 'expired' as const }
            : invite
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke invite');
    }
  };

  // Removed: expirationOptions now handled by CreateInviteModal component

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner">⏳</div>
        <p>Loading invites...</p>
        <style jsx>{`
          .loading-state {
            text-align: center;
            padding: 60px 20px;
            color: #6c757d;
          }

          .loading-spinner {
            font-size: 48px;
            margin-bottom: 20px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-invites-dashboard">
      {error && (
        <div className="error-alert">
          <span className="error-icon">⚠️</span>
          {error}
          <button 
            onClick={() => setError(null)} 
            className="close-error"
            aria-label="Close error"
          >
            ×
          </button>
        </div>
      )}

      <div className="dashboard-actions">
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="create-invite-btn"
        >
          ➕ Create New Invite
        </button>
        <button onClick={loadInvites} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <InviteStats invites={invites} />
      
      <InviteList invites={invites} onRevoke={handleRevokeInvite} />

      <CreateInviteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        onError={handleCreateError}
      />

      <style jsx>{`
        .admin-invites-dashboard {
          width: 100%;
        }

        .error-alert {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          padding: 12px 15px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .error-icon {
          font-size: 18px;
        }

        .close-error {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          margin-left: auto;
          color: #721c24;
        }

        .dashboard-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          gap: 15px;
          flex-wrap: wrap;
        }

        .create-invite-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .create-invite-btn:hover {
          background: #218838;
        }

        .refresh-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .refresh-btn:hover {
          background: #5a6268;
        }

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
        }

        .modal {
          background: white;
          border-radius: 8px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
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
        }

        .close-modal:hover:not(:disabled) {
          color: #495057;
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
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
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
        }

        .submit-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .cancel-btn:disabled,
        .submit-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .dashboard-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}
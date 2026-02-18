'use client';

import React, { useState } from 'react';

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

interface InviteListProps {
  invites: Invite[];
  onRevoke: (inviteId: string) => Promise<void>;
}

export function InviteList({ invites, onRevoke }: InviteListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [revoking, setRevoking] = useState<string | null>(null);

  const filteredInvites = invites.filter(invite => {
    const matchesSearch = !searchTerm || 
      invite.matrixId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invite.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invite.createdBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || invite.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRevoke = async (inviteId: string) => {
    if (!confirm('Are you sure you want to revoke this invite?')) return;

    setRevoking(inviteId);
    try {
      await onRevoke(inviteId);
    } finally {
      setRevoking(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: '#28a745', bg: '#d4edda', icon: '✅' },
      used: { color: '#007bff', bg: '#d1ecf1', icon: '👤' },
      expired: { color: '#dc3545', bg: '#f8d7da', icon: '⏰' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span 
        className="status-badge" 
        style={{ 
          color: config.color, 
          backgroundColor: config.bg 
        }}
      >
        {config.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="invite-list">
      <div className="list-header">
        <h3>Invite Management</h3>
        
        <div className="filters">
          <input
            type="text"
            placeholder="Search by Matrix ID, notes, or creator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="used">Used</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {filteredInvites.length === 0 ? (
        <div className="empty-state">
          <p>No invites found matching your criteria.</p>
        </div>
      ) : (
        <div className="invites-table">
          <div className="table-header">
            <div>Matrix ID</div>
            <div>Status</div>
            <div>Created</div>
            <div>Expires</div>
            <div>Actions</div>
          </div>

          {filteredInvites.map(invite => (
            <div key={invite.id} className="table-row">
              <div className="invite-details">
                <div className="matrix-id">{invite.matrixId}</div>
                <div className="invite-code">Code: {invite.code}</div>
                {invite.notes && (
                  <div className="invite-notes">{invite.notes}</div>
                )}
                <div className="creator">By: {invite.createdBy}</div>
                {invite.usedAt && invite.usedBy && (
                  <div className="usage-info">
                    Used by {invite.usedBy} on {formatDate(invite.usedAt)}
                  </div>
                )}
              </div>

              <div className="status-cell">
                {getStatusBadge(invite.status)}
              </div>

              <div className="date-cell">
                {formatDate(invite.createdAt)}
              </div>

              <div className="date-cell">
                {formatDate(invite.expiresAt)}
              </div>

              <div className="actions-cell">
                {invite.status === 'active' && (
                  <button
                    onClick={() => handleRevoke(invite.id)}
                    disabled={revoking === invite.id}
                    className="revoke-button"
                  >
                    {revoking === invite.id ? 'Revoking...' : 'Revoke'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .invite-list {
          background: white;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          overflow: hidden;
        }

        .list-header {
          padding: 20px;
          border-bottom: 1px solid #e9ecef;
          background: #f8f9fa;
        }

        .list-header h3 {
          margin: 0 0 15px 0;
          color: #2c3e50;
          font-size: 18px;
          font-weight: 600;
        }

        .filters {
          display: flex;
          gap: 15px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-input {
          flex: 1;
          min-width: 250px;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
          background: white;
        }

        .empty-state {
          padding: 40px;
          text-align: center;
          color: #6c757d;
        }

        .invites-table {
          display: block;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 120px 140px 140px 100px;
          gap: 15px;
          padding: 15px 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
          font-weight: 600;
          font-size: 14px;
          color: #495057;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 120px 140px 140px 100px;
          gap: 15px;
          padding: 20px;
          border-bottom: 1px solid #f1f3f4;
          transition: background-color 0.2s;
        }

        .table-row:hover {
          background-color: #f8f9fa;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .invite-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .matrix-id {
          font-weight: 600;
          color: #2c3e50;
          font-size: 14px;
        }

        .invite-code {
          font-family: monospace;
          font-size: 12px;
          color: #6c757d;
          background: #f8f9fa;
          padding: 2px 6px;
          border-radius: 3px;
          display: inline-block;
          width: fit-content;
        }

        .invite-notes {
          font-size: 12px;
          color: #495057;
          font-style: italic;
        }

        .creator {
          font-size: 11px;
          color: #6c757d;
        }

        .usage-info {
          font-size: 11px;
          color: #28a745;
          font-weight: 500;
        }

        .status-cell {
          display: flex;
          align-items: flex-start;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid currentColor;
          opacity: 0.9;
        }

        .date-cell {
          color: #495057;
          font-size: 13px;
          display: flex;
          align-items: flex-start;
        }

        .actions-cell {
          display: flex;
          align-items: flex-start;
        }

        .revoke-button {
          background: #dc3545;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .revoke-button:hover:not(:disabled) {
          background: #c82333;
        }

        .revoke-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        @media (max-width: 968px) {
          .invites-table {
            display: block;
          }

          .table-header {
            display: none;
          }

          .table-row {
            display: block;
            padding: 20px;
            border-bottom: 1px solid #e9ecef;
          }

          .status-cell {
            margin: 10px 0;
          }

          .date-cell {
            margin: 5px 0;
            font-size: 12px;
          }

          .actions-cell {
            margin-top: 15px;
          }

          .filters {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}
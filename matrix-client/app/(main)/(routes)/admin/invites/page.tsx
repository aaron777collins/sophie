'use client';

import React from 'react';
import { AdminInvitesDashboard } from '@/components/admin/admin-invites-dashboard';

export default function AdminInvitesPage() {
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin - Invite Management</h1>
        <p>Manage user invitations and access control</p>
      </div>

      <AdminInvitesDashboard />

      <style jsx>{`
        .admin-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .admin-header {
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }

        .admin-header h1 {
          margin: 0 0 5px 0;
          color: #2c3e50;
          font-size: 28px;
          font-weight: 600;
        }

        .admin-header p {
          margin: 0;
          color: #6c757d;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .admin-page {
            padding: 15px;
          }

          .admin-header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
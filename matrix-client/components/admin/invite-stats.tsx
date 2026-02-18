'use client';

import React from 'react';

interface InviteStatsProps {
  invites: Array<{
    id: string;
    status: 'active' | 'used' | 'expired';
    createdAt: string;
    expiresAt: string;
  }>;
}

export function InviteStats({ invites }: InviteStatsProps) {
  const stats = {
    total: invites.length,
    active: invites.filter(inv => inv.status === 'active').length,
    used: invites.filter(inv => inv.status === 'used').length,
    expired: invites.filter(inv => inv.status === 'expired').length,
  };

  const usageRate = stats.total > 0 ? ((stats.used / stats.total) * 100).toFixed(1) : '0.0';

  const statCards = [
    {
      label: 'Total Invites',
      value: stats.total,
      color: '#6c757d',
      icon: '📊'
    },
    {
      label: 'Active',
      value: stats.active,
      color: '#28a745',
      icon: '✅'
    },
    {
      label: 'Used',
      value: stats.used,
      color: '#007bff',
      icon: '👥'
    },
    {
      label: 'Expired',
      value: stats.expired,
      color: '#dc3545',
      icon: '⏰'
    }
  ];

  return (
    <div className="invite-stats">
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-value" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="usage-info">
        <div className="usage-rate">
          <span className="usage-label">Success Rate:</span>
          <span className="usage-value">{usageRate}%</span>
        </div>
      </div>

      <style jsx>{`
        .invite-stats {
          margin-bottom: 30px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          gap: 15px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          font-size: 24px;
          opacity: 0.8;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 600;
          line-height: 1;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 14px;
          color: #6c757d;
          font-weight: 500;
        }

        .usage-info {
          background: #f8f9fa;
          padding: 15px 20px;
          border-radius: 6px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
        }

        .usage-label {
          font-size: 14px;
          color: #495057;
          font-weight: 500;
        }

        .usage-value {
          font-size: 18px;
          font-weight: 600;
          color: #007bff;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }

          .stat-card {
            padding: 15px;
            gap: 12px;
          }

          .stat-value {
            font-size: 24px;
          }

          .usage-info {
            padding: 12px 15px;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
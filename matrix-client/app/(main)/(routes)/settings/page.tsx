'use client';

import React from 'react';
import { SettingsInterface } from '../../../../components/settings/settings-interface';

export default function SettingsPage() {
  return (
    <div className="settings-page">
      <SettingsInterface />
      
      <style jsx>{`
        .settings-page {
          min-height: 100vh;
          background: var(--background-color, #f8f9fa);
          padding: 20px;
        }

        @media (max-width: 768px) {
          .settings-page {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
}
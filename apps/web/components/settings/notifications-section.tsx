'use client';

import React from 'react';
import { NotificationSettings } from '@/components/notifications';

export default function NotificationsSection() {
  return (
    <NotificationSettings 
      userId="current-user" // In production, get from auth context
      onSave={(settings) => {
        console.log('Notification settings saved:', settings);
      }}
    />
  );
}
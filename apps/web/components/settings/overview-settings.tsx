'use client';

import React, { useState, useRef } from 'react';
import {
  Input,
  Textarea,
  Select,
  FormSection,
  Button,
  Divider,
  Avatar,
} from '../ui';
import type { Server, DefaultNotificationLevel } from '@/lib/types/server';
import styles from './settings-sections.module.css';

interface OverviewSettingsProps {
  server: Server;
  onSave: (updates: Partial<Server>) => Promise<void>;
  channels: { id: string; name: string; type: 'text' | 'voice' }[];
}

const AFK_TIMEOUT_OPTIONS = [
  { value: '60', label: '1 minute' },
  { value: '300', label: '5 minutes' },
  { value: '900', label: '15 minutes' },
  { value: '1800', label: '30 minutes' },
  { value: '3600', label: '1 hour' },
];

const NOTIFICATION_OPTIONS = [
  { value: 'all_messages', label: 'All Messages' },
  { value: 'only_mentions', label: 'Only @mentions' },
];

export function OverviewSettings({ server, onSave, channels }: OverviewSettingsProps) {
  const [name, setName] = useState(server.name);
  const [description, setDescription] = useState(server.description || '');
  const [afkChannelId, setAfkChannelId] = useState(server.afkChannelId || '');
  const [afkTimeout, setAfkTimeout] = useState(String(server.afkTimeout));
  const [systemChannelId, setSystemChannelId] = useState(server.systemChannelId || '');
  const [defaultNotifications, setDefaultNotifications] = useState<DefaultNotificationLevel>(
    server.defaultNotificationLevel
  );
  const [isSaving, setIsSaving] = useState(false);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const voiceChannels = channels.filter((c) => c.type === 'voice');
  const textChannels = channels.filter((c) => c.type === 'text');

  const hasChanges =
    name !== server.name ||
    description !== (server.description || '') ||
    afkChannelId !== (server.afkChannelId || '') ||
    afkTimeout !== String(server.afkTimeout) ||
    systemChannelId !== (server.systemChannelId || '') ||
    defaultNotifications !== server.defaultNotificationLevel ||
    iconPreview !== null ||
    bannerPreview !== null;

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        name,
        description,
        afkChannelId: afkChannelId || undefined,
        afkTimeout: parseInt(afkTimeout, 10),
        systemChannelId: systemChannelId || undefined,
        defaultNotificationLevel: defaultNotifications,
        // Icon and banner would be handled separately with file upload
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setName(server.name);
    setDescription(server.description || '');
    setAfkChannelId(server.afkChannelId || '');
    setAfkTimeout(String(server.afkTimeout));
    setSystemChannelId(server.systemChannelId || '');
    setDefaultNotifications(server.defaultNotificationLevel);
    setIconPreview(null);
    setBannerPreview(null);
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Server Overview</h2>
      
      <div className={styles.avatarSection}>
        <div className={styles.avatarUpload}>
          <Avatar
            src={iconPreview || server.iconUrl}
            alt={server.name}
            size="xxl"
            shape="circle"
            onClick={() => iconInputRef.current?.click()}
          />
          <input
            ref={iconInputRef}
            type="file"
            accept="image/*"
            onChange={handleIconChange}
            className={styles.hiddenInput}
          />
          <div className={styles.avatarActions}>
            <Button
              variant="secondary"
              size="small"
              onClick={() => iconInputRef.current?.click()}
            >
              Upload Icon
            </Button>
            {(iconPreview || server.iconUrl) && (
              <Button
                variant="ghost"
                size="small"
                onClick={() => {
                  setIconPreview(null);
                  // Would also trigger icon removal
                }}
              >
                Remove
              </Button>
            )}
          </div>
          <p className={styles.uploadHint}>
            Recommended: 512x512 or larger, PNG or GIF
          </p>
        </div>
      </div>

      <Divider />

      <FormSection>
        <Input
          label="Server Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
          fullWidth
        />
      </FormSection>

      <FormSection
        title="Server Description"
        description="A short description about your server"
      >
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          showCount
          placeholder="Tell people about your server..."
          fullWidth
        />
      </FormSection>

      <Divider />

      {server.features.includes('BANNER') && (
        <>
          <FormSection
            title="Server Banner"
            description="This image will be displayed at the top of the server's channel list"
          >
            <div className={styles.bannerUpload}>
              {(bannerPreview || server.bannerUrl) ? (
                <div className={styles.bannerPreview}>
                  <img
                    src={bannerPreview || server.bannerUrl || ''}
                    alt="Server banner"
                    className={styles.bannerImage}
                  />
                </div>
              ) : (
                <div className={styles.bannerPlaceholder}>
                  <span>No banner uploaded</span>
                </div>
              )}
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className={styles.hiddenInput}
              />
              <div className={styles.bannerActions}>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => bannerInputRef.current?.click()}
                >
                  Upload Banner
                </Button>
                {(bannerPreview || server.bannerUrl) && (
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => setBannerPreview(null)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </FormSection>
          <Divider />
        </>
      )}

      <FormSection title="System Messages Settings">
        <Select
          label="System Messages Channel"
          options={[
            { value: '', label: 'No system messages channel' },
            ...textChannels.map((c) => ({ value: c.id, label: `# ${c.name}` })),
          ]}
          value={systemChannelId}
          onChange={(e) => setSystemChannelId(e.target.value)}
          fullWidth
          helperText="Where system messages are sent (welcome messages, boosts, etc.)"
        />
      </FormSection>

      <Divider />

      <FormSection title="Inactive Channel">
        <Select
          label="Inactive Channel"
          options={[
            { value: '', label: 'No inactive channel' },
            ...voiceChannels.map((c) => ({ value: c.id, label: `🔊 ${c.name}` })),
          ]}
          value={afkChannelId}
          onChange={(e) => setAfkChannelId(e.target.value)}
          fullWidth
        />

        <Select
          label="Inactive Timeout"
          options={AFK_TIMEOUT_OPTIONS}
          value={afkTimeout}
          onChange={(e) => setAfkTimeout(e.target.value)}
          fullWidth
          helperText="Time before a user is considered inactive"
        />
      </FormSection>

      <Divider />

      <FormSection title="Default Notification Settings">
        <Select
          label="Default Notifications"
          options={NOTIFICATION_OPTIONS}
          value={defaultNotifications}
          onChange={(e) =>
            setDefaultNotifications(e.target.value as DefaultNotificationLevel)
          }
          fullWidth
          helperText="The default notification level for new members"
        />
      </FormSection>

      {hasChanges && (
        <div className={styles.saveBar}>
          <span className={styles.saveBarText}>Careful — you have unsaved changes!</span>
          <div className={styles.saveBarActions}>
            <Button variant="ghost" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="primary" onClick={handleSave} loading={isSaving}>
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OverviewSettings;

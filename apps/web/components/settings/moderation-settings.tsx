'use client';

import React, { useState } from 'react';
import {
  Select,
  Toggle,
  FormSection,
  Button,
  Divider,
} from '../ui';
import type {
  Server,
  VerificationLevel,
  ExplicitContentFilter,
  MfaLevel,
} from '@/lib/types/server';
import styles from './settings-sections.module.css';

interface ModerationSettingsProps {
  server: Server;
  onSave: (updates: Partial<Server>) => Promise<void>;
}

const VERIFICATION_LEVELS = [
  {
    value: 'none',
    label: 'None',
    description: 'Unrestricted',
  },
  {
    value: 'low',
    label: 'Low',
    description: 'Must have a verified email on their account',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Must also be registered on Discord for longer than 5 minutes',
  },
  {
    value: 'high',
    label: 'High',
    description: 'Must also be a member of this server for longer than 10 minutes',
  },
  {
    value: 'very_high',
    label: 'Highest',
    description: 'Must have a verified phone on their account',
  },
];

const CONTENT_FILTER_OPTIONS = [
  {
    value: 'disabled',
    label: "Don't scan any media content",
    description: 'No media will be scanned',
  },
  {
    value: 'members_without_roles',
    label: 'Scan media content from members without a role',
    description: 'Recommended for most servers',
  },
  {
    value: 'all_members',
    label: 'Scan media content from all members',
    description: 'Maximum protection',
  },
];

export function ModerationSettings({ server, onSave }: ModerationSettingsProps) {
  const [verificationLevel, setVerificationLevel] = useState<VerificationLevel>(
    server.verificationLevel
  );
  const [contentFilter, setContentFilter] = useState<ExplicitContentFilter>(
    server.explicitContentFilter
  );
  const [mfaLevel, setMfaLevel] = useState<MfaLevel>(server.mfaLevel);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges =
    verificationLevel !== server.verificationLevel ||
    contentFilter !== server.explicitContentFilter ||
    mfaLevel !== server.mfaLevel;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        verificationLevel,
        explicitContentFilter: contentFilter,
        mfaLevel,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setVerificationLevel(server.verificationLevel);
    setContentFilter(server.explicitContentFilter);
    setMfaLevel(server.mfaLevel);
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Moderation</h2>
      <p className={styles.sectionDescription}>
        Manage verification levels, content filtering, and moderation requirements
        for your server.
      </p>

      <FormSection
        title="Verification Level"
        description="This is the level of verification new members must meet before they can send messages in this server."
      >
        <div className={styles.listContainer}>
          {VERIFICATION_LEVELS.map((level) => (
            <label
              key={level.value}
              className={`${styles.card} ${styles.cardClickable} ${
                verificationLevel === level.value ? styles.cardSelected : ''
              }`}
            >
              <input
                type="radio"
                name="verificationLevel"
                value={level.value}
                checked={verificationLevel === level.value}
                onChange={(e) =>
                  setVerificationLevel(e.target.value as VerificationLevel)
                }
                className="sr-only"
              />
              <div className={styles.cardContent}>
                <span className={styles.cardTitle}>{level.label}</span>
                <span className={styles.cardSubtitle}>{level.description}</span>
              </div>
              {verificationLevel === level.value && <CheckIcon />}
            </label>
          ))}
        </div>
      </FormSection>

      <Divider />

      <FormSection
        title="Explicit Media Content Filter"
        description="Automatically scan and delete messages that contain explicit images."
      >
        <div className={styles.listContainer}>
          {CONTENT_FILTER_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`${styles.card} ${styles.cardClickable} ${
                contentFilter === option.value ? styles.cardSelected : ''
              }`}
            >
              <input
                type="radio"
                name="contentFilter"
                value={option.value}
                checked={contentFilter === option.value}
                onChange={(e) =>
                  setContentFilter(e.target.value as ExplicitContentFilter)
                }
                className="sr-only"
              />
              <div className={styles.cardContent}>
                <span className={styles.cardTitle}>{option.label}</span>
                <span className={styles.cardSubtitle}>{option.description}</span>
              </div>
              {contentFilter === option.value && <CheckIcon />}
            </label>
          ))}
        </div>
      </FormSection>

      <Divider />

      <FormSection
        title="Two-Factor Authentication Requirement"
        description="Require members with moderation powers to have two-factor authentication enabled."
      >
        <Toggle
          label="Require 2FA for moderator actions"
          description="Members with 'Ban Members', 'Kick Members', or 'Administrator' permissions will need to enable 2FA to perform those actions."
          checked={mfaLevel === 'elevated'}
          onChange={(e) => setMfaLevel(e.target.checked ? 'elevated' : 'none')}
        />

        {mfaLevel === 'elevated' && (
          <div className={styles.infoBox}>
            <InfoIcon className={styles.infoBoxIcon} />
            <div className={styles.infoBoxContent}>
              <p className={styles.infoBoxTitle}>2FA Requirement Active</p>
              <p className={styles.infoBoxText}>
                Moderators without 2FA enabled will not be able to kick, ban, or
                perform other administrative actions until they enable it.
              </p>
            </div>
          </div>
        )}
      </FormSection>

      <Divider />

      <FormSection title="Auto Moderation">
        <div className={styles.infoBox}>
          <InfoIcon className={styles.infoBoxIcon} />
          <div className={styles.infoBoxContent}>
            <p className={styles.infoBoxTitle}>AutoMod Available</p>
            <p className={styles.infoBoxText}>
              Set up automated rules to filter spam, harmful links, and unwanted
              content. Configure AutoMod rules in the dedicated AutoMod settings
              section.
            </p>
            <Button variant="link" size="small">
              Go to AutoMod Settings →
            </Button>
          </div>
        </div>
      </FormSection>

      {hasChanges && (
        <div className={styles.saveBar}>
          <span className={styles.saveBarText}>
            Careful — you have unsaved changes!
          </span>
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

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.6667 5L7.50001 14.1667L3.33334 10"
        stroke="#5865f2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 18.3333C14.6024 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39763 14.6024 1.66667 10 1.66667C5.39765 1.66667 1.66669 5.39763 1.66669 10C1.66669 14.6024 5.39765 18.3333 10 18.3333Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 13.3333V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 6.66667H10.0083"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default ModerationSettings;

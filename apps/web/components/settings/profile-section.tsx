'use client';

import React, { useState, useEffect } from 'react';
import { Input, Button, Textarea } from '@/components/ui/form';
import { Avatar } from '@/components/ui/avatar';
import styles from './profile-section.module.css';

interface UserProfile {
  userId: string;
  displayName: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  aboutMe?: string;
}

export default function ProfileSection() {
  const [profile, setProfile] = useState<UserProfile>({
    userId: '@user:matrix.example.com',
    displayName: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    aboutMe: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setAvatarFile(file);
      setHasChanges(true);
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({ ...prev, avatarUrl: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Matrix profile update
      // await updateMatrixProfile(profile, avatarFile);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      console.log('Profile saved:', profile);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to original profile data
    // TODO: Fetch from Matrix server
    setHasChanges(false);
    setAvatarFile(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Account</h1>
        <p className={styles.subtitle}>
          Manage your Matrix profile and account settings
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile Picture</h2>
        <div className={styles.avatarSection}>
          <Avatar
            src={profile.avatarUrl}
            alt={profile.displayName}
            fallback={profile.displayName}
            size="xxl"
            className={styles.avatarPreview}
          />
          <div className={styles.avatarControls}>
            <label className={styles.avatarUpload}>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                hidden
              />
              <Button type="button" size="small">
                Change Avatar
              </Button>
            </label>
            <p className={styles.avatarHint}>
              Recommended: 128x128 pixels, PNG/JPG
            </p>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Basic Information</h2>
        <div className={styles.formGrid}>
          <Input
            label="Display Name"
            value={profile.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            placeholder="Enter your display name"
            fullWidth
          />
          
          <Input
            label="Username"
            value={profile.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="Enter your username"
            fullWidth
          />
          
          <Input
            label="Email"
            type="email"
            value={profile.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email address"
            fullWidth
          />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>About Me</h2>
        <Textarea
          label="About Me"
          value={profile.aboutMe || ''}
          onChange={(e) => handleInputChange('aboutMe', e.target.value)}
          placeholder="Tell others about yourself..."
          rows={4}
          fullWidth
          helperText={`${(profile.aboutMe || '').length}/190 characters`}
          maxLength={190}
        />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Matrix Information</h2>
        <div className={styles.matrixInfo}>
          <div className={styles.matrixField}>
            <span className={styles.matrixLabel}>User ID:</span>
            <code className={styles.matrixValue}>{profile.userId}</code>
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className={styles.actions}>
          <div className={styles.actionsContent}>
            <span className={styles.unsavedText}>
              You have unsaved changes!
            </span>
            <div className={styles.actionButtons}>
              <Button
                variant="secondary"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                loading={isLoading}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
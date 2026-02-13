'use client';

import React, { useState } from 'react';
import { Input, Button } from '@/components/ui/form';
import styles from './settings-section.module.css';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginNotifications: boolean;
}

export default function AccountSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,
  });
  
  const [hasPasswordChanges, setHasPasswordChanges] = useState(false);
  const [hasSecurityChanges, setHasSecurityChanges] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    setIsChangingPassword(true);
    try {
      // TODO: Implement password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setHasPasswordChanges(false);
      console.log('Password changed successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSecurityChange = <K extends keyof SecuritySettings>(
    key: K,
    value: SecuritySettings[K]
  ) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
    setHasSecurityChanges(true);
  };

  const handleSecuritySave = () => {
    // TODO: Implement security settings save
    setHasSecurityChanges(false);
    console.log('Security settings saved:', securitySettings);
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement account deletion
      console.log('Account deletion requested');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Account Settings</h1>
        <p className={styles.subtitle}>
          Manage your account security and preferences
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className={styles.form}>
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setHasPasswordChanges(true);
            }}
            placeholder="Enter your current password"
            fullWidth
            required
          />
          
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setHasPasswordChanges(true);
            }}
            placeholder="Enter your new password"
            fullWidth
            required
          />
          
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setHasPasswordChanges(true);
            }}
            placeholder="Confirm your new password"
            fullWidth
            required
          />
          
          <Button
            type="submit"
            disabled={!hasPasswordChanges || isChangingPassword}
            loading={isChangingPassword}
          >
            Change Password
          </Button>
        </form>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Two-Factor Authentication</h2>
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div className={styles.cardInfo}>
              <h3 className={styles.cardTitle}>
                Two-Factor Authentication {securitySettings.twoFactorEnabled ? '(Enabled)' : '(Disabled)'}
              </h3>
              <p className={styles.cardDescription}>
                Add an extra layer of security to your account with 2FA
              </p>
            </div>
            <Button
              variant={securitySettings.twoFactorEnabled ? 'secondary' : 'primary'}
              onClick={() => {
                // TODO: Implement 2FA setup/disable
                console.log('2FA toggle requested');
              }}
            >
              {securitySettings.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Security Preferences</h2>
        <div className={styles.toggleGrid}>
          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Login Notifications</h3>
              <p className={styles.toggleDescription}>
                Get notified when someone logs into your account
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={securitySettings.loginNotifications}
                onChange={(e) => handleSecurityChange('loginNotifications', e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Session Timeout (minutes)</label>
          <select
            className={styles.select}
            value={securitySettings.sessionTimeout}
            onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
            <option value={0}>Never</option>
          </select>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Account Actions</h2>
        <div className={styles.dangerZone}>
          <div className={styles.dangerCard}>
            <div className={styles.dangerInfo}>
              <h3 className={styles.dangerTitle}>Delete Account</h3>
              <p className={styles.dangerDescription}>
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {hasSecurityChanges && (
        <div className={styles.actions}>
          <div className={styles.actionsContent}>
            <span className={styles.unsavedText}>
              You have unsaved security changes!
            </span>
            <div className={styles.actionButtons}>
              <Button
                variant="secondary"
                onClick={() => setHasSecurityChanges(false)}
              >
                Reset
              </Button>
              <Button onClick={handleSecuritySave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
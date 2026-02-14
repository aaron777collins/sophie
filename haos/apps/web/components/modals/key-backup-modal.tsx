'use client'

import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Download, 
  Upload, 
  Copy, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { useKeyBackup } from '../../hooks/use-key-backup'
import { BackupRecoveryInfo } from '../../lib/matrix/crypto/backup'

interface KeyBackupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTab?: 'status' | 'setup' | 'restore'
}

type TabType = 'status' | 'setup' | 'restore'

/**
 * Key backup modal for setting up and managing encryption key backup
 */
export function KeyBackupModal({ open, onOpenChange, initialTab = 'status' }: KeyBackupModalProps) {
  const {
    backupStatus,
    loading,
    error,
    isAvailable,
    hasBackup,
    isBackupTrusted,
    createBackup,
    createBackupWithPassphrase,
    restoreFromRecoveryKey,
    restoreFromPassphrase,
    deleteBackup,
    loadBackupStatus
  } = useKeyBackup()

  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [recoveryInfo, setRecoveryInfo] = useState<BackupRecoveryInfo | null>(null)
  const [usePassphrase, setUsePassphrase] = useState(false)
  const [passphrase, setPassphrase] = useState('')
  const [confirmPassphrase, setConfirmPassphrase] = useState('')
  const [recoveryKey, setRecoveryKey] = useState('')
  const [showRecoveryKey, setShowRecoveryKey] = useState(false)
  const [copied, setCopied] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setActiveTab(initialTab)
      setRecoveryInfo(null)
      setPassphrase('')
      setConfirmPassphrase('')
      setRecoveryKey('')
      setShowRecoveryKey(false)
      setCopied(false)
    }
  }, [open, initialTab])

  // Auto-switch to status tab if backup exists
  useEffect(() => {
    if (hasBackup && activeTab === 'setup') {
      setActiveTab('status')
    }
  }, [hasBackup, activeTab])

  const handleCreateBackup = async () => {
    try {
      let recoveryInfo: BackupRecoveryInfo
      
      if (usePassphrase) {
        if (passphrase !== confirmPassphrase) {
          throw new Error('Passphrases do not match')
        }
        if (passphrase.length < 8) {
          throw new Error('Passphrase must be at least 8 characters long')
        }
        recoveryInfo = await createBackupWithPassphrase(passphrase)
      } else {
        recoveryInfo = await createBackup()
      }
      
      setRecoveryInfo(recoveryInfo)
    } catch (err) {
      console.error('Failed to create backup:', err)
      // Error is handled by the hook
    }
  }

  const handleRestore = async () => {
    try {
      if (usePassphrase) {
        await restoreFromPassphrase(passphrase)
      } else {
        await restoreFromRecoveryKey(recoveryKey)
      }
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to restore backup:', err)
      // Error is handled by the hook
    }
  }

  const handleDeleteBackup = async () => {
    if (confirm('Are you sure you want to delete your key backup? You will not be able to recover your encrypted messages on new devices.')) {
      try {
        await deleteBackup()
      } catch (err) {
        console.error('Failed to delete backup:', err)
      }
    }
  }

  const copyRecoveryKey = async () => {
    if (recoveryInfo?.recoveryKey) {
      try {
        await navigator.clipboard.writeText(recoveryInfo.recoveryKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
      } catch (err) {
        console.error('Failed to copy recovery key:', err)
      }
    }
  }

  const downloadRecoveryKey = () => {
    if (recoveryInfo?.recoveryKey) {
      const element = document.createElement('a')
      const file = new Blob([recoveryInfo.recoveryKey], { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = 'matrix-recovery-key.txt'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  }

  if (!isAvailable) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Key Backup
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              Key backup is not available. Please make sure you are logged in to a Matrix account.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Key Backup
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'status'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('status')}
          >
            Status
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'setup'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('setup')}
          >
            {hasBackup ? 'Replace Backup' : 'Set Up'}
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'restore'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('restore')}
          >
            Restore
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded p-3 flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Status Tab */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : hasBackup ? (
                <div className="text-center space-y-2">
                  {isBackupTrusted ? (
                    <ShieldCheck className="h-12 w-12 text-green-500 mx-auto" />
                  ) : (
                    <ShieldAlert className="h-12 w-12 text-yellow-500 mx-auto" />
                  )}
                  <h3 className="text-lg font-semibold">
                    {isBackupTrusted ? 'Backup Active' : 'Backup Not Trusted'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {isBackupTrusted
                      ? 'Your encryption keys are being backed up securely. You can recover your messages on new devices.'
                      : 'A backup exists but is not trusted. You may need to verify it or create a new one.'
                    }
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold">No Backup Set Up</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Set up key backup to recover your encrypted messages on new devices.
                  </p>
                </div>
              )}
            </div>

            {backupStatus && (
              <div className="bg-muted/30 rounded p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Backup Version:</span>
                  <span className="font-mono">{backupStatus.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Algorithm:</span>
                  <span>{backupStatus.algorithm}</span>
                </div>
                {backupStatus.count !== undefined && (
                  <div className="flex justify-between">
                    <span>Keys Backed Up:</span>
                    <span>{backupStatus.count}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              {hasBackup && (
                <Button variant="outline" onClick={handleDeleteBackup}>
                  Delete Backup
                </Button>
              )}
              <Button
                onClick={() => setActiveTab(hasBackup ? 'setup' : 'setup')}
              >
                {hasBackup ? 'Replace Backup' : 'Set Up Backup'}
              </Button>
            </div>
          </div>
        )}

        {/* Setup Tab */}
        {activeTab === 'setup' && (
          <div className="space-y-4">
            {!recoveryInfo ? (
              <>
                <div className="text-center space-y-2 py-4">
                  <Key className="h-8 w-8 mx-auto" />
                  <h3 className="text-lg font-semibold">
                    {hasBackup ? 'Replace Key Backup' : 'Set Up Key Backup'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Choose how you want to secure your backup. You can use a recovery key or a passphrase.
                  </p>
                </div>

                <div className="space-y-4 border rounded p-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="usePassphrase"
                      checked={usePassphrase}
                      onChange={(e) => setUsePassphrase(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="usePassphrase" className="text-sm font-medium">
                      Use passphrase instead of recovery key
                    </label>
                  </div>

                  {usePassphrase ? (
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="passphrase" className="block text-sm font-medium mb-1">
                          Passphrase
                        </label>
                        <input
                          type="password"
                          id="passphrase"
                          value={passphrase}
                          onChange={(e) => setPassphrase(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md text-sm"
                          placeholder="Enter a secure passphrase (min 8 characters)"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassphrase" className="block text-sm font-medium mb-1">
                          Confirm Passphrase
                        </label>
                        <input
                          type="password"
                          id="confirmPassphrase"
                          value={confirmPassphrase}
                          onChange={(e) => setConfirmPassphrase(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md text-sm"
                          placeholder="Confirm your passphrase"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      A recovery key will be generated automatically. Make sure to save it securely.
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateBackup} 
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {hasBackup ? 'Replace Backup' : 'Create Backup'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center space-y-2 py-4">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                  <h3 className="text-lg font-semibold">Backup Created Successfully!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your encryption keys are now being backed up securely.
                  </p>
                </div>

                {recoveryInfo.recoveryKey && (
                  <div className="space-y-3">
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                      <div className="flex items-center gap-2 text-yellow-800 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Save Your Recovery Key</span>
                      </div>
                      <p className="text-sm text-yellow-700 mb-3">
                        This is your only copy of the recovery key. Store it securely - you'll need it to recover your messages.
                      </p>
                      
                      <div className="bg-white border rounded p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">Recovery Key:</span>
                          <button
                            onClick={() => setShowRecoveryKey(!showRecoveryKey)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {showRecoveryKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <div className="font-mono text-sm bg-gray-50 p-2 rounded break-all">
                          {showRecoveryKey ? recoveryInfo.recoveryKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyRecoveryKey}
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          {copied ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadRecoveryKey}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={() => onOpenChange(false)}>
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Restore Tab */}
        {activeTab === 'restore' && (
          <div className="space-y-4">
            <div className="text-center space-y-2 py-4">
              <Upload className="h-8 w-8 mx-auto" />
              <h3 className="text-lg font-semibold">Restore From Backup</h3>
              <p className="text-sm text-muted-foreground">
                Enter your recovery key or passphrase to restore your encryption keys.
              </p>
            </div>

            <div className="space-y-4 border rounded p-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="restoreWithPassphrase"
                  checked={usePassphrase}
                  onChange={(e) => setUsePassphrase(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="restoreWithPassphrase" className="text-sm font-medium">
                  I have a passphrase instead of a recovery key
                </label>
              </div>

              {usePassphrase ? (
                <div>
                  <label htmlFor="restorePassphrase" className="block text-sm font-medium mb-1">
                    Passphrase
                  </label>
                  <input
                    type="password"
                    id="restorePassphrase"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    placeholder="Enter your backup passphrase"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="restoreRecoveryKey" className="block text-sm font-medium mb-1">
                    Recovery Key
                  </label>
                  <textarea
                    id="restoreRecoveryKey"
                    value={recoveryKey}
                    onChange={(e) => setRecoveryKey(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm font-mono resize-none"
                    rows={3}
                    placeholder="Enter your recovery key"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRestore} 
                disabled={loading || (!usePassphrase && !recoveryKey.trim()) || (usePassphrase && !passphrase.trim())}
                className="flex items-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Restore Backup
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
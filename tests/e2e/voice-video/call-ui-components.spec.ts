import { test, expect } from '@playwright/test';

test.describe('Voice/Video Call UI Components', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mocks similar to the initiation tests
    await page.addInitScript(() => {
      // Mock media devices and permissions
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: async (constraints: MediaStreamConstraints) => {
            console.log('Mock getUserMedia:', constraints);
            const mockStream = new MediaStream();
            // Add mock tracks
            if (constraints.audio) {
              const mockAudioTrack = {
                kind: 'audio',
                enabled: true,
                stop: () => {},
                addEventListener: () => {},
                removeEventListener: () => {},
              };
              (mockStream as any).addTrack(mockAudioTrack);
            }
            if (constraints.video) {
              const mockVideoTrack = {
                kind: 'video',
                enabled: true,
                stop: () => {},
                addEventListener: () => {},
                removeEventListener: () => {},
              };
              (mockStream as any).addTrack(mockVideoTrack);
            }
            return mockStream;
          },
          enumerateDevices: async () => [
            { deviceId: 'default', kind: 'audioinput', label: 'Default Microphone', groupId: 'group-1' },
            { deviceId: 'mic-1', kind: 'audioinput', label: 'USB Microphone', groupId: 'group-1' },
            { deviceId: 'cam-1', kind: 'videoinput', label: 'Webcam HD', groupId: 'group-2' },
            { deviceId: 'cam-2', kind: 'videoinput', label: 'External Camera', groupId: 'group-3' },
            { deviceId: 'speaker-1', kind: 'audiooutput', label: 'Speakers', groupId: 'group-4' },
            { deviceId: 'headphones-1', kind: 'audiooutput', label: 'Headphones', groupId: 'group-5' }
          ]
        },
        writable: true
      });

      // Mock audio context for volume testing
      (window as any).AudioContext = class MockAudioContext {
        createMediaStreamSource() {
          return {
            connect: () => {}
          };
        }
        createAnalyser() {
          return {
            fftSize: 256,
            frequencyBinCount: 128,
            getByteFrequencyData: (array: Uint8Array) => {
              // Simulate some audio activity
              for (let i = 0; i < array.length; i++) {
                array[i] = Math.random() * 128;
              }
            }
          };
        }
        close() { return Promise.resolve(); }
      };

      // Mock LiveKit room and participants
      (window as any).mockLiveKitRoom = {
        localParticipant: {
          identity: 'test-user',
          name: 'Test User',
          isMicrophoneEnabled: true,
          isCameraEnabled: false,
          isScreenShareEnabled: false,
          setMicrophoneEnabled: async (enabled: boolean) => {
            console.log('Mock setMicrophoneEnabled:', enabled);
            (window as any).mockLiveKitRoom.localParticipant.isMicrophoneEnabled = enabled;
            return enabled;
          },
          setCameraEnabled: async (enabled: boolean) => {
            console.log('Mock setCameraEnabled:', enabled);
            (window as any).mockLiveKitRoom.localParticipant.isCameraEnabled = enabled;
            return enabled;
          },
          setScreenShareEnabled: async (enabled: boolean) => {
            console.log('Mock setScreenShareEnabled:', enabled);
            (window as any).mockLiveKitRoom.localParticipant.isScreenShareEnabled = enabled;
            return enabled;
          }
        },
        remoteParticipants: new Map([
          ['remote-1', {
            identity: 'remote-1',
            name: 'Remote User 1',
            isMicrophoneEnabled: true,
            isCameraEnabled: true,
            isScreenShareEnabled: false,
            isSpeaking: false
          }],
          ['remote-2', {
            identity: 'remote-2',
            name: 'Remote User 2',
            isMicrophoneEnabled: false,
            isCameraEnabled: false,
            isScreenShareEnabled: false,
            isSpeaking: true
          }]
        ]),
        state: 'connected'
      };

      // Mock voice store state
      (window as any).mockVoiceState = {
        isAudioEnabled: true,
        isVideoEnabled: false,
        isScreenSharing: false,
        connectionState: 'connected',
        participants: [
          {
            identity: 'test-user',
            name: 'Test User',
            isLocal: true,
            isSpeaking: false,
            isAudioEnabled: true,
            isVideoEnabled: false,
            connectionQuality: 'excellent'
          },
          {
            identity: 'remote-1',
            name: 'Remote User 1',
            isLocal: false,
            isSpeaking: false,
            isAudioEnabled: true,
            isVideoEnabled: true,
            connectionQuality: 'good'
          },
          {
            identity: 'remote-2',
            name: 'Remote User 2',
            isLocal: false,
            isSpeaking: true,
            isAudioEnabled: false,
            isVideoEnabled: false,
            connectionQuality: 'poor'
          }
        ]
      };
    });

    // Navigate to voice/video call UI test page
    await page.goto('/test-call-ui');
  });

  test('should render voice controls correctly', async ({ page }) => {
    // Check for main voice control elements
    await expect(page.locator('[data-testid="voice-controls"]')).toBeVisible();
    
    // Microphone toggle
    const micButton = page.locator('[data-testid="mic-toggle"]');
    await expect(micButton).toBeVisible();
    await expect(micButton).toHaveAttribute('aria-pressed', 'true'); // Initially enabled
    
    // Video toggle
    const videoButton = page.locator('[data-testid="video-toggle"]');
    await expect(videoButton).toBeVisible();
    await expect(videoButton).toHaveAttribute('aria-pressed', 'false'); // Initially disabled
    
    // Screen share toggle
    const screenShareButton = page.locator('[data-testid="screen-share-toggle"]');
    await expect(screenShareButton).toBeVisible();
    await expect(screenShareButton).toHaveAttribute('aria-pressed', 'false'); // Initially disabled
    
    // End call button
    const endCallButton = page.locator('[data-testid="end-call-button"]');
    await expect(endCallButton).toBeVisible();
    await expect(endCallButton).toHaveClass(/danger|error/); // Should have danger styling
  });

  test('should toggle microphone on and off', async ({ page }) => {
    const micButton = page.locator('[data-testid="mic-toggle"]');
    
    // Initially enabled (pressed)
    await expect(micButton).toHaveAttribute('aria-pressed', 'true');
    await expect(micButton).not.toHaveClass(/muted/);
    
    // Click to mute
    await micButton.click();
    await expect(micButton).toHaveAttribute('aria-pressed', 'false');
    await expect(micButton).toHaveClass(/muted/);
    
    // Verify microphone icon shows muted state
    await expect(page.locator('[data-testid="mic-icon-muted"]')).toBeVisible();
    
    // Click to unmute
    await micButton.click();
    await expect(micButton).toHaveAttribute('aria-pressed', 'true');
    await expect(micButton).not.toHaveClass(/muted/);
    
    // Verify microphone icon shows unmuted state
    await expect(page.locator('[data-testid="mic-icon-active"]')).toBeVisible();
  });

  test('should toggle video on and off', async ({ page }) => {
    const videoButton = page.locator('[data-testid="video-toggle"]');
    
    // Initially disabled
    await expect(videoButton).toHaveAttribute('aria-pressed', 'false');
    
    // Click to enable video
    await videoButton.click();
    await expect(videoButton).toHaveAttribute('aria-pressed', 'true');
    
    // Should show local video preview
    await expect(page.locator('[data-testid="local-video"]')).toBeVisible();
    
    // Video icon should show enabled state
    await expect(page.locator('[data-testid="video-icon-active"]')).toBeVisible();
    
    // Click to disable video
    await videoButton.click();
    await expect(videoButton).toHaveAttribute('aria-pressed', 'false');
    
    // Local video should be hidden or show placeholder
    const localVideo = page.locator('[data-testid="local-video"]');
    await expect(localVideo).not.toBeVisible().or(expect(localVideo).toHaveClass(/disabled/));
    
    // Video icon should show disabled state
    await expect(page.locator('[data-testid="video-icon-disabled"]')).toBeVisible();
  });

  test('should handle screen sharing toggle', async ({ page }) => {
    const screenShareButton = page.locator('[data-testid="screen-share-toggle"]');
    
    // Initially not sharing
    await expect(screenShareButton).toHaveAttribute('aria-pressed', 'false');
    
    // Mock screen sharing API
    await page.evaluate(() => {
      (navigator.mediaDevices as any).getDisplayMedia = async () => {
        console.log('Mock getDisplayMedia called');
        return new MediaStream();
      };
    });
    
    // Click to start screen sharing
    await screenShareButton.click();
    
    // Should show active state
    await expect(screenShareButton).toHaveAttribute('aria-pressed', 'true');
    await expect(screenShareButton).toHaveClass(/active|sharing/);
    
    // Should show screen share indicator
    await expect(page.locator('[data-testid="screen-share-indicator"]')).toBeVisible();
    
    // Click to stop screen sharing
    await screenShareButton.click();
    await expect(screenShareButton).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[data-testid="screen-share-indicator"]')).not.toBeVisible();
  });

  test('should display participant tiles correctly', async ({ page }) => {
    // Should show all participants
    const participantTiles = page.locator('[data-testid="participant-tile"]');
    await expect(participantTiles).toHaveCount(3); // Local + 2 remote
    
    // Check local participant tile
    const localTile = page.locator('[data-testid="participant-tile"]:has([data-testid="local-participant"])');
    await expect(localTile).toBeVisible();
    await expect(localTile).toContainText('Test User');
    await expect(localTile).toContainText('You');
    
    // Check remote participant tiles
    const remoteTile1 = page.locator('[data-testid="participant-tile"]').filter({ hasText: 'Remote User 1' });
    await expect(remoteTile1).toBeVisible();
    
    const remoteTile2 = page.locator('[data-testid="participant-tile"]').filter({ hasText: 'Remote User 2' });
    await expect(remoteTile2).toBeVisible();
  });

  test('should show speaking indicators correctly', async ({ page }) => {
    // Remote User 2 is speaking in mock data
    const speakingTile = page.locator('[data-testid="participant-tile"]').filter({ hasText: 'Remote User 2' });
    await expect(speakingTile.locator('[data-testid="speaking-indicator"]')).toBeVisible();
    await expect(speakingTile.locator('[data-testid="speaking-indicator"]')).toHaveClass(/speaking|active/);
    
    // Other participants should not show speaking indicator
    const localTile = page.locator('[data-testid="participant-tile"]:has([data-testid="local-participant"])');
    await expect(localTile.locator('[data-testid="speaking-indicator"]')).not.toBeVisible().or(expect(localTile.locator('[data-testid="speaking-indicator"]')).not.toHaveClass(/speaking|active/));
    
    // Simulate speaking state change
    await page.evaluate(() => {
      (window as any).mockVoiceState.participants[0].isSpeaking = true; // Local user starts speaking
      (window as any).mockVoiceState.participants[2].isSpeaking = false; // Remote user 2 stops speaking
      // Trigger state update if there's a method for it
      if ((window as any).updateVoiceState) {
        (window as any).updateVoiceState((window as any).mockVoiceState);
      }
    });
    
    // Wait for UI update
    await page.waitForTimeout(500);
    
    // Local user should now show speaking indicator
    await expect(localTile.locator('[data-testid="speaking-indicator"]')).toBeVisible();
  });

  test('should show muted indicators for participants', async ({ page }) => {
    // Remote User 2 is muted in mock data
    const mutedTile = page.locator('[data-testid="participant-tile"]').filter({ hasText: 'Remote User 2' });
    await expect(mutedTile.locator('[data-testid="muted-indicator"]')).toBeVisible();
    
    // Non-muted participants should not show muted indicator
    const unmutedTile = page.locator('[data-testid="participant-tile"]').filter({ hasText: 'Remote User 1' });
    await expect(unmutedTile.locator('[data-testid="muted-indicator"]')).not.toBeVisible();
  });

  test('should show connection quality indicators', async ({ page }) => {
    // Check excellent connection (local user)
    const excellentTile = page.locator('[data-testid="participant-tile"]:has([data-testid="local-participant"])');
    const excellentIndicator = excellentTile.locator('[data-testid="connection-quality"]');
    await expect(excellentIndicator).toBeVisible();
    await expect(excellentIndicator).toHaveClass(/excellent|good/);
    
    // Check poor connection (Remote User 2)
    const poorTile = page.locator('[data-testid="participant-tile"]').filter({ hasText: 'Remote User 2' });
    const poorIndicator = poorTile.locator('[data-testid="connection-quality"]');
    await expect(poorIndicator).toBeVisible();
    await expect(poorIndicator).toHaveClass(/poor|weak/);
  });

  test('should handle video tile interactions', async ({ page }) => {
    // Enable video first to see video tiles
    await page.locator('[data-testid="video-toggle"]').click();
    
    // Should show video grid
    await expect(page.locator('[data-testid="video-grid"]')).toBeVisible();
    
    // Should show local video tile
    const localVideoTile = page.locator('[data-testid="video-tile"][data-participant="test-user"]');
    await expect(localVideoTile).toBeVisible();
    
    // Should show remote video tile (Remote User 1 has video enabled)
    const remoteVideoTile = page.locator('[data-testid="video-tile"][data-participant="remote-1"]');
    await expect(remoteVideoTile).toBeVisible();
    
    // Should show placeholder for participant without video (Remote User 2)
    const placeholderTile = page.locator('[data-testid="video-tile"][data-participant="remote-2"]');
    await expect(placeholderTile).toBeVisible();
    await expect(placeholderTile.locator('[data-testid="video-placeholder"]')).toBeVisible();
    
    // Test tile click for focus/pin functionality
    await remoteVideoTile.click();
    await expect(remoteVideoTile).toHaveClass(/focused|pinned/);
  });

  test('should display call duration', async ({ page }) => {
    const callDuration = page.locator('[data-testid="call-duration"]');
    await expect(callDuration).toBeVisible();
    
    // Should start with 00:00 or similar
    await expect(callDuration).toContainText('00:');
    
    // Mock time progression
    await page.evaluate(() => {
      if ((window as any).setCallDuration) {
        (window as any).setCallDuration(65000); // 1 minute 5 seconds
      }
    });
    
    // Should show updated duration
    await expect(callDuration).toContainText('01:05');
  });

  test('should show device selection dropdown', async ({ page }) => {
    // Open device settings
    const settingsButton = page.locator('[data-testid="call-settings-button"]');
    await settingsButton.click();
    
    // Should show device selection modal/dropdown
    await expect(page.locator('[data-testid="device-settings"]')).toBeVisible();
    
    // Check microphone selection
    const micSelect = page.locator('[data-testid="microphone-select"]');
    await expect(micSelect).toBeVisible();
    await micSelect.click();
    
    // Should show microphone options
    await expect(page.locator('[data-testid="device-option"]').filter({ hasText: 'Default Microphone' })).toBeVisible();
    await expect(page.locator('[data-testid="device-option"]').filter({ hasText: 'USB Microphone' })).toBeVisible();
    
    // Select a different microphone
    await page.locator('[data-testid="device-option"]').filter({ hasText: 'USB Microphone' }).click();
    
    // Check camera selection
    const cameraSelect = page.locator('[data-testid="camera-select"]');
    await expect(cameraSelect).toBeVisible();
    await cameraSelect.click();
    
    // Should show camera options
    await expect(page.locator('[data-testid="device-option"]').filter({ hasText: 'Webcam HD' })).toBeVisible();
    await expect(page.locator('[data-testid="device-option"]').filter({ hasText: 'External Camera' })).toBeVisible();
    
    // Check speaker selection
    const speakerSelect = page.locator('[data-testid="speaker-select"]');
    await expect(speakerSelect).toBeVisible();
    await speakerSelect.click();
    
    // Should show speaker options
    await expect(page.locator('[data-testid="device-option"]').filter({ hasText: 'Speakers' })).toBeVisible();
    await expect(page.locator('[data-testid="device-option"]').filter({ hasText: 'Headphones' })).toBeVisible();
  });

  test('should handle picture-in-picture mode', async ({ page }) => {
    // Enable video first
    await page.locator('[data-testid="video-toggle"]').click();
    
    // Mock Picture-in-Picture API
    await page.evaluate(() => {
      (document as any).pictureInPictureEnabled = true;
      HTMLVideoElement.prototype.requestPictureInPicture = async function() {
        console.log('Mock requestPictureInPicture called');
        return {};
      };
    });
    
    // Look for PiP button
    const pipButton = page.locator('[data-testid="picture-in-picture-button"]');
    if (await pipButton.isVisible()) {
      await pipButton.click();
      
      // Should trigger PiP mode
      const pipIndicator = page.locator('[data-testid="pip-indicator"]');
      await expect(pipIndicator).toBeVisible();
    }
  });

  test('should show proper accessibility attributes', async ({ page }) => {
    // Check ARIA labels and roles
    const micButton = page.locator('[data-testid="mic-toggle"]');
    await expect(micButton).toHaveAttribute('role', 'button');
    await expect(micButton).toHaveAttribute('aria-label', /microphone|mic/i);
    
    const videoButton = page.locator('[data-testid="video-toggle"]');
    await expect(videoButton).toHaveAttribute('aria-label', /video|camera/i);
    
    const endCallButton = page.locator('[data-testid="end-call-button"]');
    await expect(endCallButton).toHaveAttribute('aria-label', /end call|hang up/i);
    
    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await expect(micButton).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(videoButton).toBeFocused();
    
    // Check keyboard activation
    await page.keyboard.press('Enter');
    await expect(videoButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Simulate media device error
    await page.evaluate(() => {
      (window as any).mockError = 'Camera access denied';
    });
    
    // Try to enable video
    await page.locator('[data-testid="video-toggle"]').click();
    
    // Should show error message
    await expect(page.locator('[data-testid="media-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="media-error"]')).toContainText('Camera access denied');
    
    // Video button should remain in disabled state
    await expect(page.locator('[data-testid="video-toggle"]')).toHaveAttribute('aria-pressed', 'false');
  });
});
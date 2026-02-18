import { test, expect } from '@playwright/test';

test.describe('Voice/Video Call Initiation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the Matrix client and LiveKit services
    await page.addInitScript(() => {
      // Mock Matrix client
      (window as any).mockMatrixClient = {
        getUserId: () => 'test-user-id',
        getRoom: (roomId: string) => ({
          name: `Test Room ${roomId}`,
          roomId,
          currentState: {
            getStateEvents: () => null
          }
        }),
        sendEvent: async (roomId: string, eventType: string, content: any) => {
          console.log('Mock Matrix sendEvent:', { roomId, eventType, content });
          (window as any).matrixEvents = (window as any).matrixEvents || [];
          (window as any).matrixEvents.push({ roomId, eventType, content, timestamp: Date.now() });
          return { event_id: `event_${Date.now()}` };
        },
        on: () => {},
        off: () => {},
      };

      // Mock LiveKit service
      (window as any).mockLiveKitService = {
        requestToken: async (roomName: string, identity: string) => {
          console.log('Mock LiveKit requestToken:', { roomName, identity });
          return 'mock-jwt-token';
        },
        connectToRoom: async (roomName: string, token: string) => {
          console.log('Mock LiveKit connectToRoom:', { roomName, token });
          (window as any).liveKitConnections = (window as any).liveKitConnections || [];
          (window as any).liveKitConnections.push({ roomName, token, timestamp: Date.now() });
          return {
            localParticipant: {
              identity: 'test-user-id',
              setMicrophoneEnabled: async (enabled: boolean) => {
                console.log('Mock setMicrophoneEnabled:', enabled);
                return enabled;
              },
              setCameraEnabled: async (enabled: boolean) => {
                console.log('Mock setCameraEnabled:', enabled);
                return enabled;
              },
            },
            state: 'connected'
          };
        },
        disconnect: async () => {
          console.log('Mock LiveKit disconnect');
          return true;
        },
        isConnected: () => true,
        setAudioEnabled: async (enabled: boolean) => {
          console.log('Mock setAudioEnabled:', enabled);
          return true;
        },
        setVideoEnabled: async (enabled: boolean) => {
          console.log('Mock setVideoEnabled:', enabled);
          return true;
        }
      };

      // Mock media devices
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: async (constraints: MediaStreamConstraints) => {
            console.log('Mock getUserMedia:', constraints);
            // Return a mock MediaStream
            return new MediaStream();
          },
          enumerateDevices: async () => {
            return [
              { deviceId: 'audio-1', kind: 'audioinput', label: 'Mock Microphone 1', groupId: 'group-1' },
              { deviceId: 'audio-2', kind: 'audioinput', label: 'Mock Microphone 2', groupId: 'group-1' },
              { deviceId: 'video-1', kind: 'videoinput', label: 'Mock Camera 1', groupId: 'group-2' },
              { deviceId: 'audio-out-1', kind: 'audiooutput', label: 'Mock Speaker 1', groupId: 'group-3' }
            ];
          }
        },
        writable: true
      });

      // Mock WebRTC APIs
      (window as any).RTCPeerConnection = class MockRTCPeerConnection {
        constructor(config: any) {
          console.log('Mock RTCPeerConnection created:', config);
        }
        addTrack() { return {}; }
        createOffer() { return Promise.resolve({ type: 'offer', sdp: 'mock-sdp' }); }
        setLocalDescription() { return Promise.resolve(); }
        setRemoteDescription() { return Promise.resolve(); }
        addIceCandidate() { return Promise.resolve(); }
        close() {}
      };

      // Clear any previous test state
      (window as any).matrixEvents = [];
      (window as any).liveKitConnections = [];
    });

    // Navigate to a test page (you'll need to create this)
    await page.goto('/test-voice-video');
  });

  test('should display voice call initiation UI', async ({ page }) => {
    // Check for voice call button
    const voiceCallButton = page.locator('[data-testid="voice-call-button"]');
    await expect(voiceCallButton).toBeVisible();
    await expect(voiceCallButton).toContainText('Voice Call');

    // Check for video call button
    const videoCallButton = page.locator('[data-testid="video-call-button"]');
    await expect(videoCallButton).toBeVisible();
    await expect(videoCallButton).toContainText('Video Call');

    // Check initial state
    await expect(page.locator('[data-testid="call-status"]')).toContainText('Not connected');
  });

  test('should initiate voice call successfully', async ({ page }) => {
    // Click voice call button
    await page.locator('[data-testid="voice-call-button"]').click();

    // Should show connecting state
    await expect(page.locator('[data-testid="call-status"]')).toContainText('Connecting');

    // Wait for connection to establish
    await page.waitForTimeout(1000);

    // Verify Matrix event was sent
    const matrixEvents = await page.evaluate(() => (window as any).matrixEvents || []);
    expect(matrixEvents).toHaveLength(1);
    expect(matrixEvents[0].eventType).toBe('m.call.invite');
    expect(matrixEvents[0].content).toMatchObject({
      call_id: expect.any(String),
      lifetime: expect.any(Number),
      offer: expect.objectContaining({
        type: 'offer',
        sdp: expect.any(String)
      }),
      type: 'voice'
    });

    // Verify LiveKit connection was attempted
    const liveKitConnections = await page.evaluate(() => (window as any).liveKitConnections || []);
    expect(liveKitConnections).toHaveLength(1);
    expect(liveKitConnections[0]).toMatchObject({
      roomName: expect.any(String),
      token: 'mock-jwt-token'
    });

    // Should show connected state
    await expect(page.locator('[data-testid="call-status"]')).toContainText('Connected');
  });

  test('should initiate video call successfully', async ({ page }) => {
    // Click video call button
    await page.locator('[data-testid="video-call-button"]').click();

    // Should show connecting state
    await expect(page.locator('[data-testid="call-status"]')).toContainText('Connecting');

    // Wait for connection to establish
    await page.waitForTimeout(1000);

    // Verify Matrix event was sent
    const matrixEvents = await page.evaluate(() => (window as any).matrixEvents || []);
    expect(matrixEvents).toHaveLength(1);
    expect(matrixEvents[0].eventType).toBe('m.call.invite');
    expect(matrixEvents[0].content).toMatchObject({
      call_id: expect.any(String),
      lifetime: expect.any(Number),
      offer: expect.objectContaining({
        type: 'offer',
        sdp: expect.any(String)
      }),
      type: 'video'
    });

    // Should show connected state
    await expect(page.locator('[data-testid="call-status"]')).toContainText('Connected');

    // Should show video elements
    await expect(page.locator('[data-testid="local-video"]')).toBeVisible();
    await expect(page.locator('[data-testid="video-controls"]')).toBeVisible();
  });

  test('should handle call rejection', async ({ page }) => {
    // Simulate incoming call by triggering Matrix event
    await page.evaluate(() => {
      const mockEvent = {
        getType: () => 'm.call.invite',
        getRoomId: () => 'test-room-id',
        getSender: () => 'remote-user',
        getContent: () => ({
          call_id: 'test-call-id',
          offer: { type: 'offer', sdp: 'mock-sdp' },
          lifetime: 30000,
          version: 1
        })
      };

      // Simulate event handler
      if ((window as any).mockMatrixClient && typeof (window as any).handleIncomingCall === 'function') {
        (window as any).handleIncomingCall(mockEvent);
      }
    });

    // Should show incoming call modal
    await expect(page.locator('[data-testid="incoming-call-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="caller-name"]')).toContainText('remote-user');

    // Click reject button
    await page.locator('[data-testid="reject-call-button"]').click();

    // Should hide modal
    await expect(page.locator('[data-testid="incoming-call-modal"]')).not.toBeVisible();

    // Verify hangup event was sent
    const matrixEvents = await page.evaluate(() => (window as any).matrixEvents || []);
    const hangupEvent = matrixEvents.find(e => e.eventType === 'm.call.hangup');
    expect(hangupEvent).toBeTruthy();
    expect(hangupEvent.content).toMatchObject({
      call_id: 'test-call-id',
      reason: 'user_hangup'
    });
  });

  test('should handle media permissions error', async ({ page }) => {
    // Mock getUserMedia to throw error
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: async () => {
            throw new Error('Permission denied');
          },
          enumerateDevices: async () => []
        },
        writable: true
      });
    });

    // Try to start voice call
    await page.locator('[data-testid="voice-call-button"]').click();

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Permission denied');

    // Status should remain not connected
    await expect(page.locator('[data-testid="call-status"]')).toContainText('Not connected');
  });

  test('should handle network connectivity issues', async ({ page }) => {
    // Mock LiveKit service to fail
    await page.evaluate(() => {
      (window as any).mockLiveKitService.connectToRoom = async () => {
        throw new Error('Network connection failed');
      };
    });

    // Try to start voice call
    await page.locator('[data-testid="voice-call-button"]').click();

    // Should show connecting then error
    await expect(page.locator('[data-testid="call-status"]')).toContainText('Connecting');
    
    // Wait for error
    await page.waitForTimeout(2000);
    
    // Should show error state
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Network connection failed');
    
    // Status should show disconnected
    await expect(page.locator('[data-testid="call-status"]')).toContainText('Disconnected');
  });

  test('should end call successfully', async ({ page }) => {
    // Start a voice call first
    await page.locator('[data-testid="voice-call-button"]').click();
    await page.waitForTimeout(1000);
    
    // Verify connected
    await expect(page.locator('[data-testid="call-status"]')).toContainText('Connected');

    // Click end call button
    await page.locator('[data-testid="end-call-button"]').click();

    // Should show disconnecting/disconnected
    await expect(page.locator('[data-testid="call-status"]')).toContainText('Not connected');

    // Verify hangup event was sent
    const matrixEvents = await page.evaluate(() => (window as any).matrixEvents || []);
    const hangupEvent = matrixEvents.find(e => e.eventType === 'm.call.hangup');
    expect(hangupEvent).toBeTruthy();
    expect(hangupEvent.content).toMatchObject({
      reason: 'user_hangup'
    });
  });

  test('should handle call timeout', async ({ page }) => {
    // Mock short timeout for testing
    await page.evaluate(() => {
      (window as any).CALL_TIMEOUT = 2000; // 2 seconds
    });

    // Simulate incoming call
    await page.evaluate(() => {
      const mockEvent = {
        getType: () => 'm.call.invite',
        getRoomId: () => 'test-room-id',
        getSender: () => 'remote-user',
        getContent: () => ({
          call_id: 'test-call-timeout',
          offer: { type: 'offer', sdp: 'mock-sdp' },
          lifetime: 2000, // 2 seconds
          version: 1
        })
      };

      if ((window as any).handleIncomingCall) {
        (window as any).handleIncomingCall(mockEvent);
      }
    });

    // Should show incoming call modal
    await expect(page.locator('[data-testid="incoming-call-modal"]')).toBeVisible();

    // Wait for timeout
    await page.waitForTimeout(3000);

    // Should hide modal after timeout
    await expect(page.locator('[data-testid="incoming-call-modal"]')).not.toBeVisible();

    // Should show timeout message
    await expect(page.locator('[data-testid="notification"]')).toContainText('Call timed out');
  });
});
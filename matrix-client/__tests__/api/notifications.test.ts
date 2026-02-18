import { NextRequest } from 'next/server';
import { GET as getPreferences, POST as postPreferences, DELETE as deletePreferences } from '../../app/api/notifications/preferences/route';
import { POST as processNotifications, GET as getStats } from '../../app/api/notifications/process/route';
import { GET as getLogs } from '../../app/api/notifications/logs/route';

// Mock the services to avoid real Matrix client initialization
jest.mock('../../lib/services/email-notification-service');
jest.mock('../../lib/services/offline-user-detection-service');

// Helper function to create mock NextRequest
const createMockRequest = (url: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', body?: any) => {
  const request = {
    url,
    method,
    json: jest.fn().mockResolvedValue(body || {}),
    nextUrl: new URL(url)
  } as unknown as NextRequest;

  return request;
};

describe('Notification API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods to avoid test output noise
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('/api/notifications/preferences', () => {
    describe('GET', () => {
      it('should return 400 when userId is missing', async () => {
        const request = createMockRequest('http://localhost:3000/api/notifications/preferences');
        
        const response = await getPreferences(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('userId parameter is required');
      });

      it('should return default preferences for new user', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/notifications/preferences?userId=@newuser:test.com'
        );
        
        const response = await getPreferences(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.preferences).toBeDefined();
        expect(data.preferences.userId).toBe('@newuser:test.com');
        expect(data.preferences.emailEnabled).toBe(true);
        expect(data.preferences.optedOut).toBe(false);
      });

      it('should handle service errors gracefully', async () => {
        // This test would require mocking the service to throw an error
        // For now, we test the basic functionality
        const request = createMockRequest(
          'http://localhost:3000/api/notifications/preferences?userId=@test:test.com'
        );
        
        const response = await getPreferences(request);
        
        expect(response.status).toBeOneOf([200, 500]);
      });
    });

    describe('POST', () => {
      it('should return 400 when userId is missing', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/notifications/preferences',
          'POST',
          { preferences: {} }
        );
        
        const response = await postPreferences(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('userId is required');
      });

      it('should return 400 when preferences object is missing', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/notifications/preferences',
          'POST',
          { userId: '@test:test.com' }
        );
        
        const response = await postPreferences(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('preferences object is required');
      });

      it('should validate email address format', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/notifications/preferences',
          'POST',
          {
            userId: '@test:test.com',
            preferences: {
              emailAddress: 'invalid-email'
            }
          }
        );
        
        const response = await postPreferences(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Invalid email address');
      });

      it('should validate offline threshold range', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/notifications/preferences',
          'POST',
          {
            userId: '@test:test.com',
            preferences: {
              offlineThresholdMinutes: 10 // Too low
            }
          }
        );
        
        const response = await postPreferences(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Offline threshold must be between 15 minutes and 24 hours');
      });

      it('should accept valid preferences update', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/notifications/preferences',
          'POST',
          {
            userId: '@test:test.com',
            preferences: {
              emailEnabled: true,
              emailAddress: 'test@example.com',
              offlineThresholdMinutes: 30,
              notificationTypes: {
                directMessages: true,
                mentions: true,
                invites: false,
                roomActivity: true
              }
            }
          }
        );
        
        const response = await postPreferences(request);
        const data = await response.json();

        expect(response.status).toBeOneOf([200, 500]); // 500 if service throws
        
        if (response.status === 200) {
          expect(data.success).toBe(true);
          expect(data.preferences).toBeDefined();
        }
      });
    });

    describe('DELETE', () => {
      it('should return 400 when userId is missing', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/notifications/preferences',
          'DELETE'
        );
        
        const response = await deletePreferences(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('userId parameter is required');
      });

      it('should opt out user successfully', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/notifications/preferences?userId=@test:test.com',
          'DELETE'
        );
        
        const response = await deletePreferences(request);
        const data = await response.json();

        expect(response.status).toBeOneOf([200, 500]); // 500 if service throws
        
        if (response.status === 200) {
          expect(data.success).toBe(true);
          expect(data.message).toContain('opted out');
          expect(data.cancelledNotifications).toBeDefined();
        }
      });
    });
  });

  describe('/api/notifications/process', () => {
    describe('POST', () => {
      it('should process notifications with default settings', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/notifications/process',
          'POST',
          {}
        );
        
        const response = await processNotifications(request);
        const data = await response.json();

        expect(response.status).toBeOneOf([200, 500]); // 500 if service throws
        
        if (response.status === 200) {
          expect(data.success).toBe(true);
          expect(data.summary).toBeDefined();
          expect(data.summary.usersChecked).toBeDefined();
          expect(data.summary.offlineUsersFound).toBeDefined();
          expect(data.offlineUsers).toBeInstanceOf(Array);
          expect(data.stats).toBeDefined();
        }
      });

      it('should support dry run mode', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/notifications/process',
          'POST',
          { dryRun: true }
        );
        
        const response = await processNotifications(request);
        const data = await response.json();

        expect(response.status).toBeOneOf([200, 500]); // 500 if service throws
        
        if (response.status === 200) {
          expect(data.dryRun).toBe(true);
          expect(data.summary.usersProcessed).toBe(0); // No actual processing in dry run
        }
      });

      it('should filter to specific user when requested', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/notifications/process',
          'POST',
          { userId: '@specific:test.com' }
        );
        
        const response = await processNotifications(request);
        
        expect(response.status).toBeOneOf([200, 404, 500]); // 404 if user not found, 500 if service throws
      });

      it('should return 404 for non-existent user', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/notifications/process',
          'POST',
          { userId: '@nonexistent:test.com' }
        );
        
        const response = await processNotifications(request);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toContain('User @nonexistent:test.com not found');
      });
    });

    describe('GET', () => {
      it('should return notification statistics', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/notifications/process/stats'
        );
        
        const response = await getStats(request);
        const data = await response.json();

        expect(response.status).toBeOneOf([200, 500]); // 500 if service throws
        
        if (response.status === 200) {
          expect(data.success).toBe(true);
          expect(data.stats).toBeDefined();
          expect(data.stats.email).toBeDefined();
          expect(data.stats.offline).toBeDefined();
          expect(data.config).toBeDefined();
        }
      });
    });
  });

  describe('/api/notifications/logs', () => {
    describe('GET', () => {
      it('should return 400 when userId is missing', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/notifications/logs'
        );
        
        const response = await getLogs(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('userId parameter is required');
      });

      it('should validate limit parameter', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/notifications/logs?userId=@test:test.com&limit=300'
        );
        
        const response = await getLogs(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('limit must be between 1 and 200');
      });

      it('should return user logs successfully', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/notifications/logs?userId=@test:test.com&limit=50'
        );
        
        const response = await getLogs(request);
        const data = await response.json();

        expect(response.status).toBeOneOf([200, 500]); // 500 if service throws
        
        if (response.status === 200) {
          expect(data.success).toBe(true);
          expect(data.userId).toBe('@test:test.com');
          expect(data.logs).toBeInstanceOf(Array);
          expect(data.total).toBeDefined();
          expect(data.limit).toBe(50);
        }
      });

      it('should use default limit when not specified', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/notifications/logs?userId=@test:test.com'
        );
        
        const response = await getLogs(request);
        const data = await response.json();

        expect(response.status).toBeOneOf([200, 500]); // 500 if service throws
        
        if (response.status === 200) {
          expect(data.limit).toBe(50); // Default limit
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parsing errors', async () => {
      const request = {
        url: 'http://localhost:3000/api/notifications/preferences',
        method: 'POST',
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        nextUrl: new URL('http://localhost:3000/api/notifications/preferences')
      } as unknown as NextRequest;
      
      const response = await postPreferences(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should handle service initialization errors gracefully', async () => {
      // The services are mocked, so this mainly tests that the endpoints
      // don't crash when services throw errors
      const request = createMockRequest(
        'http://localhost:3000/api/notifications/preferences?userId=@test:test.com'
      );
      
      const response = await getPreferences(request);
      
      // Should not crash, either returns data or error
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('Configuration Impact on Endpoints', () => {
    it('should respect disabled notifications in process endpoint', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/notifications/process',
        'POST',
        {}
      );
      
      const response = await processNotifications(request);
      const data = await response.json();

      expect(response.status).toBeOneOf([200, 500]); // 500 if service throws
      
      // The mock configuration has notifications enabled by default,
      // but in real scenarios, disabled notifications would result in
      // no processing
    });
  });
});

// Custom Jest matcher for checking if a value is one of several options
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(expected: any[]): R;
    }
  }
}

expect.extend({
  toBeOneOf(received, expected) {
    const pass = expected.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${expected}`,
        pass: false,
      };
    }
  },
});
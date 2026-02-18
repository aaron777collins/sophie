import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MatrixAuthProvider, useMatrixAuth } from '@/components/providers/matrix-auth-provider';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock getClientConfig
jest.mock('@/lib/matrix/client-config', () => ({
  getClientConfig: jest.fn()
}));

import { getClientConfig } from '@/lib/matrix/client-config';
const mockGetClientConfig = getClientConfig as jest.MockedFunction<typeof getClientConfig>;

// Test component that uses the auth context
const TestComponent: React.FC = () => {
  const { isLoginAllowedWithInvite } = useMatrixAuth();
  
  const handleTestLogin = async () => {
    const result = await isLoginAllowedWithInvite('@user:example.com', '1708203600_abc123def4567890');
    return result;
  };

  return (
    <div>
      <button onClick={handleTestLogin} data-testid="test-login">
        Test Login
      </button>
    </div>
  );
};

describe('MatrixAuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    mockFetch.mockClear();
  });

  it('provides auth context to child components', () => {
    const { getByTestId } = render(
      <MatrixAuthProvider>
        <TestComponent />
      </MatrixAuthProvider>
    );
    
    expect(getByTestId('test-login')).toBeInTheDocument();
  });

  it('throws error when useMatrixAuth is used outside provider', () => {
    // Mock console.error to avoid error output in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useMatrixAuth must be used within a MatrixAuthProvider');
    
    consoleSpy.mockRestore();
  });

  describe('isLoginAllowedWithInvite', () => {
    it('allows internal homeserver users without invite', async () => {
      mockGetClientConfig.mockResolvedValue({
        homeserver: 'https://matrix.example.com',
        privateMode: true,
        inviteRequired: true
      });

      const TestComponentAsync = () => {
        const { isLoginAllowedWithInvite } = useMatrixAuth();
        const [result, setResult] = React.useState<any>(null);

        React.useEffect(() => {
          const test = async () => {
            const res = await isLoginAllowedWithInvite('@user:matrix.example.com');
            setResult(res);
          };
          test();
        }, []);

        return <div data-testid="result">{result ? JSON.stringify(result) : 'loading'}</div>;
      };

      const { getByTestId } = render(
        <MatrixAuthProvider>
          <TestComponentAsync />
        </MatrixAuthProvider>
      );

      await waitFor(() => {
        const resultElement = getByTestId('result');
        const result = JSON.parse(resultElement.textContent || '{}');
        expect(result.allowed).toBe(true);
      });
    });

    it('allows external users when invites not required', async () => {
      mockGetClientConfig.mockResolvedValue({
        homeserver: 'https://matrix.example.com',
        privateMode: false,
        inviteRequired: false
      });

      const TestComponentAsync = () => {
        const { isLoginAllowedWithInvite } = useMatrixAuth();
        const [result, setResult] = React.useState<any>(null);

        React.useEffect(() => {
          const test = async () => {
            const res = await isLoginAllowedWithInvite('@user:external.com');
            setResult(res);
          };
          test();
        }, []);

        return <div data-testid="result">{result ? JSON.stringify(result) : 'loading'}</div>;
      };

      const { getByTestId } = render(
        <MatrixAuthProvider>
          <TestComponentAsync />
        </MatrixAuthProvider>
      );

      await waitFor(() => {
        const resultElement = getByTestId('result');
        const result = JSON.parse(resultElement.textContent || '{}');
        expect(result.allowed).toBe(true);
      });
    });

    it('requires invite code for external users in private mode', async () => {
      mockGetClientConfig.mockResolvedValue({
        homeserver: 'https://matrix.example.com',
        privateMode: true,
        inviteRequired: true
      });

      const TestComponentAsync = () => {
        const { isLoginAllowedWithInvite } = useMatrixAuth();
        const [result, setResult] = React.useState<any>(null);

        React.useEffect(() => {
          const test = async () => {
            const res = await isLoginAllowedWithInvite('@user:external.com');
            setResult(res);
          };
          test();
        }, []);

        return <div data-testid="result">{result ? JSON.stringify(result) : 'loading'}</div>;
      };

      const { getByTestId } = render(
        <MatrixAuthProvider>
          <TestComponentAsync />
        </MatrixAuthProvider>
      );

      await waitFor(() => {
        const resultElement = getByTestId('result');
        const result = JSON.parse(resultElement.textContent || '{}');
        expect(result.allowed).toBe(false);
        expect(result.error).toContain('requires an invite code');
        expect(result.requiresInvite).toBe(true);
      });
    });

    it('validates invite code format', async () => {
      mockGetClientConfig.mockResolvedValue({
        homeserver: 'https://matrix.example.com',
        privateMode: true,
        inviteRequired: true
      });

      const TestComponentAsync = () => {
        const { isLoginAllowedWithInvite } = useMatrixAuth();
        const [result, setResult] = React.useState<any>(null);

        React.useEffect(() => {
          const test = async () => {
            const res = await isLoginAllowedWithInvite('@user:external.com', 'invalid-format');
            setResult(res);
          };
          test();
        }, []);

        return <div data-testid="result">{result ? JSON.stringify(result) : 'loading'}</div>;
      };

      const { getByTestId } = render(
        <MatrixAuthProvider>
          <TestComponentAsync />
        </MatrixAuthProvider>
      );

      await waitFor(() => {
        const resultElement = getByTestId('result');
        const result = JSON.parse(resultElement.textContent || '{}');
        expect(result.allowed).toBe(false);
        expect(result.error).toContain('Invalid invite code format');
      });
    });

    it('accepts valid invite and marks as used', async () => {
      // Mock Date to ensure the test has a predictable current time
      const mockDate = new Date('2024-02-17T10:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation((() => mockDate) as any);
      (global.Date as any).now = jest.fn(() => mockDate.getTime());

      mockGetClientConfig.mockResolvedValue({
        homeserver: 'https://matrix.example.com',
        privateMode: true,
        inviteRequired: true
      });

      // Mock the API responses
      mockFetch.mockImplementation((url: string, options: any) => {
        if (url.includes('/api/admin/invites') && (!options || options.method !== 'PATCH')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              invites: [{
                id: '1',
                code: '1708203600_abc123def4567890',
                matrixId: '@user:external.com',
                status: 'active',
                expiresAt: '2030-12-31T23:59:59Z' // Very far future date
              }]
            })
          });
        } else if (options?.method === 'PATCH') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true })
          });
        }
        return Promise.reject(new Error(`Unknown URL: ${url}`));
      });

      const TestComponentAsync = () => {
        const { isLoginAllowedWithInvite } = useMatrixAuth();
        const [result, setResult] = React.useState<any>(null);

        React.useEffect(() => {
          const test = async () => {
            const res = await isLoginAllowedWithInvite('@user:external.com', '1708203600_abc123def4567890');
            setResult(res);
          };
          test();
        }, []);

        return <div data-testid="result">{result ? JSON.stringify(result) : 'loading'}</div>;
      };

      const { getByTestId } = render(
        <MatrixAuthProvider>
          <TestComponentAsync />
        </MatrixAuthProvider>
      );

      await waitFor(() => {
        const resultElement = getByTestId('result');
        const result = JSON.parse(resultElement.textContent || '{}');
        expect(result.allowed).toBe(true);
      });

      // Verify that the PATCH request was made to mark invite as used
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/invites', expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"status":"used"')
      }));
    });

    it('rejects expired invites', async () => {
      mockGetClientConfig.mockResolvedValue({
        homeserver: 'https://matrix.example.com',
        privateMode: true,
        inviteRequired: true
      });

      // Mock API to return expired invite
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          invites: [{
            id: '1',
            code: '1708203600_abc123def4567890',
            matrixId: '@user:external.com',
            status: 'active',
            expiresAt: '2023-01-01T00:00:00Z' // Expired date
          }]
        })
      });

      const TestComponentAsync = () => {
        const { isLoginAllowedWithInvite } = useMatrixAuth();
        const [result, setResult] = React.useState<any>(null);

        React.useEffect(() => {
          const test = async () => {
            const res = await isLoginAllowedWithInvite('@user:external.com', '1708203600_abc123def4567890');
            setResult(res);
          };
          test();
        }, []);

        return <div data-testid="result">{result ? JSON.stringify(result) : 'loading'}</div>;
      };

      const { getByTestId } = render(
        <MatrixAuthProvider>
          <TestComponentAsync />
        </MatrixAuthProvider>
      );

      await waitFor(() => {
        const resultElement = getByTestId('result');
        const result = JSON.parse(resultElement.textContent || '{}');
        expect(result.allowed).toBe(false);
        expect(result.error).toContain('expired');
      });
    });
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MatrixClient } from 'matrix-js-sdk';
import { DeviceVerificationPromptModal } from '../device-verification-prompt-modal';

// Mock the UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => 
    open ? <div data-testid="dialog" onClick={() => onOpenChange(false)}>{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h1 data-testid="dialog-title">{children}</h1>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, ...props }: any) => (
    <button 
      data-testid={`button-${variant || 'default'}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: any) => <div data-testid="alert">{children}</div>,
  AlertTitle: ({ children }: any) => <h3 data-testid="alert-title">{children}</h3>,
  AlertDescription: ({ children }: any) => <div data-testid="alert-description">{children}</div>
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Shield: () => <div data-testid="shield-icon" />,
  ShieldCheck: () => <div data-testid="shield-check-icon" />,
  ShieldAlert: () => <div data-testid="shield-alert-icon" />,
  Smartphone: () => <div data-testid="smartphone-icon" />,
  Key: () => <div data-testid="key-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  X: () => <div data-testid="x-icon" />,
  HelpCircle: () => <div data-testid="help-circle-icon" />,
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
  ArrowLeft: () => <div data-testid="arrow-left-icon" />
}));

describe('DeviceVerificationPromptModal', () => {
  const mockClient = {} as MatrixClient;
  
  const mockCurrentDevice = {
    deviceId: 'CURRENT_DEVICE_123',
    displayName: 'Current Device',
    lastSeenTs: Date.now() - 1000 * 60 * 5 // 5 minutes ago
  };

  const mockOtherDevices = [
    {
      deviceId: 'OTHER_DEVICE_456',
      displayName: 'Desktop PC',
      lastSeenTs: Date.now() - 1000 * 60 * 60 * 24 // 1 day ago
    },
    {
      deviceId: 'OTHER_DEVICE_789',
      displayName: 'Mobile Phone',
      lastSeenTs: Date.now() - 1000 * 60 * 60 // 1 hour ago
    }
  ];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onComplete: jest.fn(),
    onSkip: jest.fn(),
    client: mockClient,
    currentDevice: mockCurrentDevice,
    otherDevices: mockOtherDevices,
    isNewDevice: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render modal when open', () => {
      render(<DeviceVerificationPromptModal {...defaultProps} />);
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Device Verification');
    });

    it('should not render modal when closed', () => {
      render(<DeviceVerificationPromptModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('should show new device message for new devices', () => {
      render(<DeviceVerificationPromptModal {...defaultProps} isNewDevice={true} />);
      
      expect(screen.getByText('New Device Detected')).toBeInTheDocument();
      expect(screen.getByText(/We've detected you're logging in from a new device/)).toBeInTheDocument();
    });

    it('should show welcome message for first login', () => {
      render(<DeviceVerificationPromptModal {...defaultProps} isNewDevice={false} />);
      
      expect(screen.getByText('Welcome to HAOS')).toBeInTheDocument();
      expect(screen.getByText(/To keep your messages secure/)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should allow navigation through steps', () => {
      render(<DeviceVerificationPromptModal {...defaultProps} />);
      
      // Start at welcome step
      expect(screen.getByText('New Device Detected')).toBeInTheDocument();
      
      // Navigate to explanation
      fireEvent.click(screen.getByText('Get Started'));
      expect(screen.getByText('How Device Verification Works')).toBeInTheDocument();
      
      // Navigate to device list
      fireEvent.click(screen.getByText('Continue'));
      expect(screen.getByText('Your Devices')).toBeInTheDocument();
      
      // Navigate back
      fireEvent.click(screen.getByText('Back'));
      expect(screen.getByText('How Device Verification Works')).toBeInTheDocument();
    });

    it('should show device information correctly', () => {
      render(<DeviceVerificationPromptModal {...defaultProps} />);
      
      // Navigate to device list step
      fireEvent.click(screen.getByText('Get Started'));
      fireEvent.click(screen.getByText('Continue'));
      
      // Check current device
      expect(screen.getByText('Current Device')).toBeInTheDocument();
      expect(screen.getByText('This device')).toBeInTheDocument();
      expect(screen.getByText('CURRENT_DEVICE_123')).toBeInTheDocument();
      
      // Check other devices
      expect(screen.getByText('Desktop PC')).toBeInTheDocument();
      expect(screen.getByText('Mobile Phone')).toBeInTheDocument();
    });

    it('should show no other devices message when appropriate', () => {
      render(
        <DeviceVerificationPromptModal 
          {...defaultProps} 
          otherDevices={[]} 
        />
      );
      
      // Navigate to device list
      fireEvent.click(screen.getByText('Get Started'));
      fireEvent.click(screen.getByText('Continue'));
      
      expect(screen.getByText('No other devices found')).toBeInTheDocument();
      expect(screen.getByText('This appears to be your first device')).toBeInTheDocument();
    });
  });

  describe('verification methods', () => {
    it('should show cross-device verification when other devices exist', () => {
      render(<DeviceVerificationPromptModal {...defaultProps} />);
      
      // Navigate to verification methods
      fireEvent.click(screen.getByText('Get Started'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('Continue'));
      
      expect(screen.getByText('Verify with another device')).toBeInTheDocument();
      expect(screen.getByText(/Use one of your 2 other devices/)).toBeInTheDocument();
    });

    it('should not show cross-device verification when no other devices', () => {
      render(
        <DeviceVerificationPromptModal 
          {...defaultProps} 
          otherDevices={[]} 
        />
      );
      
      // Navigate to verification methods
      fireEvent.click(screen.getByText('Get Started'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('Continue'));
      
      expect(screen.queryByText('Verify with another device')).not.toBeInTheDocument();
    });

    it('should show tutorial option', () => {
      render(<DeviceVerificationPromptModal {...defaultProps} />);
      
      // Navigate to verification methods
      fireEvent.click(screen.getByText('Get Started'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('Continue'));
      
      expect(screen.getByText('Learn more about verification')).toBeInTheDocument();
      expect(screen.getByText('Security key setup')).toBeInTheDocument();
    });
  });

  describe('skip functionality', () => {
    it('should show skip warning before skipping', () => {
      render(<DeviceVerificationPromptModal {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Skip for now'));
      
      expect(screen.getByText('Are you sure you want to skip?')).toBeInTheDocument();
      expect(screen.getByText(/Without device verification/)).toBeInTheDocument();
    });

    it('should allow going back from skip warning', () => {
      render(<DeviceVerificationPromptModal {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Skip for now'));
      fireEvent.click(screen.getByText('Go back'));
      
      expect(screen.queryByText('Are you sure you want to skip?')).not.toBeInTheDocument();
      expect(screen.getByText('New Device Detected')).toBeInTheDocument();
    });

    it('should call onSkip when confirmed', () => {
      const mockOnSkip = jest.fn();
      render(<DeviceVerificationPromptModal {...defaultProps} onSkip={mockOnSkip} />);
      
      fireEvent.click(screen.getByText('Skip for now'));
      fireEvent.click(screen.getByText('Skip anyway'));
      
      expect(mockOnSkip).toHaveBeenCalled();
    });
  });

  describe('completion', () => {
    it('should call onComplete when verification is completed', async () => {
      const mockOnComplete = jest.fn();
      render(<DeviceVerificationPromptModal {...defaultProps} onComplete={mockOnComplete} />);
      
      // Navigate to verification methods
      fireEvent.click(screen.getByText('Get Started'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('Continue'));
      
      // Start verification
      fireEvent.click(screen.getByText('Verify with another device'));
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    it('should call onComplete from tutorial step', () => {
      const mockOnComplete = jest.fn();
      render(<DeviceVerificationPromptModal {...defaultProps} onComplete={mockOnComplete} />);
      
      // Navigate to tutorial
      fireEvent.click(screen.getByText('Get Started'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('Learn more about verification'));
      
      fireEvent.click(screen.getByText('Got it!'));
      
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  describe('tutorial step', () => {
    it('should show tutorial steps correctly', () => {
      render(<DeviceVerificationPromptModal {...defaultProps} />);
      
      // Navigate to tutorial
      fireEvent.click(screen.getByText('Get Started'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('Learn more about verification'));
      
      expect(screen.getByText('Device Verification Tutorial')).toBeInTheDocument();
      expect(screen.getByText('Step 1: Initiate verification')).toBeInTheDocument();
      expect(screen.getByText('Step 2: Compare security codes')).toBeInTheDocument();
      expect(screen.getByText('Step 3: Complete verification')).toBeInTheDocument();
    });
  });

  describe('event handlers', () => {
    it('should call onClose when modal is closed', () => {
      const mockOnClose = jest.fn();
      render(<DeviceVerificationPromptModal {...defaultProps} onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByTestId('dialog'));
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('formatting utilities', () => {
    it('should format device last seen times correctly', () => {
      const recentTime = Date.now() - 1000 * 60 * 30; // 30 minutes ago
      const deviceWithRecentTime = {
        ...mockCurrentDevice,
        lastSeenTs: recentTime
      };

      render(
        <DeviceVerificationPromptModal 
          {...defaultProps} 
          currentDevice={deviceWithRecentTime}
        />
      );
      
      // Navigate to device list
      fireEvent.click(screen.getByText('Get Started'));
      fireEvent.click(screen.getByText('Continue'));
      
      // Should show "Just now" for recent activity
      expect(screen.getByText('Last seen: Just now')).toBeInTheDocument();
    });
  });
});
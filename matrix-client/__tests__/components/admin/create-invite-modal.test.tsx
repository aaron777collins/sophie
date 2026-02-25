import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CreateInviteModal } from '../../../components/admin/create-invite-modal';

// Mock fetch
global.fetch = jest.fn();

describe('CreateInviteModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
    onError: mockOnError,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders modal when isOpen is true', () => {
    render(<CreateInviteModal {...defaultProps} />);
    
    expect(screen.getByText('Create New Invite')).toBeInTheDocument();
    expect(screen.getByLabelText('Matrix User ID *')).toBeInTheDocument();
    expect(screen.getByText('Expiration')).toBeInTheDocument();
    expect(screen.getByText('Notes (optional)')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(<CreateInviteModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Create New Invite')).not.toBeInTheDocument();
  });

  it('has all expiration options including custom', () => {
    render(<CreateInviteModal {...defaultProps} />);
    
    const select = screen.getByDisplayValue('7 Days');
    fireEvent.click(select);
    
    expect(screen.getByText('7 Days')).toBeInTheDocument();
    expect(screen.getByText('14 Days')).toBeInTheDocument();
    expect(screen.getByText('30 Days')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('shows custom days input when Custom is selected', () => {
    render(<CreateInviteModal {...defaultProps} />);
    
    const select = screen.getByDisplayValue('7 Days');
    fireEvent.change(select, { target: { value: '-1' } });
    
    expect(screen.getByDisplayValue('7')).toBeInTheDocument();
    expect(screen.getByText('days')).toBeInTheDocument();
  });

  it('validates Matrix ID format', async () => {
    render(<CreateInviteModal {...defaultProps} />);
    
    const matrixIdInput = screen.getByLabelText('Matrix User ID *');
    const submitBtn = screen.getByText('Create Invite');
    
    // Test invalid format
    fireEvent.change(matrixIdInput, { target: { value: 'invalid' } });
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid Matrix ID format. Use @user:homeserver.com')).toBeInTheDocument();
    });
  });

  it('validates required Matrix ID field', async () => {
    render(<CreateInviteModal {...defaultProps} />);
    
    const form = screen.getByText('Create Invite').closest('form');
    
    await act(async () => {
      fireEvent.submit(form!);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Matrix ID is required')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('validates custom expiration days', async () => {
    render(<CreateInviteModal {...defaultProps} />);
    
    const select = screen.getByDisplayValue('7 Days');
    await act(async () => {
      fireEvent.change(select, { target: { value: '-1' } });
    });
    
    const customInput = screen.getByDisplayValue('7');
    await act(async () => {
      fireEvent.change(customInput, { target: { value: '0' } });
    });
    
    // Need to provide a valid Matrix ID so only custom days validation fails
    const matrixIdInput = screen.getByLabelText('Matrix User ID *');
    await act(async () => {
      fireEvent.change(matrixIdInput, { target: { value: '@valid:matrix.org' } });
    });
    
    const form = screen.getByText('Create Invite').closest('form');
    await act(async () => {
      fireEvent.submit(form!);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Expiration must be at least 1 day')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('validates maximum custom expiration days', async () => {
    render(<CreateInviteModal {...defaultProps} />);
    
    const select = screen.getByDisplayValue('7 Days');
    await act(async () => {
      fireEvent.change(select, { target: { value: '-1' } });
    });
    
    const customInput = screen.getByDisplayValue('7');
    await act(async () => {
      fireEvent.change(customInput, { target: { value: '500' } });
    });
    
    // Need to provide a valid Matrix ID so only custom days validation fails
    const matrixIdInput = screen.getByLabelText('Matrix User ID *');
    await act(async () => {
      fireEvent.change(matrixIdInput, { target: { value: '@valid:matrix.org' } });
    });
    
    const form = screen.getByText('Create Invite').closest('form');
    await act(async () => {
      fireEvent.submit(form!);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Expiration cannot exceed 365 days')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('successfully creates invite with preset expiration', async () => {
    const mockInvite = {
      id: '1',
      code: 'test-code',
      matrixId: '@test:matrix.org',
      createdAt: '2024-01-01T00:00:00Z',
      expiresAt: '2024-01-08T00:00:00Z',
      status: 'active' as const,
      notes: 'Test note',
      createdBy: '@admin:matrix.org',
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invite: mockInvite }),
    });

    render(<CreateInviteModal {...defaultProps} />);
    
    const matrixIdInput = screen.getByLabelText('Matrix User ID *');
    const notesInput = screen.getByLabelText('Notes (optional)');
    const submitBtn = screen.getByText('Create Invite');
    
    fireEvent.change(matrixIdInput, { target: { value: '@test:matrix.org' } });
    fireEvent.change(notesInput, { target: { value: 'Test note' } });
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matrixId: '@test:matrix.org',
          expiresIn: 7 * 24 * 60 * 60 * 1000,
          notes: 'Test note',
        }),
      });
      expect(mockOnSuccess).toHaveBeenCalledWith(mockInvite);
    });
  });

  it('successfully creates invite with custom expiration', async () => {
    const mockInvite = {
      id: '1',
      code: 'test-code',
      matrixId: '@test:matrix.org',
      createdAt: '2024-01-01T00:00:00Z',
      expiresAt: '2024-01-11T00:00:00Z',
      status: 'active' as const,
      notes: '',
      createdBy: '@admin:matrix.org',
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invite: mockInvite }),
    });

    render(<CreateInviteModal {...defaultProps} />);
    
    const matrixIdInput = screen.getByLabelText('Matrix User ID *');
    const select = screen.getByDisplayValue('7 Days');
    fireEvent.change(select, { target: { value: '-1' } });
    
    const customInput = screen.getByDisplayValue('7');
    fireEvent.change(customInput, { target: { value: '10' } });
    
    fireEvent.change(matrixIdInput, { target: { value: '@test:matrix.org' } });
    
    const submitBtn = screen.getByText('Create Invite');
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matrixId: '@test:matrix.org',
          expiresIn: 10 * 24 * 60 * 60 * 1000,
          notes: '',
        }),
      });
      expect(mockOnSuccess).toHaveBeenCalledWith(mockInvite);
    });
  });

  it('handles API errors correctly', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    });

    render(<CreateInviteModal {...defaultProps} />);
    
    const matrixIdInput = screen.getByLabelText('Matrix User ID *');
    const submitBtn = screen.getByText('Create Invite');
    
    fireEvent.change(matrixIdInput, { target: { value: '@test:matrix.org' } });
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Server error');
    });
  });

  it('handles network errors correctly', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<CreateInviteModal {...defaultProps} />);
    
    const matrixIdInput = screen.getByLabelText('Matrix User ID *');
    const submitBtn = screen.getByText('Create Invite');
    
    fireEvent.change(matrixIdInput, { target: { value: '@test:matrix.org' } });
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Network error');
    });
  });

  it('closes modal when close button is clicked', () => {
    render(<CreateInviteModal {...defaultProps} />);
    
    const closeBtn = screen.getByLabelText('Close modal');
    fireEvent.click(closeBtn);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes modal when backdrop is clicked', () => {
    render(<CreateInviteModal {...defaultProps} />);
    
    const backdrop = screen.getByText('Create New Invite').closest('.modal-backdrop');
    fireEvent.click(backdrop!);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not close modal when modal content is clicked', () => {
    render(<CreateInviteModal {...defaultProps} />);
    
    const modalContent = screen.getByText('Create New Invite').closest('.modal');
    fireEvent.click(modalContent!);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('disables form during submission', async () => {
    // Mock a slow response
    (fetch as any).mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<CreateInviteModal {...defaultProps} />);
    
    const matrixIdInput = screen.getByLabelText('Matrix User ID *');
    const submitBtn = screen.getByText('Create Invite');
    
    fireEvent.change(matrixIdInput, { target: { value: '@test:matrix.org' } });
    fireEvent.click(submitBtn);
    
    // During submission
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(matrixIdInput).toBeDisabled();
    expect(submitBtn).toBeDisabled();
  });

  it('clears validation errors when user types', async () => {
    render(<CreateInviteModal {...defaultProps} />);
    
    const matrixIdInput = screen.getByLabelText('Matrix User ID *');
    const form = screen.getByText('Create Invite').closest('form');
    
    // Trigger validation error
    await act(async () => {
      fireEvent.submit(form!);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Matrix ID is required')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Type in input should clear error
    await act(async () => {
      fireEvent.change(matrixIdInput, { target: { value: '@test:matrix.org' } });
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Matrix ID is required')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
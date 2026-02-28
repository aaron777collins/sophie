import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../../../../components/auth/LoginForm';

describe('LoginForm', () => {
  it('renders login form with required fields', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('clears validation errors when user types', async () => {
    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    const usernameInput = screen.getByTestId('username-input');
    
    // Trigger validation errors
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
    });
    
    // Type in username field
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    
    // Username error should be cleared
    expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
  });

  it('masks password input', () => {
    render(<LoginForm />);
    
    const passwordInput = screen.getByTestId('password-input');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('disables form during loading state', async () => {
    const mockOnSubmit = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill in form
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    
    // Submit form
    fireEvent.click(submitButton);
    
    // Check loading state
    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Signing in...');
      expect(usernameInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  it('calls onSubmit with form data', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
    
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill in form
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    
    // Submit form
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'testpass'
      });
    });
  });

  it('displays error message on submission failure', async () => {
    const mockOnSubmit = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
    
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill in form
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    
    // Submit form
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', () => {
    render(<LoginForm />);
    
    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    
    expect(usernameInput).toHaveAttribute('aria-invalid', 'false');
    expect(passwordInput).toHaveAttribute('aria-invalid', 'false');
    expect(usernameInput).toHaveAccessibleName();
    expect(passwordInput).toHaveAccessibleName();
  });
});
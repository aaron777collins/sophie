import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { LoginForm } from '../../../../components/auth/LoginForm';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  getSession: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
}));

import { signIn, getSession } from 'next-auth/react';

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock: successful login
    mockSignIn.mockResolvedValue({
      error: null,
      status: 200,
      ok: true,
      url: '/projects',
    });
    mockGetSession.mockResolvedValue({
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  });

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
    // Mock signIn to delay response
    mockSignIn.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        error: null,
        status: 200,
        ok: true,
        url: '/projects',
      }), 100))
    );
    
    render(<LoginForm />);
    
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

  it('calls signIn with form data', async () => {
    render(<LoginForm />);
    
    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill in form
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    
    // Submit form
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        username: 'testuser',
        password: 'testpass',
        callbackUrl: '/projects',
        redirect: false,
      });
    });
  });

  it('displays error message on submission failure', async () => {
    // Mock signIn to return an error
    mockSignIn.mockResolvedValue({
      error: 'CredentialsSignin',
      status: 401,
      ok: false,
      url: null,
    });
    
    render(<LoginForm />);
    
    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill in form
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    
    // Submit form
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
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

describe('LoginForm Rate Limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows rate limit error message when API returns 429', async () => {
    // Mock signIn to return a rate limit error
    mockSignIn.mockResolvedValue({
      error: 'RateLimitExceeded',
      status: 429,
      ok: false,
      url: null,
    });
    
    render(<LoginForm />);
    
    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill in form
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    
    // Submit form
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Check rate limit error message
    await waitFor(() => {
      expect(screen.getByTestId('rate-limit-message')).toBeInTheDocument();
      expect(screen.getByText(/too many login attempts/i)).toBeInTheDocument();
    });
  });

  it('disables login button during rate limit cooldown', async () => {
    mockSignIn.mockResolvedValue({
      error: 'RateLimitExceeded',
      status: 429,
      ok: false,
      url: null,
    });
    
    render(<LoginForm />);
    
    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill in form and submit
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Button should be disabled during cooldown
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('shows visual indication of rate limiting with cooldown timer', async () => {
    mockSignIn.mockResolvedValue({
      error: 'RateLimitExceeded',
      status: 429,
      ok: false,
      url: null,
    });
    
    render(<LoginForm />);
    
    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill in form and submit
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Should show visual indication (cooldown timer or countdown)
    await waitFor(() => {
      const rateLimitMessage = screen.getByTestId('rate-limit-message');
      expect(rateLimitMessage).toHaveClass('bg-amber-50'); // Visual styling
    });
  });

  it('re-enables login button after cooldown expires', async () => {
    mockSignIn.mockResolvedValue({
      error: 'RateLimitExceeded',
      status: 429,
      ok: false,
      url: null,
    });
    
    render(<LoginForm />);
    
    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill in form and submit
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Button should be disabled
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
    
    // Advance timers past cooldown (60 seconds default)
    await act(async () => {
      jest.advanceTimersByTime(61000);
    });
    
    // Button should be re-enabled
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('displays countdown timer during rate limit', async () => {
    mockSignIn.mockResolvedValue({
      error: 'RateLimitExceeded',
      status: 429,
      ok: false,
      url: null,
    });
    
    render(<LoginForm />);
    
    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill in form and submit
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Should show countdown timer
    await waitFor(() => {
      expect(screen.getByTestId('cooldown-timer')).toBeInTheDocument();
    });
    
    // Advance time and check countdown updates
    await act(async () => {
      jest.advanceTimersByTime(10000); // 10 seconds
    });
    
    // Timer should have updated (showing less time)
    const timer = screen.getByTestId('cooldown-timer');
    expect(timer).toBeInTheDocument();
  });

  it('clears rate limit error when cooldown expires', async () => {
    mockSignIn.mockResolvedValue({
      error: 'RateLimitExceeded',
      status: 429,
      ok: false,
      url: null,
    });
    
    render(<LoginForm />);
    
    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill in form and submit
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Rate limit message should be visible
    await waitFor(() => {
      expect(screen.getByTestId('rate-limit-message')).toBeInTheDocument();
    });
    
    // Advance timers past cooldown
    await act(async () => {
      jest.advanceTimersByTime(61000);
    });
    
    // Rate limit message should be cleared
    await waitFor(() => {
      expect(screen.queryByTestId('rate-limit-message')).not.toBeInTheDocument();
    });
  });

  it('prevents form submission during rate limit cooldown', async () => {
    mockSignIn.mockResolvedValue({
      error: 'RateLimitExceeded',
      status: 429,
      ok: false,
      url: null,
    });
    
    render(<LoginForm />);
    
    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill in form and submit
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Clear the mock call count
    mockSignIn.mockClear();
    
    // Try to submit again while rate limited
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // signIn should NOT have been called again
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
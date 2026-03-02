"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface LoginFormProps {
  // No longer need onSubmit prop since we're using NextAuth directly
}

// Default cooldown period in seconds (1 minute)
const DEFAULT_COOLDOWN_SECONDS = 60;

export function LoginForm(props: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Rate limiting state
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    if (!isRateLimited || cooldownSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          // Cooldown expired - clear rate limit state
          setIsRateLimited(false);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRateLimited, cooldownSeconds]);

  // Format seconds as MM:SS
  const formatCooldown = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));

    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if rate limited
    if (isRateLimited) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log("🔐 Attempting login with rate limit check");
      
      // First, check rate limiting with our custom API
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (loginResponse.status === 429) {
        console.log("🚫 Rate limit exceeded from login API");
        const rateLimitData = await loginResponse.json();
        setIsRateLimited(true);
        setCooldownSeconds(rateLimitData.timeUntilReset || DEFAULT_COOLDOWN_SECONDS);
        setErrors({
          general: "Too many login attempts. Please wait before trying again."
        });
        return;
      }

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        setErrors({
          general: errorData.error || "Invalid credentials"
        });
        return;
      }

      // If rate limit check passed, proceed with NextAuth
      console.log("🔐 Rate limit check passed, proceeding with NextAuth");
      
      // Get callback URL from search params, default to /projects
      const callbackUrl = searchParams.get('callbackUrl') || '/projects';
      console.log("🔄 Callback URL:", callbackUrl);
      
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        callbackUrl: callbackUrl,
        redirect: false, // Handle redirect manually to check for errors
      });

      console.log("🔐 NextAuth result:", result);

      // Check for rate limit error (backup check)
      if (result?.error === 'RateLimitExceeded') {
        console.log("⚠️ Rate limit exceeded from NextAuth");
        setIsRateLimited(true);
        setCooldownSeconds(DEFAULT_COOLDOWN_SECONDS);
        setErrors({
          general: "Too many login attempts. Please wait before trying again."
        });
        return;
      }

      if (result?.error) {
        setErrors({
          general: "Invalid credentials"
        });
      } else if (result?.ok) {
        // Verify session was created
        const session = await getSession();
        console.log("✅ Session created:", session);
        
        // NextAuth's redirect callback will handle the URL validation
        // Redirect using result.url (which has been processed by NextAuth)
        const redirectUrl = result.url || '/projects';
        console.log("🚀 Redirecting to:", redirectUrl);
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error("🚨 Login error:", error);
      setErrors({
        general: error instanceof Error ? error.message : "Login failed"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Username
          </label>
          <Input
            id="username"
            type="text"
            value={formData.username}
            onChange={handleInputChange("username")}
            placeholder="Enter your username"
            disabled={isLoading}
            data-testid="username-input"
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? "username-error" : undefined}
          />
          {errors.username && (
            <p
              id="username-error"
              className="mt-1 text-sm text-red-600"
              data-testid="username-error"
            >
              {errors.username}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange("password")}
            placeholder="Enter your password"
            disabled={isLoading}
            data-testid="password-input"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <p
              id="password-error"
              className="mt-1 text-sm text-red-600"
              data-testid="password-error"
            >
              {errors.password}
            </p>
          )}
        </div>

        {errors.general && (
          <div
            className="p-3 bg-red-50 border border-red-200 rounded-md"
            data-testid="error-message"
          >
            <p className="text-sm text-red-700">{errors.general}</p>
          </div>
        )}

        {isRateLimited && (
          <div
            className="p-4 bg-amber-50 border border-amber-200 rounded-md"
            data-testid="rate-limit-message"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-amber-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Too many login attempts
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Please wait{" "}
                  <span
                    className="font-mono font-semibold"
                    data-testid="cooldown-timer"
                  >
                    {formatCooldown(cooldownSeconds)}
                  </span>{" "}
                  before trying again.
                </p>
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || isRateLimited}
          className="w-full"
          data-testid="login-button"
        >
          {isLoading ? "Signing in..." : isRateLimited ? `Wait ${formatCooldown(cooldownSeconds)}` : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
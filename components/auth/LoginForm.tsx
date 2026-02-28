"use client";

import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface LoginFormProps {
  onSubmit?: (credentials: { username: string; password: string }) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
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

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Invalid credentials"
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

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
          data-testid="login-button"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
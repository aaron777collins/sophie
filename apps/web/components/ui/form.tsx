'use client';

import React, {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ButtonHTMLAttributes,
  forwardRef,
  useState,
  useId,
  ReactNode,
} from 'react';
import styles from './form.module.css';

// ============================================================================
// Input
// ============================================================================

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: 'small' | 'medium' | 'large';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'medium',
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = !!error;

    return (
      <div
        className={`${styles.inputWrapper} ${fullWidth ? styles.fullWidth : ''} ${className}`}
      >
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
          </label>
        )}
        <div
          className={`${styles.inputContainer} ${styles[size]} ${
            hasError ? styles.error : ''
          }`}
        >
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={styles.input}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />
          {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
        </div>
        {error && (
          <p id={`${inputId}-error`} className={styles.errorText} role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className={styles.helperText}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================================================
// Textarea
// ============================================================================

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  maxLength?: number;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = false,
      maxLength,
      showCount = false,
      className = '',
      id,
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = !!error;
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div
        className={`${styles.inputWrapper} ${fullWidth ? styles.fullWidth : ''} ${className}`}
      >
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`${styles.textarea} ${hasError ? styles.error : ''}`}
          aria-invalid={hasError}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          maxLength={maxLength}
          value={value}
          {...props}
        />
        <div className={styles.textareaFooter}>
          {error ? (
            <p id={`${inputId}-error`} className={styles.errorText} role="alert">
              {error}
            </p>
          ) : helperText ? (
            <p id={`${inputId}-helper`} className={styles.helperText}>
              {helperText}
            </p>
          ) : (
            <span />
          )}
          {showCount && maxLength && (
            <span
              className={`${styles.charCount} ${
                charCount >= maxLength ? styles.charCountLimit : ''
              }`}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ============================================================================
// Select
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      placeholder,
      size = 'medium',
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = !!error;

    return (
      <div
        className={`${styles.inputWrapper} ${fullWidth ? styles.fullWidth : ''} ${className}`}
      >
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
          </label>
        )}
        <div
          className={`${styles.selectContainer} ${styles[size]} ${
            hasError ? styles.error : ''
          }`}
        >
          <select
            ref={ref}
            id={inputId}
            className={styles.select}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className={styles.selectIcon} />
        </div>
        {error && (
          <p id={`${inputId}-error`} className={styles.errorText} role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className={styles.helperText}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// ============================================================================
// Checkbox
// ============================================================================

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={`${styles.checkboxWrapper} ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className={styles.checkbox}
          {...props}
        />
        <label htmlFor={inputId} className={styles.checkboxLabel}>
          <span className={styles.checkboxBox}>
            <CheckIcon />
          </span>
          {(label || description) && (
            <span className={styles.checkboxText}>
              {label && <span className={styles.checkboxLabelText}>{label}</span>}
              {description && (
                <span className={styles.checkboxDescription}>{description}</span>
              )}
            </span>
          )}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// ============================================================================
// Toggle / Switch
// ============================================================================

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, description, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={`${styles.toggleWrapper} ${className}`}>
        <div className={styles.toggleContent}>
          {(label || description) && (
            <div className={styles.toggleText}>
              {label && (
                <label htmlFor={inputId} className={styles.toggleLabel}>
                  {label}
                </label>
              )}
              {description && (
                <span className={styles.toggleDescription}>{description}</span>
              )}
            </div>
          )}
          <label className={styles.toggleSwitch}>
            <input
              ref={ref}
              type="checkbox"
              id={inputId}
              className={styles.toggleInput}
              {...props}
            />
            <span className={styles.toggleSlider} />
          </label>
        </div>
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

// ============================================================================
// Button
// ============================================================================

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`${styles.button} ${styles[variant]} ${styles[size]} ${
          fullWidth ? styles.fullWidth : ''
        } ${loading ? styles.loading : ''} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Spinner className={styles.buttonSpinner} />}
        {leftIcon && !loading && (
          <span className={styles.buttonIcon}>{leftIcon}</span>
        )}
        <span className={styles.buttonText}>{children}</span>
        {rightIcon && <span className={styles.buttonIcon}>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ============================================================================
// Color Picker
// ============================================================================

export interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (color: string) => void;
  presetColors?: string[];
  className?: string;
}

const DEFAULT_PRESET_COLORS = [
  '#5865F2', // Blurple
  '#57F287', // Green
  '#FEE75C', // Yellow
  '#EB459E', // Fuchsia
  '#ED4245', // Red
  '#3498DB', // Blue
  '#1ABC9C', // Teal
  '#9B59B6', // Purple
  '#E67E22', // Orange
  '#95A5A6', // Grey
  '#11806A', // Dark Teal
  '#1F8B4C', // Dark Green
  '#206694', // Dark Blue
  '#71368A', // Dark Purple
  '#AD1457', // Dark Magenta
  '#C27C0E', // Dark Gold
  '#A84300', // Dark Orange
  '#992D22', // Dark Red
];

export function ColorPicker({
  label,
  value,
  onChange,
  presetColors = DEFAULT_PRESET_COLORS,
  className = '',
}: ColorPickerProps) {
  const [isCustom, setIsCustom] = useState(false);
  const id = useId();

  return (
    <div className={`${styles.colorPickerWrapper} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.colorPicker}>
        <div className={styles.presetColors}>
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              className={`${styles.presetColor} ${
                value.toLowerCase() === color.toLowerCase() ? styles.selected : ''
              }`}
              style={{ backgroundColor: color }}
              onClick={() => {
                onChange(color);
                setIsCustom(false);
              }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
        <div className={styles.customColor}>
          <label
            htmlFor={id}
            className={`${styles.customColorLabel} ${isCustom ? styles.active : ''}`}
          >
            <input
              type="color"
              id={id}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setIsCustom(true);
              }}
              className={styles.colorInput}
            />
            <span
              className={styles.colorPreview}
              style={{ backgroundColor: value }}
            />
            <span className={styles.colorValue}>{value.toUpperCase()}</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Form Section
// ============================================================================

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className = '',
}: FormSectionProps) {
  return (
    <div className={`${styles.formSection} ${className}`}>
      {(title || description) && (
        <div className={styles.formSectionHeader}>
          {title && <h3 className={styles.formSectionTitle}>{title}</h3>}
          {description && (
            <p className={styles.formSectionDescription}>{description}</p>
          )}
        </div>
      )}
      <div className={styles.formSectionContent}>{children}</div>
    </div>
  );
}

// ============================================================================
// Divider
// ============================================================================

export function Divider({ className = '' }: { className?: string }) {
  return <hr className={`${styles.divider} ${className}`} />;
}

// ============================================================================
// Icons
// ============================================================================

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 3L4.5 8.5L2 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <path
        d="M14 8a6 6 0 00-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

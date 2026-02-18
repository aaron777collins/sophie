/**
 * Invite form validation utilities
 * Extracted from create-invite-modal.tsx for reusability and testing
 */

// Expiration presets in milliseconds
export const EXPIRATION_PRESETS = {
  SEVEN_DAYS: 7 * 24 * 60 * 60 * 1000,
  FOURTEEN_DAYS: 14 * 24 * 60 * 60 * 1000,
  THIRTY_DAYS: 30 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Convert days to milliseconds
 */
export function daysToMilliseconds(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}

/**
 * Format expiration time for display
 */
export function formatExpirationTime(ms: number): string {
  const days = Math.round(ms / (24 * 60 * 60 * 1000));
  if (days === 1) return '1 day';
  return `${days} days`;
}

/**
 * Validate Matrix ID format
 * Valid format: @user:homeserver.com
 */
export function validateMatrixId(matrixId: string): string | undefined {
  if (!matrixId.trim()) {
    return 'Matrix ID is required';
  }

  const matrixIdRegex = /^@[a-z0-9._=-]+:[a-z0-9.-]+\.[a-z]{2,}$/i;
  if (!matrixIdRegex.test(matrixId)) {
    return 'Invalid Matrix ID format. Use @user:homeserver.com';
  }

  return undefined;
}

/**
 * Validate expiration duration
 */
export function validateExpiration(expiresIn: number): string | undefined {
  const days = expiresIn / (24 * 60 * 60 * 1000);
  
  if (days < 1) {
    return 'Expiration must be at least 1 day';
  }
  if (days > 365) {
    return 'Expiration cannot exceed 365 days';
  }
  
  return undefined;
}

/**
 * Validate notes field
 */
export function validateNotes(notes: string): string | undefined {
  if (notes.length > 500) {
    return 'Notes cannot exceed 500 characters';
  }
  return undefined;
}

interface InviteFormData {
  matrixId: string;
  expiresIn: number;
  notes: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: {
    matrixId?: string;
    expiration?: string;
    notes?: string;
  };
}

/**
 * Validate complete invite form
 */
export function validateInviteForm(data: InviteFormData): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  const matrixIdError = validateMatrixId(data.matrixId);
  if (matrixIdError) {
    errors.matrixId = matrixIdError;
  }

  const expirationError = validateExpiration(data.expiresIn);
  if (expirationError) {
    errors.expiration = expirationError;
  }

  const notesError = validateNotes(data.notes);
  if (notesError) {
    errors.notes = notesError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

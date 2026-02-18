// Matrix ID validation regex (basic format check)
export function validateMatrixId(matrixId: string): boolean {
  const matrixIdRegex = /^@[a-z0-9._=-]+:[a-z0-9.-]+\.[a-z]{2,}$/i;
  return matrixIdRegex.test(matrixId);
}

// Simple invite code validation (can be expanded)
export function validateInviteCode(code: string): boolean {
  // Basic format: timestamp_randomstring
  const inviteCodeRegex = /^\d{10}_[a-zA-Z0-9]{16}$/;
  return inviteCodeRegex.test(code);
}
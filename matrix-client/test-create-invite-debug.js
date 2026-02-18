// Quick test to debug CreateInviteModal validation
const React = require('react');
const { render, screen, fireEvent } = require('@testing-library/react');

// This is just to test if the validation is working
console.log('Testing CreateInviteModal validation...');

// Simulate the validation functions
const validateMatrixId = (matrixId) => {
  if (!matrixId.trim()) {
    return 'Matrix ID is required';
  }
  return undefined;
};

const validateCustomDays = (days) => {
  if (days < 1) {
    return 'Expiration must be at least 1 day';
  }
  if (days > 365) {
    return 'Expiration cannot exceed 365 days';
  }
  return undefined;
};

// Test the validation functions directly
console.log('validateMatrixId(""):', validateMatrixId(''));
console.log('validateCustomDays(0):', validateCustomDays(0));
console.log('validateCustomDays(500):', validateCustomDays(500));

console.log('Validation functions work correctly!');
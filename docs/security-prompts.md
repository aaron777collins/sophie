# Security Prompts - Comprehensive Guide

## Overview
This document provides standardized security prompts for sensitive actions across the system. These prompts are designed to prevent accidental actions, ensure user awareness, and provide appropriate security barriers.

## Categories of Security Prompts

### 1. Password/Authentication Confirmation

#### Basic Password Confirmation
```
┌─────────────────────────────────────────────────────────────────┐
│                    🔐 Authentication Required                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ To continue with this action, please enter your password:       │
│                                                                 │
│ Password: [________________]                                    │
│                                                                 │
│ This verification helps protect your account security.          │
│                                                                 │
│         [Cancel]                    [Confirm]                   │
└─────────────────────────────────────────────────────────────────┘
```

#### Enhanced Authentication (Critical Actions)
```
┌─────────────────────────────────────────────────────────────────┐
│                  🚨 Critical Action Verification                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ You are about to perform a CRITICAL action that cannot be       │
│ undone. Enhanced verification is required.                      │
│                                                                 │
│ Password: [________________]                                    │
│                                                                 │
│ □ I understand this action is irreversible                      │
│ □ I have reviewed the consequences                              │
│                                                                 │
│ Two-Factor Code: [______]                                       │
│                                                                 │
│         [Cancel]                    [Verify & Continue]         │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Destructive Operation Warnings

#### High-Risk Deletion Warning
```
┌─────────────────────────────────────────────────────────────────┐
│                    ⚠️  DESTRUCTIVE OPERATION                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ WARNING: You are about to permanently DELETE:                   │
│                                                                 │
│ • {item_name}                                                   │
│ • {item_details}                                                │
│                                                                 │
│ This action CANNOT be undone. All data will be lost forever.    │
│                                                                 │
│ To confirm, type "DELETE" (in capitals): [____________]         │
│                                                                 │
│ □ I understand this is permanent and irreversible               │
│                                                                 │
│         [Cancel]                    [Delete Forever]            │
└─────────────────────────────────────────────────────────────────┘
```

#### System Reset Warning
```
┌─────────────────────────────────────────────────────────────────┐
│                     🚨 SYSTEM RESET WARNING                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ DANGER: You are about to RESET the entire system.              │
│                                                                 │
│ This will:                                                      │
│ ❌ Delete ALL user data                                         │
│ ❌ Remove ALL configurations                                    │
│ ❌ Reset ALL settings to factory defaults                       │
│ ❌ Permanently erase ALL custom content                         │
│                                                                 │
│ ARE YOU ABSOLUTELY SURE?                                        │
│                                                                 │
│ Type "RESET EVERYTHING" to confirm: [___________________]       │
│                                                                 │
│ Password: [________________]                                    │
│                                                                 │
│ □ I have backed up all important data                          │
│ □ I understand this cannot be undone                           │
│                                                                 │
│         [Cancel]                    [RESET SYSTEM]             │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Data Access/Modification Prompts

#### Sensitive Data Access
```
┌─────────────────────────────────────────────────────────────────┐
│                   🔒 Sensitive Data Access                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ You are requesting access to sensitive information:             │
│                                                                 │
│ Resource: {resource_name}                                       │
│ Level: {access_level}                                           │
│ Reason: [_________________________________]                    │
│                                                                 │
│ This access will be logged and monitored.                      │
│                                                                 │
│ Password: [________________]                                    │
│                                                                 │
│         [Cancel]                    [Request Access]           │
└─────────────────────────────────────────────────────────────────┘
```

#### Bulk Data Modification
```
┌─────────────────────────────────────────────────────────────────┐
│                   ⚠️  Bulk Modification Warning                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ WARNING: You are about to modify {count} records.              │
│                                                                 │
│ Changes to be applied:                                          │
│ • {change_1}                                                    │
│ • {change_2}                                                    │
│ • {change_3}                                                    │
│                                                                 │
│ This operation may take several minutes and cannot be           │
│ interrupted once started.                                       │
│                                                                 │
│ □ I have reviewed the changes                                   │
│ □ I have backed up the data                                     │
│                                                                 │
│         [Cancel]                    [Apply Changes]            │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Administrative Actions

#### User Privilege Escalation
```
┌─────────────────────────────────────────────────────────────────┐
│                 🛡️  Privilege Escalation Request                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ You are requesting elevated privileges:                         │
│                                                                 │
│ User: {username}                                                │
│ New Role: {new_role}                                            │
│ Current Role: {current_role}                                    │
│                                                                 │
│ New permissions will include:                                   │
│ • {permission_1}                                                │
│ • {permission_2}                                                │
│ • {permission_3}                                                │
│                                                                 │
│ Administrator Password: [________________]                      │
│                                                                 │
│ Justification: [_________________________________]             │
│                                                                 │
│         [Cancel]                    [Grant Privileges]         │
└─────────────────────────────────────────────────────────────────┘
```

#### System Configuration Change
```
┌─────────────────────────────────────────────────────────────────┐
│               ⚙️  System Configuration Change                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ WARNING: You are modifying critical system settings.           │
│                                                                 │
│ Setting: {setting_name}                                         │
│ Current Value: {current_value}                                  │
│ New Value: {new_value}                                          │
│                                                                 │
│ Impact: {impact_description}                                    │
│                                                                 │
│ ⚠️  Incorrect configuration may cause system instability        │
│                                                                 │
│ Administrator Password: [________________]                      │
│                                                                 │
│ □ I understand the risks                                        │
│ □ I have documented this change                                 │
│                                                                 │
│         [Cancel]                    [Apply Configuration]      │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Financial/Payment Operations

#### Payment Authorization
```
┌─────────────────────────────────────────────────────────────────┐
│                   💳 Payment Authorization                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ You are about to authorize a payment:                          │
│                                                                 │
│ Amount: ${amount}                                               │
│ Recipient: {recipient}                                          │
│ Description: {description}                                      │
│ Payment Method: {payment_method}                                │
│                                                                 │
│ This payment will be processed immediately and cannot be        │
│ cancelled once authorized.                                      │
│                                                                 │
│ Password: [________________]                                    │
│                                                                 │
│ □ I verify all payment details are correct                     │
│                                                                 │
│         [Cancel]                    [Authorize Payment]        │
└─────────────────────────────────────────────────────────────────┘
```

### 6. Account Management

#### Account Deactivation
```
┌─────────────────────────────────────────────────────────────────┐
│                   🚨 Account Deactivation                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ WARNING: You are about to deactivate your account.             │
│                                                                 │
│ Account: {account_name}                                         │
│ Email: {email_address}                                          │
│                                                                 │
│ Deactivation will:                                              │
│ • Disable login access immediately                             │
│ • Hide your profile from other users                           │
│ • Preserve your data for 30 days                               │
│ • Cancel active subscriptions                                   │
│                                                                 │
│ Type "DEACTIVATE" to confirm: [____________]                    │
│                                                                 │
│ Password: [________________]                                    │
│                                                                 │
│ □ I understand my account will be inaccessible                 │
│                                                                 │
│         [Cancel]                    [Deactivate Account]       │
└─────────────────────────────────────────────────────────────────┘
```

### 7. Data Export/Download

#### Sensitive Data Export
```
┌─────────────────────────────────────────────────────────────────┐
│                    📁 Sensitive Data Export                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ You are requesting to export sensitive data:                   │
│                                                                 │
│ Data Type: {data_type}                                          │
│ Records: {record_count}                                         │
│ Format: {export_format}                                         │
│ Classification: {security_level}                                │
│                                                                 │
│ ⚠️  This data export will be:                                   │
│ • Encrypted during transfer                                     │
│ • Logged and audited                                            │
│ • Available for download for 24 hours only                     │
│                                                                 │
│ Business Justification:                                         │
│ [_____________________________________________]                 │
│                                                                 │
│ Password: [________________]                                    │
│                                                                 │
│         [Cancel]                    [Generate Export]          │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Guidelines

### Security Levels

**Level 1 - Standard**: Basic password confirmation
- Regular actions with minimal risk
- Simple password prompt
- Standard cancel/confirm options

**Level 2 - Elevated**: Enhanced confirmation
- Actions affecting multiple records
- Type-to-confirm required
- Checkbox acknowledgments

**Level 3 - Critical**: Maximum security
- Irreversible or high-risk actions
- Multiple verification steps
- Two-factor authentication
- Detailed impact warnings

### UI/UX Considerations

#### Visual Design
- Use consistent color coding (red for warnings, orange for caution)
- Clear hierarchy with prominent headers
- Adequate spacing and readability
- Accessible design for screen readers

#### Language Guidelines
- Use clear, non-technical language
- State consequences explicitly
- Avoid ambiguous terms
- Include specific details about what will happen

#### Interaction Patterns
- Always provide a clear "Cancel" option
- Make destructive actions require explicit confirmation
- Use progressive disclosure for complex operations
- Provide clear next steps after confirmation

### Technical Implementation

#### Required Fields Validation
```javascript
// Example validation for destructive operations
function validateDestructiveAction(userInput, expectedConfirmation) {
    return {
        isValid: userInput === expectedConfirmation,
        caseSensitive: true,
        minLength: expectedConfirmation.length,
        exactMatch: true
    };
}
```

#### Audit Logging
```javascript
// Example audit log entry
{
    timestamp: "2024-01-15T10:30:00Z",
    userId: "user_123",
    action: "system_reset_attempt",
    status: "confirmed",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0...",
    riskLevel: "critical",
    confirmationMethod: "password_2fa"
}
```

### Accessibility Requirements

- Screen reader compatible
- High contrast mode support
- Keyboard navigation
- Clear focus indicators
- Alternative text for icons
- Proper ARIA labels

### Localization Considerations

- All text strings must be translatable
- Consider text expansion in different languages
- Right-to-left language support
- Cultural sensitivity in warning messages
- Consistent terminology across languages

## Testing & Validation

### Security Testing
- Attempt bypass methods
- Test timeout scenarios
- Validate input sanitization
- Check session management
- Verify audit logging

### User Experience Testing
- Test with actual users
- Measure comprehension rates
- Track accidental confirmations
- Analyze abandonment rates
- Gather feedback on clarity

### Automated Testing
```javascript
// Example test cases
describe('Security Prompts', () => {
    test('requires exact confirmation text', () => {
        expect(validateConfirmation('delete', 'DELETE')).toBe(false);
        expect(validateConfirmation('DELETE', 'DELETE')).toBe(true);
    });
    
    test('logs all security events', () => {
        const result = performSecureAction();
        expect(auditLog).toHaveBeenCalledWith({
            action: 'secure_action',
            status: 'attempted'
        });
    });
});
```

---

## Prompt Templates by Context

### Quick Reference

| Action Type | Security Level | Confirmation Required |
|-------------|----------------|----------------------|
| Data View | Level 1 | Password |
| Data Edit | Level 1 | Password |
| Bulk Edit | Level 2 | Password + Checkbox |
| User Delete | Level 2 | Password + Type Confirm |
| System Config | Level 2 | Password + Justification |
| Data Export | Level 2 | Password + Justification |
| System Reset | Level 3 | Password + 2FA + Type Confirm |
| Account Delete | Level 3 | Password + 2FA + Multiple Confirms |

### Usage Examples

```html
<!-- Basic implementation -->
<security-prompt 
    level="2" 
    action="delete_user"
    target="John Doe (john@example.com)"
    confirmation-text="DELETE USER">
</security-prompt>

<!-- Advanced implementation -->
<security-prompt 
    level="3"
    action="system_reset"
    requires-2fa="true"
    confirmation-text="RESET EVERYTHING"
    impact-items="['All user data', 'All configurations', 'All customizations']">
</security-prompt>
```

This comprehensive security prompt system provides consistent, secure, and user-friendly confirmation dialogs for all sensitive operations across the system.
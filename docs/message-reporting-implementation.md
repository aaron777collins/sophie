# Message Reporting Implementation

This document outlines the implementation of message reporting functionality via Matrix API.

## Overview

The message reporting system allows users to report inappropriate messages to room moderators and server administrators. The implementation includes:

1. **UI Components** - Modal dialogs for reporting messages
2. **Matrix API Integration** - Utilities for submitting reports via Matrix protocol
3. **Error Handling** - Comprehensive error handling with user-friendly messages
4. **Testing** - Unit tests and E2E tests for all scenarios

## Architecture

### Components

#### 1. Report Message Modal (Ant Design Version)
- **File**: `src/components/report-message-modal.tsx`
- **Dependencies**: Ant Design, Matrix JS SDK
- **Features**:
  - Form validation
  - Error handling with retry functionality
  - Loading states
  - Message preview
  - Comprehensive error messages

#### 2. Report Message Modal (Radix UI Version) 
- **File**: `src/components/report-message-modal-radix.tsx`
- **Dependencies**: Radix UI, Tailwind CSS, Lucide Icons
- **Features**: Same as Ant Design version but using Radix UI components

### Utilities

#### Matrix Reporting Utilities
- **File**: `src/utils/matrix-reporting.ts`
- **Functions**:
  - `reportMessage()` - Main function to report a message
  - `validateMatrixClient()` - Validate Matrix client availability
  - `validateReportReason()` - Validate report reason input
  - `validateReportDetails()` - Validate additional details input
  - `formatErrorForDisplay()` - Format errors for user display
  - `isRetryableError()` - Check if error can be retried

#### Class Name Utility
- **File**: `src/utils/cn.ts`
- **Purpose**: Utility for conditional class names with Tailwind CSS

### Test Pages

#### Test Pages for Manual Testing
- `src/components/test-report-modal-page.tsx` (Ant Design version)
- `src/components/test-report-modal-page-radix.tsx` (Radix UI version)

## Usage

### Basic Usage (Radix UI Version)

```tsx
import { ReportMessageModal } from '@/components/report-message-modal-radix';

function MyComponent() {
  const [modalOpen, setModalOpen] = useState(false);

  const handleReportSuccess = () => {
    console.log('Message reported successfully');
    setModalOpen(false);
  };

  return (
    <>
      <button onClick={() => setModalOpen(true)}>
        Report Message
      </button>
      
      <ReportMessageModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleReportSuccess}
        messageId="$message-id:example.com"
        roomId="!room-id:example.com"
        eventContent={{
          body: "Message content to report",
          sender: "@user:example.com",
          timestamp: Date.now()
        }}
      />
    </>
  );
}
```

### Advanced Usage with Error Handling

```tsx
import { reportMessage } from '@/utils/matrix-reporting';
import { useMatrixClient } from '@/matrix-client/lib/matrix/matrix-context';

function MyComponent() {
  const matrixClient = useMatrixClient();

  const handleDirectReport = async () => {
    const result = await reportMessage(
      matrixClient,
      '!room-id:example.com',
      '$message-id:example.com',
      'spam',
      'Additional context about this spam message'
    );

    if (result.success) {
      console.log('Report submitted successfully');
    } else {
      console.error('Report failed:', result.error);
    }
  };

  return (
    <button onClick={handleDirectReport}>
      Report Directly
    </button>
  );
}
```

## API Reference

### ReportMessageModal Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | Yes | Whether the modal is visible |
| `onOpenChange` | `(open: boolean) => void` | Yes | Callback when modal open state changes |
| `onSuccess` | `() => void` | Yes | Callback when report is successfully submitted |
| `messageId` | `string` | Yes | Matrix event ID of the message to report |
| `roomId` | `string` | Yes | Matrix room ID where the message was sent |
| `eventContent` | `EventContent` | No | Optional message content for preview |

### EventContent Interface

```typescript
interface EventContent {
  body?: string;      // Message text content
  sender?: string;    // User ID of message sender
  timestamp?: number; // Unix timestamp of message
}
```

### Report Reasons

The following report reasons are available:

- `spam` - Spam
- `harassment` - Harassment or Abuse
- `hate_speech` - Hate Speech
- `violence` - Threats or Violence
- `illegal` - Illegal Content
- `inappropriate` - Inappropriate Content
- `misinformation` - Misinformation
- `other` - Other

## Error Handling

The system handles various types of errors:

### Matrix API Errors
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: User not authenticated
- **403 Forbidden**: User lacks permission to report in this room
- **404 Not Found**: Message or room not found (may be deleted)
- **429 Too Many Requests**: Rate limited (too many reports)
- **5xx Server Errors**: Server-side issues

### Network Errors
- **NetworkError**: Connection issues
- **TimeoutError**: Request timeout

### Validation Errors
- **INVALID_REASON**: Invalid or missing report reason
- **DETAILS_TOO_LONG**: Additional details exceed character limit
- **CLIENT_UNAVAILABLE**: Matrix client not available

### Retryable Errors

The following errors support automatic retry:
- Network errors
- Timeout errors  
- Server errors (5xx)

## Testing

### Unit Tests

```bash
# Run component tests
npm test tests/components/report-message-modal.test.tsx

# Run utility tests  
npm test tests/utils/matrix-reporting.test.ts
```

### E2E Tests

```bash
# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npx playwright test tests/e2e/moderation/message-reporting-radix.spec.ts
```

### Test Coverage

The test suite covers:

- ✅ **Form Validation** - Required fields, input validation
- ✅ **API Integration** - Matrix API calls with various responses
- ✅ **Error Handling** - All error scenarios with appropriate messages
- ✅ **Retry Logic** - Retry functionality for network errors
- ✅ **Loading States** - UI states during async operations
- ✅ **Accessibility** - Keyboard navigation, ARIA labels
- ✅ **Form Reset** - Proper form cleanup on cancel/close
- ✅ **Success Flow** - Complete report submission workflow

### Manual Testing

Use the test pages for manual testing:

1. Start your development server
2. Navigate to `/test-report-modal-radix` 
3. Click "Report Message" to test the modal
4. Try different scenarios (valid/invalid inputs, network errors, etc.)

## Dependencies

### Required Dependencies

```json
{
  "matrix-js-sdk": "^40.3.0-rc.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0"
}
```

### UI Library Dependencies

**For Radix UI Version:**
```json
{
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-select": "^2.0.0", 
  "lucide-react": "^0.400.0",
  "tailwindcss": "^3.4.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0"
}
```

**For Ant Design Version:**
```json
{
  "antd": "^5.0.0"
}
```

### Development Dependencies

```json
{
  "@playwright/test": "^1.40.0",
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "@testing-library/user-event": "^14.0.0",
  "typescript": "^5.0.0"
}
```

## Security Considerations

### Input Validation
- Report reasons are validated against a predefined list
- Additional details are limited to 1000 characters
- All inputs are sanitized before sending to Matrix API

### Rate Limiting
- The system handles Matrix server rate limiting gracefully
- Users are informed when they hit rate limits
- Retry mechanisms respect rate limiting delays

### Privacy
- Only message metadata (ID, room ID) and user-provided context are sent
- No sensitive user data is transmitted
- Reports are sent only to authorized moderators/administrators

### Abuse Prevention
- Users are warned about false reports
- Report reasons are categorized to prevent abuse
- All reports are logged on the Matrix server for audit

## Performance Considerations

### Bundle Size
- Radix UI version is more lightweight than Ant Design version
- Tree shaking is supported for both versions
- Utilities can be imported separately

### API Efficiency
- Single API call for basic reports
- Optional second call only when additional details provided
- Proper error handling prevents unnecessary retries

### User Experience
- Loading states provide immediate feedback
- Error messages are user-friendly and actionable
- Form validation prevents invalid submissions

## Browser Support

The implementation supports:
- Chrome 90+
- Firefox 88+
- Safari 14+  
- Edge 90+

## Deployment

### Build Requirements
- Node.js 18+
- TypeScript 5+
- Tailwind CSS 3+ (for Radix UI version)

### Environment Setup
Ensure Matrix client is properly configured with:
- Valid homeserver URL
- User authentication
- Appropriate permissions for reporting

## Contributing

When contributing to this implementation:

1. **Follow existing patterns** - Use the established component and utility structure
2. **Add tests** - All new functionality must include unit and E2E tests  
3. **Update documentation** - Keep this README current with any changes
4. **Consider accessibility** - Ensure all UI changes maintain accessibility standards
5. **Test error scenarios** - Verify error handling works for edge cases

## Troubleshooting

### Common Issues

**Modal doesn't open**: Check that the Matrix client is properly initialized and connected.

**Reports fail silently**: Verify Matrix client has proper authentication and permissions.

**Tests fail**: Ensure all dependencies are installed and test pages are accessible.

**Styling issues**: Check that Tailwind CSS is properly configured (for Radix version).

### Debug Logging

Enable debug logging by setting:
```javascript
localStorage.setItem('matrix-js-sdk:debug', 'true');
```

This will show Matrix API calls and responses in the browser console.
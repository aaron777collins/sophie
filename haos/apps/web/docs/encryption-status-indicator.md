# Encryption Status Indicator

## Overview

The encryption status indicator provides visual feedback about the end-to-end encryption (E2EE) status of chat rooms. It appears in the chat header and uses color coding to quickly communicate the security state.

## Color Coding

| Color | State | Icon | Meaning |
|-------|-------|------|---------|
| 🟢 Green | `verified` | ShieldCheck | Room is encrypted AND all participant devices are verified |
| 🟡 Yellow | `unverified` | Lock | Room is encrypted but some devices are unverified |
| 🔴 Red | `unencrypted` | ShieldOff | Room is NOT encrypted |
| ⚪ Gray | `unknown` | LockOpen | Status cannot be determined |

## Components

### `useCryptoStatus` Hook

Located at: `hooks/use-crypto-status.ts`

A React hook that provides comprehensive encryption status for a given room.

#### Usage

```typescript
import { useCryptoStatus } from '@/hooks/use-crypto-status';

function MyComponent({ roomId }: { roomId: string }) {
  const cryptoStatus = useCryptoStatus(roomId);
  
  return (
    <div>
      <span>Status: {cryptoStatus.state}</span>
      <span>Message: {cryptoStatus.statusMessage}</span>
    </div>
  );
}
```

#### Return Value: `CryptoStatus`

```typescript
interface CryptoStatus {
  // Main state for color coding
  state: 'verified' | 'unverified' | 'unencrypted' | 'unknown';
  
  // Encryption details
  isEncrypted: boolean;
  algorithm: string | null;  // e.g., 'm.megolm.v1.aes-sha2'
  canDecrypt: boolean;
  
  // Device verification
  allDevicesVerified: boolean;
  verifiedDeviceCount: number;
  unverifiedDeviceCount: number;
  totalDeviceCount: number;
  
  // Security features
  keyBackupEnabled: boolean;
  crossSigningReady: boolean;
  
  // Display messages
  statusMessage: string;      // Short message (e.g., "Fully verified")
  detailedMessage: string;    // Full tooltip content
  
  // Loading state
  isLoading: boolean;
}
```

### Tooltip Component

Located at: `components/ui/tooltip.tsx`

A reusable tooltip component for displaying hover information.

```typescript
import { Tooltip } from '@/components/ui/tooltip';

<Tooltip content="Detailed information here" side="bottom">
  <button>Hover me</button>
</Tooltip>
```

### Chat Header Integration

The encryption indicator is integrated into `components/chat/chat-header.tsx`.

#### Props

- `showEncryption?: boolean` - Whether to show the encryption indicator (default: `true`)

#### Features

1. **Color-coded icon** - Immediately shows security state
2. **Hover tooltip** - Provides detailed encryption information including:
   - Encryption algorithm
   - Device verification status
   - Key backup status
   - Cross-signing status
3. **Loading indicator** - Shows when status is being fetched
4. **Accessible** - Includes `role="status"` and `aria-label`

## State Logic

### Verified (Green)
- Room must be encrypted
- All devices of all room members must be verified
- Indicates maximum security

### Unverified (Yellow)
- Room is encrypted
- At least one device is unverified OR still loading
- Messages are encrypted but trust is not fully established

### Unencrypted (Red)
- Room has no encryption enabled
- Messages may be visible to server administrators
- **Warning state** - users should be aware

### Unknown (Gray)
- Room or client not available
- Status cannot be determined
- Fallback state

## Tooltip Content

The tooltip provides detailed information:

```
🔐 End-to-end encrypted (m.megolm.v1.aes-sha2)

📱 Devices: 5/6 verified
⚠️ 1 unverified device

💾 Key backup enabled
✅ Cross-signing ready

💡 Verify devices to ensure complete security
```

## Performance Considerations

- Device status is fetched asynchronously
- Event listeners update status on:
  - Room timeline changes
  - Device verification changes
  - User trust status changes
- Results are memoized to prevent unnecessary re-renders

## Accessibility

- Uses semantic `role="status"` for screen readers
- `aria-label` provides context for the encryption state
- `aria-hidden="true"` on decorative icons
- Keyboard-accessible tooltip (appears on focus)

## Future Improvements

1. Add click action to open device verification modal
2. Show individual unverified devices in tooltip
3. Add "Verify all devices" quick action
4. Implement real-time WebSocket updates for device changes

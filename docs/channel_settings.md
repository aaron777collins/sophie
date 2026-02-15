# Channel Settings: Slowmode

## Slowmode Configuration

Slowmode allows you to control the rate at which users can send messages in a channel.

### Features
- Enable/disable slowmode for a channel
- Configure slowmode duration between 0-5 minutes (0-300 seconds)
- Prevents users from sending messages faster than the set interval
- Provides clear feedback when rate limit is reached

### Configuration Options
- **Enabled**: Toggle slowmode on/off
- **Duration**: Set the cooldown period between messages
  - Minimum: 0 seconds (disabled)
  - Maximum: 300 seconds (5 minutes)

### Example Configuration
```json
{
  "slowmode": {
    "enabled": true,
    "duration": 10
  }
}
```

### User Experience
- When slowmode is active, users cannot send messages faster than the configured interval
- Users receive a clear visual indicator when they attempt to send a message too quickly
- The remaining cooldown time is displayed to help users understand when they can send their next message
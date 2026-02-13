# Matrix Client - Typing Indicators

## Typing Indicators Implementation

### Overview
The typing indicators feature allows users to see when someone is typing a message in a Matrix chat room.

### Key Components
- `TypingService`: Handles sending typing start/stop events
- `ChatInput`: Chat input component that uses TypingService

### Features
- Sends typing start event when user begins typing
- Sends typing stop event when input is empty or message is sent
- Rate limits typing events to prevent server flooding
- Implements a 5-second timeout for typing indicators

### Implementation Details
- Uses `matrix-js-sdk`'s `sendTyping()` method
- Implements debounce mechanism to prevent excessive typing events
- Conditionally sends typing events only when input has text

### Unit Testing
Comprehensive unit tests cover:
- Sending typing start/stop events
- Rate limiting
- Timeout handling

## Usage Example
```typescript
const chatInput = (
  <ChatInput 
    roomId="!roomId:example.com" 
    matrixClient={matrixClient} 
  />
);
```

### Success Criteria
- [x] Typing start event sent when user begins typing
- [x] Typing stop event sent when input is empty
- [x] No more than 1 typing event per 5 seconds
- [x] Unit tests for typing event logic
- [x] Integration with Matrix client services
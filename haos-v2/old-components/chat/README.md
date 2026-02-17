# Chat Components - Typing Indicators

## Typing Indicators Feature

### Overview
Typing indicators provide real-time feedback about users currently typing in a room or channel. This feature mimics Discord's typing indicator functionality while respecting user privacy.

### Components
- `TypingIndicators`: React component to display typing users
- `useTypingEvents`: Hook to manage typing event subscriptions
- `useUserSettings`: Hook to toggle typing indicator visibility

### Features
- Display up to 3 typing users simultaneously
- Smooth animations with Framer Motion
- User privacy toggle
- Real-time updates via Matrix events

### Usage

```typescript
// In a chat component
function ChatRoom({ roomId }) {
  const { typingUsers, sendTypingNotification } = useRoom(roomId);
  const { showTypingIndicators, toggleTypingIndicators } = useUserSettings();

  return (
    <>
      <ChatInput 
        onType={(isTyping) => sendTypingNotification(isTyping)}
      />
      {showTypingIndicators && (
        <TypingIndicators roomId={roomId} />
      )}
      <button onClick={toggleTypingIndicators}>
        Toggle Typing Indicators
      </button>
    </>
  );
}
```

### Performance Considerations
- Uses `useMemo` to minimize re-renders
- Limits displayed typing users to prevent UI clutter
- Leverages Matrix client's native typing events

### Accessibility
- Provides context for screen readers
- Uses semantic HTML
- Supports dark/light mode themes

### Future Improvements
- Configurable max typing users display
- More granular typing indicator settings
- Performance optimizations for large rooms
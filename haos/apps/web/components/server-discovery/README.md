# Server Discovery UI for HAOS v2

This implementation provides a comprehensive server discovery modal for browsing and joining public Matrix spaces and rooms.

## Features

### ✅ Implemented

- **Server Discovery Modal**: Full-screen modal with Radix UI Dialog
- **Browse Functionality**: List public Matrix rooms using Matrix room directory API
- **Search Functionality**: Search rooms by name, topic, or alias
- **Category Filtering**: Filter servers by predefined categories (Gaming, Technology, Community, etc.)
- **Server Preview**: Detailed preview with server info, member count, join rules, and metadata
- **Join Functionality**: Join public rooms directly from the modal

### 🎨 UI Components

1. **ServerDiscoveryModal**: Main modal component
   - Uses Radix UI Dialog for accessibility
   - Two-panel layout: server list + preview
   - Search and filter controls

2. **ServerSearch**: Search input with real-time filtering
   - Debounced search to avoid excessive API calls
   - Loading states and error handling

3. **CategoryFilter**: Dropdown category selector
   - Predefined categories with smart keyword matching
   - Shows server count per category

4. **ServerList**: Paginated list of servers
   - Server avatars, names, descriptions
   - Member counts and join status indicators
   - Loading skeletons and empty states

5. **ServerPreview**: Detailed server information
   - Server metadata and rules
   - Join button with appropriate states
   - Copy room ID functionality
   - External Matrix.to links

### 🔧 Matrix Integration

- **Matrix JS SDK**: Uses matrix-js-sdk for API calls
- **Guest Client**: Works without authentication for discovery
- **Room Directory API**: Fetches public rooms from homeserver
- **Join Room API**: Joins selected rooms with error handling

### 🎯 Categories

Servers are automatically categorized based on keywords in their name/topic:

- **All Categories**: Show all servers
- **Gaming**: Gaming communities and discussions
- **Technology**: Programming, development, tech
- **Community**: General communities and social spaces
- **Education**: Learning, study groups, educational content
- **Creative**: Art, music, writing, creative pursuits
- **Science & Research**: Scientific discussions and research
- **Hobbies & Interests**: Specific hobbies and interest groups

### 🚀 Usage

```tsx
import { ServerDiscoveryModal } from '@/components/server-discovery'

function MyComponent() {
  const [showDiscovery, setShowDiscovery] = useState(false)
  
  return (
    <ServerDiscoveryModal
      open={showDiscovery}
      onOpenChange={setShowDiscovery}
    />
  )
}
```

### 🔧 Dependencies

- `matrix-js-sdk`: Matrix protocol client
- `@radix-ui/react-dialog`: Accessible modal component
- `@radix-ui/react-select`: Dropdown select component
- `lucide-react`: Icon library
- `tailwindcss`: Styling framework

### 🎨 Styling

- **Discord-style UI**: Consistent with Discord design language
- **Dark theme**: Discord color palette (discord-dark, discord-darker, etc.)
- **Responsive**: Works on desktop and mobile
- **Animations**: Smooth transitions and loading states

### 📝 Notes

- Uses guest client for unauthenticated browsing
- Room data cached to reduce API calls
- Supports both room aliases and room IDs
- Graceful error handling for network issues
- Keyboard navigation support via Radix UI

### 🚧 Future Enhancements

- Server recommendations based on user interests
- Popular/trending server lists
- Server search across multiple homeservers
- Room preview (recent messages, member list)
- Advanced filtering (member count, activity level)
- Server verification badges
- Direct invite link handling
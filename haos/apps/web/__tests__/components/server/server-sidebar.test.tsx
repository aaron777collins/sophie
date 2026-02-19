import { render, screen } from '@testing-library/react'
import { ServerSidebar } from '@/components/server/server-sidebar'
import { ChannelType, MemberRole, ServerWithMembersWithProfiles } from '@/components/server/types'

// Mock the modal hook
jest.mock('@/hooks/use-modal-store', () => ({
  useModal: () => ({
    onOpen: jest.fn(),
  }),
}))

// Mock the child components
jest.mock('@/components/server/server-header', () => ({
  ServerHeader: ({ server, role }: { server: any; role: any }) => (
    <div data-testid="server-header">{server.name} Header</div>
  ),
}))

jest.mock('@/components/server/server-search', () => ({
  ServerSearch: ({ data }: { data: any[] }) => (
    <div data-testid="server-search">Search with {data.length} sections</div>
  ),
}))

jest.mock('@/components/server/server-section', () => ({
  ServerSection: ({ label, sectionType }: { label: string; sectionType: string }) => (
    <div data-testid="server-section">{label} ({sectionType})</div>
  ),
}))

jest.mock('@/components/server/server-channel', () => ({
  ServerChannel: ({ channel }: { channel: any }) => (
    <div data-testid="server-channel">{channel.name}</div>
  ),
}))

jest.mock('@/components/server/server-member', () => ({
  ServerMember: ({ member }: { member: any }) => (
    <div data-testid="server-member">{member.profile.name}</div>
  ),
}))

// Mock ScrollArea from radix-ui or custom component
jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scroll-area">{children}</div>
  ),
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}))

const createMockServer = (): ServerWithMembersWithProfiles => ({
  id: '1',
  name: 'Test Server',
  imageUrl: '/test.png',
  inviteCode: 'abc123',
  profileId: 'profile-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  channels: [
    {
      id: 'channel-1',
      name: 'general',
      type: ChannelType.TEXT,
      profileId: 'profile-1',
      serverId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'channel-2',
      name: 'voice-1',
      type: ChannelType.AUDIO,
      profileId: 'profile-1',
      serverId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'channel-3',
      name: 'video-1',
      type: ChannelType.VIDEO,
      profileId: 'profile-1',
      serverId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  members: [
    {
      id: 'member-1',
      role: MemberRole.ADMIN,
      profileId: 'profile-1',
      serverId: '1',
      profile: {
        id: 'profile-1',
        userId: 'user-1',
        name: 'Admin User',
        imageUrl: '/admin.png',
        email: 'admin@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'member-2',
      role: MemberRole.GUEST,
      profileId: 'profile-2',
      serverId: '1',
      profile: {
        id: 'profile-2',
        userId: 'user-2',
        name: 'Guest User',
        imageUrl: '/guest.png',
        email: 'guest@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
})

describe('ServerSidebar', () => {
  const mockServer = createMockServer()

  it('should render server header', () => {
    render(<ServerSidebar server={mockServer} role={MemberRole.ADMIN} currentProfileId="profile-1" />)
    
    expect(screen.getByTestId('server-header')).toBeInTheDocument()
    expect(screen.getByText('Test Server Header')).toBeInTheDocument()
  })

  it('should render server search with correct data', () => {
    render(<ServerSidebar server={mockServer} role={MemberRole.ADMIN} currentProfileId="profile-1" />)
    
    expect(screen.getByTestId('server-search')).toBeInTheDocument()
  })

  it('should render text channels section when text channels exist', () => {
    render(<ServerSidebar server={mockServer} role={MemberRole.ADMIN} currentProfileId="profile-1" />)
    
    expect(screen.getByText('Text Channels (channels)')).toBeInTheDocument()
    expect(screen.getByText('general')).toBeInTheDocument()
  })

  it('should render voice channels section when audio channels exist', () => {
    render(<ServerSidebar server={mockServer} role={MemberRole.ADMIN} currentProfileId="profile-1" />)
    
    expect(screen.getByText('Voice Channels (channels)')).toBeInTheDocument()
    expect(screen.getByText('voice-1')).toBeInTheDocument()
  })

  it('should render video channels section when video channels exist', () => {
    render(<ServerSidebar server={mockServer} role={MemberRole.ADMIN} currentProfileId="profile-1" />)
    
    expect(screen.getByText('Video Channels (channels)')).toBeInTheDocument()
    expect(screen.getByText('video-1')).toBeInTheDocument()
  })

  it('should render members section with correct members', () => {
    render(<ServerSidebar server={mockServer} role={MemberRole.ADMIN} currentProfileId="profile-1" />)
    
    expect(screen.getByText('Members (members)')).toBeInTheDocument()
    // Should only render other members, not the current user (profile-1)
    expect(screen.getByText('Guest User')).toBeInTheDocument()
    expect(screen.queryByText('Admin User')).not.toBeInTheDocument()
  })

  it('should use correct CSS classes matching Discord clone', () => {
    const { container } = render(<ServerSidebar server={mockServer} role={MemberRole.ADMIN} currentProfileId="profile-1" />)
    
    const sidebarContainer = container.firstChild as HTMLElement
    expect(sidebarContainer).toHaveClass('flex', 'flex-col', 'h-full', 'text-primary', 'w-full')
    expect(sidebarContainer).toHaveClass('dark:bg-[#2b2d31]', 'bg-[#f2f3f5]')
  })

  it('should render separator between search and channels', () => {
    render(<ServerSidebar server={mockServer} role={MemberRole.ADMIN} currentProfileId="profile-1" />)
    
    expect(screen.getByTestId('separator')).toBeInTheDocument()
  })

  it('should not render sections for empty channel types', () => {
    const serverWithoutChannels = {
      ...mockServer,
      channels: [],
    }
    
    render(<ServerSidebar server={serverWithoutChannels} role={MemberRole.ADMIN} currentProfileId="profile-1" />)
    
    expect(screen.queryByText('Text Channels (channels)')).not.toBeInTheDocument()
    expect(screen.queryByText('Voice Channels (channels)')).not.toBeInTheDocument()
    expect(screen.queryByText('Video Channels (channels)')).not.toBeInTheDocument()
  })

  it('should correctly filter current user from members list', () => {
    const currentProfileId = 'profile-1'
    render(<ServerSidebar server={mockServer} role={MemberRole.ADMIN} currentProfileId={currentProfileId} />)
    
    // Should not show the current user in members
    expect(screen.queryByText('Admin User')).not.toBeInTheDocument()
    // Should show other members
    expect(screen.getByText('Guest User')).toBeInTheDocument()
  })
})
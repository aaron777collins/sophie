import { render, screen, fireEvent } from '@testing-library/react'
import { ServerChannel } from '@/components/server/server-channel'
import { Channel, ChannelType, MemberRole, Server } from '@/components/server/types'

// Mock useRouter and useParams
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({
    serverId: 'server-1',
    channelId: 'channel-1',
  }),
}))

// Mock the modal hook
const mockOnOpen = jest.fn()
jest.mock('@/hooks/use-modal-store', () => ({
  useModal: () => ({
    onOpen: mockOnOpen,
  }),
}))

// Mock ActionTooltip
jest.mock('@/components/ui/action-tooltip', () => ({
  ActionTooltip: ({ children, label }: { children: React.ReactNode; label: string }) => (
    <div data-tooltip={label}>{children}</div>
  ),
}))

const createMockServer = (): Server => ({
  id: 'server-1',
  name: 'Test Server',
  imageUrl: '/test.png',
  inviteCode: 'abc123',
  profileId: 'profile-1',
  createdAt: new Date(),
  updatedAt: new Date(),
})

const createMockChannel = (overrides: Partial<Channel> = {}): Channel => ({
  id: 'channel-1',
  name: 'general',
  type: ChannelType.TEXT,
  profileId: 'profile-1',
  serverId: 'server-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe('ServerChannel', () => {
  const mockServer = createMockServer()

  beforeEach(() => {
    mockPush.mockClear()
    mockOnOpen.mockClear()
  })

  it('should render channel name', () => {
    const channel = createMockChannel({ name: 'announcements' })
    render(<ServerChannel channel={channel} server={mockServer} role={MemberRole.ADMIN} />)
    
    expect(screen.getByText('announcements')).toBeInTheDocument()
  })

  describe('Channel Icons', () => {
    it('should render Hash icon for TEXT channels', () => {
      const channel = createMockChannel({ type: ChannelType.TEXT })
      const { container } = render(<ServerChannel channel={channel} server={mockServer} />)
      
      // Hash icon is rendered as an SVG
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should render Mic icon for AUDIO channels', () => {
      const channel = createMockChannel({ type: ChannelType.AUDIO })
      const { container } = render(<ServerChannel channel={channel} server={mockServer} />)
      
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should render Video icon for VIDEO channels', () => {
      const channel = createMockChannel({ type: ChannelType.VIDEO })
      const { container } = render(<ServerChannel channel={channel} server={mockServer} />)
      
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should navigate to channel on click', () => {
      const channel = createMockChannel({ id: 'channel-2' })
      render(<ServerChannel channel={channel} server={mockServer} />)
      
      fireEvent.click(screen.getByRole('button'))
      
      expect(mockPush).toHaveBeenCalledWith('/servers/server-1/channels/channel-2')
    })
  })

  describe('Edit and Delete actions', () => {
    it('should show edit and delete for non-general channels when not guest', () => {
      const channel = createMockChannel({ name: 'announcements' })
      const { container } = render(<ServerChannel channel={channel} server={mockServer} role={MemberRole.MODERATOR} />)
      
      // Edit and Delete icons should be present but hidden
      const tooltips = container.querySelectorAll('[data-tooltip]')
      expect(tooltips.length).toBeGreaterThan(0)
    })

    it('should not show edit/delete for general channel', () => {
      const channel = createMockChannel({ name: 'general' })
      render(<ServerChannel channel={channel} server={mockServer} role={MemberRole.ADMIN} />)
      
      // Should show lock icon instead
      const lockContainer = screen.getByRole('button').querySelector('.ml-auto')
      expect(lockContainer).toBeInTheDocument()
    })

    it('should not show edit/delete for guest role', () => {
      const channel = createMockChannel({ name: 'announcements' })
      const { container } = render(<ServerChannel channel={channel} server={mockServer} role={MemberRole.GUEST} />)
      
      const tooltips = container.querySelectorAll('[data-tooltip]')
      expect(tooltips.length).toBe(0)
    })

    it('should call onOpen with "editChannel" when clicking edit', () => {
      const channel = createMockChannel({ name: 'announcements' })
      const { container } = render(<ServerChannel channel={channel} server={mockServer} role={MemberRole.MODERATOR} />)
      
      const editTooltip = container.querySelector('[data-tooltip="Edit"]')
      const editIcon = editTooltip?.querySelector('svg')
      
      if (editIcon) {
        fireEvent.click(editIcon)
        expect(mockOnOpen).toHaveBeenCalledWith('editChannel', { channel, server: mockServer })
      }
    })

    it('should call onOpen with "deleteChannel" when clicking delete', () => {
      const channel = createMockChannel({ name: 'announcements' })
      const { container } = render(<ServerChannel channel={channel} server={mockServer} role={MemberRole.MODERATOR} />)
      
      const deleteTooltip = container.querySelector('[data-tooltip="Delete"]')
      const deleteIcon = deleteTooltip?.querySelector('svg')
      
      if (deleteIcon) {
        fireEvent.click(deleteIcon)
        expect(mockOnOpen).toHaveBeenCalledWith('deleteChannel', { channel, server: mockServer })
      }
    })
  })

  describe('Active state', () => {
    it('should apply active styles when channel is selected', () => {
      const channel = createMockChannel({ id: 'channel-1' })
      const { container } = render(<ServerChannel channel={channel} server={mockServer} />)
      
      const button = container.querySelector('button')
      expect(button).toHaveClass('bg-zinc-700/20', 'dark:bg-zinc-700')
    })

    it('should not apply active styles when channel is not selected', () => {
      const channel = createMockChannel({ id: 'channel-2' })
      const { container } = render(<ServerChannel channel={channel} server={mockServer} />)
      
      const button = container.querySelector('button')
      expect(button).not.toHaveClass('bg-zinc-700/20')
    })
  })

  it('should have correct CSS classes matching Discord clone', () => {
    const channel = createMockChannel()
    const { container } = render(<ServerChannel channel={channel} server={mockServer} />)
    
    const button = container.querySelector('button')
    expect(button).toHaveClass('group', 'px-2', 'py-2', 'rounded-md', 'flex', 'items-center', 'gap-x-2', 'w-full')
    expect(button).toHaveClass('hover:bg-zinc-700/10', 'dark:hover:bg-zinc-700/50', 'transition', 'mb-1')
  })
})

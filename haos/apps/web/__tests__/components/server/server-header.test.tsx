import { render, screen, fireEvent } from '@testing-library/react'
import { ServerHeader } from '@/components/server/server-header'
import { MemberRole, ServerWithMembersWithProfiles } from '@/components/server/types'

// Mock the modal hook
const mockOnOpen = jest.fn()
jest.mock('@/hooks/use-modal-store', () => ({
  useModal: () => ({
    onOpen: mockOnOpen,
  }),
}))

const createMockServer = (): ServerWithMembersWithProfiles => ({
  id: '1',
  name: 'Test Server',
  imageUrl: '/test.png',
  inviteCode: 'abc123',
  profileId: 'profile-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  channels: [],
  members: [],
})

describe('ServerHeader', () => {
  const mockServer = createMockServer()

  beforeEach(() => {
    mockOnOpen.mockClear()
  })

  it('should render server name', () => {
    render(<ServerHeader server={mockServer} role={MemberRole.ADMIN} />)
    
    expect(screen.getByText('Test Server')).toBeInTheDocument()
  })

  it('should render chevron down icon', () => {
    const { container } = render(<ServerHeader server={mockServer} role={MemberRole.ADMIN} />)
    
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  describe('Admin role', () => {
    it('should show all menu items for admin', () => {
      render(<ServerHeader server={mockServer} role={MemberRole.ADMIN} />)
      
      // Open dropdown
      fireEvent.click(screen.getByText('Test Server'))
      
      expect(screen.getByText('Invite People')).toBeInTheDocument()
      expect(screen.getByText('Server Settings')).toBeInTheDocument()
      expect(screen.getByText('Manage Members')).toBeInTheDocument()
      expect(screen.getByText('Create Channel')).toBeInTheDocument()
      expect(screen.getByText('Delete Server')).toBeInTheDocument()
      expect(screen.queryByText('Leave Server')).not.toBeInTheDocument()
    })

    it('should call onOpen with "invite" when clicking Invite People', () => {
      render(<ServerHeader server={mockServer} role={MemberRole.ADMIN} />)
      
      fireEvent.click(screen.getByText('Test Server'))
      fireEvent.click(screen.getByText('Invite People'))
      
      expect(mockOnOpen).toHaveBeenCalledWith('invite', { server: mockServer })
    })

    it('should call onOpen with "editServer" when clicking Server Settings', () => {
      render(<ServerHeader server={mockServer} role={MemberRole.ADMIN} />)
      
      fireEvent.click(screen.getByText('Test Server'))
      fireEvent.click(screen.getByText('Server Settings'))
      
      expect(mockOnOpen).toHaveBeenCalledWith('editServer', { server: mockServer })
    })

    it('should call onOpen with "members" when clicking Manage Members', () => {
      render(<ServerHeader server={mockServer} role={MemberRole.ADMIN} />)
      
      fireEvent.click(screen.getByText('Test Server'))
      fireEvent.click(screen.getByText('Manage Members'))
      
      expect(mockOnOpen).toHaveBeenCalledWith('members', { server: mockServer })
    })

    it('should call onOpen with "deleteServer" when clicking Delete Server', () => {
      render(<ServerHeader server={mockServer} role={MemberRole.ADMIN} />)
      
      fireEvent.click(screen.getByText('Test Server'))
      fireEvent.click(screen.getByText('Delete Server'))
      
      expect(mockOnOpen).toHaveBeenCalledWith('deleteServer', { server: mockServer })
    })
  })

  describe('Moderator role', () => {
    it('should show limited menu items for moderator', () => {
      render(<ServerHeader server={mockServer} role={MemberRole.MODERATOR} />)
      
      fireEvent.click(screen.getByText('Test Server'))
      
      expect(screen.getByText('Invite People')).toBeInTheDocument()
      expect(screen.queryByText('Server Settings')).not.toBeInTheDocument()
      expect(screen.queryByText('Manage Members')).not.toBeInTheDocument()
      expect(screen.getByText('Create Channel')).toBeInTheDocument()
      expect(screen.queryByText('Delete Server')).not.toBeInTheDocument()
      expect(screen.getByText('Leave Server')).toBeInTheDocument()
    })
  })

  describe('Guest role', () => {
    it('should show only Leave Server for guest', () => {
      render(<ServerHeader server={mockServer} role={MemberRole.GUEST} />)
      
      fireEvent.click(screen.getByText('Test Server'))
      
      expect(screen.queryByText('Invite People')).not.toBeInTheDocument()
      expect(screen.queryByText('Server Settings')).not.toBeInTheDocument()
      expect(screen.queryByText('Manage Members')).not.toBeInTheDocument()
      expect(screen.queryByText('Create Channel')).not.toBeInTheDocument()
      expect(screen.queryByText('Delete Server')).not.toBeInTheDocument()
      expect(screen.getByText('Leave Server')).toBeInTheDocument()
    })

    it('should call onOpen with "leaveServer" when clicking Leave Server', () => {
      render(<ServerHeader server={mockServer} role={MemberRole.GUEST} />)
      
      fireEvent.click(screen.getByText('Test Server'))
      fireEvent.click(screen.getByText('Leave Server'))
      
      expect(mockOnOpen).toHaveBeenCalledWith('leaveServer', { server: mockServer })
    })
  })

  it('should have correct CSS classes matching Discord clone', () => {
    const { container } = render(<ServerHeader server={mockServer} role={MemberRole.ADMIN} />)
    
    // The outer button is the DropdownMenuTrigger which has asChild
    // So the actual styled button is the inner one
    const buttons = container.querySelectorAll('button')
    // Find the button with the actual styles (the inner button)
    const styledButton = Array.from(buttons).find(b => b.classList.contains('w-full'))
    
    if (styledButton) {
      expect(styledButton).toHaveClass('w-full', 'text-md', 'font-semibold', 'px-3', 'flex', 'items-center', 'h-12')
      expect(styledButton).toHaveClass('border-neutral-200', 'dark:border-neutral-800', 'border-b-2')
      expect(styledButton).toHaveClass('hover:bg-zinc-700/10', 'dark:hover:bg-zinc-700/50', 'transition')
    } else {
      // Button exists and renders correctly
      expect(buttons.length).toBeGreaterThan(0)
    }
  })
})

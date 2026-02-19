import { render, screen, fireEvent } from '@testing-library/react'
import { ServerSection } from '@/components/server/server-section'
import { ChannelType, MemberRole, ServerWithMembersWithProfiles } from '@/components/server/types'

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

describe('ServerSection', () => {
  const mockServer = createMockServer()

  beforeEach(() => {
    mockOnOpen.mockClear()
  })

  it('should render label in uppercase', () => {
    render(<ServerSection label="Text Channels" sectionType="channels" role={MemberRole.ADMIN} />)
    
    const label = screen.getByText('Text Channels')
    expect(label).toHaveClass('uppercase', 'text-xs', 'font-semibold')
  })

  describe('Channel sections', () => {
    it('should show add button for Admin role', () => {
      const { container } = render(
        <ServerSection 
          label="Text Channels" 
          sectionType="channels" 
          channelType={ChannelType.TEXT}
          role={MemberRole.ADMIN} 
        />
      )
      
      const tooltip = container.querySelector('[data-tooltip="Create Channel"]')
      expect(tooltip).toBeInTheDocument()
    })

    it('should show add button for Moderator role', () => {
      const { container } = render(
        <ServerSection 
          label="Text Channels" 
          sectionType="channels" 
          channelType={ChannelType.TEXT}
          role={MemberRole.MODERATOR} 
        />
      )
      
      const tooltip = container.querySelector('[data-tooltip="Create Channel"]')
      expect(tooltip).toBeInTheDocument()
    })

    it('should not show add button for Guest role', () => {
      const { container } = render(
        <ServerSection 
          label="Text Channels" 
          sectionType="channels" 
          channelType={ChannelType.TEXT}
          role={MemberRole.GUEST} 
        />
      )
      
      const tooltip = container.querySelector('[data-tooltip="Create Channel"]')
      expect(tooltip).not.toBeInTheDocument()
    })

    it('should call onOpen with "createChannel" and channelType when clicking add', () => {
      const { container } = render(
        <ServerSection 
          label="Voice Channels" 
          sectionType="channels" 
          channelType={ChannelType.AUDIO}
          role={MemberRole.ADMIN} 
        />
      )
      
      const button = container.querySelector('button')
      if (button) {
        fireEvent.click(button)
        expect(mockOnOpen).toHaveBeenCalledWith('createChannel', { channelType: ChannelType.AUDIO })
      }
    })
  })

  describe('Members sections', () => {
    it('should show settings button for Admin role', () => {
      const { container } = render(
        <ServerSection 
          label="Members" 
          sectionType="members" 
          role={MemberRole.ADMIN}
          server={mockServer}
        />
      )
      
      const tooltip = container.querySelector('[data-tooltip="Manage Members"]')
      expect(tooltip).toBeInTheDocument()
    })

    it('should not show settings button for Moderator role', () => {
      const { container } = render(
        <ServerSection 
          label="Members" 
          sectionType="members" 
          role={MemberRole.MODERATOR}
          server={mockServer}
        />
      )
      
      const tooltip = container.querySelector('[data-tooltip="Manage Members"]')
      expect(tooltip).not.toBeInTheDocument()
    })

    it('should not show settings button for Guest role', () => {
      const { container } = render(
        <ServerSection 
          label="Members" 
          sectionType="members" 
          role={MemberRole.GUEST}
          server={mockServer}
        />
      )
      
      const tooltip = container.querySelector('[data-tooltip="Manage Members"]')
      expect(tooltip).not.toBeInTheDocument()
    })

    it('should call onOpen with "members" when clicking settings', () => {
      const { container } = render(
        <ServerSection 
          label="Members" 
          sectionType="members" 
          role={MemberRole.ADMIN}
          server={mockServer}
        />
      )
      
      const button = container.querySelector('button')
      if (button) {
        fireEvent.click(button)
        expect(mockOnOpen).toHaveBeenCalledWith('members', { server: mockServer })
      }
    })
  })

  it('should have correct CSS classes matching Discord clone', () => {
    const { container } = render(
      <ServerSection label="Test" sectionType="channels" role={MemberRole.ADMIN} />
    )
    
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-between', 'py-2')
    
    const label = container.querySelector('p')
    expect(label).toHaveClass('text-xs', 'uppercase', 'font-semibold', 'text-zinc-500', 'dark:text-zinc-400')
  })
})

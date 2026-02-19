import { render, screen, fireEvent } from '@testing-library/react'
import { ServerMember } from '@/components/server/server-member'
import { Member, MemberRole, Profile, Server } from '@/components/server/types'

// Mock useRouter and useParams
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({
    serverId: 'server-1',
    memberId: 'member-1',
  }),
}))

// Mock UserAvatar
jest.mock('@/components/user-avatar', () => ({
  UserAvatar: ({ src, className }: { src: string; className: string }) => (
    <div data-testid="user-avatar" data-src={src} className={className}>Avatar</div>
  ),
}))

const createMockProfile = (overrides: Partial<Profile> = {}): Profile => ({
  id: 'profile-1',
  userId: 'user-1',
  name: 'Test User',
  imageUrl: '/test.png',
  email: 'test@test.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const createMockMember = (overrides: Partial<Member> = {}): Member => ({
  id: 'member-1',
  role: MemberRole.GUEST,
  profileId: 'profile-1',
  serverId: 'server-1',
  profile: createMockProfile(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const createMockServer = (): Server => ({
  id: 'server-1',
  name: 'Test Server',
  imageUrl: '/test.png',
  inviteCode: 'abc123',
  profileId: 'profile-1',
  createdAt: new Date(),
  updatedAt: new Date(),
})

describe('ServerMember', () => {
  const mockServer = createMockServer()

  beforeEach(() => {
    mockPush.mockClear()
  })

  it('should render member name', () => {
    const member = createMockMember({ profile: createMockProfile({ name: 'John Doe' }) })
    render(<ServerMember member={member} server={mockServer} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should render user avatar with correct src', () => {
    const member = createMockMember({ profile: createMockProfile({ imageUrl: '/avatar.png' }) })
    render(<ServerMember member={member} server={mockServer} />)
    
    const avatar = screen.getByTestId('user-avatar')
    expect(avatar).toHaveAttribute('data-src', '/avatar.png')
  })

  describe('Role Icons', () => {
    it('should not render icon for GUEST role', () => {
      const member = createMockMember({ role: MemberRole.GUEST })
      const { container } = render(<ServerMember member={member} server={mockServer} />)
      
      // Only the avatar SVG should be present (mocked)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBe(0) // No shield icons
    })

    it('should render ShieldCheck for MODERATOR role', () => {
      const member = createMockMember({ role: MemberRole.MODERATOR })
      const { container } = render(<ServerMember member={member} server={mockServer} />)
      
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('text-indigo-500')
    })

    it('should render ShieldAlert for ADMIN role', () => {
      const member = createMockMember({ role: MemberRole.ADMIN })
      const { container } = render(<ServerMember member={member} server={mockServer} />)
      
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('text-rose-500')
    })
  })

  describe('Navigation', () => {
    it('should navigate to conversation on click', () => {
      const member = createMockMember({ id: 'member-2' })
      render(<ServerMember member={member} server={mockServer} />)
      
      fireEvent.click(screen.getByRole('button'))
      
      expect(mockPush).toHaveBeenCalledWith('/servers/server-1/conversations/member-2')
    })
  })

  describe('Active state', () => {
    it('should apply active styles when member is selected', () => {
      const member = createMockMember({ id: 'member-1' })
      const { container } = render(<ServerMember member={member} server={mockServer} />)
      
      const button = container.querySelector('button')
      expect(button).toHaveClass('bg-zinc-700/20', 'dark:bg-zinc-700')
    })

    it('should not apply active styles when member is not selected', () => {
      const member = createMockMember({ id: 'member-2' })
      const { container } = render(<ServerMember member={member} server={mockServer} />)
      
      const button = container.querySelector('button')
      expect(button).not.toHaveClass('bg-zinc-700/20')
    })
  })

  it('should have correct CSS classes matching Discord clone', () => {
    const member = createMockMember()
    const { container } = render(<ServerMember member={member} server={mockServer} />)
    
    const button = container.querySelector('button')
    expect(button).toHaveClass('group', 'px-2', 'py-2', 'rounded-md', 'flex', 'items-center', 'gap-x-2', 'w-full')
    expect(button).toHaveClass('hover:bg-zinc-700/10', 'dark:hover:bg-zinc-700/50', 'transition', 'mb-1')
  })

  it('should apply correct text styles', () => {
    // Use a member id that doesn't match params.memberId ('member-1')
    const member = createMockMember({ id: 'member-other' })
    const { container } = render(<ServerMember member={member} server={mockServer} />)
    
    const nameElement = container.querySelector('p')
    expect(nameElement).toHaveClass('font-semibold', 'text-sm', 'text-zinc-500')
    expect(nameElement).toHaveClass('group-hover:text-zinc-600', 'dark:text-zinc-400', 'dark:group-hover:text-zinc-300')
  })
})

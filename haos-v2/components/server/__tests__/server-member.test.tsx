import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ServerMember } from "../server-member";
import { Member, MemberRole, Profile, Server } from "@/types";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({
    serverId: "test-server-id",
    memberId: null,
  }),
}));

// Mock Radix UI avatar
jest.mock("@radix-ui/react-avatar", () => ({
  Root: ({ children, className }: any) => (
    <div className={className} data-testid="avatar-root">{children}</div>
  ),
  Image: ({ src, className }: any) => (
    <img src={src} className={className} data-testid="avatar-image" alt="avatar" />
  ),
  Fallback: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

const createMockProfile = (overrides?: Partial<Profile>): Profile => ({
  id: "profile-1",
  userId: "user-1",
  name: "Test User",
  imageUrl: "https://example.com/avatar.png",
  email: "test@example.com",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const createMockMember = (overrides?: Partial<Member & { profile: Profile }>): Member & { profile: Profile } => ({
  id: "member-1",
  role: MemberRole.GUEST,
  profileId: "profile-1",
  serverId: "server-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  profile: createMockProfile(),
  ...overrides,
});

const createMockServer = (): Server => ({
  id: "server-1",
  name: "Test Server",
  imageUrl: "https://example.com/image.png",
  inviteCode: "abc123",
  profileId: "profile-1",
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("ServerMember", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders the member name", () => {
    const member = createMockMember({ profile: createMockProfile({ name: "John Doe" }) });
    const server = createMockServer();
    render(<ServerMember member={member} server={server} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders the avatar", () => {
    const member = createMockMember();
    const server = createMockServer();
    render(<ServerMember member={member} server={server} />);
    expect(screen.getByTestId("avatar-root")).toBeInTheDocument();
  });

  it("renders avatar with correct image URL", () => {
    const member = createMockMember({
      profile: createMockProfile({ imageUrl: "https://example.com/custom-avatar.png" }),
    });
    const server = createMockServer();
    render(<ServerMember member={member} server={server} />);
    const img = screen.getByTestId("avatar-image");
    expect(img).toHaveAttribute("src", "https://example.com/custom-avatar.png");
  });

  it("navigates to conversation on click", () => {
    const member = createMockMember({ id: "member-123" });
    const server = createMockServer();
    render(<ServerMember member={member} server={server} />);
    
    fireEvent.click(screen.getByRole("button"));
    expect(mockPush).toHaveBeenCalledWith("/servers/test-server-id/conversations/member-123");
  });

  it("renders shield icon for MODERATOR role", () => {
    const member = createMockMember({ role: MemberRole.MODERATOR });
    const server = createMockServer();
    const { container } = render(<ServerMember member={member} server={server} />);
    // ShieldCheck icon should be present
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders shield alert icon for ADMIN role", () => {
    const member = createMockMember({ role: MemberRole.ADMIN });
    const server = createMockServer();
    const { container } = render(<ServerMember member={member} server={server} />);
    // ShieldAlert icon should be present
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("does not render icon for GUEST role", () => {
    const member = createMockMember({ role: MemberRole.GUEST });
    const server = createMockServer();
    const { container } = render(<ServerMember member={member} server={server} />);
    // No shield icon for guest
    const svgs = container.querySelectorAll("svg");
    // There might be no SVGs or just the avatar placeholder
    expect(svgs.length).toBe(0);
  });

  it("has correct styling classes", () => {
    const member = createMockMember();
    const server = createMockServer();
    render(<ServerMember member={member} server={server} />);
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("group");
    expect(button).toHaveClass("px-2");
    expect(button).toHaveClass("py-2");
    expect(button).toHaveClass("rounded-md");
    expect(button).toHaveClass("flex");
    expect(button).toHaveClass("items-center");
    expect(button).toHaveClass("gap-x-2");
    expect(button).toHaveClass("w-full");
  });

  it("has hover styling", () => {
    const member = createMockMember();
    const server = createMockServer();
    render(<ServerMember member={member} server={server} />);
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("hover:bg-zinc-700/10");
    expect(button).toHaveClass("dark:hover:bg-zinc-700/50");
  });

  it("has correct avatar size classes", () => {
    const member = createMockMember();
    const server = createMockServer();
    render(<ServerMember member={member} server={server} />);
    
    const avatar = screen.getByTestId("avatar-root");
    expect(avatar).toHaveClass("h-8");
    expect(avatar).toHaveClass("w-8");
  });
});

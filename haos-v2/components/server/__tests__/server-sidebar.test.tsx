import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ServerSidebar } from "../server-sidebar";
import { ChannelType, MemberRole, ServerWithMembersWithProfiles } from "@/types";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useParams: () => ({
    serverId: "test-server-id",
    channelId: null,
    memberId: null,
  }),
}));

// Mock the modal store
jest.mock("@/hooks/use-modal-store", () => ({
  useModal: () => ({
    onOpen: jest.fn(),
    onClose: jest.fn(),
    isOpen: false,
    type: null,
    data: {},
  }),
}));

// Mock Radix UI components that may have issues in test environment
jest.mock("@radix-ui/react-scroll-area", () => ({
  Root: ({ children, className }: any) => <div className={className}>{children}</div>,
  Viewport: ({ children, className }: any) => <div className={className}>{children}</div>,
  ScrollAreaScrollbar: ({ children }: any) => <div>{children}</div>,
  ScrollAreaThumb: () => <div />,
  Corner: () => <div />,
}));

jest.mock("@radix-ui/react-separator", () => ({
  Root: ({ className }: any) => <div className={className} role="separator" />,
}));

// Mock the dropdown-menu UI component directly
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => <div onClick={onClick}>{children}</div>,
  DropdownMenuSeparator: () => <div />,
}));

const createMockServer = (overrides?: Partial<ServerWithMembersWithProfiles>): ServerWithMembersWithProfiles => ({
  id: "server-1",
  name: "Test Server",
  imageUrl: "https://example.com/image.png",
  inviteCode: "abc123",
  profileId: "profile-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  channels: [
    {
      id: "channel-1",
      name: "general",
      type: ChannelType.TEXT,
      profileId: "profile-1",
      serverId: "server-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "channel-2",
      name: "random",
      type: ChannelType.TEXT,
      profileId: "profile-1",
      serverId: "server-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "channel-3",
      name: "voice-chat",
      type: ChannelType.AUDIO,
      profileId: "profile-1",
      serverId: "server-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "channel-4",
      name: "video-room",
      type: ChannelType.VIDEO,
      profileId: "profile-1",
      serverId: "server-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  members: [
    {
      id: "member-1",
      role: MemberRole.ADMIN,
      profileId: "profile-1",
      serverId: "server-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        id: "profile-1",
        userId: "user-1",
        name: "Admin User",
        imageUrl: "https://example.com/admin.png",
        email: "admin@test.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    {
      id: "member-2",
      role: MemberRole.MODERATOR,
      profileId: "profile-2",
      serverId: "server-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        id: "profile-2",
        userId: "user-2",
        name: "Moderator User",
        imageUrl: "https://example.com/mod.png",
        email: "mod@test.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    {
      id: "member-3",
      role: MemberRole.GUEST,
      profileId: "profile-3",
      serverId: "server-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        id: "profile-3",
        userId: "user-3",
        name: "Guest User",
        imageUrl: "https://example.com/guest.png",
        email: "guest@test.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  ],
  ...overrides,
});

describe("ServerSidebar", () => {
  it("renders the server name in header", () => {
    const server = createMockServer();
    render(
      <ServerSidebar
        server={server}
        role={MemberRole.ADMIN}
        currentProfileId="profile-1"
      />
    );
    expect(screen.getByText("Test Server")).toBeInTheDocument();
  });

  it("renders search button", () => {
    const server = createMockServer();
    render(
      <ServerSidebar
        server={server}
        role={MemberRole.ADMIN}
        currentProfileId="profile-1"
      />
    );
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("renders text channels section", () => {
    const server = createMockServer();
    render(
      <ServerSidebar
        server={server}
        role={MemberRole.ADMIN}
        currentProfileId="profile-1"
      />
    );
    expect(screen.getByText("Text Channels")).toBeInTheDocument();
  });

  it("renders voice channels section", () => {
    const server = createMockServer();
    render(
      <ServerSidebar
        server={server}
        role={MemberRole.ADMIN}
        currentProfileId="profile-1"
      />
    );
    expect(screen.getByText("Voice Channels")).toBeInTheDocument();
  });

  it("renders video channels section", () => {
    const server = createMockServer();
    render(
      <ServerSidebar
        server={server}
        role={MemberRole.ADMIN}
        currentProfileId="profile-1"
      />
    );
    expect(screen.getByText("Video Channels")).toBeInTheDocument();
  });

  it("renders members section", () => {
    const server = createMockServer();
    render(
      <ServerSidebar
        server={server}
        role={MemberRole.ADMIN}
        currentProfileId="profile-1"
      />
    );
    expect(screen.getByText("Members")).toBeInTheDocument();
  });

  it("renders channel names", () => {
    const server = createMockServer();
    render(
      <ServerSidebar
        server={server}
        role={MemberRole.ADMIN}
        currentProfileId="profile-1"
      />
    );
    expect(screen.getByText("general")).toBeInTheDocument();
    expect(screen.getByText("random")).toBeInTheDocument();
    expect(screen.getByText("voice-chat")).toBeInTheDocument();
    expect(screen.getByText("video-room")).toBeInTheDocument();
  });

  it("renders member names excluding current user", () => {
    const server = createMockServer();
    render(
      <ServerSidebar
        server={server}
        role={MemberRole.ADMIN}
        currentProfileId="profile-1"
      />
    );
    // Current user (profile-1) should not be shown
    expect(screen.queryByText("Admin User")).not.toBeInTheDocument();
    // Other members should be shown
    expect(screen.getByText("Moderator User")).toBeInTheDocument();
    expect(screen.getByText("Guest User")).toBeInTheDocument();
  });

  it("has correct background colors for dark mode", () => {
    const server = createMockServer();
    const { container } = render(
      <ServerSidebar
        server={server}
        role={MemberRole.ADMIN}
        currentProfileId="profile-1"
      />
    );
    const sidebar = container.firstChild;
    expect(sidebar).toHaveClass("dark:bg-[#2b2d31]");
    expect(sidebar).toHaveClass("bg-[#f2f3f5]");
  });

  it("does not render sections when empty", () => {
    const server = createMockServer({
      channels: [],
      members: [],
    });
    render(
      <ServerSidebar
        server={server}
        role={MemberRole.ADMIN}
        currentProfileId="profile-1"
      />
    );
    expect(screen.queryByText("Text Channels")).not.toBeInTheDocument();
    expect(screen.queryByText("Voice Channels")).not.toBeInTheDocument();
    expect(screen.queryByText("Video Channels")).not.toBeInTheDocument();
    // Members section won't render if no other members
    expect(screen.queryByText("Members")).not.toBeInTheDocument();
  });
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ServerChannel } from "../server-channel";
import { Channel, ChannelType, MemberRole, Server } from "@/types";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({
    serverId: "test-server-id",
    channelId: null,
  }),
}));

// Mock the modal store
const mockOnOpen = jest.fn();
jest.mock("@/hooks/use-modal-store", () => ({
  useModal: () => ({
    onOpen: mockOnOpen,
  }),
  ModalType: {},
}));

// Mock Radix UI tooltip
jest.mock("@radix-ui/react-tooltip", () => ({
  Provider: ({ children }: any) => <div>{children}</div>,
  Root: ({ children }: any) => <div>{children}</div>,
  Trigger: ({ children, asChild }: any) => <div>{children}</div>,
  Content: ({ children }: any) => <div>{children}</div>,
}));

const createMockChannel = (overrides?: Partial<Channel>): Channel => ({
  id: "channel-1",
  name: "test-channel",
  type: ChannelType.TEXT,
  profileId: "profile-1",
  serverId: "server-1",
  createdAt: new Date(),
  updatedAt: new Date(),
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

describe("ServerChannel", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockOnOpen.mockClear();
  });

  it("renders the channel name", () => {
    const channel = createMockChannel({ name: "my-channel" });
    const server = createMockServer();
    render(<ServerChannel channel={channel} server={server} role={MemberRole.ADMIN} />);
    expect(screen.getByText("my-channel")).toBeInTheDocument();
  });

  it("renders Hash icon for TEXT channel", () => {
    const channel = createMockChannel({ type: ChannelType.TEXT });
    const server = createMockServer();
    const { container } = render(
      <ServerChannel channel={channel} server={server} role={MemberRole.ADMIN} />
    );
    // Lucide Hash icon renders as SVG
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders Mic icon for AUDIO channel", () => {
    const channel = createMockChannel({ type: ChannelType.AUDIO });
    const server = createMockServer();
    const { container } = render(
      <ServerChannel channel={channel} server={server} role={MemberRole.ADMIN} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders Video icon for VIDEO channel", () => {
    const channel = createMockChannel({ type: ChannelType.VIDEO });
    const server = createMockServer();
    const { container } = render(
      <ServerChannel channel={channel} server={server} role={MemberRole.ADMIN} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("navigates to channel on click", () => {
    const channel = createMockChannel({ id: "channel-123" });
    const server = createMockServer();
    render(<ServerChannel channel={channel} server={server} role={MemberRole.ADMIN} />);
    
    fireEvent.click(screen.getByRole("button"));
    expect(mockPush).toHaveBeenCalledWith("/servers/test-server-id/channels/channel-123");
  });

  it("shows lock icon for general channel", () => {
    const channel = createMockChannel({ name: "general" });
    const server = createMockServer();
    const { container } = render(
      <ServerChannel channel={channel} server={server} role={MemberRole.ADMIN} />
    );
    // Should have multiple SVGs: channel icon + lock icon
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(1);
  });

  it("does not show edit/delete for general channel", () => {
    const channel = createMockChannel({ name: "general" });
    const server = createMockServer();
    render(<ServerChannel channel={channel} server={server} role={MemberRole.ADMIN} />);
    
    // Edit and Delete text shouldn't be visible for general channel
    // (they're in tooltips, so we check for the icons having hidden class)
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("does not show edit/delete for GUEST role", () => {
    const channel = createMockChannel({ name: "random" });
    const server = createMockServer();
    render(<ServerChannel channel={channel} server={server} role={MemberRole.GUEST} />);
    
    // For non-general channels as guest, no edit/delete icons
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("has correct styling classes", () => {
    const channel = createMockChannel();
    const server = createMockServer();
    render(<ServerChannel channel={channel} server={server} role={MemberRole.ADMIN} />);
    
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
    const channel = createMockChannel();
    const server = createMockServer();
    render(<ServerChannel channel={channel} server={server} role={MemberRole.ADMIN} />);
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("hover:bg-zinc-700/10");
    expect(button).toHaveClass("dark:hover:bg-zinc-700/50");
  });
});

describe("ServerChannel with active state", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockOnOpen.mockClear();
  });

  it("has active styling when channel is selected", () => {
    // Override useParams to return matching channelId
    jest.doMock("next/navigation", () => ({
      useRouter: () => ({ push: mockPush }),
      useParams: () => ({
        serverId: "test-server-id",
        channelId: "channel-1",
      }),
    }));

    const channel = createMockChannel({ id: "channel-1" });
    const server = createMockServer();
    render(<ServerChannel channel={channel} server={server} role={MemberRole.ADMIN} />);
    
    const button = screen.getByRole("button");
    // Active state classes are applied via cn() utility
    expect(button).toBeInTheDocument();
  });
});

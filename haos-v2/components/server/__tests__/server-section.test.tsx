import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ServerSection } from "../server-section";
import { ChannelType, MemberRole, ServerWithMembersWithProfiles } from "@/types";

// Mock the modal store
const mockOnOpen = jest.fn();
jest.mock("@/hooks/use-modal-store", () => ({
  useModal: () => ({
    onOpen: mockOnOpen,
  }),
}));

// Mock Radix UI tooltip
jest.mock("@radix-ui/react-tooltip", () => ({
  Provider: ({ children }: any) => <div>{children}</div>,
  Root: ({ children }: any) => <div>{children}</div>,
  Trigger: ({ children, asChild }: any) => <div data-testid="tooltip-trigger">{children}</div>,
  Content: ({ children, side }: any) => <div data-testid="tooltip-content">{children}</div>,
}));

const createMockServer = (): ServerWithMembersWithProfiles => ({
  id: "server-1",
  name: "Test Server",
  imageUrl: "https://example.com/image.png",
  inviteCode: "abc123",
  profileId: "profile-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  channels: [],
  members: [],
});

describe("ServerSection", () => {
  beforeEach(() => {
    mockOnOpen.mockClear();
  });

  it("renders the section label", () => {
    render(
      <ServerSection
        label="Text Channels"
        sectionType="channels"
        role={MemberRole.ADMIN}
      />
    );
    expect(screen.getByText("Text Channels")).toBeInTheDocument();
  });

  it("renders label with uppercase styling", () => {
    render(
      <ServerSection
        label="Text Channels"
        sectionType="channels"
        role={MemberRole.ADMIN}
      />
    );
    const label = screen.getByText("Text Channels");
    expect(label).toHaveClass("uppercase");
    expect(label).toHaveClass("text-xs");
    expect(label).toHaveClass("font-semibold");
  });

  it("renders label with correct color classes", () => {
    render(
      <ServerSection
        label="Text Channels"
        sectionType="channels"
        role={MemberRole.ADMIN}
      />
    );
    const label = screen.getByText("Text Channels");
    expect(label).toHaveClass("text-zinc-500");
    expect(label).toHaveClass("dark:text-zinc-400");
  });

  describe("channels sectionType", () => {
    it("shows plus button for ADMIN role", () => {
      const { container } = render(
        <ServerSection
          label="Text Channels"
          sectionType="channels"
          channelType={ChannelType.TEXT}
          role={MemberRole.ADMIN}
        />
      );
      // Plus icon should be rendered
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("shows plus button for MODERATOR role", () => {
      const { container } = render(
        <ServerSection
          label="Text Channels"
          sectionType="channels"
          channelType={ChannelType.TEXT}
          role={MemberRole.MODERATOR}
        />
      );
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("does not show plus button for GUEST role", () => {
      const { container } = render(
        <ServerSection
          label="Text Channels"
          sectionType="channels"
          channelType={ChannelType.TEXT}
          role={MemberRole.GUEST}
        />
      );
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBe(0);
    });

    it("calls onOpen with createChannel when plus button clicked", () => {
      const { container } = render(
        <ServerSection
          label="Text Channels"
          sectionType="channels"
          channelType={ChannelType.TEXT}
          role={MemberRole.ADMIN}
        />
      );
      const button = container.querySelector("button");
      if (button) {
        fireEvent.click(button);
        expect(mockOnOpen).toHaveBeenCalledWith("createChannel", { channelType: ChannelType.TEXT });
      }
    });

    it("passes correct channelType for AUDIO channels", () => {
      const { container } = render(
        <ServerSection
          label="Voice Channels"
          sectionType="channels"
          channelType={ChannelType.AUDIO}
          role={MemberRole.ADMIN}
        />
      );
      const button = container.querySelector("button");
      if (button) {
        fireEvent.click(button);
        expect(mockOnOpen).toHaveBeenCalledWith("createChannel", { channelType: ChannelType.AUDIO });
      }
    });

    it("passes correct channelType for VIDEO channels", () => {
      const { container } = render(
        <ServerSection
          label="Video Channels"
          sectionType="channels"
          channelType={ChannelType.VIDEO}
          role={MemberRole.ADMIN}
        />
      );
      const button = container.querySelector("button");
      if (button) {
        fireEvent.click(button);
        expect(mockOnOpen).toHaveBeenCalledWith("createChannel", { channelType: ChannelType.VIDEO });
      }
    });
  });

  describe("members sectionType", () => {
    it("shows settings button for ADMIN role", () => {
      const server = createMockServer();
      const { container } = render(
        <ServerSection
          label="Members"
          sectionType="members"
          role={MemberRole.ADMIN}
          server={server}
        />
      );
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("does not show settings button for MODERATOR role", () => {
      const server = createMockServer();
      const { container } = render(
        <ServerSection
          label="Members"
          sectionType="members"
          role={MemberRole.MODERATOR}
          server={server}
        />
      );
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBe(0);
    });

    it("does not show settings button for GUEST role", () => {
      const server = createMockServer();
      const { container } = render(
        <ServerSection
          label="Members"
          sectionType="members"
          role={MemberRole.GUEST}
          server={server}
        />
      );
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBe(0);
    });

    it("calls onOpen with members modal when settings button clicked", () => {
      const server = createMockServer();
      const { container } = render(
        <ServerSection
          label="Members"
          sectionType="members"
          role={MemberRole.ADMIN}
          server={server}
        />
      );
      const button = container.querySelector("button");
      if (button) {
        fireEvent.click(button);
        expect(mockOnOpen).toHaveBeenCalledWith("members", { server });
      }
    });
  });

  it("has correct container styling", () => {
    const { container } = render(
      <ServerSection
        label="Text Channels"
        sectionType="channels"
        role={MemberRole.ADMIN}
      />
    );
    const div = container.firstChild;
    expect(div).toHaveClass("flex");
    expect(div).toHaveClass("items-center");
    expect(div).toHaveClass("justify-between");
    expect(div).toHaveClass("py-2");
  });
});

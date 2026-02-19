import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ServerHeader } from "../server-header";
import { MemberRole, ServerWithMembersWithProfiles } from "@/types";

// Mock the modal store
const mockOnOpen = jest.fn();
jest.mock("@/hooks/use-modal-store", () => ({
  useModal: () => ({
    onOpen: mockOnOpen,
    onClose: jest.fn(),
    isOpen: false,
    type: null,
    data: {},
  }),
}));

// Mock the dropdown-menu UI component directly
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-root">{children}</div>,
  DropdownMenuTrigger: ({ children, asChild, ...props }: any) => (
    <div data-testid="dropdown-trigger" {...props}>{children}</div>
  ),
  DropdownMenuContent: ({ children, className }: any) => (
    <div data-testid="dropdown-content" className={className}>{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick, className }: any) => (
    <div data-testid="dropdown-item" onClick={onClick} className={className}>{children}</div>
  ),
  DropdownMenuSeparator: () => <div data-testid="dropdown-separator" />,
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

describe("ServerHeader", () => {
  beforeEach(() => {
    mockOnOpen.mockClear();
  });

  it("renders the server name", () => {
    const server = createMockServer();
    render(<ServerHeader server={server} role={MemberRole.ADMIN} />);
    expect(screen.getByText("Test Server")).toBeInTheDocument();
  });

  it("renders the chevron icon", () => {
    const server = createMockServer();
    const { container } = render(<ServerHeader server={server} role={MemberRole.ADMIN} />);
    // Lucide icons render as SVGs
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  describe("Admin role", () => {
    it("shows Invite People option", () => {
      const server = createMockServer();
      render(<ServerHeader server={server} role={MemberRole.ADMIN} />);
      expect(screen.getByText("Invite People")).toBeInTheDocument();
    });

    it("shows Server Settings option", () => {
      const server = createMockServer();
      render(<ServerHeader server={server} role={MemberRole.ADMIN} />);
      expect(screen.getByText("Server Settings")).toBeInTheDocument();
    });

    it("shows Manage Members option", () => {
      const server = createMockServer();
      render(<ServerHeader server={server} role={MemberRole.ADMIN} />);
      expect(screen.getByText("Manage Members")).toBeInTheDocument();
    });

    it("shows Create Channel option", () => {
      const server = createMockServer();
      render(<ServerHeader server={server} role={MemberRole.ADMIN} />);
      expect(screen.getByText("Create Channel")).toBeInTheDocument();
    });

    it("shows Delete Server option", () => {
      const server = createMockServer();
      render(<ServerHeader server={server} role={MemberRole.ADMIN} />);
      expect(screen.getByText("Delete Server")).toBeInTheDocument();
    });

    it("does not show Leave Server option", () => {
      const server = createMockServer();
      render(<ServerHeader server={server} role={MemberRole.ADMIN} />);
      expect(screen.queryByText("Leave Server")).not.toBeInTheDocument();
    });

    it("calls onOpen with invite modal when clicking Invite People", () => {
      const server = createMockServer();
      render(<ServerHeader server={server} role={MemberRole.ADMIN} />);
      fireEvent.click(screen.getByText("Invite People"));
      expect(mockOnOpen).toHaveBeenCalledWith("invite", { server });
    });

    it("calls onOpen with editServer modal when clicking Server Settings", () => {
      const server = createMockServer();
      render(<ServerHeader server={server} role={MemberRole.ADMIN} />);
      fireEvent.click(screen.getByText("Server Settings"));
      expect(mockOnOpen).toHaveBeenCalledWith("editServer", { server });
    });
  });

  describe("Moderator role", () => {
    it("shows Invite People option", () => {
      const server = createMockServer();
      render(<ServerHeader server={server} role={MemberRole.MODERATOR} />);
      expect(screen.getByText("Invite People")).toBeInTheDocument();
    });

    it("shows Create Channel option", () => {
      const server = createMockServer();
      render(<ServerHeader server={server} role={MemberRole.MODERATOR} />);
      expect(screen.getByText("Create Channel")).toBeInTheDocument();
    });

    it("does not show Server Settings option", () => {
      const server = createMockServer();
      render(<ServerHeader server={server} role={MemberRole.MODERATOR} />);
      expect(screen.queryByText("Server Settings")).not.toBeInTheDocument();
    });

    it("does not show Delete Server option", () => {
      const server = createMockServer();
      render(<ServerHeader server={server} role={MemberRole.MODERATOR} />);
      expect(screen.queryByText("Delete Server")).not.toBeInTheDocument();
    });

    it("shows Leave Server option", () => {
      const server = createMockServer();
      render(<ServerHeader server={server} role={MemberRole.MODERATOR} />);
      expect(screen.getByText("Leave Server")).toBeInTheDocument();
    });
  });

  describe("Guest role", () => {
    it("does not show Invite People option", () => {
      const server = createMockServer();
      render(<ServerHeader server={server} role={MemberRole.GUEST} />);
      expect(screen.queryByText("Invite People")).not.toBeInTheDocument();
    });

    it("does not show Create Channel option", () => {
      const server = createMockServer();
      render(<ServerHeader server={server} role={MemberRole.GUEST} />);
      expect(screen.queryByText("Create Channel")).not.toBeInTheDocument();
    });

    it("shows Leave Server option", () => {
      const server = createMockServer();
      render(<ServerHeader server={server} role={MemberRole.GUEST} />);
      expect(screen.getByText("Leave Server")).toBeInTheDocument();
    });
  });

  it("has correct styling on trigger button", () => {
    const server = createMockServer();
    render(<ServerHeader server={server} role={MemberRole.ADMIN} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("w-full");
    expect(button).toHaveClass("h-12");
    expect(button).toHaveClass("border-b-2");
  });
});

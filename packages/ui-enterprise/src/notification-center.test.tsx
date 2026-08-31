/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationCenter, NotificationDetail, NotificationBell } from "./notification-center";
import type { NotificationItem, NotificationCounts } from "./notification-center";

const mockNotification: NotificationItem = {
  id: "n1",
  type: "system",
  title: "Test Notification",
  message: "This is a test notification",
  summary: "Test summary",
  severity: "info",
  category: "system",
  timestamp: new Date().toISOString(),
  read: false,
  acknowledged: false,
  dismissed: false,
  source: "test",
  deepLink: "/dashboard",
  relatedEntityId: null,
  relatedEntityType: null,
  groupKey: null,
};

const mockNotificationRead: NotificationItem = {
  ...mockNotification,
  id: "n2",
  title: "Read Notification",
  read: true,
};

const mockNotificationAcknowledged: NotificationItem = {
  ...mockNotification,
  id: "n3",
  title: "Acknowledged Notification",
  read: true,
  acknowledged: true,
};

const mockCounts: NotificationCounts = {
  total: 3,
  unread: 1,
  acknowledged: 1,
  dismissed: 0,
};

describe("NotificationCenter", () => {
  it("renders without crashing", () => {
    render(<NotificationCenter items={[]} />);
    expect(screen.getByText("Notifications")).toBeTruthy();
  });

  it("shows empty state when no items", () => {
    render(<NotificationCenter items={[]} />);
    expect(screen.getByText("All caught up!")).toBeTruthy();
  });

  it("renders notification items", () => {
    render(<NotificationCenter items={[mockNotification, mockNotificationRead]} />);
    expect(screen.getByText("Test Notification")).toBeTruthy();
    expect(screen.getByText("Read Notification")).toBeTruthy();
  });

  it("shows unread count badge", () => {
    render(
      <NotificationCenter items={[mockNotification, mockNotificationRead]} counts={mockCounts} />,
    );
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("shows filter tabs", () => {
    render(<NotificationCenter items={[mockNotification]} />);
    expect(screen.getByText(/All/)).toBeTruthy();
    expect(screen.getByText(/Unread/)).toBeTruthy();
    expect(screen.getByText(/Acknowledged/)).toBeTruthy();
  });

  it("calls onMarkRead when mark read button clicked", () => {
    const onMarkRead = vi.fn();
    render(<NotificationCenter items={[mockNotification]} onMarkRead={onMarkRead} />);
    const markReadButtons = screen.getAllByLabelText("Mark as read");
    expect(markReadButtons[0]).toBeDefined();
    fireEvent.click(markReadButtons[0]!);
    expect(onMarkRead).toHaveBeenCalledWith("n1");
  });

  it("calls onAcknowledge when acknowledge button clicked", () => {
    const onAcknowledge = vi.fn();
    render(<NotificationCenter items={[mockNotification]} onAcknowledge={onAcknowledge} />);
    const ackButtons = screen.getAllByLabelText("Acknowledge");
    expect(ackButtons[0]).toBeDefined();
    fireEvent.click(ackButtons[0]!);
    expect(onAcknowledge).toHaveBeenCalledWith("n1");
  });

  it("calls onDismiss when dismiss button clicked", () => {
    const onDismiss = vi.fn();
    render(<NotificationCenter items={[mockNotification]} onDismiss={onDismiss} />);
    const dismissButtons = screen.getAllByLabelText("Dismiss");
    expect(dismissButtons[0]).toBeDefined();
    fireEvent.click(dismissButtons[0]!);
    expect(onDismiss).toHaveBeenCalledWith("n1");
  });

  it("calls onMarkAllRead when mark all read clicked", () => {
    const onMarkAllRead = vi.fn();
    render(
      <NotificationCenter
        items={[mockNotification]}
        counts={mockCounts}
        onMarkAllRead={onMarkAllRead}
      />,
    );
    const markAllButton = screen.getByText("Mark all read");
    fireEvent.click(markAllButton);
    expect(onMarkAllRead).toHaveBeenCalled();
  });

  it("shows severity indicator", () => {
    render(<NotificationCenter items={[mockNotification]} />);
    expect(screen.getByLabelText("Severity: info")).toBeTruthy();
  });

  it("shows category badge", () => {
    render(<NotificationCenter items={[mockNotification]} />);
    expect(screen.getByText("System")).toBeTruthy();
  });

  it("shows category filters when categoryCounts provided", () => {
    const categoryCounts = { system: 2, security: 1 };
    render(<NotificationCenter items={[mockNotification]} categoryCounts={categoryCounts} />);
    expect(screen.getAllByText(/System/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Security/).length).toBeGreaterThan(0);
  });

  it("shows severity filters when severityCounts provided", () => {
    const severityCounts = { info: 2, error: 1 };
    render(<NotificationCenter items={[mockNotification]} severityCounts={severityCounts} />);
    expect(screen.getByText(/info/)).toBeTruthy();
    expect(screen.getByText(/error/)).toBeTruthy();
  });

  it("shows loading state", () => {
    render(<NotificationCenter items={[]} loading={true} />);
    expect(screen.getByLabelText("Notifications")).toBeTruthy();
  });

  it("renders notification detail when item clicked", () => {
    render(<NotificationCenter items={[mockNotification]} />);
    const item = screen.getByText("Test Notification");
    fireEvent.click(item);
    expect(screen.getByText("Test summary")).toBeTruthy();
  });
});

describe("NotificationDetail", () => {
  it("renders notification details", () => {
    render(<NotificationDetail notification={mockNotification} />);
    expect(screen.getByText("Test Notification")).toBeTruthy();
    expect(screen.getByText("This is a test notification")).toBeTruthy();
    expect(screen.getByText("Source: test")).toBeTruthy();
  });

  it("shows deep link button", () => {
    const onNavigate = vi.fn();
    render(<NotificationDetail notification={mockNotification} onNavigate={onNavigate} />);
    const viewButton = screen.getByText("View");
    fireEvent.click(viewButton);
    expect(onNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("shows mark read button for unread notifications", () => {
    const onMarkRead = vi.fn();
    render(<NotificationDetail notification={mockNotification} onMarkRead={onMarkRead} />);
    expect(screen.getByText("Mark Read")).toBeTruthy();
  });

  it("does not show mark read button for read notifications", () => {
    render(<NotificationDetail notification={mockNotificationRead} />);
    expect(screen.queryByText("Mark Read")).toBeNull();
  });

  it("shows acknowledge button for unacknowledged notifications", () => {
    const onAcknowledge = vi.fn();
    render(<NotificationDetail notification={mockNotification} onAcknowledge={onAcknowledge} />);
    expect(screen.getByText("Acknowledge")).toBeTruthy();
  });

  it("does not show acknowledge button for acknowledged notifications", () => {
    render(<NotificationDetail notification={mockNotificationAcknowledged} />);
    expect(screen.queryByText("Acknowledge")).toBeNull();
  });

  it("shows dismiss button", () => {
    const onDismiss = vi.fn();
    render(<NotificationDetail notification={mockNotification} onDismiss={onDismiss} />);
    expect(screen.getByText("Dismiss")).toBeTruthy();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<NotificationDetail notification={mockNotification} onClose={onClose} />);
    const closeButton = screen.getByLabelText("Close detail");
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it("shows related entity info", () => {
    const notificationWithEntity: NotificationItem = {
      ...mockNotification,
      relatedEntityId: "deploy-123",
      relatedEntityType: "deployment",
    };
    render(<NotificationDetail notification={notificationWithEntity} />);
    expect(screen.getByText("Related: deployment (deploy-123)")).toBeTruthy();
  });

  it("shows acknowledged badge for acknowledged notifications in list", () => {
    render(<NotificationCenter items={[mockNotificationAcknowledged]} />);
    expect(screen.getByText("Acknowledged")).toBeTruthy();
  });

  it("provides accessible label and id for notification search input", () => {
    render(<NotificationCenter items={[]} />);
    const searchInput = screen.getByRole("searchbox", { name: "Search notifications" });
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("id", "notification-search-input");
    expect(screen.getByLabelText("Search notifications")).toBe(searchInput);
  });
});

describe("NotificationBell", () => {
  it("renders bell icon", () => {
    render(<NotificationBell unreadCount={0} />);
    expect(screen.getByLabelText("Notifications")).toBeTruthy();
  });

  it("shows unread count", () => {
    render(<NotificationBell unreadCount={5} />);
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByLabelText("Notifications, 5 unread")).toBeTruthy();
  });

  it("shows 9+ for counts over 9", () => {
    render(<NotificationBell unreadCount={15} />);
    expect(screen.getByText("9+")).toBeTruthy();
  });

  it("does not show badge when count is 0", () => {
    render(<NotificationBell unreadCount={0} />);
    expect(screen.queryByText("0")).toBeNull();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<NotificationBell unreadCount={0} onClick={onClick} />);
    fireEvent.click(screen.getByLabelText("Notifications"));
    expect(onClick).toHaveBeenCalled();
  });
});

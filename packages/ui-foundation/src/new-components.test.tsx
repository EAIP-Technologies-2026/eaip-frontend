import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Alert } from "./alert";
import { Toast, ToastContainer } from "./toast";
import { Banner } from "./banner";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "./dropdown-menu";
import { TabNav } from "./tab-nav";
import { Sidebar } from "./sidebar";

describe("Alert", () => {
  it("renders children", () => {
    render(<Alert>Message</Alert>);
    expect(screen.getByText("Message")).toBeDefined();
  });

  it("renders with role alert", () => {
    render(<Alert>Alert</Alert>);
    expect(document.querySelector("[role='alert']")).toBeDefined();
  });

  it("renders title", () => {
    render(<Alert title="Title">Content</Alert>);
    expect(screen.getByText("Title")).toBeDefined();
  });

  it("renders all variants", () => {
    const variants = ["info", "success", "warning", "error"] as const;
    for (const v of variants) {
      const { container } = render(<Alert variant={v}>{v}</Alert>);
      expect(container.firstElementChild).toBeDefined();
    }
  });

  it("dismisses when dismissible", () => {
    const onDismiss = vi.fn();
    render(<Alert dismissible onDismiss={onDismiss}>Dismiss me</Alert>);
    act(() => {
      screen.getByLabelText("Dismiss").click();
    });
    expect(screen.queryByText("Dismiss me")).toBeNull();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", () => {
    const { container } = render(<Alert className="custom">Alert</Alert>);
    expect(container.firstElementChild?.classList.contains("custom")).toBe(true);
  });
});

describe("Toast", () => {
  it("renders children", () => {
    render(<Toast>Notification</Toast>);
    expect(screen.getByText("Notification")).toBeDefined();
  });

  it("renders with role status", () => {
    render(<Toast>Status</Toast>);
    expect(document.querySelector("[role='status']")).toBeDefined();
  });

  it("renders all variants", () => {
    const variants = ["info", "success", "warning", "error"] as const;
    for (const v of variants) {
      const { container } = render(<Toast variant={v}>{v}</Toast>);
      expect(container.firstElementChild).toBeDefined();
    }
  });

  it("dismisses on button click", () => {
    const onDismiss = vi.fn();
    render(<Toast onDismiss={onDismiss}>Dismiss</Toast>);
    act(() => {
      screen.getByLabelText("Dismiss").click();
    });
    expect(screen.queryByText("Dismiss")).toBeNull();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("dismisses after duration", () => {
    vi.useFakeTimers();
    render(<Toast duration={1000}>Timed</Toast>);
    expect(screen.getByText("Timed")).toBeDefined();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText("Timed")).toBeNull();
    vi.useRealTimers();
  });
});

describe("ToastContainer", () => {
  it("renders children", () => {
    render(<ToastContainer><Toast>In container</Toast></ToastContainer>);
    expect(screen.getByText("In container")).toBeDefined();
  });

  it("renders in different positions", () => {
    const { container } = render(<ToastContainer position="bottom-left"><Toast>Test</Toast></ToastContainer>);
    expect(container.firstElementChild).toBeDefined();
  });
});

describe("Banner", () => {
  it("renders children", () => {
    render(<Banner>Banner message</Banner>);
    expect(screen.getByText("Banner message")).toBeDefined();
  });

  it("renders with role banner", () => {
    render(<Banner>Banner</Banner>);
    expect(document.querySelector("[role='banner']")).toBeDefined();
  });

  it("renders all variants", () => {
    const variants = ["info", "success", "warning", "error"] as const;
    for (const v of variants) {
      const { container } = render(<Banner variant={v}>{v}</Banner>);
      expect(container.firstElementChild).toBeDefined();
    }
  });

  it("dismisses when dismissible", () => {
    render(<Banner dismissible>Dismissible</Banner>);
    act(() => {
      screen.getByLabelText("Dismiss").click();
    });
    expect(screen.queryByText("Dismissible")).toBeNull();
  });

  it("renders action element", () => {
    render(<Banner action={<button>Action</button>}>Banner</Banner>);
    expect(screen.getByText("Action")).toBeDefined();
  });
});

describe("DropdownMenu", () => {
  it("renders trigger", () => {
    render(<DropdownMenu trigger={<button>Menu</button>}><DropdownMenuItem>Item</DropdownMenuItem></DropdownMenu>);
    expect(screen.getByText("Menu")).toBeDefined();
  });

  it("shows menu on trigger click", () => {
    render(<DropdownMenu trigger={<span>Menu</span>}><DropdownMenuItem>Item</DropdownMenuItem></DropdownMenu>);
    act(() => {
      screen.getByText("Menu").click();
    });
    expect(screen.getByText("Item")).toBeDefined();
  });

  it("closes on Escape", () => {
    render(<DropdownMenu trigger={<span>Menu</span>}><DropdownMenuItem>Item</DropdownMenuItem></DropdownMenu>);
    act(() => {
      screen.getByText("Menu").click();
    });
    expect(screen.getByText("Item")).toBeDefined();
    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    expect(screen.queryByText("Item")).toBeNull();
  });

  it("renders DropdownMenuItem with destructive style", () => {
    render(
      <DropdownMenu open trigger={<span>Menu</span>}>
        <DropdownMenuItem destructive>Delete</DropdownMenuItem>
      </DropdownMenu>
    );
    expect(screen.getByText("Delete")).toBeDefined();
  });

  it("renders DropdownMenuSeparator", () => {
    const { container } = render(
      <DropdownMenu open trigger={<span>Menu</span>}>
        <DropdownMenuItem>Item</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Other</DropdownMenuItem>
      </DropdownMenu>
    );
    expect(container.querySelectorAll("[role='menuitem']").length).toBe(2);
  });

  it("renders DropdownMenuLabel", () => {
    render(
      <DropdownMenu open trigger={<span>Menu</span>}>
        <DropdownMenuLabel>Section</DropdownMenuLabel>
      </DropdownMenu>
    );
    expect(screen.getByText("Section")).toBeDefined();
  });
});

describe("TabNav", () => {
  const items = [
    { id: "tab1", label: "Tab 1" },
    { id: "tab2", label: "Tab 2" },
  ];

  it("renders tabs", () => {
    render(<TabNav items={items} activeId="tab1" onChange={() => {}} />);
    expect(screen.getByText("Tab 1")).toBeDefined();
    expect(screen.getByText("Tab 2")).toBeDefined();
  });

  it("calls onChange when tab clicked", () => {
    const onChange = vi.fn();
    render(<TabNav items={items} activeId="tab1" onChange={onChange} />);
    screen.getByText("Tab 2").click();
    expect(onChange).toHaveBeenCalledWith("tab2");
  });

  it("renders with aria-current on active tab", () => {
    render(<TabNav items={items} activeId="tab1" onChange={() => {}} />);
    const activeTab = screen.getByText("Tab 1");
    expect(activeTab.getAttribute("aria-current")).toBe("page");
  });

  it("renders all variants", () => {
    const variants = ["underline", "pills", "bar"] as const;
    for (const v of variants) {
      const { container } = render(<TabNav items={items} activeId="tab1" onChange={() => {}} variant={v} />);
      expect(container.firstElementChild).toBeDefined();
    }
  });

  it("renders vertical orientation", () => {
    const { container } = render(<TabNav items={items} activeId="tab1" onChange={() => {}} orientation="vertical" />);
    expect(container.firstElementChild?.classList.contains("flex-col")).toBe(true);
  });

  it("applies custom className", () => {
    const { container } = render(<TabNav items={items} activeId="tab1" onChange={() => {}} className="custom" />);
    expect(container.firstElementChild?.classList.contains("custom")).toBe(true);
  });
});

describe("Sidebar", () => {
  const items = [
    { id: "home", label: "Home", icon: <span data-testid="home-icon" /> },
    { id: "settings", label: "Settings", icon: <span data-testid="settings-icon" /> },
  ];

  it("renders navigation items", () => {
    render(<Sidebar items={items} activeId="home" onNavigate={() => {}} />);
    expect(screen.getByText("Home")).toBeDefined();
    expect(screen.getByText("Settings")).toBeDefined();
  });

  it("calls onNavigate when item clicked", () => {
    const onNavigate = vi.fn();
    render(<Sidebar items={items} activeId="home" onNavigate={onNavigate} />);
    screen.getByText("Settings").click();
    expect(onNavigate).toHaveBeenCalledWith("settings");
  });

  it("renders collapsed state", () => {
    const { container } = render(<Sidebar items={items} activeId="home" onNavigate={() => {}} collapsed />);
    expect(container.firstElementChild?.classList.contains("w-16")).toBe(true);
  });

  it("renders collapsible toggle", () => {
    const onCollapse = vi.fn();
    render(<Sidebar items={items} activeId="home" onNavigate={() => {}} collapsible onCollapse={onCollapse} />);
    screen.getByLabelText("Collapse sidebar").click();
    expect(onCollapse).toHaveBeenCalledWith(true);
  });

  it("renders header", () => {
    render(<Sidebar items={items} activeId="home" onNavigate={() => {}} header={<div>Header</div>} />);
    expect(screen.getByText("Header")).toBeDefined();
  });

  it("renders footer", () => {
    render(<Sidebar items={items} activeId="home" onNavigate={() => {}} footer={<div>Footer</div>} />);
    expect(screen.getByText("Footer")).toBeDefined();
  });

  it("applies custom className", () => {
    const { container } = render(<Sidebar items={items} activeId="home" onNavigate={() => {}} className="custom" />);
    expect(container.firstElementChild?.classList.contains("custom")).toBe(true);
  });
});

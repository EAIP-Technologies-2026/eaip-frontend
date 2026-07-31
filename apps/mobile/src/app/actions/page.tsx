"use client";

import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { Card, CardContent, CardTitle, EnterpriseIcon } from "@eaip/ui-enterprise";

const quickActions = [
  { id: "search", label: "Search", description: "Open global search", icon: "search" },
  { id: "command", label: "Command Palette", description: "Open command palette", icon: "bot" },
  { id: "notify", label: "Add Notification", description: "Add a test notification", icon: "bell" },
] as const;

function ActionsPageContent() {
  const { openGlobalSearch, openCommandPalette, addNotification } = usePlatformStore();

  function handleAction(id: string) {
    if (id === "search") {
      openGlobalSearch();
    } else if (id === "command") {
      openCommandPalette();
    } else if (id === "notify") {
      addNotification({
        id: crypto.randomUUID(),
        title: "Test notification",
        message: "This is a quick action notification.",
        read: false,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return (
    <div className="space-y-4">
      {quickActions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => {
            handleAction(action.id);
          }}
          className="w-full rounded-card text-left outline-none transition-smooth focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          <Card className="h-full hover:border-primary hover:shadow-elevated">
            <CardContent className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
                <EnterpriseIcon name={action.icon} size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle as="h3">{action.label}</CardTitle>
                <p className="mt-0.5 text-sm text-text-secondary">{action.description}</p>
              </div>
              <EnterpriseIcon name="chevronRight" size={20} className="text-text-muted" />
            </CardContent>
          </Card>
        </button>
      ))}
    </div>
  );
}

export default function ActionsPage() {
  return (
    <RequireAuth>
      <ActionsPageContent />
    </RequireAuth>
  );
}

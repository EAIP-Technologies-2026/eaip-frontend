"use client";

import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { EnterpriseShell } from "@eaip/ui-enterprise";

const quickActions = [
  { id: "search", label: "Search", description: "Open global search" },
  { id: "command", label: "Command Palette", description: "Open command palette" },
  { id: "notify", label: "Add Notification", description: "Add a test notification" },
];

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
    <EnterpriseShell
      appId="mobile"
      pageTitle="Quick Actions"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Actions" }]}
    >
      <div className="space-y-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => {
              handleAction(action.id);
            }}
            className="w-full rounded-lg border p-4 text-left hover:border-pink-300 hover:bg-pink-50"
          >
            <h3 className="font-medium text-gray-900">{action.label}</h3>
            <p className="text-sm text-gray-500">{action.description}</p>
          </button>
        ))}
      </div>
    </EnterpriseShell>
  );
}

export default function ActionsPage() {
  return (
    <RequireAuth>
      <ActionsPageContent />
    </RequireAuth>
  );
}

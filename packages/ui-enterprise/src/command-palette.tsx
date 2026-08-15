"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlatformStore } from "@eaip/state";
import { CommandPaletteShell, type CommandPaletteItem } from "@eaip/ui-foundation";
import { getNavigationForApp } from "./navigation";

export function CommandPalette() {
  const { commandPaletteOpen, openCommandPalette, closeCommandPalette } = usePlatformStore();
  const router = useRouter();

  const items: CommandPaletteItem[] = [
    {
      id: "open-conductor",
      label: "Open EAIP Conductor",
      icon: "sparkles",
    },
    {
      id: "ask-conductor-context",
      label: "Ask Conductor about this page",
      icon: "help-circle",
    },
    ...getNavigationForApp("enterprise-console").items.map((item) => ({
      id: item.id,
      label: item.label,
      icon: item.icon,
    })),
  ];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openCommandPalette();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openCommandPalette]);

  return (
    <CommandPaletteShell
      open={commandPaletteOpen}
      onClose={closeCommandPalette}
      items={items}
      placeholder="Search pages and commands..."
      onSelect={(item) => {
        if (item.id === "open-conductor" || item.id === "ask-conductor-context") {
          const btn = document.querySelector<HTMLButtonElement>(
            'button[aria-label="Open EAIP Conductor"]',
          );
          btn?.click();
          closeCommandPalette();
          return;
        }
        const match = getNavigationForApp("enterprise-console").items.find((i) => i.id === item.id);
        if (match?.href) router.push(match.href);
      }}
    />
  );

}

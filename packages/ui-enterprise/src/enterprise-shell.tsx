"use client";

import { useEffect } from "react";
import { usePlatformStore } from "@eaip/state";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import type { ShellProps } from "./types";

export function EnterpriseShell({ appId, children, breadcrumbs, pageTitle }: ShellProps) {
  const { setActiveRoute, setBreadcrumbs } = usePlatformStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActiveRoute(window.location.pathname, breadcrumbs);
    }
  }, [setActiveRoute, breadcrumbs]);

  useEffect(() => {
    if (breadcrumbs) {
      setBreadcrumbs(breadcrumbs);
    }
  }, [breadcrumbs, setBreadcrumbs]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header appId={appId} pageTitle={pageTitle} />
      <Sidebar appId={appId} />
      <main className="pt-[7.5rem] transition-all duration-200 md:pl-64">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

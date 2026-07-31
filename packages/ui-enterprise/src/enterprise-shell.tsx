"use client";

import { useEffect } from "react";
import { usePlatformStore } from "@eaip/state";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { ToastContainer } from "./toast";
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
    <div className="min-h-screen bg-atmosphere">
      <Header appId={appId} pageTitle={pageTitle} />
      <Sidebar appId={appId} />
      <main id="main-content" className="pt-[7.5rem] transition-all duration-200 md:pl-64">
        <div className="page-enter p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@eaip/auth";
import { EnterpriseIcon } from "@eaip/icons";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  return (
    <main className="bg-atmosphere-animated relative flex min-h-screen items-center justify-center overflow-hidden">
      <div
        className="orb-glow bg-primary/10 absolute -top-32 -left-32 h-[28rem] w-[28rem]"
        aria-hidden="true"
      />
      <div
        className="orb-glow bg-accent-glow/15 absolute -right-32 -bottom-40 h-[32rem] w-[32rem]"
        aria-hidden="true"
      />
      <div className="page-enter relative flex flex-col items-center gap-4">
        <div className="bg-primary flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="text-text-secondary flex items-center gap-2 text-sm">
          <EnterpriseIcon name="loading" size={16} className="animate-spin" />
          <span>Loading EAIP Enterprise Console...</span>
        </div>
      </div>
    </main>
  );
}

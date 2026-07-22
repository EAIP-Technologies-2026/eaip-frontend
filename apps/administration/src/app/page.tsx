"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@eaip/auth";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>Redirecting...</p>
    </main>
  );
}

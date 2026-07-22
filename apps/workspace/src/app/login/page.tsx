"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@eaip/auth";
import { Button, Input } from "@eaip/ui-primitives";
import { cn } from "@eaip/utilities";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error, clearError } = useAuth();
  const router = useRouter();

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    void (async () => {
      try {
        await login({ email, password });
        router.push("/dashboard");
      } catch {
        void 0;
      }
    })();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Workspace</h1>
          <p className="text-sm text-gray-500">Sign in to your EAIP account</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setEmail(event.target.value);
            }}
            placeholder="user@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPassword(event.target.value);
            }}
            placeholder="••••••••"
            required
          />

          {error ? (
            <div className={cn("rounded-md bg-red-50 p-3 text-sm text-red-600")}>{error}</div>
          ) : null}

          <Button type="submit" loading={loading} className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </main>
  );
}

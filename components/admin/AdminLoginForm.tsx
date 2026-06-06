"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export function AdminLoginForm({ isConfigured }: { isConfigured: boolean }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.message ?? "Could not log in.");
      }

      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not log in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center rsl-grid-bg p-6">
      <form
        onSubmit={login}
        className="w-full max-w-sm rounded border border-cyan-500/40 bg-slate-900/95 p-6 shadow-glow"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded border border-cyan-400/50 bg-cyan-400/10 text-cyan-200">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Admin</p>
            <h1 className="text-2xl font-black text-yellow-300">Sign In</h1>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <label>
            <span className="text-sm font-bold text-slate-200">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={!isConfigured || isSubmitting}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-400 disabled:opacity-60"
            />
          </label>
          <label>
            <span className="text-sm font-bold text-slate-200">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={!isConfigured || isSubmitting}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-400 disabled:opacity-60"
            />
          </label>
        </div>

        {!isConfigured ? (
          <div className="mt-4 rounded border border-yellow-500/50 bg-yellow-950/30 p-3 text-sm text-yellow-100">
            Add ADMIN_USERNAME and ADMIN_PASSWORD to .env to enable admin login.
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded border border-rose-500/50 bg-rose-950/40 p-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!isConfigured || isSubmitting}
          className="mt-5 w-full rounded bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing In" : "Sign In"}
        </button>
      </form>
    </main>
  );
}

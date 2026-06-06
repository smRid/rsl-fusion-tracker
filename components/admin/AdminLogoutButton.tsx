"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout() {
    setIsLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={isLoggingOut}
      className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded border border-slate-600 bg-slate-950/90 px-3 py-2 text-xs font-bold text-slate-100 shadow-lg hover:border-cyan-400 disabled:opacity-60"
    >
      <LogOut className="h-4 w-4" />
      {isLoggingOut ? "Signing Out" : "Sign Out"}
    </button>
  );
}

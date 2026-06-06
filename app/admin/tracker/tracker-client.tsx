"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrackerDashboard } from "@/components/tracker/TrackerDashboard";
import { clearTracker, getTracker, saveTracker } from "@/lib/local-storage";
import type { FusionTracker } from "@/types/fusion";

export function AdminTrackerClient() {
  const [tracker, setTracker] = useState<FusionTracker | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTracker(getTracker());
    setLoaded(true);
  }, []);

  function handleTrackerChange(nextTracker: FusionTracker) {
    saveTracker(nextTracker);
    setTracker(nextTracker);
  }

  function handleReset() {
    clearTracker();
    setTracker(null);
  }

  if (!loaded) {
    return <main className="min-h-screen rsl-grid-bg" />;
  }

  if (!tracker) {
    return (
      <main className="flex min-h-screen items-center justify-center rsl-grid-bg p-6">
        <section className="max-w-md rounded border border-cyan-500/40 bg-slate-900/90 p-6 text-center shadow-glow">
          <h1 className="text-2xl font-bold text-yellow-400">No Tracker Found</h1>
          <p className="mt-3 text-sm text-slate-300">
            Upload a fusion calendar from the admin dashboard to start editing.
          </p>
          <Link
            href="/admin"
            className="mt-5 inline-flex rounded bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300"
          >
            Go to Admin
          </Link>
        </section>
      </main>
    );
  }

  return (
    <TrackerDashboard
      tracker={tracker}
      onTrackerChange={handleTrackerChange}
      onReset={handleReset}
    />
  );
}

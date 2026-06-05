"use client";

import { AlertTriangle, CheckCircle2, CircleDashed, ShieldCheck } from "lucide-react";
import type { FusionTracker } from "@/types/fusion";
import { calculateProgress } from "@/lib/tracker-utils";

const statusCopy = {
  completed: "Fusion complete. You have enough fragments.",
  "on-track": "You are on track.",
  "at-risk": "Fusion may be impossible if too many fragments were skipped.",
  "needs-review": "Some AI-extracted events need manual review."
};

export function ProgressPanel({ tracker }: { tracker: FusionTracker }) {
  const progress = calculateProgress(tracker);
  const statusClass =
    progress.status === "completed"
      ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-200"
      : progress.status === "at-risk"
        ? "border-rose-400/60 bg-rose-500/15 text-rose-200"
        : progress.status === "needs-review"
          ? "border-yellow-400/60 bg-yellow-500/15 text-yellow-100"
          : "border-cyan-400/60 bg-cyan-500/15 text-cyan-100";
  const StatusIcon =
    progress.status === "completed"
      ? CheckCircle2
      : progress.status === "at-risk"
        ? AlertTriangle
        : progress.status === "needs-review"
          ? CircleDashed
          : ShieldCheck;

  return (
    <section className="h-full rounded border border-slate-700 bg-slate-900/90 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-yellow-300">Progress</h2>
        <span className={`inline-flex items-center gap-2 rounded border px-3 py-1 text-xs font-bold ${statusClass}`}>
          <StatusIcon className="h-4 w-4" />
          {progress.status.replace("-", " ")}
        </span>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-sm">
          <span className="text-slate-300">Earned</span>
          <span className="font-bold text-emerald-300">
            {progress.earnedFragments}/{progress.requiredFragments}
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded bg-slate-800">
          <div
            className="h-full rounded bg-emerald-500"
            style={{ width: `${progress.percentComplete}%` }}
          />
        </div>
      </div>

      <p className="mt-4 rounded border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200">
        {statusCopy[progress.status]}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Available" value={progress.totalFragments} tone="text-cyan-200" />
        <Stat label="Pending" value={progress.pendingFragments} tone="text-slate-200" />
        <Stat label="Skipped" value={progress.skippedFragments} tone="text-rose-200" />
        <Stat label="Remaining" value={progress.remainingNeeded} tone="text-yellow-200" />
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded border border-slate-700 bg-slate-950/50 p-3">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-black ${tone}`}>{value}</p>
    </div>
  );
}

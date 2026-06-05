"use client";

import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import type { FusionTracker } from "@/types/fusion";
import { parseDateSafe } from "@/lib/date-utils";

export function CalendarDetailsPanel({
  tracker,
  onSave
}: {
  tracker: FusionTracker;
  onSave: (patch: Partial<FusionTracker>) => void;
}) {
  const [fusionName, setFusionName] = useState(tracker.fusionName ?? "");
  const [startDate, setStartDate] = useState(tracker.dateRange.start ?? "");
  const [endDate, setEndDate] = useState(tracker.dateRange.end ?? "");
  const [requiredFragments, setRequiredFragments] = useState(String(tracker.requiredFragments));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFusionName(tracker.fusionName ?? "");
    setStartDate(tracker.dateRange.start ?? "");
    setEndDate(tracker.dateRange.end ?? "");
    setRequiredFragments(String(tracker.requiredFragments));
  }, [tracker]);

  function save() {
    setError(null);

    if (startDate && !parseDateSafe(startDate)) {
      setError("Start date must be a valid date.");
      return;
    }

    if (endDate && !parseDateSafe(endDate)) {
      setError("End date must be a valid date.");
      return;
    }

    const parsedStart = parseDateSafe(startDate);
    const parsedEnd = parseDateSafe(endDate);
    if (parsedStart && parsedEnd && parsedEnd < parsedStart) {
      setError("End date cannot be before start date.");
      return;
    }

    const parsedRequired = Number(requiredFragments);
    if (!Number.isFinite(parsedRequired) || parsedRequired <= 0) {
      setError("Required fragments must be greater than 0.");
      return;
    }

    onSave({
      fusionName: fusionName.trim() || null,
      dateRange: {
        start: startDate || null,
        end: endDate || null
      },
      requiredFragments: Math.round(parsedRequired)
    });
  }

  return (
    <section className="h-full rounded border border-cyan-500/40 bg-slate-900/90 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-yellow-300">Calendar Details</h2>
          <p className="mt-1 text-sm text-slate-400">
            Set the fusion range to unlock the timeline grid.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          className="inline-flex items-center gap-2 rounded bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950 hover:bg-yellow-300"
        >
          <CalendarCheck className="h-4 w-4" />
          Save & View Grid
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-4">
        <label className="sm:col-span-2">
          <span className="text-sm font-bold text-slate-200">Fusion Name</span>
          <input
            value={fusionName}
            onChange={(event) => setFusionName(event.target.value)}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-400"
          />
        </label>
        <label>
          <span className="text-sm font-bold text-slate-200">Start Date</span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-400"
          />
        </label>
        <label>
          <span className="text-sm font-bold text-slate-200">End Date</span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-400"
          />
        </label>
        <label>
          <span className="text-sm font-bold text-slate-200">Required Fragments</span>
          <input
            type="number"
            min="1"
            value={requiredFragments}
            onChange={(event) => setRequiredFragments(event.target.value)}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-400"
          />
        </label>
      </div>

      {error ? (
        <div className="mt-4 rounded border border-rose-500/50 bg-rose-950/40 p-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
    </section>
  );
}

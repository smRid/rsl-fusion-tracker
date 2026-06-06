"use client";

import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import type { FusionEvent, FusionEventStatus, FusionEventType } from "@/types/fusion";
import { parseDateSafe } from "@/lib/date-utils";
import { getEventFragmentTotal } from "@/lib/tracker-utils";

export function EventEditorModal({
  event,
  onCancel,
  onSave,
  onDelete
}: {
  event: FusionEvent | null;
  onCancel: () => void;
  onSave: (event: FusionEvent) => void;
  onDelete: (eventId: string) => void;
}) {
  const [draft, setDraft] = useState<FusionEvent | null>(event);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(event);
    setError(null);
  }, [event]);

  if (!draft) {
    return null;
  }

  function save() {
    if (!draft) {
      return;
    }
    const validationError = validateEvent(draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    onSave(draft);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <section className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded border border-cyan-500/50 bg-slate-900 p-5 shadow-glow">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-yellow-300">Edit Event</h2>
          <button type="button" onClick={onCancel} className="rounded p-2 text-slate-300 hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <EventFields draft={draft} onChange={setDraft} />

        {error ? (
          <div className="mt-4 rounded border border-rose-500/50 bg-rose-950/40 p-3 text-sm text-rose-100">{error}</div>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-between gap-3">
          <button
            type="button"
            onClick={() => onDelete(draft.id)}
            className="inline-flex items-center gap-2 rounded border border-rose-500/60 px-4 py-2 text-sm font-bold text-rose-100 hover:bg-rose-600/20"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded border border-slate-600 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              className="rounded bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950 hover:bg-yellow-300"
            >
              Save
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export function EventFields({
  draft,
  onChange
}: {
  draft: FusionEvent;
  onChange: (event: FusionEvent) => void;
}) {
  const earnedFragmentOptions = getEarnedFragmentOptions(draft);

  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-2">
        <span className="text-sm font-bold text-slate-200">Name</span>
        <input
          value={draft.name}
          onChange={(event) => onChange({ ...draft, name: event.target.value })}
          className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-400"
        />
      </label>
      <label>
        <span className="text-sm font-bold text-slate-200">Type</span>
        <select
          value={draft.type}
          onChange={(event) => onChange({ ...draft, type: event.target.value as FusionEventType })}
          className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-400"
        >
          <option value="Tournament">Tournament</option>
          <option value="Event">Event</option>
        </select>
      </label>
      <label>
        <span className="text-sm font-bold text-slate-200">Status</span>
        <select
          value={getStatusSelectValue(draft)}
          onChange={(event) => onChange(applyStatusSelectValue(draft, event.target.value))}
          className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-400"
        >
          <option value="pending">pending</option>
          {earnedFragmentOptions.map((fragments) => (
            <option key={fragments} value={`earned-${fragments}`}>
              earned {fragments}
            </option>
          ))}
          <option value="skipped">skipped</option>
        </select>
      </label>
      <label>
        <span className="text-sm font-bold text-slate-200">Start Date</span>
        <input
          type="date"
          value={draft.startDate ?? ""}
          onChange={(event) => onChange({ ...draft, startDate: event.target.value || null })}
          className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-400"
        />
      </label>
      <label>
        <span className="text-sm font-bold text-slate-200">End Date</span>
        <input
          type="date"
          value={draft.endDate ?? ""}
          onChange={(event) => onChange({ ...draft, endDate: event.target.value || null })}
          className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-400"
        />
      </label>
      <label>
        <span className="text-sm font-bold text-slate-200">Main Fragments</span>
        <input
          type="number"
          min="0"
          value={draft.fragments ?? ""}
          onChange={(event) =>
            onChange({
              ...draft,
              fragments: event.target.value === "" ? null : Math.max(0, Number(event.target.value))
            })
          }
          className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-400"
        />
      </label>
      <label>
        <span className="text-sm font-bold text-slate-200">Leaderboard Fragments</span>
        <input
          type="number"
          min="0"
          value={draft.leaderboardFragments ?? ""}
          onChange={(event) =>
            onChange({
              ...draft,
              leaderboardFragments: event.target.value === "" ? null : Math.max(0, Number(event.target.value))
            })
          }
          className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-400"
        />
      </label>
      <label>
        <span className="text-sm font-bold text-slate-200">Grid Position</span>
        <input
          type="number"
          min="1"
          value={draft.gridPosition}
          onChange={(event) =>
            onChange({
              ...draft,
              gridPosition: event.target.value === "" ? 1 : Math.max(1, Number(event.target.value))
            })
          }
          className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-400"
        />
      </label>
      <label className="flex items-end gap-3 rounded border border-slate-700 bg-slate-950 p-3">
        <input
          type="checkbox"
          checked={draft.needsReview}
          onChange={(event) => onChange({ ...draft, needsReview: event.target.checked })}
          className="h-5 w-5 accent-yellow-400"
        />
        <span className="text-sm font-bold text-slate-200">Needs review</span>
      </label>
      <label className="sm:col-span-2">
        <span className="text-sm font-bold text-slate-200">Notes</span>
        <textarea
          value={draft.notes ?? ""}
          onChange={(event) => onChange({ ...draft, notes: event.target.value })}
          rows={3}
          className="mt-1 w-full resize-y rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-400"
        />
      </label>
    </div>
  );
}

export function validateEvent(event: FusionEvent): string | null {
  if (!event.name.trim()) {
    return "Event name is required.";
  }
  if (event.fragments !== null && (!Number.isFinite(event.fragments) || event.fragments < 0)) {
    return "Fragments must be a number greater than or equal to 0.";
  }
  if (
    event.leaderboardFragments !== null &&
    event.leaderboardFragments !== undefined &&
    (!Number.isFinite(event.leaderboardFragments) || event.leaderboardFragments < 0)
  ) {
    return "Leaderboard fragments must be a number greater than or equal to 0.";
  }
  if (
    event.earnedFragments !== null &&
    event.earnedFragments !== undefined &&
    (!Number.isFinite(event.earnedFragments) || event.earnedFragments < 0)
  ) {
    return "Earned fragments must be a number greater than or equal to 0.";
  }
  if (
    event.earnedFragments !== null &&
    event.earnedFragments !== undefined &&
    event.earnedFragments > getEventFragmentTotal(event)
  ) {
    return "Earned fragments cannot be greater than this event's available fragments.";
  }
  if (!Number.isFinite(event.gridPosition) || event.gridPosition < 1) {
    return "Grid position must be a number greater than or equal to 1.";
  }
  if (event.startDate && !parseDateSafe(event.startDate)) {
    return "Start date must use YYYY-MM-DD format.";
  }
  if (event.endDate && !parseDateSafe(event.endDate)) {
    return "End date must use YYYY-MM-DD format.";
  }
  if (event.startDate && event.endDate) {
    const start = parseDateSafe(event.startDate);
    const end = parseDateSafe(event.endDate);
    if (start && end && end < start) {
      return "End date cannot be before start date.";
    }
  }
  return null;
}

function getStatusSelectValue(event: FusionEvent): string {
  if (event.status === "earned") {
    return `earned-${event.earnedFragments ?? getEventFragmentTotal(event)}`;
  }

  return event.status;
}

function applyStatusSelectValue(event: FusionEvent, value: string): FusionEvent {
  if (value.startsWith("earned-")) {
    return {
      ...event,
      status: "earned",
      earnedFragments: Math.max(0, Number(value.replace("earned-", "")))
    };
  }

  return {
    ...event,
    status: value as FusionEventStatus,
    earnedFragments: null
  };
}

function getEarnedFragmentOptions(event: FusionEvent): number[] {
  const mainFragments = Math.max(0, event.fragments ?? 0);
  const totalFragments = getEventFragmentTotal(event);

  return [...new Set([mainFragments, totalFragments].filter((fragments) => fragments > 0))].sort(
    (first, second) => first - second
  );
}

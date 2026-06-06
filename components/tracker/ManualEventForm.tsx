"use client";

import { useState } from "react";
import type { FusionEvent } from "@/types/fusion";
import { EventFields, validateEvent } from "./EventEditorModal";

export function ManualEventForm({
  open,
  onCancel,
  onAdd
}: {
  open: boolean;
  onCancel: () => void;
  onAdd: (event: FusionEvent) => void;
}) {
  const [draft, setDraft] = useState<FusionEvent>({
    id: "new",
    name: "",
    type: "Event",
    startDate: null,
    endDate: null,
    fragments: null,
    leaderboardFragments: null,
    earnedFragments: null,
    gridPosition: 1,
    status: "pending",
    needsReview: false
  });
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  function add() {
    const validationError = validateEvent(draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    onAdd(draft);
    setDraft({
      id: "new",
      name: "",
      type: "Event",
      startDate: null,
      endDate: null,
      fragments: null,
      leaderboardFragments: null,
      earnedFragments: null,
      gridPosition: 1,
      status: "pending",
      needsReview: false
    });
    setError(null);
  }

  return (
    <section className="rounded border border-cyan-500/40 bg-slate-900/90 p-5">
      <h2 className="text-xl font-black text-yellow-300">Add Manual Event</h2>
      <EventFields draft={draft} onChange={setDraft} />
      {error ? <div className="mt-4 rounded border border-rose-500/50 bg-rose-950/40 p-3 text-sm text-rose-100">{error}</div> : null}
      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-slate-600 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={add}
          className="rounded bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950 hover:bg-yellow-300"
        >
          Add Event
        </button>
      </div>
    </section>
  );
}

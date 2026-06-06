"use client";

import { useMemo, useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import type { FusionEvent, FusionTracker } from "@/types/fusion";
import { createEventId, normalizeTracker } from "@/lib/tracker-utils";
import { ProgressPanel } from "./ProgressPanel";
import { TimelineGrid } from "./TimelineGrid";
import { EventEditorModal } from "./EventEditorModal";
import { ManualEventForm } from "./ManualEventForm";
import { CalendarDetailsPanel } from "./CalendarDetailsPanel";
import { ImportExportPanel } from "./ImportExportPanel";
import { FusionHeroBanner } from "./FusionHeroBanner";

export function TrackerDashboard({
  tracker,
  onTrackerChange,
  onReset,
  showAdminTools = false
}: {
  tracker: FusionTracker;
  onTrackerChange: (tracker: FusionTracker) => void;
  onReset: () => void;
  showAdminTools?: boolean;
}) {
  const [editingEvent, setEditingEvent] = useState<FusionEvent | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const sortedTracker = useMemo(() => normalizeTracker(tracker), [tracker]);

  function updateTracker(events: FusionEvent[], patch: Partial<FusionTracker> = {}) {
    onTrackerChange(
      normalizeTracker({
        ...sortedTracker,
        ...patch,
        events,
        updatedAt: new Date().toISOString()
      })
    );
  }

  function updateTrackerDetails(patch: Partial<FusionTracker>) {
    updateTracker(sortedTracker.events, patch);
  }

  function handleSaveEvent(event: FusionEvent) {
    updateTracker(sortedTracker.events.map((item) => (item.id === event.id ? event : item)));
    setEditingEvent(null);
  }

  function handleDeleteEvent(eventId: string) {
    updateTracker(sortedTracker.events.filter((event) => event.id !== eventId));
    setEditingEvent(null);
  }

  function handleAddEvent(event: FusionEvent) {
    updateTracker([...sortedTracker.events, event]);
    setIsAdding(false);
  }

  return (
    <main className="min-h-screen rsl-grid-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {showAdminTools ? (
          <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-cyan-500/30 pb-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                Fusion Calendar
              </p>
              <h1 className="mt-1 text-3xl font-black text-yellow-400 sm:text-5xl">
                {sortedTracker.fusionName ?? "Unnamed Fusion"}
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                {sortedTracker.dateRange.start ?? "Unknown start"} - {sortedTracker.dateRange.end ?? "Unknown end"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-2 rounded border border-cyan-400 bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300"
              >
                <Plus className="h-4 w-4" />
                Add Event
              </button>
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-2 rounded bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-500"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </header>
        ) : (
          <FusionHeroBanner tracker={sortedTracker} />
        )}

        <div
          className={`grid items-stretch gap-4 ${
            showAdminTools
              ? "xl:grid-cols-[minmax(0,1.8fr)_minmax(260px,0.75fr)_minmax(260px,0.75fr)]"
              : "hidden"
          }`}
        >
          {showAdminTools ? (
            <CalendarDetailsPanel tracker={sortedTracker} onSave={updateTrackerDetails} editable />
          ) : null}
          {showAdminTools ? (
            <ProgressPanel tracker={sortedTracker} showStatusMessage />
          ) : null}
          {showAdminTools ? (
            <ImportExportPanel tracker={sortedTracker} onImport={onTrackerChange} />
          ) : null}
        </div>

        <section className="mt-5 space-y-5">
          <TimelineGrid tracker={sortedTracker} onSelectEvent={setEditingEvent} />
          {showAdminTools ? (
            <ManualEventForm
              open={isAdding}
              onCancel={() => setIsAdding(false)}
              onAdd={(event) =>
                handleAddEvent({
                  ...event,
                  id: createEventId(),
                  status: event.status ?? "pending"
                })
              }
            />
          ) : null}
        </section>

        <footer className="mt-8 border-t border-slate-800 pt-5 text-center text-xs text-slate-500">
          Fan-made utility tool. Not affiliated with Plarium or Raid: Shadow Legends.
        </footer>
      </div>

      <EventEditorModal
        event={editingEvent}
        onCancel={() => setEditingEvent(null)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        editable={showAdminTools}
      />
    </main>
  );
}

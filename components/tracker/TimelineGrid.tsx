"use client";

import type { FusionEvent, FusionTracker } from "@/types/fusion";
import { formatDisplayDate, getDateRange, parseDateSafe } from "@/lib/date-utils";
import { groupEventsByType } from "@/lib/tracker-utils";
import { TimelineEventBar } from "./TimelineEventBar";

const ROW_HEIGHT = 50;
const MIN_DAY_WIDTH = 76;

export function TimelineGrid({
  tracker,
  onSelectEvent
}: {
  tracker: FusionTracker;
  onSelectEvent: (event: FusionEvent) => void;
}) {
  const dateRange =
    tracker.dateRange.start && tracker.dateRange.end
      ? getDateRange(tracker.dateRange.start, tracker.dateRange.end)
      : [];
  const grouped = groupEventsByType(tracker.events);
  const invalidEvents = tracker.events.filter(
    (event) => !parseDateSafe(event.startDate) || !parseDateSafe(event.endDate) || !dateRange.length
  );
  const reviewGridGroups = {
    Tournament: invalidEvents.filter((event) => event.type === "Tournament"),
    Event: invalidEvents.filter((event) => event.type === "Event")
  };
  const datedGroups = {
    Tournament: grouped.Tournament.filter((event) => !invalidEvents.includes(event)),
    Event: grouped.Event.filter((event) => !invalidEvents.includes(event))
  };
  const minGridWidth = dateRange.length ? Math.max(980, dateRange.length * MIN_DAY_WIDTH) : 980;
  const dayWidthCss = `max(${MIN_DAY_WIDTH}px, calc(100% / ${Math.max(dateRange.length, 1)}))`;

  return (
    <section className="rounded border border-cyan-500/40 bg-slate-950/75 p-4 shadow-glow">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-yellow-300">Timeline</h2>
          <p className="mt-1 text-sm text-slate-400">Click a bar to edit status, dates, fragments, or review flags.</p>
        </div>
        <div className="flex gap-2 text-xs">
          <Legend className="bg-slate-700" label="Pending" />
          <Legend className="bg-emerald-600" label="Earned" />
          <Legend className="bg-rose-700" label="Skipped" />
        </div>
      </div>

      {dateRange.length ? (
        <div className="timeline-scroll overflow-x-auto rounded border border-slate-700 2xl:overflow-x-visible">
          <div className="w-full" style={{ minWidth: minGridWidth }}>
            <div className="sticky top-0 z-10 grid bg-slate-950" style={{ gridTemplateColumns: `repeat(${dateRange.length}, minmax(${MIN_DAY_WIDTH}px, 1fr))` }}>
              {dateRange.map((date) => (
                <div key={date} className="border-b border-r border-slate-700 px-2 py-3 text-center">
                  <p className="text-[11px] font-bold text-slate-400">
                    {new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`))}
                  </p>
                  <p className="mt-1 text-xs font-black text-cyan-100 sm:text-sm">{formatDisplayDate(date)}</p>
                </div>
              ))}
            </div>

            <TimelineLane
              title="Tournaments"
              events={[...datedGroups.Tournament, ...reviewGridGroups.Tournament]}
              rangeStart={dateRange[0]}
              dateCount={dateRange.length}
              dayWidthCss={dayWidthCss}
              onSelectEvent={onSelectEvent}
            />
            <TimelineLane
              title="Events"
              events={[...datedGroups.Event, ...reviewGridGroups.Event]}
              rangeStart={dateRange[0]}
              dateCount={dateRange.length}
              dayWidthCss={dayWidthCss}
              onSelectEvent={onSelectEvent}
            />
          </div>
        </div>
      ) : (
        <div className="rounded border border-yellow-500/40 bg-yellow-950/20 p-4 text-sm text-yellow-100">
          The calendar date range needs review before events can be placed on the grid.
        </div>
      )}

      {invalidEvents.length ? (
        <div className="mt-5">
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-300">Needs Review</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {invalidEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event)}
                className="rounded border border-yellow-500/40 bg-slate-900 p-3 text-left text-sm hover:border-yellow-300"
              >
                <span className="font-bold text-slate-100">{event.name}</span>
                <span className="ml-2 text-xs text-slate-400">{event.type}</span>
                <p className="mt-1 text-xs text-yellow-100">
                  Click its timeline bar to set exact dates - {event.fragments ?? 0} fragments
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function TimelineLane({
  title,
  events,
  rangeStart,
  dateCount,
  dayWidthCss,
  onSelectEvent
}: {
  title: string;
  events: FusionEvent[];
  rangeStart: string;
  dateCount: number;
  dayWidthCss: string;
  onSelectEvent: (event: FusionEvent) => void;
}) {
  const height = Math.max(100, events.length * ROW_HEIGHT + 50);

  return (
    <div className="relative border-b border-slate-700" style={{ height }}>
      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${dateCount}, minmax(${MIN_DAY_WIDTH}px, 1fr))` }}>
        {Array.from({ length: dateCount }).map((_, index) => (
          <div key={index} className="border-r border-cyan-900/70 bg-cyan-950/20" />
        ))}
      </div>
      <div className="absolute left-0 top-0 z-[1] flex h-9 items-center bg-slate-950/95 px-3 text-sm font-black uppercase tracking-[0.18em] text-yellow-300">
        {title}
      </div>
      {events.map((event, index) => (
        <TimelineEventBar
          key={event.id}
          event={event}
          rangeStart={rangeStart}
          dayWidthCss={dayWidthCss}
          top={40 + index * ROW_HEIGHT}
          onClick={() => onSelectEvent(event)}
        />
      ))}
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-slate-300">
      <span className={`h-2.5 w-2.5 rounded-sm ${className}`} />
      {label}
    </span>
  );
}

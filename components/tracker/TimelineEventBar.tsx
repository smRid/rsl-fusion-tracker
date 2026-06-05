"use client";

import { AlertTriangle } from "lucide-react";
import type { FusionEvent } from "@/types/fusion";
import { formatDisplayDate, getEventDuration, getEventOffset } from "@/lib/date-utils";

export function TimelineEventBar({
  event,
  rangeStart,
  dayWidth,
  top,
  onClick
}: {
  event: FusionEvent;
  rangeStart: string;
  dayWidth: number;
  top: number;
  onClick: () => void;
}) {
  const startDate = event.startDate ?? rangeStart;
  const endDate = event.endDate ?? startDate;
  const left = getEventOffset(rangeStart, startDate) * dayWidth + 12;
  const isMissingDates = !event.startDate || !event.endDate;
  const width = isMissingDates
    ? Math.max(dayWidth * 2 - 24, dayWidth - 18)
    : Math.max(dayWidth - 18, getEventDuration(startDate, endDate) * dayWidth - 24);
  const statusClass =
    event.status === "earned"
      ? "border-emerald-300/80 bg-emerald-700/90 text-emerald-50"
      : event.status === "skipped"
        ? "border-rose-300/70 bg-rose-900/80 text-rose-100 opacity-75"
        : "border-cyan-300/70 bg-slate-700/95 text-slate-50";

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${event.name} · ${formatDisplayDate(event.startDate)} - ${formatDisplayDate(event.endDate)}`}
      className={`absolute flex h-11 items-center justify-between gap-2 rounded border px-3 text-left text-xs shadow-lg transition hover:-translate-y-0.5 hover:border-yellow-300 ${isMissingDates ? "border-dashed" : ""} ${statusClass}`}
      style={{ left, top, width }}
    >
      <span className="min-w-0">
        <span className="block truncate font-black">{event.name}</span>
        <span className="block truncate text-[11px] opacity-80">
          {isMissingDates ? "Set dates" : event.type} · {event.status}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1">
        {event.needsReview ? <AlertTriangle className="h-4 w-4 text-yellow-200" /> : null}
        <span className="rounded border border-yellow-300/70 bg-slate-950/75 px-2 py-1 font-black text-yellow-200">
          {event.fragments ?? "?"}
        </span>
      </span>
    </button>
  );
}

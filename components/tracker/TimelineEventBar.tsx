"use client";

import { AlertTriangle } from "lucide-react";
import type { FusionEvent } from "@/types/fusion";
import { formatDisplayDate, getEventDuration, getEventOffset } from "@/lib/date-utils";
import { getEventEarnedTotal } from "@/lib/tracker-utils";

export function TimelineEventBar({
  event,
  rangeStart,
  dayWidthCss,
  top,
  onClick
}: {
  event: FusionEvent;
  rangeStart: string;
  dayWidthCss: string;
  top: number;
  onClick: () => void;
}) {
  const startDate = event.startDate ?? rangeStart;
  const endDate = event.endDate ?? startDate;
  const offset = getEventOffset(rangeStart, startDate);
  const duration = getEventDuration(startDate, endDate);
  const isMissingDates = !event.startDate || !event.endDate;
  const startMidpoint = offset + 0.5;
  const midpointSpan = isMissingDates ? 2 : Math.max(0.5, duration - 1);
  const leaderboardFragments = event.leaderboardFragments ?? 0;
  const typeIcon = event.type === "Tournament" ? "/tournament.webp" : "/event.webp";
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
      title={`${event.name} - ${formatDisplayDate(event.startDate)} to ${formatDisplayDate(event.endDate)}`}
      className={`absolute flex h-10 items-center justify-between gap-2 rounded border px-2 text-left text-[11px] shadow-lg transition hover:-translate-y-0.5 hover:border-yellow-300 sm:text-xs ${isMissingDates ? "border-dashed" : ""} ${statusClass}`}
      style={{
        left: `calc(${startMidpoint} * ${dayWidthCss})`,
        top,
        width: `calc(${midpointSpan} * ${dayWidthCss})`
      }}
    >
      <span className="flex min-w-0 items-center gap-2">
        <img
          src={typeIcon}
          alt=""
          aria-hidden="true"
          className="h-6 w-6 shrink-0 rounded-sm object-contain"
        />
        <span className="min-w-0">
          <span className="block truncate font-black">{event.name}</span>
          <span className="block truncate text-[10px] opacity-80 sm:text-[11px]">
            {isMissingDates ? "Set dates" : event.type} - {formatStatus(event)}
          </span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1">
        {event.needsReview ? <AlertTriangle className="h-4 w-4 text-yellow-200" /> : null}
        <span className="rounded border border-yellow-300/70 bg-slate-950/75 px-2 py-1 font-black text-yellow-200">
          {event.fragments ?? "?"}
          {leaderboardFragments > 0 ? (
            <span className="text-emerald-300">+{leaderboardFragments}</span>
          ) : null}
        </span>
      </span>
    </button>
  );
}

function formatStatus(event: FusionEvent): string {
  if (event.status === "earned") {
    return `earned ${getEventEarnedTotal(event)}`;
  }

  return event.status;
}

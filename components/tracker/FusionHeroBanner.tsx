"use client";

import { CalendarDays, Trophy } from "lucide-react";
import type { FusionTracker } from "@/types/fusion";
import { formatDisplayDate } from "@/lib/date-utils";
import { calculateProgress } from "@/lib/tracker-utils";

const championImages: Record<string, string> = {
  "folan silverhart": "/Folan Silverhart.webp",
  "masahiro the bell monk": "/masahiro%20the%20bell%20monk.png"
};

export function FusionHeroBanner({ tracker }: { tracker: FusionTracker }) {
  const progress = calculateProgress(tracker);
  const imageSrc = getChampionImage(tracker.fusionName);

  return (
    <section className="relative mb-5 overflow-hidden rounded border border-cyan-400/40 bg-slate-950 shadow-glow">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover object-top opacity-25"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(2,6,23,0.98)_0%,rgba(2,6,23,0.95)_48%,rgba(8,19,37,0.5)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,204,21,0.07),transparent_34%,rgba(34,211,238,0.08))]" />
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#22d3ee,#facc15,#10b981,#22d3ee)]" />
      <div className="absolute right-0 top-0 hidden h-full w-[42%] border-l border-cyan-300/40 bg-cyan-500/10 [clip-path:polygon(10%_0,100%_0,100%_100%,0_100%)] lg:block" />

      {imageSrc ? (
        <img
          src={imageSrc}
          alt={tracker.fusionName ?? "Fusion champion"}
          className="absolute bottom-0 right-0 hidden h-full w-[43%] scale-125 object-cover object-center opacity-95 [clip-path:polygon(10%_0,100%_0,100%_100%,0_100%)] lg:block"
        />
      ) : null}

      <div className="relative p-4 sm:p-5 lg:p-6">
        <div className="flex max-w-3xl flex-col gap-4 lg:w-[52%]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded border border-cyan-300/50 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
                <Trophy className="h-4 w-4 text-yellow-300" />
                Fusion Calendar
              </span>
              <span className="inline-flex items-center gap-2 rounded border border-slate-600 bg-slate-950/70 px-3 py-1 text-xs font-bold text-slate-200">
                <CalendarDays className="h-4 w-4 text-cyan-200" />
                {formatDisplayDate(tracker.dateRange.start)} - {formatDisplayDate(tracker.dateRange.end)}
              </span>
            </div>

            <h1 className="mt-3 max-w-full text-3xl font-black text-yellow-300 sm:text-4xl lg:text-5xl">
              {tracker.fusionName ?? "Unnamed Fusion"}
            </h1>
            <p className="mt-2 max-w-full text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
              Fragment chase progress
            </p>
          </div>

          <div>
            <div className="mb-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <HeroStat label="Available" value={progress.totalFragments} tone="text-cyan-100" />
              <HeroStat label="Pending" value={progress.pendingFragments} tone="text-slate-100" />
              <HeroStat label="Skipped" value={progress.skippedFragments} tone="text-rose-100" />
              <HeroStat label="Remaining" value={progress.remainingNeeded} tone="text-yellow-200" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Earned</p>
              <p className="text-xl font-black text-emerald-300 sm:text-2xl">
                {progress.earnedFragments}
                <span className="text-base text-slate-400">/{progress.requiredFragments}</span>
              </p>
            </div>
            <div className="mt-1 h-3 overflow-hidden rounded border border-slate-700 bg-slate-950">
              <div
                className="h-full rounded bg-[linear-gradient(90deg,#10b981,#22d3ee,#facc15)]"
                style={{ width: `${progress.percentComplete}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="min-w-0 rounded border border-slate-600/80 bg-slate-950/80 px-3 py-2 shadow-lg">
      <p className="truncate text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:text-[10px]">{label}</p>
      <p className={`text-lg font-black sm:text-xl ${tone}`}>{value}</p>
    </div>
  );
}

function getChampionImage(fusionName: string | null): string | null {
  if (!fusionName) {
    return null;
  }

  return championImages[fusionName.toLowerCase()] ?? null;
}

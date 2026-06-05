"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import type { FusionTracker } from "@/types/fusion";
import { normalizeTracker } from "@/lib/tracker-utils";

export function ImportExportPanel({
  tracker,
  onImport
}: {
  tracker: FusionTracker;
  onImport: (tracker: FusionTracker) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function exportTracker() {
    const filename = `fusion-tracker-${slugify(tracker.fusionName ?? "tracker")}.json`;
    const blob = new Blob([JSON.stringify(tracker, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importTracker(file: File | null) {
    setError(null);
    if (!file) {
      return;
    }

    try {
      const parsed = JSON.parse(await file.text());
      const nextTracker = normalizeTracker({ ...parsed, source: "imported" });
      if (!nextTracker.events.length) {
        throw new Error("Imported tracker must contain at least one event.");
      }
      onImport(nextTracker);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Imported JSON is invalid.");
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <section className="h-full rounded border border-slate-700 bg-slate-900/90 p-5">
      <h2 className="text-xl font-black text-yellow-300">Import / Export</h2>
      <p className="mt-2 text-sm text-slate-300">
        Move this tracker between browsers or keep a backup of your manual edits.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <button
          type="button"
          onClick={exportTracker}
          className="inline-flex items-center justify-center gap-2 rounded border border-cyan-400/70 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-500/10"
        >
          <Download className="h-4 w-4" />
          Export JSON
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 rounded border border-slate-600 px-4 py-2 text-sm font-bold text-slate-100 hover:bg-slate-800"
        >
          <Upload className="h-4 w-4" />
          Import JSON
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={(event) => void importTracker(event.target.files?.item(0) ?? null)}
      />
      {error ? <div className="mt-4 rounded border border-rose-500/50 bg-rose-950/40 p-3 text-sm text-rose-100">{error}</div> : null}
    </section>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "tracker";
}

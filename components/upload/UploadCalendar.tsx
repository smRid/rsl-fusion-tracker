"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, FileImage, Loader2, Upload, X } from "lucide-react";
import { getTracker, saveTracker, clearTracker } from "@/lib/local-storage";
import { normalizeTracker } from "@/lib/tracker-utils";
import type { FusionTracker } from "@/types/fusion";

const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const PROCESSING_STEPS = [
  "Reading fusion calendar...",
  "Detecting dates...",
  "Extracting events...",
  "Building tracker..."
];
const PRESET_TRACKERS = [
  {
    id: "folan-silverhart",
    eyebrow: "JUNE 2026 FUSION",
    name: "Folan Silverhart",
    imageSrc: "/Folan Silverhart.webp",
    trackerSrc: "/fusion-tracker-folan-silverhart.json"
  },
  {
    id: "masahiro-the-bell-monk",
    eyebrow: "MAY 2026 FUSION",
    name: "Masahiro the Bell Monk",
    imageSrc: "/masahiro%20the%20bell%20monk.png",
    trackerSrc: "/fusion-tracker-masahiro-the-bell-monk.json"
  }
];

export function UploadCalendar({
  trackerPath = "/tracker",
  eyebrow = "Raid: Shadow Legends",
  title = "AI Fusion Tracker",
  subtitle = "Upload a Raid fusion calendar and generate your tracker automatically."
}: {
  trackerPath?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
} = {}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [existingTracker, setExistingTracker] = useState<FusionTracker | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingPresetId, setLoadingPresetId] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState(0);

  useEffect(() => {
    setExistingTracker(getTracker());
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    if (!isProcessing) {
      return;
    }

    const interval = window.setInterval(() => {
      setProcessingStep((step) => (step + 1) % PROCESSING_STEPS.length);
    }, 1400);
    return () => window.clearInterval(interval);
  }, [isProcessing]);

  function chooseFile(file: File | null) {
    setError(null);
    if (!file) {
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setSelectedFile(null);
      setError("Please upload a valid PNG, JPG, JPEG, or WEBP image.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setSelectedFile(null);
      setError("Image must be under 20MB.");
      return;
    }

    setSelectedFile(file);
  }

  async function handleGenerate() {
    if (!selectedFile) {
      setError("Please select a fusion calendar image first.");
      return;
    }

    setIsProcessing(true);
    setProcessingStep(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/extract-calendar", {
        method: "POST",
        body: formData
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.message ?? "AI could not process this image.");
      }

      const tracker = normalizeTracker(body);
      saveTracker(tracker);
      router.push(trackerPath);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong while generating the tracker.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleLoadPreset(preset: (typeof PRESET_TRACKERS)[number]) {
    setLoadingPresetId(preset.id);
    setError(null);

    try {
      const response = await fetch(preset.trackerSrc);

      if (!response.ok) {
        throw new Error(`Could not load the ${preset.name} tracker.`);
      }

      const body = await response.json();
      const tracker = normalizeTracker(body);
      saveTracker(tracker);
      router.push(trackerPath);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong while loading the preset tracker.");
    } finally {
      setLoadingPresetId(null);
    }
  }

  function handleStartNew() {
    clearTracker();
    setExistingTracker(null);
    setSelectedFile(null);
    setError(null);
  }

  return (
    <main className="min-h-screen rsl-grid-bg px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/30 pb-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">{eyebrow}</p>
            <h1 className="mt-2 text-4xl font-black text-yellow-400 sm:text-6xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-300 sm:text-lg">
              {subtitle}
            </p>
          </div>
          {existingTracker ? (
            <div className="flex gap-3">
              <Link
                href={trackerPath}
                className="rounded border border-cyan-400 bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300"
              >
                Continue Tracker
              </Link>
              <button
                type="button"
                onClick={handleStartNew}
                className="rounded border border-rose-400/70 px-4 py-2 text-sm font-bold text-rose-100 hover:bg-rose-600/20"
              >
                Start New
              </button>
            </div>
          ) : null}
        </header>

        <div className="mb-6 grid gap-4">
          {PRESET_TRACKERS.map((preset) => (
            <PresetTrackerButton
              key={preset.id}
              preset={preset}
              isLoading={loadingPresetId === preset.id}
              disabled={Boolean(loadingPresetId) || isProcessing}
              onClick={() => handleLoadPreset(preset)}
            />
          ))}
        </div>

        <section className="grid flex-1 gap-6">
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              chooseFile(event.dataTransfer.files.item(0));
            }}
            className={`min-h-[420px] rounded border border-dashed border-cyan-400/60 bg-slate-900/75 p-6 shadow-glow ${
              previewUrl ? "grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_220px]" : "flex flex-col items-center justify-center text-center"
            }`}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected fusion calendar preview"
                className="max-h-[520px] w-full rounded border border-slate-700 object-contain"
              />
            ) : (
              <div className="max-w-lg">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-400/10">
                  <Upload className="h-9 w-9 text-cyan-300" />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-slate-50">Drop your fusion calendar here</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Use the official calendar image. The AI extractor reads visible dates, event names, categories, and fragment counts.
                </p>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="sr-only"
              onChange={(event) => chooseFile(event.target.files?.item(0) ?? null)}
            />

            <div className={previewUrl ? "flex flex-col items-stretch gap-4" : "mt-6 flex flex-wrap items-center justify-center gap-3"}>
              <div className={previewUrl ? "grid gap-3" : "contents"}>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-cyan-400"
                >
                  <FileImage className="h-4 w-4" />
                  Choose Image
                </button>
                {selectedFile ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setError(null);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                ) : null}
              </div>

              {selectedFile ? (
                <div className="rounded border border-slate-700 bg-slate-950/60 p-3 text-left text-sm">
                  <p className="break-words font-semibold text-slate-100">{selectedFile.name}</p>
                  <p className="mt-1 text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : null}

              {error ? (
                <div className="rounded border border-rose-500/50 bg-rose-950/40 p-3 text-sm text-rose-100">{error}</div>
              ) : null}

              {selectedFile ? (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleGenerate}
                  className="inline-flex items-center justify-center gap-2 rounded bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {isProcessing ? PROCESSING_STEPS[processingStep] : "Generate Timeline"}
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t border-slate-800 pt-5 text-center text-xs text-slate-500">
          Fan-made utility tool. Not affiliated with Plarium or Raid: Shadow Legends.
        </footer>
      </div>
    </main>
  );
}

function PresetTrackerButton({
  preset,
  isLoading,
  disabled,
  onClick
}: {
  preset: (typeof PRESET_TRACKERS)[number];
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group grid min-h-[220px] overflow-hidden rounded border border-yellow-300/60 bg-slate-950 text-left shadow-glow transition hover:-translate-y-0.5 hover:border-yellow-200 disabled:cursor-not-allowed disabled:opacity-70 sm:grid-cols-[minmax(0,1fr)_330px]"
    >
      <span className="flex flex-col justify-center p-5 sm:p-6">
        <span className="text-sm font-black uppercase tracking-[0.2em] text-cyan-200">{preset.eyebrow}</span>
        <span className="mt-2 text-3xl font-black text-yellow-300 sm:text-4xl">{preset.name}</span>
        <span className="mt-5 inline-flex w-fit items-center gap-2 rounded bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950 group-hover:bg-yellow-300">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {isLoading ? "Loading Tracker" : "Open Tracker"}
        </span>
      </span>
      <span className="relative min-h-[220px] overflow-hidden bg-slate-900">
        <img
          src={preset.imageSrc}
          alt={preset.name}
          className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-transparent to-transparent" />
      </span>
    </button>
  );
}

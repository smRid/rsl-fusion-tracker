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

export function UploadCalendar() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [existingTracker, setExistingTracker] = useState<FusionTracker | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPreset, setIsLoadingPreset] = useState(false);
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
      router.push("/tracker");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong while generating the tracker.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleLoadFolanTracker() {
    setIsLoadingPreset(true);
    setError(null);

    try {
      const response = await fetch("/fusion-tracker-folan-silverhart.json");

      if (!response.ok) {
        throw new Error("Could not load the Folan Silverhart tracker.");
      }

      const body = await response.json();
      const tracker = normalizeTracker(body);
      saveTracker(tracker);
      router.push("/tracker");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong while loading the preset tracker.");
    } finally {
      setIsLoadingPreset(false);
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
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Raid: Shadow Legends</p>
            <h1 className="mt-2 text-4xl font-black text-yellow-400 sm:text-6xl">AI Fusion Tracker</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-300 sm:text-lg">
              Upload a Raid fusion calendar and generate your tracker automatically.
            </p>
          </div>
          {existingTracker ? (
            <div className="flex gap-3">
              <Link
                href="/tracker"
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

        <button
          type="button"
          onClick={handleLoadFolanTracker}
          disabled={isLoadingPreset || isProcessing}
          className="group mb-6 grid min-h-[220px] overflow-hidden rounded border border-yellow-300/60 bg-slate-950 text-left shadow-glow transition hover:-translate-y-0.5 hover:border-yellow-200 disabled:cursor-not-allowed disabled:opacity-70 md:grid-cols-[minmax(0,1fr)_330px]"
        >
          <span className="flex flex-col justify-center p-5 sm:p-7">
            <span className="text-sm font-black uppercase tracking-[0.2em] text-cyan-200">JUNE 2026 FUSION</span>
            <span className="mt-2 text-4xl font-black text-yellow-300 sm:text-5xl">Folan Silverhart</span>
            <span className="mt-5 inline-flex w-fit items-center gap-2 rounded bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950 group-hover:bg-yellow-300">
              {isLoadingPreset ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {isLoadingPreset ? "Loading Tracker" : "Open Tracker"}
            </span>
          </span>
          <span className="relative min-h-[220px] overflow-hidden bg-slate-900">
            <img
              src="/Folan Silverhart.webp"
              alt="Folan Silverhart"
              className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-transparent to-transparent" />
          </span>
        </button>

        <section className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              chooseFile(event.dataTransfer.files.item(0));
            }}
            className="flex min-h-[420px] flex-col items-center justify-center rounded border border-dashed border-cyan-400/60 bg-slate-900/75 p-6 text-center shadow-glow"
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

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-cyan-400"
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
                  className="inline-flex items-center gap-2 rounded border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          <aside className="rounded border border-slate-700 bg-slate-900/85 p-5">
            <h2 className="text-xl font-bold text-yellow-300">Generate Timeline</h2>
            <p className="mt-2 text-sm text-slate-300">
              The Ollama API key stays server-side. Your tracker data is saved only in this browser.
            </p>

            {selectedFile ? (
              <div className="mt-5 rounded border border-slate-700 bg-slate-950/60 p-3 text-left text-sm">
                <p className="font-semibold text-slate-100">{selectedFile.name}</p>
                <p className="mt-1 text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 rounded border border-rose-500/50 bg-rose-950/40 p-3 text-sm text-rose-100">{error}</div>
            ) : null}

            <button
              type="button"
              disabled={!selectedFile || isProcessing}
              onClick={handleGenerate}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded bg-yellow-400 px-4 py-3 text-sm font-black text-slate-950 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {isProcessing ? PROCESSING_STEPS[processingStep] : "Generate Timeline"}
            </button>
          </aside>
        </section>

        <footer className="mt-8 border-t border-slate-800 pt-5 text-center text-xs text-slate-500">
          Fan-made utility tool. Not affiliated with Plarium or Raid: Shadow Legends.
        </footer>
      </div>
    </main>
  );
}

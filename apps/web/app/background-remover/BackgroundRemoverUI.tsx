"use client";

import React, { useCallback, useRef, useState } from "react";
import { AdSlot } from "@quickhelp/ui";
import { AD_SLOTS } from "@/lib/ad-slots";

// ── Types ─────────────────────────────────────────────────────────────────────

type Stage =
  | { kind: "idle" }
  | { kind: "processing"; file: File; originalUrl: string; progress: number; status: string }
  | { kind: "done"; file: File; originalUrl: string; resultUrl: string; resultBlob: Blob }
  | { kind: "error"; file: File; originalUrl: string; message: string };

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const ACCEPTED = "image/png,image/jpeg,image/webp,image/avif,image/tiff,image/gif";

// ── Main component ────────────────────────────────────────────────────────────

export function BackgroundRemoverUI() {
  const [stage, setStage] = useState<Stage>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    const originalUrl = URL.createObjectURL(file);
    setStage({ kind: "processing", file, originalUrl, progress: 0, status: "Loading AI model…" });

    try {
      // Dynamic import keeps the heavy library out of the initial bundle
      const { removeBackground } = await import("@imgly/background-removal");

      const resultBlob = await removeBackground(file, {
        // proxyToWorker: false avoids SharedArrayBuffer / COEP header requirement
        proxyToWorker: false,
        model: "isnet",
        // In a webpack bundle import.meta.url resolves incorrectly, so the library
        // can't infer the CDN path. Set it explicitly to avoid "e.replace is not a function".
        publicPath:
          "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/",
        output: { format: "image/png" },
        progress: (key: string, current: number, total: number) => {
          const pct = total > 0 ? Math.round((current / total) * 100) : 0;
          const isModel = key.includes("fetch") || key.includes("load");
          setStage((prev) =>
            prev.kind === "processing"
              ? { ...prev, progress: pct, status: isModel ? `Downloading model… ${pct}%` : `Removing background… ${pct}%` }
              : prev
          );
        },
      });

      const resultUrl = URL.createObjectURL(resultBlob);
      // Revoke old preview URL
      URL.revokeObjectURL(originalUrl);
      const freshOriginalUrl = URL.createObjectURL(file);
      setStage({ kind: "done", file, originalUrl: freshOriginalUrl, resultUrl, resultBlob });
    } catch (err) {
      setStage({
        kind: "error",
        file,
        originalUrl,
        message: err instanceof Error ? err.message : "Unexpected error — please try again.",
      });
    }
  }, []);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const file = Array.from(files).find((f) => f.type.startsWith("image/"));
      if (!file) return;
      void processFile(file);
    },
    [processFile]
  );

  const reset = () => {
    if (stage.kind !== "idle") {
      URL.revokeObjectURL(stage.originalUrl);
      if (stage.kind === "done") URL.revokeObjectURL(stage.resultUrl);
    }
    setStage({ kind: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Background Remover</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Remove image backgrounds with AI — runs in your browser, image never leaves your device.
        </p>
      </div>

      {/* ── Idle: drop zone ── */}
      {stage.kind === "idle" && (
        <DropZone
          inputRef={inputRef}
          dragging={dragging}
          onDragging={setDragging}
          onFiles={handleFiles}
          accepted={ACCEPTED}
        />
      )}

      {/* ── Processing ── */}
      {stage.kind === "processing" && (
        <ProcessingCard stage={stage} />
      )}

      {/* ── Done: result ── */}
      {stage.kind === "done" && (
        <ResultCard stage={stage} onReset={reset} />
      )}

      {/* ── Error ── */}
      {stage.kind === "error" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {stage.message}
          </div>
          <button
            onClick={reset}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Try another image
          </button>
        </div>
      )}

      <AdSlot slot={AD_SLOTS["tool-mid"]} />

      {/* Educational content */}
      <div className="space-y-6 border-t border-border pt-8">
        <section>
          <h2 className="text-base font-semibold text-foreground">How it works</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The AI model runs entirely in your browser using WebAssembly and ONNX Runtime. Your image
            is never uploaded to any server. The model (~40 MB) downloads from a CDN on first use and
            is cached for future visits.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">What formats are supported?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            PNG, JPEG, WebP, AVIF, TIFF, and GIF as input. The output is always a transparent PNG so
            the removed background shows as true transparency in any design tool.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Why is the first run slow?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The AI model is ~40 MB and is downloaded once from a CDN. Your browser caches it, so
            every run after the first is near-instant.
          </p>
        </section>
      </div>
    </div>
  );
}

// ── Drop zone ─────────────────────────────────────────────────────────────────

function DropZone({
  inputRef,
  dragging,
  onDragging,
  onFiles,
  accepted,
}: {
  inputRef: React.RefObject<HTMLInputElement>;
  dragging: boolean;
  onDragging: (v: boolean) => void;
  onFiles: (files: FileList) => void;
  accepted: string;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload image"
      className={[
        "flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors",
        dragging ? "border-accent bg-accent/5" : "border-border hover:border-foreground/30",
      ].join(" ")}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onDrop={(e) => {
        e.preventDefault();
        onDragging(false);
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
      }}
      onDragOver={(e) => { e.preventDefault(); onDragging(true); }}
      onDragLeave={() => onDragging(false)}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accepted}
        className="hidden"
        onChange={(e) => { if (e.target.files) onFiles(e.target.files); }}
      />
      <UploadIcon className="h-10 w-10 text-muted-foreground" />
      <div className="text-center">
        <p className="text-base font-semibold text-foreground">Upload Image</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Drop a file here or click to browse
        </p>
        <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WebP, AVIF, TIFF, GIF</p>
      </div>
    </div>
  );
}

// ── Processing card ───────────────────────────────────────────────────────────

function ProcessingCard({
  stage,
}: {
  stage: Extract<Stage, { kind: "processing" }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-6">
      <div className="flex items-center gap-4">
        {/* Thumbnail */}
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-background">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={stage.originalUrl} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{stage.file.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{formatBytes(stage.file.size)}</p>
          <p className="mt-2 text-xs text-muted-foreground">{stage.status}</p>
          {/* Progress bar */}
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${stage.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Result card ───────────────────────────────────────────────────────────────

function ResultCard({
  stage,
  onReset,
}: {
  stage: Extract<Stage, { kind: "done" }>;
  onReset: () => void;
}) {
  const outputName = stage.file.name.replace(/\.[^.]+$/, "-no-bg.png");

  return (
    <div className="space-y-4">
      {/* Two-pane: result (main) + original (side) */}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        {/* Result — checkerboard transparency */}
        <div className="overflow-hidden rounded-xl border border-border">
          <div
            className="flex items-center justify-center p-4"
            style={{
              backgroundImage:
                "linear-gradient(45deg,#cbd5e1 25%,transparent 25%)," +
                "linear-gradient(-45deg,#cbd5e1 25%,transparent 25%)," +
                "linear-gradient(45deg,transparent 75%,#cbd5e1 75%)," +
                "linear-gradient(-45deg,transparent 75%,#cbd5e1 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0,0 10px,10px -10px,-10px 0",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={stage.resultUrl}
              alt="Background removed"
              className="max-h-96 max-w-full object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* Original thumbnail */}
        <div className="flex flex-col gap-2 sm:w-40">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Original</p>
          <div className="overflow-hidden rounded-lg border border-border bg-background">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stage.originalUrl} alt="Original" className="w-full object-cover" />
          </div>
          <p className="text-xs text-muted-foreground">{formatBytes(stage.file.size)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={stage.resultUrl}
          download={outputName}
          className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-80 transition-opacity"
        >
          Download PNG
        </a>
        <button
          onClick={onReset}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Remove another
        </button>
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

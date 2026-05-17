"use client";

import React, { useCallback, useRef, useState } from "react";
import { AdSlot } from "@quickhelp/ui";
import { AD_SLOTS } from "@/lib/ad-slots";

type InputFormat = "png" | "jpeg" | "webp" | "avif" | "tiff" | "gif" | "svg";
type OutputFormat = "png" | "jpeg" | "webp" | "avif" | "tiff" | "gif";

const OUTPUT_FORMATS: OutputFormat[] = ["png", "jpeg", "webp", "avif", "tiff", "gif"];

const MIME_TO_FORMAT: Record<string, InputFormat> = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/tiff": "tiff",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

const EXT_TO_FORMAT: Record<string, InputFormat> = {
  png: "png",
  jpg: "jpeg",
  jpeg: "jpeg",
  webp: "webp",
  avif: "avif",
  tiff: "tiff",
  tif: "tiff",
  gif: "gif",
  svg: "svg",
};

function detectFormat(file: File): InputFormat {
  const byMime = MIME_TO_FORMAT[file.type];
  if (byMime) return byMime;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_FORMAT[ext] ?? "png";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface FileItem {
  id: string;
  file: File;
  from: InputFormat;
  to: OutputFormat;
  previewUrl: string;
  status: "idle" | "converting" | "done" | "error";
  outputB64?: string;
  outputFormat?: string;
  outputSize?: number;
  errorMsg?: string;
}

let _counter = 0;
function uid() {
  return `img-${++_counter}`;
}

const MAX_BYTES = 3 * 1024 * 1024;

export function ImageConverterUI() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [globalTo, setGlobalTo] = useState<OutputFormat>("webp");
  const [quality, setQuality] = useState(80);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files).filter(
        (f) => f.type.startsWith("image/") || f.name.toLowerCase().endsWith(".svg")
      );
      const newItems: FileItem[] = arr.map((file) => ({
        id: uid(),
        file,
        from: detectFormat(file),
        to: globalTo,
        previewUrl: URL.createObjectURL(file),
        status: "idle",
      }));
      setItems((prev) => [...prev, ...newItems]);
    },
    [globalTo]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const updateItem = (id: string, patch: Partial<FileItem>) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const convertItem = useCallback(
    async (item: FileItem) => {
      if (item.status === "converting") return;
      if (item.file.size > MAX_BYTES) {
        updateItem(item.id, {
          status: "error",
          errorMsg: `${formatBytes(item.file.size)} — max is 3 MB`,
        });
        return;
      }
      updateItem(item.id, { status: "converting", errorMsg: undefined });
      try {
        const b64 = await fileToBase64(item.file);
        const res = await fetch("/api/image-converter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: b64, from: item.from, to: item.to, quality }),
        });
        const json = (await res.json()) as {
          image?: string;
          format?: string;
          size_bytes?: number;
          error?: string;
        };
        if (!res.ok) {
          updateItem(item.id, { status: "error", errorMsg: json.error ?? "Conversion failed" });
        } else {
          updateItem(item.id, {
            status: "done",
            outputB64: json.image,
            outputFormat: json.format,
            outputSize: json.size_bytes,
          });
        }
      } catch (err) {
        updateItem(item.id, {
          status: "error",
          errorMsg: err instanceof Error ? err.message : "Unknown error",
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quality]
  );

  const convertAll = () => {
    items
      .filter((i) => i.status === "idle" || i.status === "error")
      .forEach((i) => void convertItem(i));
  };

  const clearAll = () => {
    items.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    setItems([]);
  };

  const applyGlobalTo = (to: OutputFormat) => {
    setGlobalTo(to);
    setItems((prev) => prev.map((i) => ({ ...i, to, status: i.status === "done" ? "idle" : i.status })));
  };

  const anyPending = items.some((i) => i.status === "idle" || i.status === "error");
  const anyConverting = items.some((i) => i.status === "converting");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Image Converter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Convert images between PNG, JPEG, WebP, AVIF, TIFF, and GIF. Drop multiple files at once.
        </p>
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload images"
        className={[
          "flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors",
          dragging ? "border-accent bg-accent/5" : "border-border hover:border-foreground/30",
        ].join(" ")}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/avif,image/tiff,image/gif,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <UploadIcon />
        <p className="text-sm font-medium text-foreground">
          {items.length > 0 ? "Add more images" : "Drop images here or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground">
          PNG, JPEG, WebP, AVIF, TIFF, GIF, SVG · max 3 MB per file
        </p>
      </div>

      {items.length > 0 && (
        <>
          {/* Controls bar */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <label className="whitespace-nowrap text-sm font-medium text-foreground">
                Convert all to
              </label>
              <select
                value={globalTo}
                onChange={(e) => applyGlobalTo(e.target.value as OutputFormat)}
                className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {OUTPUT_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="whitespace-nowrap text-sm font-medium text-foreground">Quality</label>
              <input
                type="number"
                min={1}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Math.min(100, Math.max(1, Number(e.target.value))))}
                className="w-16 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="ml-auto flex gap-2">
              <button
                onClick={clearAll}
                className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear all
              </button>
              <button
                onClick={convertAll}
                disabled={!anyPending || anyConverting}
                className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                {anyConverting ? "Converting…" : "Convert all"}
              </button>
            </div>
          </div>

          {/* File rows */}
          <div className="space-y-2">
            {items.map((item) => (
              <FileRow
                key={item.id}
                item={item}
                onToChange={(to) => updateItem(item.id, { to, status: item.status === "done" ? "idle" : item.status })}
                onRemove={() => removeItem(item.id)}
                onConvert={() => void convertItem(item)}
              />
            ))}
          </div>
        </>
      )}

      <AdSlot slot={AD_SLOTS["tool-mid"]} />

      <div className="space-y-6 border-t border-border pt-8">
        <section>
          <h2 className="text-base font-semibold text-foreground">What is this?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Image Converter converts image files between popular formats — PNG, JPEG, WebP, AVIF, TIFF, and GIF.
            SVG files can also be rasterised to any of those formats. No software to install and no sign-up required.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Why convert to WebP or AVIF?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            WebP is 25–35% smaller than JPEG/PNG at equivalent quality and is supported by all modern browsers.
            AVIF is 50% smaller still but takes longer to encode. Both are the right choice for web delivery.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">What is the maximum file size?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            3 MB per file, set by the Vercel free-tier request body limit. For larger images, clone the repo and
            run locally — there is no size cap when self-hosted.
          </p>
        </section>
      </div>
    </div>
  );
}

function FileRow({
  item,
  onToChange,
  onRemove,
  onConvert,
}: {
  item: FileItem;
  onToChange: (to: OutputFormat) => void;
  onRemove: () => void;
  onConvert: () => void;
}) {
  const outputName = item.file.name.replace(/\.[^.]+$/, `.${item.outputFormat ?? item.to}`);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
      {/* Thumbnail */}
      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded border border-border bg-background">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            item.status === "done" && item.outputB64
              ? `data:image/${item.outputFormat};base64,${item.outputB64}`
              : item.previewUrl
          }
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      {/* File info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{item.file.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatBytes(item.file.size)}
          {item.status === "done" && item.outputSize != null && (
            <span className="text-success"> → {formatBytes(item.outputSize)}</span>
          )}
          {item.status === "error" && (
            <span className="text-danger"> · {item.errorMsg}</span>
          )}
        </p>
      </div>

      {/* From badge (auto-detected) */}
      <span className="flex-shrink-0 rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
        {item.from.toUpperCase()}
      </span>

      {/* Arrow */}
      <svg
        className="h-4 w-4 flex-shrink-0 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>

      {/* To format */}
      <select
        value={item.to}
        onChange={(e) => onToChange(e.target.value as OutputFormat)}
        disabled={item.status === "converting"}
        className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
      >
        {OUTPUT_FORMATS.map((f) => (
          <option key={f} value={f}>
            {f.toUpperCase()}
          </option>
        ))}
      </select>

      {/* Action */}
      {item.status === "idle" && (
        <button
          onClick={onConvert}
          className="flex-shrink-0 rounded-md border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Convert
        </button>
      )}
      {item.status === "converting" && (
        <span className="flex-shrink-0 animate-pulse text-xs text-muted-foreground">Converting…</span>
      )}
      {item.status === "done" && item.outputB64 && (
        <a
          href={`data:image/${item.outputFormat};base64,${item.outputB64}`}
          download={outputName}
          className="flex-shrink-0 rounded-md bg-success px-3 py-1 text-xs font-medium text-success-foreground transition-opacity hover:opacity-80"
        >
          Download
        </a>
      )}
      {item.status === "error" && (
        <button
          onClick={onConvert}
          className="flex-shrink-0 rounded-md border border-danger/30 bg-danger/10 px-3 py-1 text-xs font-medium text-danger transition-opacity hover:opacity-80"
        >
          Retry
        </button>
      )}

      {/* Remove */}
      <button
        onClick={onRemove}
        disabled={item.status === "converting"}
        className="flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        aria-label="Remove file"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      className="h-8 w-8 text-muted-foreground"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

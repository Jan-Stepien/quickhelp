"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const CHECKERBOARD_STYLE: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23e5e7eb'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23e5e7eb'/%3E%3C/svg%3E\")",
};

type OutputFormat = "png" | "jpeg" | "webp";
type FitMode = "inside" | "cover" | "fill";
type Tab = "resize" | "crop" | "transform";

interface Dimensions { width: number; height: number }

type StageResult = { url: string; dimensions: Dimensions; sizeBytes: number; format: OutputFormat };

type Stage =
  | { kind: "idle" }
  | { kind: "loaded"; file: File; original: Dimensions; objectUrl: string; result?: StageResult }
  | { kind: "error"; message: string };

const CROP_PRESETS = [
  { label: "Free", ratio: null },
  { label: "1:1", ratio: 1 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "16:9", ratio: 16 / 9 },
  { label: "3:2", ratio: 3 / 2 },
];

function getImageDimensions(file: File): Promise<Dimensions> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve({ width: img.naturalWidth, height: img.naturalHeight }); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read image dimensions.")); };
    img.src = url;
  });
}

function processImageOnCanvas(
  file: File,
  opts: {
    resizeWidth?: number;
    resizeHeight?: number;
    fit: FitMode;
    cropX?: number; cropY?: number; cropWidth?: number; cropHeight?: number;
    rotate: 0 | 90 | 180 | 270;
    flipH: boolean;
    flipV: boolean;
    format: OutputFormat;
    quality: number;
  }
): Promise<{ url: string; width: number; height: number; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    const objUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objUrl);
      try {
        let sw = img.naturalWidth, sh = img.naturalHeight;
        let sx = 0, sy = 0;

        if (opts.cropWidth && opts.cropHeight) {
          sx = Math.max(0, Math.min(opts.cropX ?? 0, sw - 1));
          sy = Math.max(0, Math.min(opts.cropY ?? 0, sh - 1));
          sw = Math.min(opts.cropWidth, sw - sx);
          sh = Math.min(opts.cropHeight, sh - sy);
        }

        let dw = sw, dh = sh;
        if (opts.resizeWidth || opts.resizeHeight) {
          const rw = opts.resizeWidth ?? Infinity;
          const rh = opts.resizeHeight ?? Infinity;
          if (opts.fit === "fill") {
            dw = opts.resizeWidth ?? sw;
            dh = opts.resizeHeight ?? sh;
          } else if (opts.fit === "cover") {
            const scaleW = opts.resizeWidth ? opts.resizeWidth / sw : Infinity;
            const scaleH = opts.resizeHeight ? opts.resizeHeight / sh : Infinity;
            const scale = Math.max(scaleW === Infinity ? 0 : scaleW, scaleH === Infinity ? 0 : scaleH);
            dw = Math.round(sw * scale);
            dh = Math.round(sh * scale);
            if (opts.resizeWidth) dw = opts.resizeWidth;
            if (opts.resizeHeight) dh = opts.resizeHeight;
          } else {
            const scale = Math.min(rw / sw, rh / sh);
            dw = Math.round(sw * scale);
            dh = Math.round(sh * scale);
          }
        }

        const rotated = opts.rotate === 90 || opts.rotate === 270;
        const canvasW = rotated ? dh : dw;
        const canvasH = rotated ? dw : dh;

        const canvas = document.createElement("canvas");
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext("2d")!;

        ctx.translate(canvasW / 2, canvasH / 2);
        ctx.rotate((opts.rotate * Math.PI) / 180);
        if (opts.flipH) ctx.scale(-1, 1);
        if (opts.flipV) ctx.scale(1, -1);
        ctx.drawImage(img, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);

        const mime = opts.format === "jpeg" ? "image/jpeg" : opts.format === "webp" ? "image/webp" : "image/png";
        const qualityArg = opts.format === "png" ? undefined : opts.quality / 100;

        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Canvas export failed."));
          const url = URL.createObjectURL(blob);
          resolve({ url, width: canvasW, height: canvasH, sizeBytes: blob.size });
        }, mime, qualityArg);
      } catch (e) {
        reject(e instanceof Error ? e : new Error("Processing failed."));
      }
    };
    img.onerror = () => reject(new Error("Could not load image."));
    img.src = objUrl;
  });
}

export function ImageResizerUI() {
  const [stage, setStage] = useState<Stage>({ kind: "idle" });
  const [tab, setTab] = useState<Tab>("resize");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resize
  const [resizeWidth, setResizeWidth] = useState("");
  const [resizeHeight, setResizeHeight] = useState("");
  const [aspectLock, setAspectLock] = useState(true);
  const [fit, setFit] = useState<FitMode>("inside");

  // Crop
  const [cropX, setCropX] = useState("0");
  const [cropY, setCropY] = useState("0");
  const [cropWidth, setCropWidth] = useState("");
  const [cropHeight, setCropHeight] = useState("");
  const [cropPreset, setCropPreset] = useState<number | null>(null);

  // Transform
  const [rotate, setRotate] = useState<0 | 90 | 180 | 270>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Output
  const [format, setFormat] = useState<OutputFormat>("png");
  const [quality, setQuality] = useState(85);
  const [processing, setProcessing] = useState(false);

  const originalRef = useRef<Dimensions | null>(null);

  // Keep object URLs clean
  useEffect(() => {
    return () => {
      if (stage.kind === "loaded") {
        URL.revokeObjectURL(stage.objectUrl);
        if (stage.result) URL.revokeObjectURL(stage.result.url);
      }
    };
  }, [stage]);

  const loadFile = useCallback(async (file: File) => {
    try {
      const dims = await getImageDimensions(file);
      originalRef.current = dims;
      const objectUrl = URL.createObjectURL(file);
      setStage({ kind: "loaded", file, original: dims, objectUrl });
      setResizeWidth(String(dims.width));
      setResizeHeight(String(dims.height));
      setCropWidth(String(dims.width));
      setCropHeight(String(dims.height));
      setCropX("0"); setCropY("0");
      setRotate(0); setFlipH(false); setFlipV(false);
    } catch (e) {
      setStage({ kind: "error", message: e instanceof Error ? e.message : "Failed to load image." });
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }, [loadFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  }, [loadFile]);

  const handleWidthChange = (v: string) => {
    setResizeWidth(v);
    if (aspectLock && originalRef.current && v) {
      const orig = originalRef.current;
      const w = parseInt(v, 10);
      if (!isNaN(w)) setResizeHeight(String(Math.round((w / orig.width) * orig.height)));
    }
  };

  const handleHeightChange = (v: string) => {
    setResizeHeight(v);
    if (aspectLock && originalRef.current && v) {
      const orig = originalRef.current;
      const h = parseInt(v, 10);
      if (!isNaN(h)) setResizeWidth(String(Math.round((h / orig.height) * orig.width)));
    }
  };

  const handleCropPreset = (ratio: number | null) => {
    setCropPreset(ratio);
    if (ratio && originalRef.current) {
      const orig = originalRef.current;
      const cx = parseInt(cropX, 10) || 0;
      const cy = parseInt(cropY, 10) || 0;
      const availW = orig.width - cx;
      const availH = orig.height - cy;
      if (availW / availH > ratio) {
        const h = availH;
        const w = Math.round(h * ratio);
        setCropWidth(String(w)); setCropHeight(String(h));
      } else {
        const w = availW;
        const h = Math.round(w / ratio);
        setCropWidth(String(w)); setCropHeight(String(h));
      }
    }
  };

  const handleProcess = async () => {
    if (stage.kind !== "loaded") return;
    setProcessing(true);
    try {
      const cw = parseInt(cropWidth, 10);
      const ch = parseInt(cropHeight, 10);
      const hasCrop = cw > 0 && ch > 0 && (cw < stage.original.width || ch < stage.original.height || parseInt(cropX, 10) > 0 || parseInt(cropY, 10) > 0);
      const rw = parseInt(resizeWidth, 10);
      const rh = parseInt(resizeHeight, 10);
      const hasResize = (rw > 0 && rw !== stage.original.width) || (rh > 0 && rh !== stage.original.height);

      const result = await processImageOnCanvas(stage.file, {
        resizeWidth: hasResize ? (rw > 0 ? rw : undefined) : undefined,
        resizeHeight: hasResize ? (rh > 0 ? rh : undefined) : undefined,
        fit,
        cropX: hasCrop ? parseInt(cropX, 10) : undefined,
        cropY: hasCrop ? parseInt(cropY, 10) : undefined,
        cropWidth: hasCrop ? cw : undefined,
        cropHeight: hasCrop ? ch : undefined,
        rotate,
        flipH,
        flipV,
        format,
        quality,
      });
      // Revoke the previous result URL before updating
      if (stage.result) URL.revokeObjectURL(stage.result.url);
      setStage({
        ...stage,
        result: { url: result.url, dimensions: { width: result.width, height: result.height }, sizeBytes: result.sizeBytes, format },
      });
    } catch (e) {
      setStage({ kind: "error", message: e instanceof Error ? e.message : "Processing failed." });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (stage.kind !== "loaded" || !stage.result) return;
    const a = document.createElement("a");
    a.href = stage.result.url;
    a.download = `resized.${stage.result.format}`;
    a.click();
  };

  const reset = () => {
    if (stage.kind === "loaded") {
      URL.revokeObjectURL(stage.objectUrl);
      if (stage.result) URL.revokeObjectURL(stage.result.url);
    }
    setStage({ kind: "idle" });
  };

  if (stage.kind === "idle" || stage.kind === "error") {
    return (
      <div className="space-y-4">
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload image"
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors cursor-pointer select-none
            ${dragging ? "border-foreground bg-muted/40" : "border-border hover:border-foreground/40 hover:bg-muted/20"}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileInput} />
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-muted p-3">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5M5.25 3h-.008v.008H5.25V3zm0 16.5h-.008v.008H5.25v-.008z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm">Drop your image here</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPEG, WebP, AVIF, GIF · no size limit</p>
            </div>
          </div>
        </div>
        {stage.kind === "error" && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {stage.message}
          </div>
        )}
      </div>
    );
  }

  // loaded state
  const { original, objectUrl, result } = stage;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Preview — updates to show result after processing */}
        <div className="space-y-2">
          <div className="rounded-xl border border-border overflow-hidden" style={CHECKERBOARD_STYLE}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result?.url ?? objectUrl} alt={result ? "Processed result" : "Original"} className="w-full object-contain max-h-64" />
          </div>
          {result ? (
            <div className="rounded-lg border border-border p-2 space-y-2">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{result.dimensions.width}×{result.dimensions.height}</span>
                {" · "}{(result.sizeBytes / 1024).toFixed(0)} KB · {result.format.toUpperCase()}
                <span className="ml-1 text-muted-foreground/60">(was {original.width}×{original.height})</span>
              </p>
              <button
                onClick={handleDownload}
                className="w-full rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity"
              >
                Download {result.format.toUpperCase()}
              </button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground font-mono">{original.width}×{original.height} px · original</p>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-mono">{original.width}×{original.height} px · source</p>

          {/* Tabs */}
          <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium">
            {(["resize", "crop", "transform"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 px-2 py-1.5 capitalize transition-colors ${tab === t ? "bg-foreground text-background" : "hover:bg-muted"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "resize" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-muted-foreground">Width (px)</label>
                  <input type="number" value={resizeWidth} onChange={(e) => handleWidthChange(e.target.value)} min={1} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-foreground/20" />
                </div>
                <button
                  onClick={() => setAspectLock((v) => !v)}
                  className={`mt-5 rounded-md border px-2 py-1.5 text-xs transition-colors ${aspectLock ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"}`}
                  title={aspectLock ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                >
                  {aspectLock ? "🔒" : "🔓"}
                </button>
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-muted-foreground">Height (px)</label>
                  <input type="number" value={resizeHeight} onChange={(e) => handleHeightChange(e.target.value)} min={1} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-foreground/20" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Fit mode</label>
                <select value={fit} onChange={(e) => setFit(e.target.value as FitMode)} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none">
                  <option value="inside">Inside — fit within bounds (default)</option>
                  <option value="cover">Cover — fill and crop overflow</option>
                  <option value="fill">Fill — stretch to exact size</option>
                </select>
              </div>
            </div>
          )}

          {tab === "crop" && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {CROP_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleCropPreset(p.ratio)}
                    className={`rounded border px-2 py-0.5 text-xs transition-colors ${cropPreset === p.ratio ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "X (left)", val: cropX, set: setCropX },
                  { label: "Y (top)", val: cropY, set: setCropY },
                  { label: "Width", val: cropWidth, set: setCropWidth },
                  { label: "Height", val: cropHeight, set: setCropHeight },
                ].map(({ label, val, set }) => (
                  <div key={label} className="space-y-0.5">
                    <label className="text-xs text-muted-foreground">{label}</label>
                    <input type="number" value={val} onChange={(e) => set(e.target.value)} min={0} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-foreground/20" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "transform" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Rotate</label>
                <div className="flex gap-1">
                  {([0, 90, 180, 270] as const).map((deg) => (
                    <button
                      key={deg}
                      onClick={() => setRotate(deg)}
                      className={`flex-1 rounded border py-1.5 text-xs font-mono transition-colors ${rotate === deg ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"}`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFlipH((v) => !v)}
                  className={`flex-1 rounded border py-1.5 text-xs transition-colors ${flipH ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"}`}
                >
                  Flip H
                </button>
                <button
                  onClick={() => setFlipV((v) => !v)}
                  className={`flex-1 rounded border py-1.5 text-xs transition-colors ${flipV ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"}`}
                >
                  Flip V
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Output settings */}
      <div className="rounded-lg border border-border p-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Output</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Format</label>
            <div className="flex gap-1">
              {(["png", "jpeg", "webp"] as OutputFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`rounded border px-3 py-1.5 text-xs uppercase font-mono transition-colors ${format === f ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          {format !== "png" && (
            <div className="flex-1 min-w-32 space-y-1">
              <label className="text-xs text-muted-foreground">Quality: {quality}</label>
              <input
                type="range"
                min={1}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleProcess}
          disabled={processing}
          className="flex-1 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? "Processing…" : result ? "Re-apply" : "Apply & Preview"}
        </button>
        <button onClick={reset} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted transition-colors">
          New image
        </button>
      </div>
    </div>
  );
}

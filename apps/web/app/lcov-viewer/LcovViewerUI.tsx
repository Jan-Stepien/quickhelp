"use client";

import { useRef, useState, useCallback } from "react";

interface FileCoverage {
  path: string;
  linesCoverage: number;
  functionsCoverage: number;
  branchesCoverage: number;
  linesHit: number;
  linesFound: number;
  functionsHit: number;
  functionsFound: number;
  branchesHit: number;
  branchesFound: number;
}

interface LcovReport {
  summary: FileCoverage & { linesCoverage: number; functionsCoverage: number; branchesCoverage: number };
  files: FileCoverage[];
}

type SortKey = "path" | "linesCoverage" | "functionsCoverage" | "branchesCoverage";
type Stage =
  | { kind: "idle" }
  | { kind: "done"; report: LcovReport }
  | { kind: "error"; message: string };

function pct(hit: number, found: number): number {
  if (found === 0) return 100;
  return Math.round((hit / found) * 1000) / 10;
}

function parseLcov(content: string): LcovReport {
  const files: FileCoverage[] = [];
  const records = content.split(/end_of_record/i);

  for (const record of records) {
    const trimmed = record.trim();
    if (!trimmed) continue;

    let path = "";
    let linesFound = 0, linesHit = 0;
    let functionsFound = 0, functionsHit = 0;
    let branchesFound = 0, branchesHit = 0;

    for (const line of trimmed.split(/\r?\n/)) {
      const colon = line.indexOf(":");
      if (colon === -1) continue;
      const key = line.slice(0, colon).trim();
      const value = line.slice(colon + 1).trim();

      switch (key) {
        case "SF": path = value; break;
        case "LF": linesFound = parseInt(value, 10) || 0; break;
        case "LH": linesHit = parseInt(value, 10) || 0; break;
        case "FNF": functionsFound = parseInt(value, 10) || 0; break;
        case "FNH": functionsHit = parseInt(value, 10) || 0; break;
        case "BRF": branchesFound = parseInt(value, 10) || 0; break;
        case "BRH": branchesHit = parseInt(value, 10) || 0; break;
      }
    }

    if (!path) continue;
    files.push({
      path,
      linesCoverage: pct(linesHit, linesFound),
      functionsCoverage: pct(functionsHit, functionsFound),
      branchesCoverage: pct(branchesHit, branchesFound),
      linesHit, linesFound,
      functionsHit, functionsFound,
      branchesHit, branchesFound,
    });
  }

  if (files.length === 0) throw new Error("No source files found. Is this a valid LCOV .info file?");

  const totals = files.reduce(
    (acc, f) => ({
      linesHit: acc.linesHit + f.linesHit,
      linesFound: acc.linesFound + f.linesFound,
      functionsHit: acc.functionsHit + f.functionsHit,
      functionsFound: acc.functionsFound + f.functionsFound,
      branchesHit: acc.branchesHit + f.branchesHit,
      branchesFound: acc.branchesFound + f.branchesFound,
    }),
    { linesHit: 0, linesFound: 0, functionsHit: 0, functionsFound: 0, branchesHit: 0, branchesFound: 0 }
  );

  return {
    summary: {
      path: "All Files",
      linesCoverage: pct(totals.linesHit, totals.linesFound),
      functionsCoverage: pct(totals.functionsHit, totals.functionsFound),
      branchesCoverage: pct(totals.branchesHit, totals.branchesFound),
      ...totals,
    },
    files,
  };
}

function coverageColor(pct: number): string {
  if (pct >= 80) return "text-green-600 dark:text-green-400";
  if (pct >= 60) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function coverageBg(pct: number): string {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

function CoverageBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden flex-shrink-0">
        <div
          className={`h-full rounded-full ${coverageBg(value)}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className={`text-xs font-mono font-medium ${coverageColor(value)}`}>
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

function SummaryCard({ label, pct, hit, found }: { label: string; pct: number; hit: number; found: number }) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold font-mono ${coverageColor(pct)}`}>{pct.toFixed(1)}%</p>
      <p className="text-xs text-muted-foreground font-mono">{hit}/{found} covered</p>
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${coverageBg(pct)}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

export function LcovViewerUI() {
  const [stage, setStage] = useState<Stage>({ kind: "idle" });
  const [sortKey, setSortKey] = useState<SortKey>("linesCoverage");
  const [sortAsc, setSortAsc] = useState(true);
  const [filter, setFilter] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const report = parseLcov(content);
        setStage({ kind: "done", report });
        setFilter("");
        setSortKey("linesCoverage");
        setSortAsc(true);
      } catch (err) {
        setStage({ kind: "error", message: err instanceof Error ? err.message : "Failed to parse file." });
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");
    if (text.includes("end_of_record")) {
      e.preventDefault();
      try {
        const report = parseLcov(text);
        setStage({ kind: "done", report });
      } catch (err) {
        setStage({ kind: "error", message: err instanceof Error ? err.message : "Failed to parse content." });
      }
    }
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <span className="text-muted-foreground/40">↕</span>;
    return <span>{sortAsc ? "↑" : "↓"}</span>;
  };

  if (stage.kind === "idle" || stage.kind === "error") {
    return (
      <div className="space-y-4">
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload LCOV file"
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors cursor-pointer select-none
            ${dragging ? "border-foreground bg-muted/40" : "border-border hover:border-foreground/40 hover:bg-muted/20"}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".info,.lcov,text/plain"
            className="sr-only"
            onChange={handleFileInput}
          />
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-muted p-3">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm">Drop your lcov.info file here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse — .info and .lcov accepted</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <p className="text-xs text-muted-foreground mb-1.5">Or paste raw LCOV content:</p>
          <textarea
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-y"
            rows={5}
            placeholder={"TN:\nSF:src/index.ts\n...\nend_of_record"}
            onPaste={handlePaste}
            onChange={(e) => {
              if (e.target.value.includes("end_of_record")) {
                try {
                  const report = parseLcov(e.target.value);
                  setStage({ kind: "done", report });
                } catch {
                  // wait for more content
                }
              }
            }}
          />
        </div>

        {stage.kind === "error" && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {stage.message}
          </div>
        )}
      </div>
    );
  }

  const { report } = stage;
  const filteredFiles = report.files
    .filter((f) => f.path.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      const diff = sortKey === "path"
        ? a.path.localeCompare(b.path)
        : a[sortKey] - b[sortKey];
      return sortAsc ? diff : -diff;
    });

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Lines" pct={report.summary.linesCoverage} hit={report.summary.linesHit} found={report.summary.linesFound} />
        <SummaryCard label="Functions" pct={report.summary.functionsCoverage} hit={report.summary.functionsHit} found={report.summary.functionsFound} />
        <SummaryCard label="Branches" pct={report.summary.branchesCoverage} hit={report.summary.branchesHit} found={report.summary.branchesFound} />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter files…"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
        />
        <button
          onClick={() => setStage({ kind: "idle" })}
          className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
        >
          Load another file
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                <button onClick={() => toggleSort("path")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  File <SortIcon k="path" />
                </button>
              </th>
              <th className="text-right px-3 py-2 font-medium text-muted-foreground hidden sm:table-cell">
                Lines
              </th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                <button onClick={() => toggleSort("linesCoverage")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Line Cov. <SortIcon k="linesCoverage" />
                </button>
              </th>
              <th className="text-right px-3 py-2 font-medium text-muted-foreground hidden md:table-cell">
                Fns
              </th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground hidden md:table-cell">
                <button onClick={() => toggleSort("functionsCoverage")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Fn Cov. <SortIcon k="functionsCoverage" />
                </button>
              </th>
              <th className="text-right px-3 py-2 font-medium text-muted-foreground hidden lg:table-cell">
                Branches
              </th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground hidden lg:table-cell">
                <button onClick={() => toggleSort("branchesCoverage")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Branch Cov. <SortIcon k="branchesCoverage" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.map((file) => (
              <tr key={file.path} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-3 py-2 font-mono text-xs max-w-xs truncate text-foreground/80">
                  {file.path}
                </td>
                <td className="px-3 py-2 text-right text-xs font-mono text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                  {file.linesHit}/{file.linesFound}
                </td>
                <td className="px-3 py-2">
                  <CoverageBar value={file.linesCoverage} />
                </td>
                <td className="px-3 py-2 text-right text-xs font-mono text-muted-foreground hidden md:table-cell whitespace-nowrap">
                  {file.functionsHit}/{file.functionsFound}
                </td>
                <td className="px-3 py-2 hidden md:table-cell">
                  <CoverageBar value={file.functionsCoverage} />
                </td>
                <td className="px-3 py-2 text-right text-xs font-mono text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                  {file.branchesHit}/{file.branchesFound}
                </td>
                <td className="px-3 py-2 hidden lg:table-cell">
                  <CoverageBar value={file.branchesCoverage} />
                </td>
              </tr>
            ))}
            {filteredFiles.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No files match &ldquo;{filter}&rdquo;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground text-right">
        {filteredFiles.length} of {report.files.length} files · parsed in your browser
      </p>
    </div>
  );
}

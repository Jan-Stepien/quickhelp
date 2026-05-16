"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, CodeBlock, CopyButton, Select, Textarea } from "@quickhelp/ui";
import { JsonTree } from "./JsonTree";
import { repairJson, extractErrorPosition } from "./repair";

type Indent = "2" | "4" | "tab";
type Tab = "formatted" | "tree" | "raw";

interface FormatResult {
  output: string;
  parsed: unknown;
  valid: boolean;
  error?: string;
  errorLine?: number;
  errorCol?: number;
}

function formatJson(input: string, indent: Indent, sort: boolean, repair: boolean): FormatResult {
  let src = input;
  if (repair) src = repairJson(src);
  try {
    let parsed: unknown = JSON.parse(src);
    if (sort && parsed !== null && typeof parsed === "object") {
      parsed = sortDeep(parsed);
    }
    const indentVal = indent === "tab" ? "\t" : parseInt(indent, 10);
    const output = JSON.stringify(parsed, null, indentVal);
    return { output, parsed, valid: true };
  } catch (err) {
    const pos = extractErrorPosition(err);
    // Try to get line/col from the error message directly
    const msg = err instanceof SyntaxError ? err.message : "Invalid JSON";
    const lcMatch = /line (\d+) column (\d+)/.exec(msg);
    return {
      output: input,
      parsed: null,
      valid: false,
      error: msg,
      errorLine: lcMatch ? parseInt(lcMatch[1]!, 10) : pos?.line,
      errorCol: lcMatch ? parseInt(lcMatch[2]!, 10) : pos?.column,
    };
  }
}

function sortDeep(val: unknown): unknown {
  if (Array.isArray(val)) return val.map(sortDeep);
  if (val !== null && typeof val === "object") {
    return Object.fromEntries(
      Object.keys(val as Record<string, unknown>)
        .sort()
        .map((k) => [k, sortDeep((val as Record<string, unknown>)[k])])
    );
  }
  return val;
}

function downloadJson(content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "formatted.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function JsonFormatterUI() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<Indent>("2");
  const [sort, setSort] = useState(false);
  const [repair, setRepair] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("formatted");
  const [result, setResult] = useState<FormatResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced live format
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!input.trim()) { setResult(null); return; }
      setResult(formatJson(input, indent, sort, repair));
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [input, indent, sort, repair]);

  const loadSample = useCallback(() => {
    setInput(JSON.stringify({
      name: "quickhelp.dev",
      tools: ["jwt-decoder", "json-formatter", "image-converter"],
      version: 1,
      active: true,
      meta: { author: "Anna", created: null },
    }, null, 2));
  }, []);

  const validBadge = result
    ? result.valid
      ? <Badge variant="success">Valid JSON</Badge>
      : <Badge variant="danger">
          Invalid{result.errorLine ? ` · line ${result.errorLine}${result.errorCol ? `:${result.errorCol}` : ""}` : ""}
        </Badge>
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">JSON Formatter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Format, validate, sort, and explore JSON. Repair mode fixes trailing commas, single quotes, and comments.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">Indent</label>
          <Select
            className="w-24"
            value={indent}
            onChange={(e) => setIndent(e.target.value as Indent)}
            options={[
              { value: "2", label: "2 spaces" },
              { value: "4", label: "4 spaces" },
              { value: "tab", label: "Tab" },
            ]}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground">
          <input
            type="checkbox"
            checked={sort}
            onChange={(e) => setSort(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-border accent-accent"
          />
          Sort keys
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground">
          <input
            type="checkbox"
            checked={repair}
            onChange={(e) => setRepair(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-border accent-accent"
          />
          Repair
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (result?.valid) {
              const indentVal = indent === "tab" ? "\t" : parseInt(indent, 10);
              setInput(JSON.stringify(JSON.parse(result.output), null, indentVal));
            }
          }}
        >
          Minify
        </Button>
        <Button variant="ghost" size="sm" onClick={loadSample}>
          Load example
        </Button>
      </div>

      {/* Editor + Output */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            {validBadge}
          </CardHeader>
          <CardBody>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={20}
              placeholder={'Paste JSON here…\n\n{"key": "value"}'}
              className="text-xs leading-relaxed"
              spellCheck={false}
            />
            {result && !result.valid && result.error && (
              <p className="mt-2 rounded-md bg-danger/10 px-3 py-2 font-mono text-xs text-danger">
                {result.error}
              </p>
            )}
          </CardBody>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <div className="flex gap-1 text-xs">
              {(["formatted", "tree", "raw"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-md px-2 py-1 font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {result?.valid && <CopyButton text={result.output} />}
              {result?.valid && (
                <Button variant="ghost" size="sm" onClick={() => downloadJson(result.output)}>
                  ↓ Download
                </Button>
              )}
            </div>
          </CardHeader>
          <CardBody>
            {!result && (
              <p className="text-xs text-muted-foreground italic">Paste JSON to see formatted output</p>
            )}
            {result && activeTab === "formatted" && (
              <CodeBlock code={result.output} language={result.valid ? "json" : "text"} className="text-xs" />
            )}
            {result && activeTab === "tree" && result.valid && result.parsed !== null && (
              <JsonTree value={result.parsed} />
            )}
            {result && activeTab === "tree" && !result.valid && (
              <p className="text-xs text-muted-foreground italic">Fix the JSON to see the tree view</p>
            )}
            {result && activeTab === "raw" && (
              <pre className="overflow-auto rounded-md bg-muted p-4 font-mono text-xs">{result.output}</pre>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Content block */}
      <div className="space-y-6 border-t border-border pt-8">
        <section>
          <h2 className="text-base font-semibold text-foreground">What is this?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A JSON formatter parses a JSON string and re-serializes it with consistent indentation or no whitespace.
            The repair mode tolerates common mistakes — trailing commas, single-quoted strings, and{" "}
            <code className="font-mono text-xs">// comments</code> — so you can paste real-world config files
            without manually fixing every lint error first.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Tree view</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Click any key or value in the Tree tab to copy its JSONPath to the clipboard. Nodes deeper than 2
            levels are collapsed by default — click the arrow to expand.
          </p>
        </section>
      </div>
    </div>
  );
}

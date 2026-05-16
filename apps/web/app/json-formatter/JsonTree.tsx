"use client";

import React, { useState } from "react";

const COLORS = {
  key: "var(--json-key)",
  string: "var(--json-string)",
  number: "var(--json-number)",
  boolean: "var(--json-keyword)",
  null: "var(--muted-foreground)",
  bracket: "var(--muted-foreground)",
};

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className="ml-1.5 rounded px-1 py-0.5 font-mono text-[10px]"
      style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
    >
      {type}
    </span>
  );
}

function Primitive({
  value,
  jsonPath,
}: {
  value: string | number | boolean | null;
  jsonPath: string;
}) {
  const [copied, setCopied] = useState(false);
  const type = value === null ? "null" : typeof value;
  const color = type === "string" ? COLORS.string : type === "number" ? COLORS.number : type === "boolean" ? COLORS.boolean : COLORS.null;
  const display = type === "string" ? `"${String(value)}"` : String(value);

  function copyPath() {
    navigator.clipboard.writeText(jsonPath).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span
      className="group cursor-pointer"
      onClick={copyPath}
      title={`Copy path: ${jsonPath}`}
    >
      <span style={{ color, fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{display}</span>
      <TypeBadge type={type} />
      {copied && <span className="ml-1 text-[10px]" style={{ color: "var(--success)" }}>✓</span>}
    </span>
  );
}

interface NodeProps {
  value: unknown;
  jsonPath: string;
  depth: number;
}

function TreeNode({ value, jsonPath, depth }: NodeProps) {
  const [collapsed, setCollapsed] = useState(depth > 2);

  if (value === null || typeof value !== "object") {
    return <Primitive value={value as string | number | boolean | null} jsonPath={jsonPath} />;
  }

  const isArray = Array.isArray(value);
  const entries = isArray
    ? (value as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
    : Object.entries(value as Record<string, unknown>);

  const open = isArray ? "[" : "{";
  const close = isArray ? "]" : "}";
  const preview = `${entries.length} ${isArray ? "items" : "keys"}`;

  return (
    <span>
      <button
        className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded text-[10px] leading-none"
        style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed ? "▶" : "▼"}
      </button>
      <span style={{ color: COLORS.bracket, fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{open}</span>
      {collapsed ? (
        <>
          <span className="ml-1 text-xs" style={{ color: "var(--muted-foreground)" }}>{preview}</span>
          <span style={{ color: COLORS.bracket, fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{close}</span>
        </>
      ) : (
        <>
          <div className="ml-5 border-l border-dashed" style={{ borderColor: "var(--border)" }}>
            {entries.map(([k, v]) => {
              const childPath = isArray ? `${jsonPath}[${k}]` : `${jsonPath}.${k}`;
              return (
                <div key={k} className="py-0.5 pl-3">
                  {!isArray && (
                    <>
                      <span
                        className="cursor-pointer"
                        style={{ color: COLORS.key, fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}
                        onClick={() => { navigator.clipboard.writeText(childPath).catch(() => {}); }}
                        title={`Copy path: ${childPath}`}
                      >
                        &quot;{k}&quot;
                      </span>
                      <span className="mx-1" style={{ color: COLORS.bracket, fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>:</span>
                    </>
                  )}
                  <TreeNode value={v} jsonPath={childPath} depth={depth + 1} />
                </div>
              );
            })}
          </div>
          <span style={{ color: COLORS.bracket, fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{close}</span>
        </>
      )}
    </span>
  );
}

export function JsonTree({ value }: { value: unknown }) {
  return (
    <div className="overflow-auto rounded-md bg-muted p-4 text-sm">
      <TreeNode value={value} jsonPath="$" depth={0} />
    </div>
  );
}

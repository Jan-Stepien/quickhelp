"use client";

import React from "react";
import { cn } from "./cn";

// Minimal JSON tokenizer — handles the common cases from JSON.stringify output
const TOKEN_RE = /("(?:[^"\\]|\\.)*")(\s*:\s*)|("(?:[^"\\]|\\.)*")|(true|false|null)|([-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],])/g;

function renderJson(code: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let idx = 0;
  TOKEN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = TOKEN_RE.exec(code)) !== null) {
    if (m.index > last) {
      nodes.push(code.slice(last, m.index));
    }
    const [full, keyStr, colon, valStr, keyword, num] = m;
    if (keyStr && colon !== undefined) {
      nodes.push(
        <span key={idx++} style={{ color: "var(--json-key)" }}>
          {keyStr}
        </span>
      );
      nodes.push(colon);
    } else if (valStr) {
      nodes.push(
        <span key={idx++} style={{ color: "var(--json-string)" }}>
          {valStr}
        </span>
      );
    } else if (keyword) {
      nodes.push(
        <span key={idx++} style={{ color: "var(--json-keyword)" }}>
          {keyword}
        </span>
      );
    } else if (num) {
      nodes.push(
        <span key={idx++} style={{ color: "var(--json-number)" }}>
          {num}
        </span>
      );
    } else {
      nodes.push(
        <span key={idx++} className="text-muted-foreground">
          {full}
        </span>
      );
    }
    last = m.index + full.length;
  }
  if (last < code.length) nodes.push(code.slice(last));
  return nodes;
}

interface CodeBlockProps {
  code: string;
  language?: "json" | "text";
  className?: string;
}

export function CodeBlock({ code, language = "json", className }: CodeBlockProps) {
  const content = language === "json" ? renderJson(code) : code;
  return (
    <pre
      className={cn(
        "overflow-auto rounded-md bg-muted p-4 font-mono text-sm leading-relaxed text-foreground",
        className
      )}
    >
      <code>{content}</code>
    </pre>
  );
}

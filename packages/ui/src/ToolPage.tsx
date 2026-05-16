"use client";

import React, { useState } from "react";
import type { Tool, ToolContent } from "@quickhelp/tool-kit";
import { CopyButton } from "./CopyButton.js";

interface ToolPageProps {
  tool: Tool;
}

export function ToolPage({ tool }: ToolPageProps) {
  const [output, setOutput] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const input: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      input[key] = value;
    }

    try {
      const res = await fetch(`/api/${tool.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        setError(String(json["error"] ?? "Request failed"));
      } else {
        setOutput(json);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const outputStr = output ? JSON.stringify(output, null, 2) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{tool.name}</h1>
        <p className="mt-1 text-gray-600">{tool.summary}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-6">
        <ToolForm tool={tool} />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? "Running…" : "Run"}
        </button>
      </form>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {outputStr && (
        <div className="relative rounded-lg border bg-white p-6">
          <div className="absolute right-4 top-4">
            <CopyButton text={outputStr} />
          </div>
          <pre className="overflow-auto text-sm">{outputStr}</pre>
        </div>
      )}

      {tool.content && <ContentBlock content={tool.content} />}
    </div>
  );
}

function ToolForm({ tool }: { tool: Tool }) {
  const shape = getShape(tool.inputSchema);
  return (
    <>
      {Object.entries(shape).map(([key, fieldSchema]) => (
        <div key={key} className="space-y-1">
          <label htmlFor={key} className="block text-sm font-medium text-gray-700 capitalize">
            {key}
          </label>
          {isTextArea(fieldSchema) ? (
            <textarea
              id={key}
              name={key}
              rows={6}
              className="w-full rounded-md border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder={(fieldSchema as { description?: string }).description}
            />
          ) : (
            <input
              id={key}
              name={key}
              type="text"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder={(fieldSchema as { description?: string }).description}
            />
          )}
        </div>
      ))}
    </>
  );
}

function ContentBlock({ content }: { content: ToolContent }) {
  return (
    <div className="space-y-6 border-t pt-8">
      {content.whatIs && (
        <section>
          <h2 className="text-lg font-semibold">What is this?</h2>
          <p className="mt-2 text-gray-700">{content.whatIs}</p>
        </section>
      )}

      {content.howToSteps.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">How to use</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            {content.howToSteps.map((step, i) => (
              <li key={i}>
                <strong>{step.name}</strong>: {step.text}
              </li>
            ))}
          </ol>
        </section>
      )}

      {content.faq.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">FAQ</h2>
          <dl className="mt-2 space-y-4">
            {content.faq.map((item, i) => (
              <div key={i}>
                <dt className="font-medium text-gray-900">{item.question}</dt>
                <dd className="mt-1 text-gray-700">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}

function getShape(schema: Tool["inputSchema"]): Record<string, unknown> {
  try {
    const s = schema as { shape?: Record<string, unknown> };
    return s.shape ?? {};
  } catch {
    return {};
  }
}

function isTextArea(fieldSchema: unknown): boolean {
  const s = fieldSchema as { _def?: { checks?: Array<{ kind: string; value: number }> } };
  return s._def?.checks?.some((c) => c.kind === "min" && c.value > 50) ?? false;
}

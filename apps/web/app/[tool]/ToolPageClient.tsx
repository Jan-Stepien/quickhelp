"use client";

import React, { useRef, useState } from "react";
import type { SerializedTool, FormField } from "@/lib/tool-serializer";
import type { ToolContent } from "@no-work/tool-kit";

interface ToolPageClientProps {
  tool: SerializedTool;
  prefilledValues?: Record<string, string>;
}

export function ToolPageClient({ tool, prefilledValues }: ToolPageClientProps) {
  const [output, setOutput] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileBase64Ref = useRef<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const input: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      input[key] = value;
    }
    // Overlay base64 file values (hidden inputs won't capture them reliably cross-browser)
    for (const [key, b64] of Object.entries(fileBase64Ref.current)) {
      input[key] = b64;
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

  // For image output, detect base64 image in the output
  const imageOutput =
    output &&
    typeof output["image"] === "string" &&
    typeof output["format"] === "string"
      ? { b64: output["image"] as string, format: output["format"] as string }
      : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{tool.name}</h1>
        <p className="mt-1 text-gray-600">{tool.summary}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-6">
        {tool.fields.map((field) => (
          <FieldInput
            key={field.key}
            field={field}
            prefilledValue={prefilledValues?.[field.key]}
            onFileBase64={(b64) => {
              fileBase64Ref.current[field.key] = b64;
            }}
          />
        ))}
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

      {imageOutput && (
        <div className="rounded-lg border bg-white p-6 space-y-4">
          <h2 className="text-sm font-medium text-gray-700">Converted image</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/${imageOutput.format};base64,${imageOutput.b64}`}
            alt="Converted output"
            className="max-w-full rounded border"
          />
          <a
            href={`data:image/${imageOutput.format};base64,${imageOutput.b64}`}
            download={`converted.${imageOutput.format}`}
            className="inline-block rounded-md border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Download
          </a>
        </div>
      )}

      {outputStr && !imageOutput && (
        <div className="relative rounded-lg border bg-white p-6">
          <CopyButton text={outputStr} />
          <pre className="overflow-auto pt-6 text-sm">{outputStr}</pre>
        </div>
      )}

      {tool.content && <ContentBlock content={tool.content} />}
    </div>
  );
}

function FieldInput({
  field,
  prefilledValue,
  onFileBase64,
}: {
  field: FormField;
  prefilledValue?: string;
  onFileBase64?: (b64: string) => void;
}) {
  const baseClass =
    "w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";

  if (field.type === "file") {
    return (
      <div className="space-y-1">
        <label htmlFor={field.key} className="block text-sm font-medium capitalize text-gray-700">
          {field.label}
        </label>
        <input
          id={field.key}
          name={field.key}
          type="file"
          accept={field.accept}
          className={baseClass}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file || !onFileBase64) return;
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              // Strip the data URL prefix (e.g. "data:image/png;base64,")
              const b64 = result.split(",")[1] ?? "";
              onFileBase64(b64);
            };
            reader.readAsDataURL(file);
          }}
        />
        {field.placeholder && (
          <p className="text-xs text-gray-500">{field.placeholder}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label htmlFor={field.key} className="block text-sm font-medium capitalize text-gray-700">
        {field.label}
      </label>
      {field.type === "textarea" ? (
        <textarea
          id={field.key}
          name={field.key}
          rows={6}
          defaultValue={prefilledValue ?? field.defaultValue}
          placeholder={field.placeholder}
          className={`${baseClass} font-mono`}
        />
      ) : (
        <input
          id={field.key}
          name={field.key}
          type="text"
          defaultValue={prefilledValue ?? field.defaultValue}
          placeholder={field.placeholder}
          className={baseClass}
        />
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function handleClick() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleClick}
      className="absolute right-4 top-4 rounded-md border px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
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

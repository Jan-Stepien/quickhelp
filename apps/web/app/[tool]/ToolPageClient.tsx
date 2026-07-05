"use client";

import React, { useRef, useState } from "react";
import type { SerializedTool, FormField } from "@/lib/tool-serializer";
import { Button, Card, CardBody, Textarea, Input, Select, CodeBlock, CopyButton } from "@quickhelp/ui";

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
      const field = tool.fields.find((f) => f.key === key);
      if (field?.type === "file") continue; // populated via fileBase64Ref below
      if (field?.type === "number" && typeof value === "string" && value !== "") {
        input[key] = Number(value);
      } else {
        input[key] = value;
      }
    }
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

  const imageOutput =
    output &&
    typeof output["image"] === "string" &&
    typeof output["format"] === "string"
      ? { b64: output["image"] as string, format: output["format"] as string }
      : null;

  return (
    <div className="space-y-8">
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {tool.fields.map((field) => (
              <FieldInput
                key={field.key}
                field={field}
                prefilledValue={prefilledValues?.[field.key]}
                onFileBase64={(b64) => { fileBase64Ref.current[field.key] = b64; }}
              />
            ))}
            <Button type="submit" disabled={loading}>
              {loading ? "Running…" : "Run"}
            </Button>
          </form>
        </CardBody>
      </Card>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {imageOutput && (
        <Card>
          <CardBody className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Converted image</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/${imageOutput.format};base64,${imageOutput.b64}`}
              alt="Converted output"
              className="max-w-full rounded border border-border"
            />
            <a
              href={`data:image/${imageOutput.format};base64,${imageOutput.b64}`}
              download={`converted.${imageOutput.format}`}
            >
              <Button variant="outline" size="sm">Download</Button>
            </a>
          </CardBody>
        </Card>
      )}

      {outputStr && !imageOutput && (
        <Card>
          <CardBody className="relative">
            <div className="absolute right-3 top-3">
              <CopyButton text={outputStr} />
            </div>
            <CodeBlock code={outputStr} language="json" className="mt-2" />
          </CardBody>
        </Card>
      )}

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
  const label = (
    <label htmlFor={field.key} className="mb-1 block text-sm font-medium capitalize text-foreground">
      {field.label}
    </label>
  );

  if (field.type === "file") {
    return (
      <div>
        {label}
        <Input
          id={field.key}
          name={field.key}
          type="file"
          accept={field.accept}
          onChange={(e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file || !onFileBase64) return;
            const reader = new FileReader();
            reader.onload = () => {
              const b64 = (reader.result as string).split(",")[1] ?? "";
              onFileBase64(b64);
            };
            reader.readAsDataURL(file);
          }}
        />
        {field.placeholder && <p className="mt-1 text-xs text-muted-foreground">{field.placeholder}</p>}
      </div>
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <div>
        {label}
        <Select
          id={field.key}
          name={field.key}
          defaultValue={prefilledValue ?? field.defaultValue}
          options={field.options}
        />
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div>
        {label}
        <Input
          id={field.key}
          name={field.key}
          type="number"
          defaultValue={prefilledValue ?? field.defaultValue}
          placeholder={field.placeholder}
        />
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        {label}
        <Textarea
          id={field.key}
          name={field.key}
          rows={6}
          defaultValue={prefilledValue ?? field.defaultValue}
          placeholder={field.placeholder}
        />
      </div>
    );
  }

  return (
    <div>
      {label}
      <Input
        id={field.key}
        name={field.key}
        type="text"
        defaultValue={prefilledValue ?? field.defaultValue}
        placeholder={field.placeholder}
      />
    </div>
  );
}


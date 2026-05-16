import type { Tool, ToolContent } from "@quickhelp/tool-kit";
import { z } from "zod";

export interface FormField {
  key: string;
  label: string;
  placeholder?: string;
  type: "text" | "textarea" | "file" | "select" | "number";
  accept?: string;
  defaultValue?: string;
  options?: { value: string; label: string }[];
}

export interface SerializedTool {
  slug: string;
  name: string;
  summary: string;
  fields: FormField[];
  content?: ToolContent;
}

const MULTILINE_KEYS = new Set(["json", "text", "content", "body", "token", "input", "data"]);

export function serializeTool(tool: Tool): SerializedTool {
  const fields = extractFields(tool.inputSchema, tool.inputUiHints);
  return {
    slug: tool.slug,
    name: tool.name,
    summary: tool.summary,
    fields,
    content: tool.content,
  };
}

function extractFields(
  schema: z.ZodTypeAny,
  hints?: Record<string, { type: "text" | "textarea" | "file" | "select"; accept?: string; options?: string[] }>
): FormField[] {
  if (!(schema instanceof z.ZodObject)) return [];
  const shape = (schema as z.ZodObject<z.ZodRawShape>).shape;
  return Object.entries(shape).map(([key, fieldSchema]) => {
    const s = fieldSchema as z.ZodTypeAny;
    const desc = s.description ?? undefined;
    let defaultValue: string | undefined;
    let inner = s;

    if (inner instanceof z.ZodDefault) {
      defaultValue = String((inner as z.ZodDefault<z.ZodTypeAny>)._def.defaultValue());
      inner = (inner as z.ZodDefault<z.ZodTypeAny>)._def.innerType;
    }
    if (inner instanceof z.ZodOptional) {
      inner = (inner as z.ZodOptional<z.ZodTypeAny>).unwrap();
    }

    const hint = hints?.[key];

    // Enum → select
    if (inner instanceof z.ZodEnum) {
      const values = (inner as z.ZodEnum<[string, ...string[]]>).options as string[];
      return {
        key,
        label: key.replace(/_/g, " "),
        placeholder: desc,
        type: "select",
        defaultValue,
        options: values.map((v) => ({ value: v, label: v })),
      } satisfies FormField;
    }

    // Number → number input
    if (inner instanceof z.ZodNumber) {
      return {
        key,
        label: key.replace(/_/g, " "),
        placeholder: desc,
        type: "number",
        defaultValue,
      } satisfies FormField;
    }

    if (hint) {
      return {
        key,
        label: key.replace(/_/g, " "),
        placeholder: desc,
        type: hint.type,
        accept: hint.accept,
        defaultValue,
        options: hint.options?.map((v) => ({ value: v, label: v })),
      } satisfies FormField;
    }

    const fieldType: "text" | "textarea" =
      MULTILINE_KEYS.has(key) || isLongStringField(inner) ? "textarea" : "text";

    return {
      key,
      label: key.replace(/_/g, " "),
      placeholder: desc,
      type: fieldType,
      defaultValue,
    } satisfies FormField;
  });
}

function isLongStringField(schema: z.ZodTypeAny): boolean {
  if (!(schema instanceof z.ZodString)) return false;
  const checks = (schema as z.ZodString)._def.checks;
  return checks.some((c) => c.kind === "min" && typeof c.value === "number" && c.value > 50);
}

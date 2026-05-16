import type { Tool, ToolContent } from "@no-work/tool-kit";
import { z } from "zod";

export interface FormField {
  key: string;
  label: string;
  placeholder?: string;
  type: "text" | "textarea" | "file";
  accept?: string;
  defaultValue?: string;
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
  hints?: Record<string, { type: "text" | "textarea" | "file"; accept?: string }>
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
    let fieldType: "text" | "textarea" | "file";
    if (hint) {
      fieldType = hint.type;
    } else {
      fieldType =
        MULTILINE_KEYS.has(key) || isLongStringField(inner) ? "textarea" : "text";
    }

    return {
      key,
      label: key.replace(/_/g, " "),
      placeholder: desc,
      type: fieldType,
      accept: hint?.accept,
      defaultValue,
    };
  });
}

function isLongStringField(schema: z.ZodTypeAny): boolean {
  if (!(schema instanceof z.ZodString)) return false;
  const checks = (schema as z.ZodString)._def.checks;
  return checks.some((c) => c.kind === "min" && typeof c.value === "number" && c.value > 50);
}

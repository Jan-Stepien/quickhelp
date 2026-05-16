import { z } from "zod";
import { defineTool } from "@quickhelp/tool-kit";

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

export const jsonFormatter = defineTool({
  id: "json-formatter",
  slug: "json-formatter",
  name: "JSON Formatter",
  summary: "Pretty-print or minify JSON — with syntax validation.",
  description:
    "Paste raw or minified JSON and format it with configurable indentation, or minify it by removing all whitespace. Validates syntax, reports parse errors with line/column, and optionally sorts keys or repairs malformed JSON.",
  category: "formatting",
  inputSchema: z.object({
    json: z.string().min(1).describe("The JSON string to format or minify"),
    mode: z.enum(["pretty", "minify"]).default("pretty").describe("Output mode: pretty-print or minify"),
    indent: z.union([z.literal(2), z.literal(4), z.literal("tab")]).default(2).describe("Indentation: 2 spaces, 4 spaces, or tab"),
    sort_keys: z.boolean().default(false).describe("Sort object keys alphabetically"),
    repair: z.boolean().default(false).describe("Attempt to repair malformed JSON (trailing commas, single quotes, comments)"),
  }),
  outputSchema: z.object({
    output: z.string(),
    valid: z.boolean(),
    error: z.string().optional(),
    error_line: z.number().optional(),
    error_column: z.number().optional(),
  }),
  examples: [
    {
      title: "Pretty-print JSON",
      input: { json: '{"name":"Alice","age":30}', mode: "pretty", indent: 2, sort_keys: false, repair: false },
      output: { output: '{\n  "name": "Alice",\n  "age": 30\n}', valid: true },
    },
    {
      title: "Minify JSON",
      input: { json: '{\n  "name": "Alice",\n  "age": 30\n}', mode: "minify", indent: 2, sort_keys: false, repair: false },
      output: { output: '{"name":"Alice","age":30}', valid: true },
    },
    {
      title: "Sort keys",
      input: { json: '{"z":1,"a":2}', mode: "pretty", indent: 2, sort_keys: true, repair: false },
      output: { output: '{\n  "a": 2,\n  "z": 1\n}', valid: true },
    },
  ],
  handler({ json, mode, indent, sort_keys, repair }) {
    let src = json;

    if (repair) {
      // Remove block comments
      src = src.replace(/\/\*[\s\S]*?\*\//g, "");
      // Remove line comments (preserve string content)
      src = src.replace(/("(?:[^"\\]|\\.)*")|\/\/[^\n]*/g, (m, str) => (str ? str : ""));
      // Replace single-quoted strings
      src = src.replace(/'(?:[^'\\]|\\.)*'/g, (m) => `"${m.slice(1, -1).replace(/"/g, '\\"').replace(/\\'/g, "'")}"`);
      // Quote bare keys
      src = src.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, '$1"$2"$3');
      // Remove trailing commas
      src = src.replace(/,(\s*[}\]])/g, "$1");
    }

    try {
      let parsed: unknown = JSON.parse(src);

      if (sort_keys && parsed !== null && typeof parsed === "object") {
        parsed = sortDeep(parsed);
      }

      const indentVal = mode === "minify" ? undefined : (indent === "tab" ? "\t" : indent);
      const output = JSON.stringify(parsed, null, indentVal);
      return { output, valid: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid JSON";
      const lcMatch = /line (\d+) column (\d+)/.exec(msg);
      return {
        output: "",
        valid: false,
        error: msg,
        error_line: lcMatch ? parseInt(lcMatch[1]!, 10) : undefined,
        error_column: lcMatch ? parseInt(lcMatch[2]!, 10) : undefined,
      };
    }
  },
  schemaOrg: {
    name: "JSON Formatter",
    description: "Pretty-print or minify JSON with syntax validation",
    url: "https://quickhelp.dev/json-formatter",
  },
  attribution: {
    text: "Formatted by quickhelp.dev/json-formatter",
    url: "https://quickhelp.dev/json-formatter",
  },
  content: {
    whatIs:
      "A JSON formatter parses a JSON string and re-serializes it with consistent indentation (pretty) or no whitespace (minify). This tool also catches syntax errors and reports the exact position of the problem.",
    howToSteps: [
      { name: "Paste JSON", text: "Paste your raw, minified, or malformed JSON into the input field." },
      { name: "Choose mode", text: "Select 'pretty' for readable output or 'minify' to compact it." },
      { name: "Click Run", text: "The formatted result appears instantly. Use the Copy button to copy it." },
    ],
    faq: [
      {
        question: "What's the size limit?",
        answer: "The API accepts up to 1 MB of JSON. For larger files, run the formatter locally with JSON.stringify.",
      },
      {
        question: "Does it sort keys?",
        answer: "Yes — enable the 'Sort keys' option to sort object keys alphabetically at every level of nesting.",
      },
    ],
    relatedTools: ["jwt-decoder"],
  },
});

import { z } from "zod";
import { defineTool } from "@no-work/tool-kit";

export const jsonFormatter = defineTool({
  id: "json-formatter",
  slug: "json-formatter",
  name: "JSON Formatter",
  summary: "Pretty-print or minify JSON — with syntax validation.",
  description:
    "Paste raw or minified JSON and format it with 2-space indentation, or minify it by removing all whitespace. Validates syntax and reports parse errors.",
  category: "formatting",
  inputSchema: z.object({
    json: z.string().min(1).describe("The JSON string to format or minify"),
    mode: z.enum(["pretty", "minify"]).default("pretty").describe("Output mode: pretty-print or minify"),
  }),
  outputSchema: z.object({
    output: z.string(),
    valid: z.boolean(),
    error: z.string().optional(),
  }),
  examples: [
    {
      title: "Pretty-print JSON",
      input: { json: '{"name":"Alice","age":30}', mode: "pretty" },
      output: { output: '{\n  "name": "Alice",\n  "age": 30\n}', valid: true },
    },
    {
      title: "Minify JSON",
      input: { json: '{\n  "name": "Alice",\n  "age": 30\n}', mode: "minify" },
      output: { output: '{"name":"Alice","age":30}', valid: true },
    },
  ],
  handler({ json, mode }) {
    try {
      const parsed: unknown = JSON.parse(json);
      const output =
        mode === "minify"
          ? JSON.stringify(parsed)
          : JSON.stringify(parsed, null, 2);
      return { output, valid: true };
    } catch (err) {
      return {
        output: "",
        valid: false,
        error: err instanceof Error ? err.message : "Invalid JSON",
      };
    }
  },
  schemaOrg: {
    name: "JSON Formatter",
    description: "Pretty-print or minify JSON with syntax validation",
    url: "https://no.work/json-formatter",
  },
  attribution: {
    text: "Formatted by no.work/json-formatter",
    url: "https://no.work/json-formatter",
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
        answer: "No — key order is preserved as-is. JSON technically has no guaranteed order, but most parsers preserve insertion order.",
      },
    ],
    relatedTools: ["jwt-decoder"],
  },
});

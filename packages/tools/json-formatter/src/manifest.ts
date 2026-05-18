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
    useCases: [
      {
        slug: "pretty-print-api-response",
        title: "How to pretty-print a JSON API response",
        intent: "Convert a minified or compact JSON API response into human-readable, indented output for inspection.",
        intro: "When you fetch a JSON API in the browser or with curl, the response usually arrives as a single compressed line that's nearly impossible to read. Pretty-printing adds indentation and line breaks so you can immediately see the structure, find the field you need, and spot unexpected values. This guide shows how to format any JSON API response in seconds using the quickhelp.dev JSON Formatter — no terminal, no jq, no installation required.",
        steps: [
          { name: "Copy the raw response", text: "In Chrome DevTools open the Network tab, click the API request, select the Response tab, and copy the body. Or copy the output of: curl https://api.example.com/endpoint." },
          { name: "Paste and format", text: "Open quickhelp.dev/json-formatter, paste the raw JSON, select 'Pretty' mode with 2-space indentation, and click Run. The formatted output appears immediately." },
          { name: "Inspect and copy", text: "Use the tree view to expand nested objects. Click the Copy button to paste the formatted JSON into your editor, log file, or documentation." },
        ],
        faq: [
          { question: "Does pretty-printing change the data?", answer: "No. Formatting only affects whitespace — the underlying data, field order, and values are unchanged." },
          { question: "What if the API returns invalid JSON?", answer: "The formatter shows a parse error with the line and column number. Enable 'Repair' mode to automatically fix common issues like trailing commas and single-quoted strings." },
        ],
      },
      {
        slug: "minify-json-for-production",
        title: "How to minify JSON for production",
        intent: "Remove all whitespace from a JSON file to reduce its size before embedding it in code, APIs, or config files.",
        intro: "Minifying JSON strips every space, tab, and newline that exists only for human readability, producing the smallest possible string for a given data structure. This matters when embedding JSON in JavaScript bundles, serializing API responses, storing JSON in database columns, or sending payloads over constrained networks. This guide explains how to minify any JSON file in one step using the quickhelp.dev JSON Formatter.",
        steps: [
          { name: "Paste your JSON", text: "Copy your formatted or indented JSON and paste it into quickhelp.dev/json-formatter." },
          { name: "Select Minify mode", text: "Click the 'Minify' option in the mode selector. The output field updates instantly with a single-line, whitespace-free string." },
          { name: "Copy the result", text: "Click Copy. The minified JSON is ready to paste into your code, config file, or API payload." },
        ],
        faq: [
          { question: "How much smaller does minified JSON get?", answer: "Typically 10–30% smaller depending on how much indentation the original had. For deeply nested objects with 4-space indentation, savings can be 40%+." },
          { question: "Does minification sort keys or change field order?", answer: "No — minification only removes whitespace. Key order is preserved exactly as in the input." },
        ],
      },
      {
        slug: "sort-json-keys-alphabetically",
        title: "How to sort JSON keys alphabetically",
        intent: "Reorder all keys in a JSON object alphabetically at every level of nesting for consistent diffs and readability.",
        intro: "Alphabetically sorted JSON keys make git diffs cleaner, make config files easier to scan, and let you reliably compare two JSON objects by eye. When keys are added in random order over time, a sorted snapshot reveals exactly what changed. This guide shows how to sort all keys in a JSON object — recursively, at every level of nesting — using the quickhelp.dev JSON Formatter.",
        steps: [
          { name: "Paste your JSON", text: "Open quickhelp.dev/json-formatter and paste the JSON whose keys you want to sort." },
          { name: "Enable Sort Keys", text: "Toggle on the 'Sort keys' option. Leave mode set to 'Pretty' for readable output." },
          { name: "Copy the sorted result", text: "Click Run then Copy. The output has every object's keys sorted A→Z at every depth." },
        ],
        faq: [
          { question: "Does sort order affect JSON semantics?", answer: "No. JSON objects are unordered by specification — key order carries no semantic meaning. Sorting is purely a style convention." },
          { question: "Are array elements also sorted?", answer: "No. Array elements maintain their original order because arrays are ordered by definition." },
        ],
      },
      {
        slug: "validate-json-syntax",
        title: "How to validate JSON syntax and find errors",
        intent: "Check whether a JSON string is syntactically valid and locate the exact position of any parse errors.",
        intro: "A single missing comma, an extra bracket, or a trailing comma turns valid JSON into an unresolvable parse error. Tracking down the error by eye in a 500-line JSON file is painful. The quickhelp.dev JSON Formatter validates any JSON string instantly, reports whether it's valid, and — if it isn't — shows the exact line and column of the first error. The optional Repair mode can automatically fix the most common issues.",
        steps: [
          { name: "Paste the suspect JSON", text: "Copy the JSON you want to validate and paste it into quickhelp.dev/json-formatter." },
          { name: "Check the result", text: "If the JSON is valid, the formatted output appears. If it's invalid, a red error message shows the problem and its exact line:column position." },
          { name: "Fix or repair", text: "Correct the error manually based on the line number, or enable 'Repair' mode to automatically remove trailing commas, fix single-quoted strings, and strip comments." },
        ],
        faq: [
          { question: "What errors can Repair mode fix automatically?", answer: "Trailing commas before } or ], single-quoted strings, bare (unquoted) object keys, and JavaScript-style // and /* */ comments." },
          { question: "Is there a file size limit for validation?", answer: "The API endpoint accepts up to 1 MB. For larger files, validate locally with: node -e \"JSON.parse(require('fs').readFileSync('file.json','utf8'))\"" },
        ],
      },
    ],
  },
});

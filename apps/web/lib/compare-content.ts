import type { Tool } from "@quickhelp/tool-kit";

// ── Editorial verdicts ──────────────────────────────────────────────────────
// One unique 1-2 sentence verdict per pair (keyed by sorted a-vs-b slug).
// These are the human-authored anchors that make each compare page distinct.

export const COMPARE_VERDICTS: Record<string, string> = {
  "background-remover-vs-image-converter":
    "Background Remover targets subject isolation — use it when you need a transparent or clean background. Image Converter is format-first — use it when changing file format for compatibility or performance without altering image content.",
  "background-remover-vs-image-resizer":
    "Background Remover changes image content by isolating the subject; Image Resizer changes only canvas dimensions. For most workflows, resize after removing the background so the crop is sized to the final subject.",
  "base64-vs-color-converter":
    "Base64 is a binary encoding scheme for text-safe data transport; Color Converter translates between colour notations like HEX and RGB. They solve entirely different problems and are not substitutes.",
  "base64-vs-hash-generator":
    "Base64 is reversible — the original data can always be recovered by decoding. Hash Generator is one-way — the digest is a fingerprint that cannot be reversed. Choose Base64 when you need to recover the original; choose a hash when you only need to verify integrity.",
  "base64-vs-json-formatter":
    "Base64 encodes binary or arbitrary bytes as ASCII text; JSON Formatter parses and pretty-prints structured data. JSON payloads are sometimes Base64-encoded inside a larger JSON document, so these tools work at different layers of the same pipeline.",
  "base64-vs-jwt-decoder":
    "A JWT is a three-part Base64-URL-encoded structure — JWT Decoder understands that structure and validates the token format automatically. Use Base64 for arbitrary binary-to-text encoding; use JWT Decoder specifically when inspecting signed tokens.",
  "base64-vs-number-base-converter":
    "Base64 encodes raw bytes as printable ASCII for text-safe transport; Number Base Converter changes the numeric radix between binary, octal, decimal, and hex. Use Base64 for binary payload embedding; use Number Base Converter for numeric value representation.",
  "base64-vs-url-encoder":
    "URL Encoder handles percent-encoding of characters that are illegal in a URL. Base64 encodes any binary data but adds ~33% size overhead and is not natively URL-safe. Prefer URL Encoder for query strings; prefer Base64 URL-safe mode for embedding binary payloads inside URLs.",
  "color-converter-vs-image-converter":
    "Color Converter translates a single colour value between HEX, RGB, HSL, and other notations — no image file involved. Image Converter processes entire image files between formats. They belong to separate problem domains: design/CSS workflow vs file transformation.",
  "color-converter-vs-number-base-converter":
    "Colour values like #FF5733 are hex numbers, so Number Base Converter can translate individual byte values between hex, decimal, and binary. Color Converter goes further with HSL, HSV, and named-colour lookups. Use Color Converter for design work; use Number Base Converter for numeric radix arithmetic.",
  "hash-generator-vs-jwt-decoder":
    "Hash Generator produces fixed-length fingerprints (MD5, SHA-256) used to verify data integrity. JWT Decoder parses tokens whose signature is itself a hash of the header and payload. Use Hash Generator to create or verify checksums; use JWT Decoder to inspect the claims inside a signed token.",
  "hash-generator-vs-number-base-converter":
    "Hash Generator outputs digest values in hexadecimal; Number Base Converter can translate those hex digests to decimal or binary for contexts that expect a different representation. The tools compose naturally: hash first, then convert the output base.",
  "hash-generator-vs-url-encoder":
    "Hash Generator creates a one-way digest; URL Encoder makes text safe for URLs via percent-encoding. Hash digests are already URL-safe hex strings, so they rarely need URL encoding — use each for its own domain.",
  "hash-generator-vs-uuid-generator":
    "A UUID is a randomly generated identifier guaranteed to be structurally unique without any input. A hash digest is a deterministic fingerprint of specific data — hashing the same input always yields the same output. Use UUID Generator for new entities; use Hash Generator to identify or verify existing data.",
  "image-converter-vs-image-resizer":
    "Image Converter changes file format (PNG → WebP); Image Resizer changes image dimensions. They are complementary: convert for format compatibility and file size, resize for display requirements. In a pipeline, resize first, then convert to the target format.",
  "image-converter-vs-jwt-decoder":
    "Image Converter handles image file format transformations; JWT Decoder parses authentication tokens. They belong to entirely separate problem domains — image processing vs API security debugging.",
  "json-formatter-vs-json-to-csv":
    "JSON Formatter pretty-prints or minifies JSON without changing the data structure. JSON to CSV flattens a JSON array of objects into spreadsheet-compatible rows, changing both structure and format. Use JSON Formatter for readability and debugging; use JSON to CSV to export data to Excel or a database import.",
  "json-formatter-vs-jwt-decoder":
    "JSON Formatter works with any JSON document; JWT Decoder specifically handles the three-part token format and Base64-URL-decodes each segment. A JWT's payload is valid JSON — paste a decoded payload into JSON Formatter to explore nested claims in detail.",
  "json-formatter-vs-lcov-viewer":
    "JSON Formatter is a general-purpose text transformation tool for any JSON document; LCOV Viewer renders code-coverage reports from lcov/genhtml output into a visual summary. Both are read-only display tools for different data formats: API debugging vs CI coverage analysis.",
  "json-formatter-vs-text-case-converter":
    "JSON Formatter restructures structured JSON data; Text Case Converter transforms plain-text strings between camelCase, snake_case, UPPER_CASE, and other conventions. Use JSON Formatter when your input is valid JSON; use Text Case Converter for renaming variables, slugs, or labels.",
  "json-formatter-vs-timestamp-converter":
    "JSON Formatter displays the raw JSON structure, including epoch-second values as plain numbers. Timestamp Converter translates those numeric values into human-readable dates. Paste the JSON into the formatter to find the timestamp field, then paste the value into Timestamp Converter to read the date.",
  "json-formatter-vs-url-encoder":
    "URL Encoder handles percent-encoding for query-string construction; JSON Formatter parses and displays the decoded JSON payload. When a URL contains a percent-encoded JSON parameter, decode it with URL Encoder first, then inspect the result with JSON Formatter.",
  "json-to-csv-vs-text-case-converter":
    "JSON to CSV converts a JSON array of objects into rows and columns for spreadsheet import. Text Case Converter changes capitalisation style of plain-text strings. Use JSON to CSV when exporting structured data; use Text Case Converter when normalising field names or labels before the export.",
  "jwt-decoder-vs-timestamp-converter":
    "JWT Decoder exposes raw `iat`, `exp`, and `nbf` claims as Unix epoch integers. Timestamp Converter translates those integers into readable dates so you can immediately tell when a token was issued or when it expires. Use both together for authentication debugging.",
  "number-base-converter-vs-url-encoder":
    "Number Base Converter changes how a number is represented (binary, octal, decimal, hex). URL Encoder escapes special characters so they are safe in a URL. Both produce different string representations of data, but they operate on different types: numeric values vs text strings.",
  "text-case-converter-vs-url-encoder":
    "Text Case Converter can produce clean kebab-case slugs (e.g. `my-page-title`); URL Encoder then makes that slug safe for query strings containing special characters. The tools often chain: case-convert first, then URL-encode if the result contains non-ASCII characters.",
  "timestamp-converter-vs-uuid-generator":
    "Timestamp Converter reads or displays a specific point in time. UUID Generator mints identifiers that are globally unique, and some variants (UUIDv1, UUIDv7) encode the current timestamp inside the UUID itself. Use Timestamp Converter to inspect a moment in time; use UUID Generator to create new unique identifiers.",
};

// ── Content assembler ───────────────────────────────────────────────────────

export interface CompareSection {
  intro: string;
  verdict: string;
  toolAWhatIs: string;
  toolBWhatIs: string;
  whenToUseA: { title: string; intro: string }[];
  whenToUseB: { title: string; intro: string }[];
  mergedFaq: { question: string; answer: string }[];
  tableRows: { label: string; a: string; b: string }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCompareContent(toolA: Tool<any, any>, toolB: Tool<any, any>): CompareSection {
  const pairKey = [toolA.slug, toolB.slug].sort().join("-vs-");
  const verdict = COMPARE_VERDICTS[pairKey] ?? `${toolA.name} and ${toolB.name} are both developer utilities with different primary use cases.`;

  const sameCategory = toolA.category === toolB.category;
  const intro = sameCategory
    ? `${toolA.name} and ${toolB.name} are both ${toolA.category} tools. They serve related purposes but are optimised for different tasks — understanding the distinction helps you choose the right one for your workflow.`
    : `${toolA.name} (${toolA.category}) and ${toolB.name} (${toolB.category}) come from different categories but appear together in developer workflows. This guide explains what each does and when to reach for one over the other.`;

  // What each does
  const toolAWhatIs = toolA.content?.whatIs ?? toolA.description;
  const toolBWhatIs = toolB.content?.whatIs ?? toolB.description;

  // When to use each — up to 2 use cases, falling back to summary
  const whenToUseA: { title: string; intro: string }[] = toolA.content?.useCases?.slice(0, 2).map((uc) => ({
    title: uc.title,
    intro: uc.intent ?? uc.intro.slice(0, 200),
  })) ?? [{ title: `Use ${toolA.name} when…`, intro: toolA.summary }];

  const whenToUseB: { title: string; intro: string }[] = toolB.content?.useCases?.slice(0, 2).map((uc) => ({
    title: uc.title,
    intro: uc.intent ?? uc.intro.slice(0, 200),
  })) ?? [{ title: `Use ${toolB.name} when…`, intro: toolB.summary }];

  // Merged FAQ — first 2 from each tool
  const mergedFaq = [
    ...(toolA.content?.faq?.slice(0, 2) ?? []),
    ...(toolB.content?.faq?.slice(0, 2) ?? []),
  ];

  // Richer comparison table
  const tableRows = [
    { label: "Category", a: toolA.category, b: toolB.category },
    { label: "Primary purpose", a: toolA.summary, b: toolB.summary },
    { label: "Inputs", a: getSchemaKeys(toolA.inputSchema), b: getSchemaKeys(toolB.inputSchema) },
    { label: "Outputs", a: getSchemaKeys(toolA.outputSchema), b: getSchemaKeys(toolB.outputSchema) },
  ];

  return { intro, verdict, toolAWhatIs, toolBWhatIs, whenToUseA, whenToUseB, mergedFaq, tableRows };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSchemaKeys(schema: any): string {
  try {
    const shape = (schema as { shape?: Record<string, unknown> }).shape;
    return shape ? Object.keys(shape).join(", ") : "—";
  } catch {
    return "—";
  }
}

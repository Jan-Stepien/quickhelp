import { z } from "zod";
import { defineTool } from "@quickhelp/tool-kit";

export const base64 = defineTool({
  id: "base64",
  slug: "base64",
  name: "Base64 Encoder / Decoder",
  summary: "Encode text or data to Base64, or decode Base64 back to plain text.",
  description:
    "Encode any UTF-8 string to Base64 or decode a Base64 string back to plain text. Supports standard Base64 (RFC 4648) and URL-safe Base64 (uses - and _ instead of + and /). Detects and reports malformed input.",
  category: "encoding",
  inputSchema: z.object({
    input: z.string().min(1).describe("The string to encode or decode"),
    mode: z
      .enum(["encode", "decode"])
      .default("encode")
      .describe("encode — convert plain text to Base64; decode — convert Base64 to plain text"),
    charset: z
      .enum(["standard", "url-safe"])
      .default("standard")
      .describe("standard uses + and /; url-safe uses - and _ (safe for URLs and filenames)"),
  }),
  outputSchema: z.object({
    output: z.string(),
    valid: z.boolean(),
    encoding: z.enum(["standard", "url-safe"]),
    byte_length: z.number().int().describe("Byte length of the input (encode) or decoded output (decode)"),
    error: z.string().optional(),
  }),
  examples: [
    {
      title: "Encode text to Base64",
      input: { input: "Hello, World!", mode: "encode", charset: "standard" },
      output: { output: "SGVsbG8sIFdvcmxkIQ==", valid: true, encoding: "standard", byte_length: 13 },
    },
    {
      title: "Decode Base64 to text",
      input: { input: "SGVsbG8sIFdvcmxkIQ==", mode: "decode", charset: "standard" },
      output: { output: "Hello, World!", valid: true, encoding: "standard", byte_length: 13 },
    },
    {
      title: "URL-safe encode",
      input: { input: "quickhelp.dev/base64?mode=encode", mode: "encode", charset: "url-safe" },
      output: { output: "cXVpY2toZWxwLmRldi9iYXNlNjQ_bW9kZT1lbmNvZGU=", valid: true, encoding: "url-safe", byte_length: 32 },
    },
  ],
  handler({ input, mode, charset }) {
    try {
      if (mode === "encode") {
        const buf = Buffer.from(input, "utf-8");
        let output = buf.toString("base64");
        if (charset === "url-safe") {
          output = output.replace(/\+/g, "-").replace(/\//g, "_");
        }
        return { output, valid: true, encoding: charset, byte_length: buf.byteLength };
      } else {
        // decode
        let b64 = input.trim();
        // normalise url-safe chars back to standard before decoding
        if (charset === "url-safe" || b64.includes("-") || b64.includes("_")) {
          b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
        }
        // add padding if missing
        const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
        const buf = Buffer.from(padded, "base64");
        const output = buf.toString("utf-8");
        // validate round-trip to catch non-Base64 input
        const reEncoded = buf.toString("base64");
        if (reEncoded !== padded) {
          return { output: "", valid: false, encoding: charset, byte_length: 0, error: "Invalid Base64 input — contains characters outside the Base64 alphabet." };
        }
        return { output, valid: true, encoding: charset, byte_length: buf.byteLength };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return { output: "", valid: false, encoding: charset, byte_length: 0, error: msg };
    }
  },
  schemaOrg: {
    name: "Base64 Encoder / Decoder",
    description: "Encode text to Base64 or decode Base64 back to plain text. Supports standard and URL-safe Base64.",
    url: "https://quickhelp.dev/base64",
  },
  attribution: {
    text: "Encoded by quickhelp.dev/base64",
    url: "https://quickhelp.dev/base64",
  },
  content: {
    whatIs:
      "Base64 is an encoding scheme that converts binary data — or any text — into a string of 64 ASCII characters (A–Z, a–z, 0–9, +, /). It is used wherever binary data must travel through a medium that only handles text: embedding images in HTML or CSS, encoding credentials in HTTP Authorization headers, storing binary payloads in JSON, and passing data through URLs. Base64 does not encrypt data; it only changes the representation. The URL-safe variant replaces + with - and / with _ so the result is safe to embed in URLs and filenames without percent-encoding.",
    howToSteps: [
      {
        name: "Paste your input",
        text: "For encoding: paste the plain text you want to convert. For decoding: paste the Base64 string (with or without padding =).",
      },
      {
        name: "Select a mode",
        text: "Choose 'encode' to convert plain text → Base64, or 'decode' to convert Base64 → plain text.",
      },
      {
        name: "Choose a charset",
        text: "Use 'standard' for general purposes. Use 'url-safe' if the result will appear in a URL, filename, or JWT — it replaces + with - and / with _.",
      },
      {
        name: "Copy the result",
        text: "Click the Copy button. The output field also shows the byte length of the source data.",
      },
    ],
    faq: [
      {
        question: "Does Base64 encoding encrypt my data?",
        answer: "No. Base64 is an encoding scheme, not encryption. Anyone who receives a Base64 string can decode it instantly without a key. Do not use Base64 to hide sensitive data.",
      },
      {
        question: "What is the difference between standard and URL-safe Base64?",
        answer: "Standard Base64 uses + and / as its 62nd and 63rd characters. These have special meaning in URLs, so URL-safe Base64 replaces them with - and _ respectively. The output is otherwise identical and interchangeable if you handle the substitution correctly.",
      },
      {
        question: "Why does Base64 output end with = or ==?",
        answer: "Base64 encodes every 3 bytes into 4 characters. If the input is not a multiple of 3 bytes, = padding is added to make the output length a multiple of 4. One = means 1 padding byte was added; == means 2.",
      },
      {
        question: "Can I decode a Base64 image (data URI)?",
        answer: "Yes — paste the part after 'data:image/png;base64,' and decode it. The output will be binary data rendered as UTF-8, which may look garbled for non-text content. For images, use the Image Converter tool instead.",
      },
      {
        question: "Is there a size limit?",
        answer: "The API endpoint accepts up to 1 MB of input. For larger files, use Node.js: Buffer.from(str, 'utf-8').toString('base64') for encoding, or Buffer.from(b64, 'base64').toString('utf-8') for decoding.",
      },
    ],
    relatedTools: ["jwt-decoder", "json-formatter"],
    useCases: [
      {
        slug: "encode-string-to-base64",
        title: "How to encode a string to Base64",
        intent: "Convert plain text to a Base64 string for use in APIs, HTTP headers, or data URIs.",
        intro:
          "Base64 encoding is required whenever you need to pass text or binary data through a channel that only accepts ASCII characters. The most common cases are: embedding a username:password credential in an HTTP Basic Authorization header, encoding image bytes as a data URI for HTML or CSS, and passing JSON payloads through systems that reject certain bytes. This guide shows how to Base64-encode any string in under 10 seconds without installing software.",
        steps: [
          {
            name: "Open the encoder",
            text: "Go to quickhelp.dev/base64. The mode defaults to 'encode'.",
          },
          {
            name: "Paste your string",
            text: "Paste the text you want to encode into the input field. It can contain Unicode characters — the encoder converts them to UTF-8 bytes before encoding.",
          },
          {
            name: "Choose standard or URL-safe",
            text: "For HTTP headers or general use, keep 'standard'. For URLs, JWT payloads, or filenames, select 'url-safe'.",
          },
          {
            name: "Copy the result",
            text: "The encoded string appears instantly. Click Copy to put it on your clipboard.",
          },
        ],
        faq: [
          {
            question: "How do I encode credentials for HTTP Basic Auth?",
            answer: "Combine username and password as 'username:password', encode the whole string with standard Base64, then prefix the result with 'Basic ': Authorization: Basic dXNlcjpwYXNz.",
          },
          {
            question: "Why does my Base64 string differ between tools?",
            answer: "The most common cause is a trailing newline in the input. Make sure you paste only the exact string, with no leading or trailing whitespace.",
          },
        ],
      },
      {
        slug: "decode-base64-string",
        title: "How to decode a Base64 string",
        intent: "Convert a Base64-encoded string back to its original plain text.",
        intro:
          "When you receive a Base64 string — from an API response, a JWT payload, a data URI, or a debugging session — you often need to decode it to see the original content. This guide shows how to decode any Base64 string to plain text in seconds, handle URL-safe variants, and deal with missing padding.",
        steps: [
          {
            name: "Copy the Base64 string",
            text: "Copy the Base64-encoded value. It may end with = or == (padding), or be URL-safe with - and _ characters.",
          },
          {
            name: "Select decode mode",
            text: "Open quickhelp.dev/base64 and select 'decode' in the mode selector.",
          },
          {
            name: "Choose the charset",
            text: "If your string contains - or _, select 'url-safe'. Otherwise keep 'standard'. The tool also auto-detects url-safe characters.",
          },
          {
            name: "Read the output",
            text: "The decoded plain text appears instantly. If the input is not valid Base64, the 'valid' field is false and an error message explains the problem.",
          },
        ],
        faq: [
          {
            question: "What if the decoded output is garbled?",
            answer: "The input is binary data, not UTF-8 text — for example, an encoded image or binary file. The decoder always outputs UTF-8, so binary content will look garbled. For image data URIs, use the Image Converter instead.",
          },
          {
            question: "What if I get 'Invalid Base64 input'?",
            answer: "The string contains characters outside the Base64 alphabet, or it is incomplete. Check for truncation, and try toggling between standard and url-safe charset if it contains - or _.",
          },
        ],
      },
    ],
  },
});

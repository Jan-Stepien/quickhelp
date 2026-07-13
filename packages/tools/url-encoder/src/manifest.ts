import { z } from "zod";
import { defineTool } from "@quickhelp/tool-kit";

export const urlEncoder = defineTool({
  id: "url-encoder",
  slug: "url-encoder",
  name: "URL Encoder / Decoder",
  summary: "Encode or decode URLs and query string components using percent-encoding (RFC 3986).",
  description:
    "Encode any string for safe use in a URL or query parameter using percent-encoding (RFC 3986), or decode a percent-encoded string back to plain text. Supports both full URL encoding (preserves ://?=& structure) and component encoding (encodes every special character). Shows a character-by-character encoding table for reference.",
  category: "encoding",
  inputSchema: z.object({
    input: z.string().min(1).describe("The string to encode or decode"),
    mode: z
      .enum(["encode-component", "encode-full", "decode"])
      .default("encode-component")
      .describe(
        "encode-component — encodes every character except A–Z a–z 0–9 - _ . ! ~ * ' ( ); encode-full — preserves URL structure characters (: / ? # [ ] @ ! $ & ' ( ) * + , ; =); decode — converts %XX sequences back to plain text"
      ),
  }),
  outputSchema: z.object({
    output: z.string().describe("The encoded or decoded result"),
    mode: z.enum(["encode-component", "encode-full", "decode"]),
    changed: z.boolean().describe("True if the output differs from the input"),
    encoding_table: z
      .array(z.object({ original: z.string(), encoded: z.string() }))
      .describe("Characters that were changed, for reference (encode modes only)"),
  }),
  examples: [
    {
      title: "Encode a query parameter value",
      input: { input: "hello world & more=stuff", mode: "encode-component" },
      output: {
        output: "hello%20world%20%26%20more%3Dstuff",
        mode: "encode-component",
        changed: true,
        encoding_table: [
          { original: " ", encoded: "%20" },
          { original: "&", encoded: "%26" },
          { original: "=", encoded: "%3D" },
        ],
      },
    },
    {
      title: "Encode a full URL (preserve structure)",
      input: {
        input: "https://example.com/search?q=hello world&lang=en",
        mode: "encode-full",
      },
      output: {
        output: "https://example.com/search?q=hello%20world&lang=en",
        mode: "encode-full",
        changed: true,
        encoding_table: [{ original: " ", encoded: "%20" }],
      },
    },
    {
      title: "Decode a percent-encoded string",
      input: { input: "hello%20world%20%26%20more%3Dstuff", mode: "decode" },
      output: {
        output: "hello world & more=stuff",
        mode: "decode",
        changed: true,
        encoding_table: [],
      },
    },
  ],
  handler({ input, mode }) {
    try {
      let output: string;
      if (mode === "encode-component") {
        output = encodeURIComponent(input);
      } else if (mode === "encode-full") {
        output = encodeURI(input);
      } else {
        output = decodeURIComponent(input);
      }

      const changed = output !== input;

      // Build encoding table for encode modes
      const encoding_table: { original: string; encoded: string }[] = [];
      if (mode !== "decode" && changed) {
        const seen = new Set<string>();
        for (const char of input) {
          const encoded = mode === "encode-component"
            ? encodeURIComponent(char)
            : encodeURI(char);
          if (encoded !== char && !seen.has(char)) {
            seen.add(char);
            encoding_table.push({ original: char, encoded });
          }
        }
      }

      return { output, mode, changed, encoding_table };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      // Return input unchanged on decode error (malformed percent sequence)
      return {
        output: input,
        mode,
        changed: false,
        encoding_table: [{ original: "error", encoded: msg }],
      };
    }
  },
  schemaOrg: {
    name: "URL Encoder / Decoder",
    description:
      "Encode or decode URLs and query string components using percent-encoding (RFC 3986).",
    url: "https://quickhelp.dev/url-encoder",
  },
  attribution: {
    text: "Encoded by quickhelp.dev/url-encoder",
    url: "https://quickhelp.dev/url-encoder",
  },
  content: {
    whatIs:
      "Percent-encoding (also called URL encoding) is a mechanism defined in RFC 3986 for representing characters that are not allowed or have special meaning in a URL. Every character that needs encoding is replaced by a percent sign followed by two hex digits representing the character's UTF-8 byte value — for example, a space becomes %20 and an ampersand becomes %26. There are two encoding variants: component encoding (encodeURIComponent) converts every character except the unreserved set A–Z a–z 0–9 and - _ . ! ~ * ' ( ); full URL encoding (encodeURI) additionally preserves the structural characters : / ? # [ ] @ ! $ & ' ( ) * + , ; = so that a complete URL remains navigable. Decoding reverses the process, converting all %XX sequences back to the original characters. URL encoding is required whenever you embed user-supplied text in a query string, form a redirect URL, construct a OAuth callback, or pass data through a system that only allows safe ASCII characters.",
    howToSteps: [
      {
        name: "Paste your text or URL",
        text: "For query parameter values (names, search terms, user input), paste the raw text and choose 'encode-component'. For a complete URL with a path and query string, paste the full URL and choose 'encode-full'. For decoding, paste any percent-encoded string.",
      },
      {
        name: "Choose the mode",
        text: "encode-component is correct for individual parameter values — it encodes & = ? and other structural characters. encode-full is for complete URLs where you want spaces encoded but the URL structure preserved. decode reverses any percent-encoding.",
      },
      {
        name: "Copy the result",
        text: "The encoded or decoded string appears instantly. The encoding table shows exactly which characters were changed and their %XX codes — useful for debugging encoding issues in APIs or redirect URLs.",
      },
    ],
    faq: [
      {
        question: "What is the difference between encodeURI and encodeURIComponent?",
        answer:
          "encodeURI is designed for complete URLs — it leaves the structural characters (: / ? # & = + @) untouched so the URL remains valid. encodeURIComponent is designed for individual values within a URL — it encodes those structural characters too, preventing them from being misinterpreted as URL delimiters. Use encodeURIComponent for query parameter values; use encodeURI only if you have a full URL that you want to sanitise without breaking its structure.",
      },
      {
        question: "Why does a space sometimes appear as + instead of %20?",
        answer:
          "HTML forms using application/x-www-form-urlencoded encoding replace spaces with + rather than %20. Both are valid in query strings, but they are different encodings. Modern APIs and URLs use %20 (RFC 3986). If you are constructing a query string for a form submission, check whether the receiving server expects + or %20.",
      },
      {
        question: "Is my data sent to a server when I encode or decode?",
        answer:
          "No. Encoding and decoding run entirely in your browser using built-in JavaScript functions — no network request is made. The REST API endpoint is stateless and logs nothing.",
      },
      {
        question: "How do I encode a full URL safely?",
        answer:
          "Do not encode the entire URL at once — that would encode the slashes, colons, and query string delimiters, breaking the URL structure. Instead, encode only the values: use encodeURIComponent on each query parameter value, then assemble the full URL manually. For example: const url = 'https://example.com/search?q=' + encodeURIComponent(userInput) + '&lang=' + encodeURIComponent(lang).",
      },
      {
        question: "What characters must be percent-encoded in a URL?",
        answer:
          "RFC 3986 defines unreserved characters (A-Z, a-z, 0-9, -, _, ., ~) as safe in any URL component. All other characters — including spaces, @, #, ?, /, =, &, :, and all non-ASCII Unicode — must be percent-encoded when used as literal data values. Reserved characters (: / ? # [ ] @ ! $ & ' ( ) * + , ; =) are allowed in URLs as structural delimiters but must be encoded when they appear as data.",
      },
      {
        question: "How does percent-encoding handle non-ASCII characters like emoji or accented letters?",
        answer:
          "Non-ASCII characters are first encoded as UTF-8 bytes, then each byte is percent-encoded. The letter 'é' is UTF-8 bytes C3 A9, so it becomes %C3%A9. The emoji 🔥 is UTF-8 bytes F0 9F 94 A5, becoming %F0%9F%94%A5. This is why non-ASCII URL characters appear as multiple %xx sequences rather than a single one.",
      },
    ],
    relatedTools: ["base64", "json-formatter", "hash-generator"],
    useCases: [
      {
        slug: "encode-url-query-parameter",
        title: "How to encode a URL query parameter value",
        intent: "Safely embed user input or special characters in a URL query string.",
        intro:
          "Query parameter values often contain characters that break URL parsing — spaces, ampersands, equals signs, and non-ASCII text. If these characters are not percent-encoded, the server receives a malformed query string or silently truncates the value. This guide shows how to encode any string for safe use as a query parameter value in under 10 seconds, without writing code.",
        steps: [
          {
            name: "Paste the raw value",
            text: "Paste the text you want to use as a query parameter value — a search term, a redirect URL, a user name, or any string that may contain spaces or special characters.",
          },
          {
            name: "Select encode-component",
            text: "Choose 'encode-component' (encodeURIComponent). This encodes all characters that could be misread as URL structure, including &, =, ?, #, and spaces.",
          },
          {
            name: "Insert the result into your URL",
            text: "Copy the encoded string and append it to your URL: ?key=<encoded-value>. The encoding table shows exactly which characters were changed so you can verify the output.",
          },
        ],
        faq: [
          {
            question: "Do I need to encode the key name as well as the value?",
            answer:
              "In practice, key names are usually simple ASCII strings with no special characters. But if your key name contains spaces or symbols, encode it with encodeURIComponent too — the same rules apply to both sides of the = sign.",
          },
          {
            question: "What happens if I don't encode the value?",
            answer:
              "The browser or server will interpret special characters as URL delimiters. A & in the value will be parsed as a new parameter separator, splitting the value in two. A space will cause the URL to be truncated at that point.",
          },
        ],
      },
      {
        slug: "decode-percent-encoded-url",
        title: "How to decode a percent-encoded URL",
        intent: "Convert %XX sequences back to human-readable text for debugging or display.",
        intro:
          "When you copy a URL from a browser address bar, log file, or API response, it often contains percent-encoded sequences like %20 for space or %C3%A9 for é. Decoding these sequences reveals the original string, which is essential for debugging redirect chains, inspecting OAuth callback parameters, and reading log entries. This guide shows how to decode any percent-encoded string instantly.",
        steps: [
          {
            name: "Copy the encoded URL or value",
            text: "Copy the percent-encoded string from your browser, log file, curl output, or API response.",
          },
          {
            name: "Select decode mode",
            text: "Open the URL Encoder / Decoder and select 'decode'. Paste the encoded string into the input field.",
          },
          {
            name: "Read the decoded output",
            text: "The plain text appears immediately. If the input contains %XX sequences, they are converted back to their original characters — including non-ASCII Unicode characters encoded as multi-byte UTF-8 sequences.",
          },
        ],
        faq: [
          {
            question: "What does 'URI malformed' or a decode error mean?",
            answer:
              "The input contains an invalid percent sequence — a % not followed by two valid hex digits. This happens with truncated or hand-edited URLs. Find the malformed % and fix or remove it.",
          },
          {
            question: "Why are some characters like + not decoded to a space?",
            answer:
              "RFC 3986 decoding does not convert + to a space — only %20 is decoded as a space. The + convention comes from HTML form encoding. If your input uses + for spaces (from a form submission), replace + with %20 before decoding, or use a library that handles application/x-www-form-urlencoded format.",
          },
        ],
      },
      {
        slug: "encode-oauth-redirect-uri",
        title: "How to encode an OAuth redirect_uri parameter",
        intent: "Percent-encode a callback URL for use as an OAuth 2.0 redirect_uri query parameter.",
        intro:
          "OAuth 2.0 authorization requests pass the callback URL as a redirect_uri query parameter. Because the callback URL itself contains characters like ://?= that are meaningful in URLs, it must be percent-encoded before being appended as a parameter value. Forgetting this step is one of the most common causes of OAuth redirect failures. This guide shows how to encode a redirect URI correctly in one step.",
        steps: [
          {
            name: "Paste your callback URL",
            text: "Paste the full callback URL — for example https://myapp.com/auth/callback?state=xyz. This URL contains characters that must be encoded when used as a parameter value.",
          },
          {
            name: "Select encode-component",
            text: "Choose 'encode-component'. This encodes the : // ? = & characters in your callback URL so they are not misread as delimiters in the outer authorization URL.",
          },
          {
            name: "Append to the authorization URL",
            text: "Copy the result and append it to the authorization endpoint: https://auth.example.com/authorize?client_id=...&redirect_uri=<encoded-callback>. The encoding table confirms that ://?=& were encoded.",
          },
        ],
        faq: [
          {
            question: "Why does the OAuth server reject my redirect_uri even when encoded?",
            answer:
              "Most OAuth servers require the redirect_uri to exactly match a pre-registered URI. The comparison is usually against the decoded value, but some servers compare the encoded form. Ensure the URI you encode matches the one registered in the OAuth application settings character-for-character.",
          },
          {
            question: "Should I encode the entire authorization URL or just the redirect_uri value?",
            answer:
              "Encode only the value of redirect_uri, not the entire URL. The outer authorization URL must remain a valid URL — encoding it entirely would break the structure the browser needs to navigate to.",
          },
        ],
      },
      {
        slug: "fix-malformed-url-encoding",
        title: "How to fix malformed or double-encoded URLs",
        intent: "Diagnose and repair a URL that has been encoded twice or has broken percent sequences.",
        intro:
          "Double-encoding happens when code calls encodeURIComponent on a string that is already percent-encoded, turning %20 into %2520. The receiving server decodes once and gets %20 as a literal string instead of a space. This is one of the most confusing URL bugs to track down. This guide shows how to identify double-encoding and decode a URL back to its intended form.",
        steps: [
          {
            name: "Spot the double-encoding pattern",
            text: "Look for %25 in your encoded string — %25 is the encoding of a literal %, so %2520 means the original had %20 which was encoded again. Other common patterns: %253A (double-encoded :) and %252F (double-encoded /).",
          },
          {
            name: "Decode once to reveal the intermediate form",
            text: "Paste the double-encoded string and select 'decode'. The output will show the single-encoded form (e.g. %20 for a space). Decode again if still encoded, or read the output as the intended plain text.",
          },
          {
            name: "Fix the root cause in code",
            text: "In your code, avoid calling encodeURIComponent on a value that is already encoded. Decode the value first with decodeURIComponent, then re-encode exactly once. Use this tool to verify the final encoded form before deploying.",
          },
        ],
        faq: [
          {
            question: "How many times should I decode to get the original string?",
            answer:
              "Decode until the output stops changing. Each decode pass removes one round of encoding. If the string was double-encoded, two decode passes return the original. Use this tool iteratively — paste the output back as input — to find the original value.",
          },
          {
            question: "Can I safely decode a URL that might not be encoded?",
            answer:
              "Yes, with one caveat: decodeURIComponent throws on invalid sequences (a % not followed by two hex digits). This tool handles that gracefully and returns the input unchanged. For a plain string with no % sequences, decoding is a no-op — the output equals the input.",
          },
        ],
      },
    ],
  },
});

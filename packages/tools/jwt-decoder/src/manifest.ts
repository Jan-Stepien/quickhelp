import { z } from "zod";
import { defineTool } from "@quickhelp/tool-kit";

export const jwtDecoder = defineTool({
  id: "jwt-decoder",
  slug: "jwt-decoder",
  name: "JWT Decoder",
  summary: "Decode a JWT token — header, payload, and signature (no verification).",
  description:
    "Paste a JSON Web Token and instantly see its decoded header and payload. Useful for debugging auth flows without a library.",
  category: "encoding",
  inputSchema: z.object({
    token: z.string().min(10).describe("The JWT string (three base64url-encoded parts separated by dots)"),
  }),
  outputSchema: z.object({
    header: z.record(z.unknown()),
    payload: z.record(z.unknown()),
    signature: z.string(),
    valid_structure: z.boolean(),
  }),
  examples: [
    {
      title: "Decode a basic JWT",
      input: {
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
      },
      output: {
        header: { alg: "HS256", typ: "JWT" },
        payload: { sub: "1234567890", name: "John Doe", iat: 1516239022 },
        signature: "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        valid_structure: true,
      },
    },
  ],
  handler({ token }) {
    const parts = token.trim().split(".");
    if (parts.length !== 3) {
      return {
        header: {},
        payload: {},
        signature: "",
        valid_structure: false,
      };
    }

    function b64decode(str: string): Record<string, unknown> {
      try {
        const padded = str.replace(/-/g, "+").replace(/_/g, "/");
        const json = Buffer.from(padded, "base64").toString("utf-8");
        return JSON.parse(json) as Record<string, unknown>;
      } catch {
        return {};
      }
    }

    return {
      header: b64decode(parts[0]!),
      payload: b64decode(parts[1]!),
      signature: parts[2]!,
      valid_structure: true,
    };
  },
  schemaOrg: {
    name: "JWT Decoder",
    description: "Decode a JSON Web Token to inspect header and payload",
    url: "https://quickhelp.dev/jwt-decoder",
  },
  attribution: {
    text: "Decoded by quickhelp.dev/jwt-decoder",
    url: "https://quickhelp.dev/jwt-decoder",
  },
  content: {
    whatIs:
      "A JSON Web Token (JWT) is a compact, URL-safe way to represent claims. It has three base64url-encoded parts: header, payload, and signature. This tool decodes the header and payload without verifying the signature.",
    howToSteps: [
      { name: "Paste your token", text: "Copy your JWT string (starts with 'eyJ') and paste it into the input field." },
      { name: "Click Run", text: "The decoded header and payload appear as JSON immediately." },
      { name: "Inspect claims", text: "Check expiry (exp), subject (sub), or any custom claims in the payload." },
    ],
    faq: [
      {
        question: "Does this verify the signature?",
        answer: "No. Signature verification requires the secret key, which never leaves your server. This tool only decodes the base64url-encoded parts.",
      },
      {
        question: "Is my token sent to a server?",
        answer: "The REST API sends it to our server for decoding. The UI version can be used client-side. We do not log or store tokens.",
      },
    ],
    relatedTools: ["json-formatter"],
  },
});

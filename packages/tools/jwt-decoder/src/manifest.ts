import { z } from "zod";
import { defineTool } from "@quickhelp/tool-kit";
import { jwtVerify, importSPKI } from "jose";

const ALGORITHMS = ["HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "ES256", "ES384", "ES512"] as const;

function b64urlDecode(str: string): Record<string, unknown> {
  try {
    const padded = str.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export const jwtDecoder = defineTool({
  id: "jwt-decoder",
  slug: "jwt-decoder",
  name: "JWT Decoder",
  summary: "Decode and verify JSON Web Tokens — header, payload, claims, and signature.",
  description:
    "Paste a JSON Web Token to instantly decode its header and payload. Optionally supply a secret or public key to verify the signature.",
  category: "encoding",
  inputSchema: z.object({
    token: z.string().min(10).describe("The JWT string (three base64url-encoded parts separated by dots)"),
    secret: z.string().optional().describe("Secret (HS*) or PEM public key (RS*/ES*) for signature verification"),
    algorithm: z.enum(ALGORITHMS).optional().default("HS256").describe("Signing algorithm — required when verifying"),
  }),
  outputSchema: z.object({
    header: z.record(z.unknown()),
    payload: z.record(z.unknown()),
    signature: z.string(),
    valid_structure: z.boolean(),
    verified: z.boolean().optional(),
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
  async handler({ token, secret, algorithm }) {
    const parts = token.trim().split(".");
    if (parts.length !== 3) {
      return { header: {}, payload: {}, signature: "", valid_structure: false };
    }

    const header = b64urlDecode(parts[0]!);
    const payload = b64urlDecode(parts[1]!);
    const signature = parts[2]!;

    let verified: boolean | undefined;
    if (secret) {
      const alg = algorithm ?? "HS256";
      try {
        if (alg.startsWith("HS")) {
          await jwtVerify(token.trim(), new TextEncoder().encode(secret), { algorithms: [alg] });
        } else {
          const key = await importSPKI(secret, alg);
          await jwtVerify(token.trim(), key, { algorithms: [alg] });
        }
        verified = true;
      } catch {
        verified = false;
      }
    }

    return { header, payload, signature, valid_structure: true, verified };
  },
  schemaOrg: {
    name: "JWT Decoder",
    description: "Decode a JSON Web Token to inspect header, payload, and claims. Optionally verify the signature.",
    url: "https://quickhelp.dev/jwt-decoder",
  },
  attribution: {
    text: "Decoded by quickhelp.dev/jwt-decoder",
    url: "https://quickhelp.dev/jwt-decoder",
  },
  content: {
    whatIs:
      "A JSON Web Token (JWT) is a compact, URL-safe way to represent claims. It has three base64url-encoded parts: header, payload, and signature. This tool decodes the header and payload and can optionally verify the signature.",
    howToSteps: [
      { name: "Paste your token", text: "Copy your JWT string (starts with 'eyJ') and paste it into the input field." },
      { name: "Inspect claims", text: "The decoded header and payload appear instantly — check exp, sub, iss, and any custom claims." },
      { name: "Verify signature", text: "Enter your secret or public key and click Verify to confirm the token hasn't been tampered with." },
    ],
    faq: [
      {
        question: "Does this verify the signature?",
        answer: "Yes — enter your HMAC secret or RSA/ECDSA public key in the Verify section. For HS* algorithms the secret is a plain string; for RS*/ES* provide a PEM public key.",
      },
      {
        question: "Is my token sent to a server?",
        answer: "The browser-side decoder never makes a network call. The signature-verification endpoint receives your token and key only during the verify request; neither is logged or stored.",
      },
    ],
    relatedTools: ["json-formatter"],
  },
});

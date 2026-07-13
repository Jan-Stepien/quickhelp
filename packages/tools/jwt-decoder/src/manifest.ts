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
      "A JSON Web Token (JWT) is a compact, URL-safe string used to securely transmit claims between two parties. It consists of three base64url-encoded segments separated by dots: a header, a payload, and a signature. The header specifies the signing algorithm (such as HS256, RS256, or ES256). The payload contains claims — statements about an entity and additional metadata, such as a user ID (sub), an expiry time (exp), an issuer (iss), and any custom application-defined fields. The signature is computed over the header and payload using a secret or private key, allowing the recipient to verify that the token was issued by a trusted source and has not been modified. JWTs are the standard mechanism for stateless authentication in modern web applications: once issued, they travel with every API request (typically in the Authorization: Bearer header) and can be validated without a database lookup. This tool decodes the header and payload instantly without requiring a key, and can optionally verify the signature using your HMAC secret or RSA/ECDSA public key — all within your browser.",
    howToSteps: [
      { name: "Paste your token", text: "Copy your JWT string — it starts with 'eyJ' and contains two dots separating the three segments. Paste it into the input field." },
      { name: "Inspect the claims", text: "The decoded header and payload appear as formatted JSON instantly. Check the algorithm (alg) in the header, and look for exp (expiry as a Unix timestamp), sub (subject/user ID), iss (issuer), and any application-specific claims in the payload." },
      { name: "Verify the signature (optional)", text: "To confirm the token has not been tampered with, enter your HMAC secret (for HS256/HS384/HS512) or PEM public key (for RS*/ES*) in the Verify section and click Verify. A green badge means the signature is valid." },
    ],
    faq: [
      {
        question: "Does this verify the signature?",
        answer: "Yes — enter your HMAC secret or RSA/ECDSA public key in the Verify section. For HS* algorithms the secret is a plain text string; for RS*/ES* provide a PEM-formatted public key matching the private key that signed the token.",
      },
      {
        question: "Is my token sent to a server?",
        answer: "The browser-side decoder never makes a network call — decoding is done entirely in JavaScript. The signature-verification call does send your token and key over HTTPS to a server-side endpoint, but neither is logged or stored.",
      },
      {
        question: "What is the difference between HS256 and RS256?",
        answer: "HS256 (HMAC-SHA-256) uses a single shared secret that both the issuer and the verifier must know. RS256 (RSA-SHA-256) uses a private key to sign and a public key to verify — the public key can be shared openly via a JWKS endpoint without exposing the signing key. RS256 is preferred for public APIs and multi-tenant systems.",
      },
      {
        question: "How do I check if a JWT has expired?",
        answer: "After decoding, look for the 'exp' claim in the payload — it is a Unix timestamp (seconds since 1970-01-01 UTC). If Date.now() / 1000 > exp, the token is expired. The decoder converts timestamp claims to human-readable dates automatically so you can see the expiry at a glance.",
      },
      {
        question: "Can I decode a JWT without the secret?",
        answer: "Yes. Decoding only requires base64url-decoding the header and payload segments, which requires no key. Anyone with the token string can read the claims — JWTs are encoded, not encrypted. Never store sensitive data (passwords, payment details) in a JWT payload unless you also encrypt it (JWE).",
      },
      {
        question: "What should I do if I see 'Invalid signature'?",
        answer: "Confirm you are using the correct key for the algorithm shown in the header. For HS256, check for extra whitespace or base64 encoding on the secret. For RS256/ES256, confirm you are using the public key (not the private key) in PEM format. A wrong key is always the cause of a signature mismatch.",
      },
    ],
    relatedTools: ["json-formatter", "hash-generator", "base64"],
    useCases: [
      {
        slug: "decode-jwt-in-browser",
        title: "How to decode a JWT in your browser",
        intent: "Instantly inspect the header and payload of any JWT without installing software.",
        intro: "JSON Web Tokens (JWTs) are opaque strings at first glance, but decoding them takes less than a second. This guide shows you how to decode a JWT directly in your browser using quickhelp.dev — no library, no terminal, no sign-up required. Just paste your token and you'll see the header algorithm, the payload claims, and the raw signature in a readable JSON format. Ideal for debugging authentication issues, checking token expiry, or inspecting claims from a third-party identity provider.",
        steps: [
          { name: "Copy your token", text: "Grab the JWT from your browser's developer tools (Application → Cookies or Network → Authorization header) or from your code." },
          { name: "Paste into the decoder", text: "Open the JWT Decoder at quickhelp.dev/jwt-decoder and paste the token into the input field. The header and payload appear instantly." },
          { name: "Read the claims", text: "Look for 'exp' (expiry as a Unix timestamp), 'sub' (subject/user ID), 'iss' (issuer), and any custom claims your application adds." },
        ],
        faq: [
          { question: "Does decoding a JWT verify it?", answer: "No. Decoding only reveals the contents. Verification requires the secret or public key to confirm the signature has not been tampered with." },
          { question: "Is my token sent to a server when I decode it?", answer: "The browser-side decoder runs entirely in JavaScript — no network request is made. For API-based decoding, the token is sent over HTTPS and never stored." },
        ],
      },
      {
        slug: "inspect-auth0-token",
        title: "How to inspect an Auth0 JWT token",
        intent: "Read the claims inside an Auth0 access token or ID token to debug permissions and user data.",
        intro: "Auth0 issues both access tokens and ID tokens as JWTs. When an integration breaks — a user lacks permissions, a role is missing, or an API returns 401 — the fastest fix is to inspect the token claims directly. This guide explains how to decode an Auth0 JWT and what each claim means, without writing a single line of code. You'll identify the 'scope', 'permissions', 'https://your-namespace/roles', and custom claims added by Auth0 Rules or Actions.",
        steps: [
          { name: "Get the token", text: "In Auth0's Dashboard, go to Auth0 → Applications → Test → copy the access_token from the response. Or grab it from your app's auth flow in browser DevTools." },
          { name: "Paste and decode", text: "Paste the token at quickhelp.dev/jwt-decoder. Look in the header for 'alg' (RS256 for Auth0) and in the payload for 'aud', 'iss', 'sub', and 'scope'." },
          { name: "Check permissions", text: "Auth0 RBAC adds a 'permissions' array and a namespaced roles claim. Confirm the user has the expected permissions before debugging your API logic." },
        ],
        faq: [
          { question: "Why does Auth0 use RS256 instead of HS256?", answer: "RS256 (RSA + SHA-256) lets any party verify the token using Auth0's public JWKS endpoint without knowing the private signing key, which is more secure for public APIs." },
          { question: "How do I verify an Auth0 token's signature?", answer: "Paste your Auth0 PEM public key (from your tenant's JWKS endpoint) into the Verify section and select RS256." },
        ],
      },
      {
        slug: "check-jwt-expiry",
        title: "How to check if a JWT has expired",
        intent: "Read the 'exp' claim from a JWT to determine when the token expires or whether it's already expired.",
        intro: "A JWT with an expired 'exp' claim causes 401 errors that can be frustrating to track down. This guide explains how to quickly read the expiry timestamp from any JWT — no library required. You'll convert the Unix timestamp in the 'exp' claim to a readable date and compare it against the current time. Useful for debugging token refresh flows, diagnosing intermittent auth failures, and confirming that your token issuance logic sets the correct lifetime.",
        steps: [
          { name: "Decode the token", text: "Paste your JWT at quickhelp.dev/jwt-decoder. The payload renders as formatted JSON." },
          { name: "Find the exp claim", text: "Look for the 'exp' field — it's a Unix timestamp (seconds since 1970-01-01). Example: 1716998400." },
          { name: "Convert to a readable date", text: "In your browser console run: new Date(1716998400 * 1000).toISOString(). Compare against the current time with: Date.now() > 1716998400 * 1000 — if true, the token is expired." },
        ],
        faq: [
          { question: "What happens if a JWT has no exp claim?", answer: "Tokens without 'exp' never expire on their own — your server must revoke them explicitly via a denylist or by rotating the signing secret." },
          { question: "Can I trust the exp claim alone?", answer: "No. A malicious actor can craft any payload. Always verify the signature before trusting any claim, including exp." },
        ],
      },
      {
        slug: "verify-hs256-signature",
        title: "How to verify a JWT HS256 signature",
        intent: "Confirm that a JWT signed with HMAC-SHA-256 has not been tampered with by verifying it against a known secret.",
        intro: "HMAC-SHA-256 (HS256) is the most common JWT signing algorithm for server-to-server tokens where both parties share a secret. Verifying the signature proves the token was issued by a server that knows the secret and that the claims have not been modified in transit. This guide walks through verification using the quickhelp.dev JWT Decoder — no Node.js or Python script required.",
        steps: [
          { name: "Paste the token", text: "Open quickhelp.dev/jwt-decoder and paste your HS256-signed JWT. Confirm 'alg: HS256' appears in the decoded header." },
          { name: "Enter the secret", text: "Scroll to the Verify section. Enter your HMAC secret (the same string your server uses to sign tokens) in the Secret field." },
          { name: "Click Verify", text: "The tool computes the expected signature and compares it to the token's signature. 'Verified ✓' means the token is authentic; 'Invalid signature' means it has been tampered with or the wrong secret was used." },
        ],
        faq: [
          { question: "Is it safe to paste my HMAC secret here?", answer: "Use a test or non-production secret when verifying in any online tool. Never paste production secrets into third-party websites." },
          { question: "What if verification fails with the correct secret?", answer: "Check for trailing whitespace, encoding differences (the secret may be base64-encoded on your server), or clock skew affecting the iat/nbf claims." },
        ],
      },
    ],
  },
});

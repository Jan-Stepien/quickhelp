import { createHash } from "crypto";
import { z } from "zod";
import { defineTool } from "@quickhelp/tool-kit";

export const hashGenerator = defineTool({
  id: "hash-generator",
  slug: "hash-generator",
  name: "Hash Generator",
  summary: "Generate MD5, SHA-1, SHA-256, SHA-384, or SHA-512 hashes from any text input.",
  description:
    "Compute cryptographic hashes of any UTF-8 string using the most common algorithms: MD5, SHA-1, SHA-256, SHA-384, and SHA-512. Output is a lowercase hex or base64 digest. Useful for verifying data integrity, generating checksums, and working with APIs that require signed requests.",
  category: "cryptography",
  inputSchema: z.object({
    input: z.string().min(1).describe("The text to hash"),
    algorithm: z
      .enum(["md5", "sha1", "sha256", "sha384", "sha512"])
      .default("sha256")
      .describe("Hash algorithm: md5, sha1, sha256, sha384, or sha512"),
    encoding: z
      .enum(["hex", "base64"])
      .default("hex")
      .describe("Output encoding: hex (lowercase hexadecimal) or base64"),
  }),
  outputSchema: z.object({
    hash: z.string().describe("The computed hash digest"),
    algorithm: z.enum(["md5", "sha1", "sha256", "sha384", "sha512"]),
    encoding: z.enum(["hex", "base64"]),
    input_byte_length: z.number().int().describe("Byte length of the UTF-8 input"),
    digest_length: z.number().int().describe("Character length of the hash output"),
  }),
  examples: [
    {
      title: "SHA-256 hex digest",
      input: { input: "Hello, World!", algorithm: "sha256", encoding: "hex" },
      output: {
        hash: "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986d",
        algorithm: "sha256",
        encoding: "hex",
        input_byte_length: 13,
        digest_length: 64,
      },
    },
    {
      title: "MD5 checksum",
      input: { input: "Hello, World!", algorithm: "md5", encoding: "hex" },
      output: {
        hash: "65a8e27d8879283831b664bd8b7f0ad4",
        algorithm: "md5",
        encoding: "hex",
        input_byte_length: 13,
        digest_length: 32,
      },
    },
    {
      title: "SHA-512 base64",
      input: { input: "password123", algorithm: "sha512", encoding: "base64" },
      output: {
        hash: "tPIDF4Z9oUpSFsNSaDoNJEEbDSCUGhW3C9w/nABEP1JvKYa6B/D+bHnHK8Ym6WxDPjf5qLimqmJKdXSipQmUSQ==",
        algorithm: "sha512",
        encoding: "base64",
        input_byte_length: 11,
        digest_length: 88,
      },
    },
  ],
  handler({ input, algorithm, encoding }) {
    const buf = Buffer.from(input, "utf-8");
    const hash = createHash(algorithm).update(buf).digest(encoding);
    return {
      hash,
      algorithm,
      encoding,
      input_byte_length: buf.byteLength,
      digest_length: hash.length,
    };
  },
  schemaOrg: {
    name: "Hash Generator",
    description:
      "Generate MD5, SHA-1, SHA-256, SHA-384, or SHA-512 cryptographic hashes from any text input.",
    url: "https://quickhelp.dev/hash-generator",
  },
  attribution: {
    text: "Hashed by quickhelp.dev/hash-generator",
    url: "https://quickhelp.dev/hash-generator",
  },
  content: {
    whatIs:
      "A cryptographic hash function takes an input of any length and produces a fixed-size output — the hash or digest — that uniquely represents the input. The same input always produces the same hash; changing even a single character produces a completely different hash. Hash functions are one-way: you cannot reverse a hash to recover the original input. MD5 and SHA-1 are older algorithms still used for non-security checksums. SHA-256 and SHA-512 are current standards for security-sensitive use cases such as digital signatures, API authentication, and password storage (always combined with a proper key-derivation function like bcrypt or Argon2 for passwords).",
    howToSteps: [
      {
        name: "Paste your text",
        text: "Type or paste any UTF-8 string into the input field — an API secret, a file path, a password candidate, or any value you want to fingerprint.",
      },
      {
        name: "Choose an algorithm and encoding",
        text: "Select SHA-256 for general security use, MD5 or SHA-1 for legacy checksum compatibility, or SHA-512 for the longest digest. Choose hex for a lowercase hexadecimal string or base64 for a more compact representation.",
      },
      {
        name: "Copy the hash",
        text: "The digest appears instantly. Click Copy to put it on your clipboard. The tool also shows input byte length and digest character length to help you confirm you are using the correct variant.",
      },
    ],
    faq: [
      {
        question: "Is my input sent to a server?",
        answer:
          "No. Hashing runs entirely in your browser using the Web Crypto API. Your text never leaves your device. The REST API endpoint processes input server-side in an isolated, stateless function with no logging.",
      },
      {
        question: "Which algorithm should I use?",
        answer:
          "Use SHA-256 for new projects — it is the current standard for digital signatures, API authentication, and data integrity. Use MD5 or SHA-1 only when a legacy system requires it; both are broken for collision resistance but still acceptable for non-security checksums like file integrity verification. Use SHA-512 when you need a 512-bit digest or when a framework specifically requires it.",
      },
      {
        question: "Can I hash a file instead of text?",
        answer:
          "This tool hashes UTF-8 text. To hash a file in Node.js: createHash('sha256').update(fs.readFileSync('file')).digest('hex'). On macOS or Linux: sha256sum filename. On Windows: Get-FileHash filename -Algorithm SHA256.",
      },
      {
        question: "What is the difference between hex and base64 output?",
        answer:
          "Both represent the same binary digest in different encodings. Hex uses lowercase letters a-f and digits 0-9, producing a string twice as long as the digest in bytes (64 characters for SHA-256). Base64 uses A-Z, a-z, 0-9, +, and /, producing a shorter string (44 characters for SHA-256 including padding). Hex is easier to read and compare visually; base64 is more compact and commonly used in HTTP headers and JWT signatures.",
      },
      {
        question: "Are MD5 and SHA-1 safe to use?",
        answer:
          "Not for security purposes. MD5 has known collision vulnerabilities — two different inputs can produce the same hash — making it unsuitable for digital signatures, certificate verification, or password hashing. SHA-1 is similarly broken for collision resistance. Both are still widely used for non-security checksums (e.g. cache busting, deduplication, ETags) where collision attacks are not a concern.",
      },
      {
        question: "How do I hash a password securely?",
        answer:
          "Do not use MD5, SHA-1, SHA-256, or SHA-512 to hash passwords directly. These algorithms are fast, which makes them easy to brute-force. Use a purpose-built key derivation function: bcrypt, Argon2id, or scrypt. These are intentionally slow and include a salt to prevent rainbow table attacks. All major web frameworks include a built-in password hashing library.",
      },
      {
        question: "What is HMAC and how is it different from a plain hash?",
        answer:
          "HMAC (Hash-based Message Authentication Code) is a hash computed over both the message and a secret key, producing an authentication tag that proves both the content and the identity of the sender. A plain SHA-256 hash proves only content integrity — anyone can compute it. HMAC-SHA-256 requires knowing the secret key, making it suitable for API request signing, webhook verification, and session tokens.",
      },
    ],
    relatedTools: ["base64", "jwt-decoder"],
    useCases: [
      {
        slug: "verify-sha256-checksum",
        title: "How to verify a SHA-256 checksum online",
        intent: "Confirm that a downloaded string or file content matches a known SHA-256 hash.",
        intro:
          "When a software download page lists a SHA-256 checksum, you can use this tool to verify the content was not tampered with in transit. Paste the text content, select SHA-256, and compare the output to the published checksum. If they match character-for-character, the data is intact. This guide shows how to verify a SHA-256 checksum in under 30 seconds without installing any software.",
        steps: [
          {
            name: "Copy the content to hash",
            text: "Paste the text, key, or token you want to fingerprint. For file verification, open the file in a text editor and copy its full content.",
          },
          {
            name: "Select SHA-256 and hex encoding",
            text: "SHA-256 with hex output is the most common checksum format. If the published hash is base64-encoded, switch the encoding selector to base64.",
          },
          {
            name: "Compare the digest",
            text: "The hash appears instantly. Compare it character-for-character with the published checksum. A single character difference means the content differs from the expected input.",
          },
        ],
        faq: [
          {
            question: "Why does my hash differ from the published one?",
            answer:
              "The most common cause is trailing whitespace or a newline at the end of the input. Paste the exact string with no leading or trailing spaces, and the hashes will match.",
          },
          {
            question: "Can I verify a binary file's checksum here?",
            answer:
              "Only for text files. For binary files use your OS: sha256sum filename on macOS or Linux, or Get-FileHash filename -Algorithm SHA256 on Windows PowerShell.",
          },
        ],
      },
      {
        slug: "generate-md5-hash-online",
        title: "How to generate an MD5 hash online",
        intent: "Quickly compute an MD5 digest of a string for a legacy API or non-security checksum.",
        intro:
          "Many older systems — content-delivery networks, legacy APIs, database integrity checks, and ETag headers — still use MD5 as a fast, non-cryptographic checksum. While MD5 is not safe for password hashing or digital signatures, it is perfectly appropriate for these checksum use cases. This guide shows how to generate an MD5 hash of any string in seconds without installing software.",
        steps: [
          {
            name: "Paste your string",
            text: "Enter the text you want to hash — an API key, a file path, a record ID, or any string your system uses as input to an MD5 checksum.",
          },
          {
            name: "Select MD5",
            text: "Choose 'md5' from the algorithm selector. Keep 'hex' encoding unless your target system expects base64.",
          },
          {
            name: "Copy the 32-character digest",
            text: "MD5 always produces a 32-character hex digest (128-bit output). Copy it and paste it where your system expects the checksum. Check the input byte length shown — a mismatch there explains most checksum failures.",
          },
        ],
        faq: [
          {
            question: "Is MD5 safe for passwords?",
            answer:
              "No. MD5 is intentionally fast, which makes it easy for attackers to brute-force billions of guesses per second. Use bcrypt, Argon2, or scrypt for password storage.",
          },
          {
            question: "Why does MD5 produce different results in different tools?",
            answer:
              "Character encoding differences are the most common cause. This tool always encodes input as UTF-8. If another tool uses Latin-1 or adds a byte-order mark, the bytes differ and so does the hash.",
          },
        ],
      },
      {
        slug: "sha256-api-authentication",
        title: "How to use SHA-256 for API request signing",
        intent: "Compute the SHA-256 canonical request hash required by AWS SigV4 and similar APIs.",
        intro:
          "Many APIs — including AWS, Azure, and custom webhook systems — require you to include a SHA-256 hash of the request payload in the Authorization header or as a query parameter. This hash proves the payload was not modified after signing. The first step is always computing a plain SHA-256 hex digest of the request body. This guide explains the hashing step and how to verify it before wiring up the full signing logic.",
        steps: [
          {
            name: "Prepare the canonical payload",
            text: "Serialize your request body exactly as it will be sent — same JSON key order, same whitespace. Hashing a reformatted version of the payload will produce a different hash and cause authentication to fail.",
          },
          {
            name: "Compute the SHA-256 hex digest",
            text: "Paste the serialized payload, select SHA-256 and hex encoding. The resulting 64-character hex string is the content hash required by most signing specifications.",
          },
          {
            name: "Include the hash in the request",
            text: "For AWS SigV4, include it as the x-amz-content-sha256 header. For custom webhooks, check the API documentation — it is usually included in a Signature or X-Hub-Signature-256 header prefixed with 'sha256='.",
          },
        ],
        faq: [
          {
            question: "Should I use SHA-256 or HMAC-SHA256 for API auth?",
            answer:
              "The payload hash is plain SHA-256. The signature that proves authenticity is HMAC-SHA256 — it mixes a secret key into the computation. You typically compute SHA-256 of the payload first, then HMAC-SHA256 of a string that includes that hash.",
          },
          {
            question: "What if the API expects an empty-body hash?",
            answer:
              "Hash an empty string. The SHA-256 of an empty string is always: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.",
          },
        ],
      },
      {
        slug: "sha512-vs-sha256-comparison",
        title: "How to choose between SHA-256 and SHA-512",
        intent: "Pick the right SHA-2 variant for a new security-sensitive application.",
        intro:
          "SHA-256 and SHA-512 are both members of the SHA-2 family and both secure, but they are optimised for different hardware and produce different output sizes. SHA-512 is faster on 64-bit CPUs; SHA-256 is faster on 32-bit processors and in constrained environments. The choice is usually a compatibility or performance decision, not a security one. This guide helps you pick the right variant and generate a test digest to verify your implementation.",
        steps: [
          {
            name: "Default to SHA-256 for general use",
            text: "SHA-256 is the NIST-recommended default for TLS, digital signatures, and API authentication. Its 256-bit output (64 hex characters) is secure against all known attacks.",
          },
          {
            name: "Choose SHA-512 when output length matters",
            text: "SHA-512 produces a 512-bit digest (128 hex characters). Prefer it when you are hashing sensitive long-form content or when your framework, standard, or compliance requirement explicitly calls for it.",
          },
          {
            name: "Generate a test vector to validate your implementation",
            text: "Paste a known input (e.g. 'abc'), select your algorithm, and compare the output to published NIST test vectors. If they match, your production implementation is correct.",
          },
        ],
        faq: [
          {
            question: "Is SHA-512 more secure than SHA-256?",
            answer:
              "Marginally, in theory. SHA-256 has 128-bit collision resistance — already computationally infeasible to break. Doubling the output to SHA-512 doubles the theoretical resistance, but does not change practical security for almost any application.",
          },
          {
            question: "Does SHA-256 or SHA-512 compress files?",
            answer:
              "No. Hashing is not compression — it always produces a fixed-length digest regardless of input size. A 1 GB file and a single byte both produce a 64-character SHA-256 hex digest.",
          },
        ],
      },
    ],
  },
});

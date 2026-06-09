import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@quickhelp/tool-kit";
import { JsonLd } from "@quickhelp/seo";

export const dynamic = "force-static";

interface GlossaryEntry {
  term: string;
  slug: string;
  definition: string;
  extended: string;
  related?: string[];
  seeAlso?: { label: string; href: string }[];
}

// Each entry ≥200 words per quality-gates.md (safe-at-scale programmatic page type)
const GLOSSARY: GlossaryEntry[] = [
  {
    term: "JWT",
    slug: "jwt",
    definition:
      "JWT (JSON Web Token) is an open standard (RFC 7519) for compactly and securely transmitting information between parties as a JSON object. A JWT consists of three base64url-encoded parts separated by dots: the header (algorithm and token type), the payload (claims), and the signature.",
    extended: `
JSON Web Tokens are commonly used for authentication and information exchange in web applications and APIs. The header specifies the signing algorithm (e.g., HS256, RS256) and token type. The payload contains claims — statements about an entity (typically the user) and additional metadata. Common registered claims include \`iss\` (issuer), \`sub\` (subject), \`exp\` (expiration time), \`iat\` (issued at), and \`aud\` (audience).

The signature is computed by encoding the header and payload, concatenating them with a dot, and signing with the algorithm specified in the header. For HMAC-based algorithms (HS256, HS384, HS512), the signature uses a shared secret. For RSA and ECDSA algorithms, a private key signs and a public key verifies.

JWTs are widely used in OAuth 2.0, OpenID Connect, and session management. They allow stateless authentication because the server can verify the token without storing session data. However, JWTs cannot be invalidated before expiry without a server-side deny-list, so short expiry times are recommended for sensitive operations.

Use quickhelp.dev's JWT Decoder to inspect any JWT's header and payload, and optionally verify the signature with your secret or public key.
    `.trim(),
    related: ["jwt-decoder", "json-formatter"],
    seeAlso: [
      { label: "JWT Decoder", href: "/jwt-decoder" },
      { label: "RFC 7519", href: "https://datatracker.ietf.org/doc/html/rfc7519" },
    ],
  },
  {
    term: "MCP",
    slug: "mcp",
    definition:
      "MCP (Model Context Protocol) is an open standard that defines how AI models and agents discover and invoke external tools. It provides a unified interface for tool registration, invocation, and result handling, enabling any AI system to use any MCP-compatible tool without custom integration code.",
    extended: `
The Model Context Protocol was introduced to solve the n×m integration problem: n AI systems each needing custom integrations with m tools. MCP defines a standard wire protocol (typically JSON-RPC over stdio or HTTP) with well-defined messages for tool discovery (\`tools/list\`), invocation (\`tools/call\`), and resource access.

An MCP server exposes a registry of tools. Each tool has a name, description, and JSON Schema-described input parameters. An MCP client (typically an AI agent or model) queries the server for available tools, selects the appropriate tool, calls it with structured input, and receives structured output.

quickhelp.dev exposes all registered tools over MCP at \`/mcp\` (HTTP transport) and via stdio for local use with Claude Desktop. The same tool registry powering the REST API and OpenAPI spec automatically populates the MCP tool list — adding a new tool makes it available across all four surfaces at once.

MCP is a key part of the agent-native design: tools built for MCP are discoverable by any AI system that speaks the protocol.
    `.trim(),
    related: [],
    seeAlso: [
      { label: "MCP Endpoint", href: "/mcp" },
      { label: "OpenAPI Spec", href: "/openapi.json" },
    ],
  },
  {
    term: "OpenAPI",
    slug: "openapi",
    definition:
      "OpenAPI (formerly Swagger) is a specification for describing HTTP APIs in a machine-readable format. An OpenAPI document (typically JSON or YAML) describes endpoints, request/response schemas, authentication, and examples in a standardised way that tools can use to generate clients, servers, documentation, and tests automatically.",
    extended: `
OpenAPI 3.1 (the current version) aligns fully with JSON Schema, allowing reuse of existing schema definitions and enabling richer validation. An OpenAPI document consists of an \`info\` block (title, version, description), \`paths\` (endpoints with operations), \`components\` (reusable schemas, parameters, responses), and optional security schemes.

For AI agents, the OpenAPI spec is a critical discovery surface. Agents can load \`/openapi.json\`, parse the available operations, understand input and output shapes, and call any tool without prior knowledge of its API. Tools like Claude, ChatGPT plugins, and LangChain's OpenAPI agent all support this pattern.

quickhelp.dev maintains an aggregated OpenAPI 3.1 document at \`/openapi.json\`. Each tool's \`inputSchema\` and \`outputSchema\` (defined as Zod schemas in the manifest) are automatically compiled to JSON Schema and embedded in the OpenAPI document. Adding a new tool automatically extends the spec.

Use the spec to generate client SDKs in any language, import it into Postman or Insomnia, or point an AI agent at it for tool discovery.
    `.trim(),
    related: [],
    seeAlso: [
      { label: "quickhelp.dev OpenAPI spec", href: "/openapi.json" },
      { label: "OpenAPI Initiative", href: "https://www.openapis.org" },
    ],
  },
  {
    term: "Base64",
    slug: "base64",
    definition:
      "Base64 is a binary-to-text encoding scheme that represents binary data as a sequence of printable ASCII characters. It encodes every three bytes of input into four characters drawn from a 64-character alphabet (A–Z, a–z, 0–9, +, /), expanding the size by approximately 33% but ensuring safe transmission through text-only channels.",
    extended: `
Base64 is ubiquitous in computing because many protocols — email (MIME), HTTP, and JSON — were designed around text and cannot carry raw binary safely. By encoding binary data into a stable set of 64 printable characters, Base64 makes it possible to embed images in HTML, transmit cryptographic keys in JSON, and store binary blobs in databases that only accept text.

The encoding process splits input bytes into 6-bit groups (since 2^6 = 64) and maps each to a character in the Base64 alphabet. If the input length is not a multiple of three, padding characters (=) are appended to make the output a multiple of four characters long. A variant called Base64url replaces + with - and / with _ to make the output safe inside URLs and filenames — this is the variant used in JWTs.

Decoding reverses the process: each character is looked up in the alphabet table, the resulting 6-bit values are concatenated, and the bytes are reconstructed. Base64 is not encryption — anyone with the encoded string can decode it trivially. Its only purpose is encoding, not security.

Common uses include: embedding binary file attachments in email (MIME), storing images directly in HTML or CSS as data URIs, encoding cryptographic keys and certificates in PEM format, and transmitting binary API payloads through JSON.

quickhelp.dev's Base64 tool encodes and decodes strings and binary files instantly in the browser — no server-side processing, no data leaving your device.
    `.trim(),
    related: ["base64", "url-encoder"],
    seeAlso: [
      { label: "Base64 Encoder / Decoder", href: "/base64" },
      { label: "URL Encoder", href: "/url-encoder" },
    ],
  },
  {
    term: "Binary",
    slug: "binary",
    definition:
      "Binary is the base-2 number system, using only the digits 0 and 1. It is the native number system of all digital computers because transistors have two states (on/off), which map directly to the binary digits 1 and 0. Every number, character, image, and instruction in a computer is ultimately represented as a sequence of binary digits (bits).",
    extended: `
In binary, each digit position represents a power of 2, starting from 2^0 = 1 on the right. The binary number 1011 means 1×8 + 0×4 + 1×2 + 1×1 = 11 in decimal. This positional system is identical to the familiar decimal (base-10) system, just with a smaller base.

A single binary digit is called a bit. Eight bits form a byte, which can represent 256 different values (0–255). Bytes are the standard unit for measuring file sizes, memory, and network bandwidth. Common groupings include the nibble (4 bits, one hexadecimal digit), the word (typically 16 or 32 bits depending on architecture), and the double word (32 bits).

Binary is foundational to understanding how computers work. File permissions on Unix systems use octal notation, which maps cleanly to groups of three binary bits. Bitwise operations (AND, OR, XOR, NOT, shifts) operate directly on binary representations and are used in cryptography, networking, graphics, and low-level programming.

Hexadecimal (base-16) is a compact shorthand for binary: one hex digit represents exactly four binary digits (a nibble). Programmers read hex values instead of long binary strings for memory addresses, color codes, and byte sequences.

Use the Number Base Converter to convert between binary, octal, decimal, and hexadecimal instantly, including grouped nibble and byte formats for readability.
    `.trim(),
    related: ["number-base-converter"],
    seeAlso: [
      { label: "Number Base Converter", href: "/number-base-converter" },
      { label: "Hexadecimal", href: "/glossary/hexadecimal" },
    ],
  },
  {
    term: "CSV",
    slug: "csv",
    definition:
      "CSV (Comma-Separated Values) is a plain-text tabular data format in which each line represents a row and values within a row are separated by commas. Despite its simplicity, CSV is one of the most widely used formats for data exchange between spreadsheets, databases, analytics tools, and APIs.",
    extended: `
A CSV file has no formal standard, but the de facto convention (described in RFC 4180) is: each record occupies one line ending with CRLF, the first line is an optional header row naming the columns, values are separated by commas, and values containing commas, newlines, or double-quote characters are wrapped in double quotes. A double-quote within a quoted value is escaped by doubling it ("").

Alternative separators are common — tab-separated files (TSV) use a tab character, and some regional locales use semicolons because the comma is the decimal separator. Many CSV parsers accept a configurable delimiter.

CSV is popular because it is human-readable, editable in any text editor, importable directly into Excel and Google Sheets, and supported by virtually every database, programming language, and data tool. It trades features for simplicity: CSV has no native support for nested data, multiple sheets, data types, formulas, or encoding metadata.

For exchanging flat, rectangular data — user lists, product catalogs, financial records, measurement samples — CSV is often the most pragmatic choice. For hierarchical or schema-rich data, JSON or XML are more appropriate.

quickhelp.dev's JSON to CSV tool converts flat JSON arrays to CSV and back, making it easy to switch between API payloads (JSON) and spreadsheet-friendly formats (CSV) without writing any code.
    `.trim(),
    related: ["json-to-csv", "json-formatter"],
    seeAlso: [
      { label: "JSON to CSV Converter", href: "/json-to-csv" },
      { label: "RFC 4180", href: "https://datatracker.ietf.org/doc/html/rfc4180" },
    ],
  },
  {
    term: "Hash function",
    slug: "hash-function",
    definition:
      "A cryptographic hash function is a one-way mathematical function that maps an input of arbitrary size to a fixed-length output called a hash, digest, or checksum. The function is deterministic (same input always produces the same output), fast to compute, and practically impossible to reverse — you cannot reconstruct the input from the output.",
    extended: `
A secure cryptographic hash function has three key properties. Preimage resistance means that given a hash value, it is computationally infeasible to find any input that produces it. Second preimage resistance means that given an input and its hash, it is infeasible to find a different input with the same hash. Collision resistance means it is infeasible to find any two different inputs that produce the same hash.

The most widely used hash functions today are the SHA-2 family (SHA-256, SHA-384, SHA-512) and SHA-3. MD5 and SHA-1 are deprecated for security use because practical collision attacks exist, but they still appear in non-security contexts such as file deduplication and legacy checksums.

Hash functions serve many purposes in computing. Password storage: instead of storing passwords in plain text, systems store the hash (ideally salted and with a slow function like bcrypt or Argon2) so that even if the database is stolen, passwords are not immediately compromised. Data integrity: checksums let you verify that a downloaded file was not corrupted or tampered with. Digital signatures: a signature is computed over the hash of a document, not the document itself, for efficiency. Content-addressing: Git identifies every commit, tree, and blob by its SHA-1 hash (migrating to SHA-256). Bitcoin uses double-SHA-256 to link blocks in the chain.

quickhelp.dev's Hash Generator computes MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes for any text input in your browser.
    `.trim(),
    related: ["hash-generator"],
    seeAlso: [
      { label: "Hash Generator", href: "/hash-generator" },
      { label: "SHA-256", href: "/glossary/sha-256" },
      { label: "HMAC", href: "/glossary/hmac" },
    ],
  },
  {
    term: "Hexadecimal",
    slug: "hexadecimal",
    definition:
      "Hexadecimal (hex) is a base-16 number system that uses 16 symbols: digits 0–9 and letters A–F, where A = 10, B = 11, C = 12, D = 13, E = 14, and F = 15. Hexadecimal is favoured in computing because each hex digit maps exactly to four binary digits (a nibble), making it a compact shorthand for binary values.",
    extended: `
In hexadecimal, each digit position represents a power of 16. The value 0xFF equals 15×16 + 15 = 255 in decimal, and 11111111 in binary. This clean 4-bit-to-1-digit mapping means that an 8-bit byte (0–255) is always two hex digits, a 16-bit value is four digits, and a 32-bit value is eight digits — fixed-width representations that are much easier to read than long binary strings.

Hexadecimal values are conventionally prefixed with 0x (in C, Python, Go, JavaScript, and most other languages) or # (in CSS for colours). Uppercase A–F and lowercase a–f are equivalent and accepted by all parsers.

Common uses of hexadecimal in programming include: memory addresses and pointer values (0x7fff5fbff700), CSS colour codes (#FF6600 = rgb(255, 102, 0)), file format magic numbers (PDF files begin with 25 50 44 46 = %PDF), network addresses and subnet masks, cryptographic hash outputs (SHA-256 produces 64 hex chars), and binary data in debuggers and hex editors.

To convert between hex and other bases, you multiply each digit by its positional power of 16 and sum. For long values, tools like the Number Base Converter handle arbitrarily large integers without precision loss.

Octal (base-8) is another compact binary shorthand — each octal digit represents exactly three binary digits — most commonly seen in Unix file permissions (chmod 755).
    `.trim(),
    related: ["number-base-converter", "color-converter", "hash-generator"],
    seeAlso: [
      { label: "Number Base Converter", href: "/number-base-converter" },
      { label: "Color Converter", href: "/color-converter" },
      { label: "Binary", href: "/glossary/binary" },
    ],
  },
  {
    term: "HMAC",
    slug: "hmac",
    definition:
      "HMAC (Hash-based Message Authentication Code) is a type of message authentication code that combines a cryptographic hash function with a secret key. It provides both data integrity (the message was not altered) and authentication (the sender knows the secret key). HMAC is defined in RFC 2104 and is widely used in API authentication, JWT signing, and webhook verification.",
    extended: `
A plain hash function (e.g., SHA-256) verifies data integrity but not authenticity — anyone can compute a hash. HMAC adds a secret key to the computation so that only parties who know the key can produce or verify the correct MAC. The algorithm pads the key to the hash block size, XORs it with inner and outer padding constants, and runs two nested hash operations: H(K ⊕ opad || H(K ⊕ ipad || message)).

This two-pass construction prevents length extension attacks that affect plain hash constructions like H(key || message). HMAC is provably secure as long as the underlying hash function is collision-resistant and the key is secret.

HMAC-SHA256 is the most common variant. It is used in JWT signing (the HS256 algorithm), AWS request signing (Signature Version 4), OAuth 1.0 signature generation, TOTP/HOTP one-time password algorithms (RFC 6238 / RFC 4226), TLS 1.2 PRF, and webhook payload verification (GitHub, Stripe, and most SaaS providers send an HMAC-SHA256 signature with each webhook so you can verify the payload came from them).

To verify an HMAC, the recipient recomputes it using the same key and compares to the value in the request. Comparison should be done in constant time to prevent timing attacks — most languages provide a dedicated function for this (e.g., \`crypto.timingSafeEqual\` in Node.js, \`hmac.compare_digest\` in Python).

HMAC does not encrypt — the payload is still visible. For confidentiality, use HMAC alongside encryption or use an authenticated encryption scheme (AES-GCM).
    `.trim(),
    related: ["hash-generator", "jwt-decoder"],
    seeAlso: [
      { label: "Hash Generator", href: "/hash-generator" },
      { label: "JWT Decoder", href: "/jwt-decoder" },
      { label: "RFC 2104", href: "https://datatracker.ietf.org/doc/html/rfc2104" },
    ],
  },
  {
    term: "JSON",
    slug: "json",
    definition:
      "JSON (JavaScript Object Notation) is a lightweight, text-based data interchange format that is easy for humans to read and write and easy for machines to parse and generate. It is derived from JavaScript object literal syntax but is language-independent and supported natively by virtually every programming language and platform.",
    extended: `
JSON represents data as a combination of six value types: strings (double-quoted Unicode text), numbers (integer or floating-point), booleans (true or false), null, arrays (ordered lists of values), and objects (unordered key-value maps). These primitives compose recursively, allowing JSON to represent any hierarchical data structure.

The format was formalised in RFC 8259 and ECMA-404. Key rules: object keys must be strings, strings must be double-quoted (single quotes are invalid), trailing commas are not allowed, and comments are not part of the standard (JSON5 and JSONC are extensions that relax these constraints).

JSON replaced XML as the dominant web API format starting around 2005 because it is less verbose, easier to parse, and maps naturally to data structures in most programming languages. REST APIs return JSON, configuration files (package.json, tsconfig.json, .prettierrc) use JSON, and databases like PostgreSQL and MongoDB have native JSON column types.

Pretty-printing (adding indentation and newlines) makes JSON human-readable during development; minifying (removing whitespace) reduces payload size for production use.

quickhelp.dev's JSON Formatter pretty-prints, minifies, and validates JSON in the browser. The JSON to CSV tool converts flat JSON arrays to tabular format for use in spreadsheets and data tools.
    `.trim(),
    related: ["json-formatter", "json-to-csv"],
    seeAlso: [
      { label: "JSON Formatter", href: "/json-formatter" },
      { label: "JSON to CSV", href: "/json-to-csv" },
      { label: "RFC 8259", href: "https://datatracker.ietf.org/doc/html/rfc8259" },
    ],
  },
  {
    term: "JSON Schema",
    slug: "json-schema",
    definition:
      "JSON Schema is a vocabulary that allows you to annotate and validate the structure of JSON documents. A JSON Schema document describes what fields an object may contain, their types, constraints (minimum, maximum, pattern, enum), and which fields are required — enabling automatic validation, documentation generation, and UI generation from a single source of truth.",
    extended: `
A JSON Schema is itself a JSON document. The most current stable version is Draft 2020-12, which aligns with the JSON Schema standard referenced by OpenAPI 3.1. Key keywords include: type (string, number, integer, boolean, array, object, null), properties (sub-schemas for object keys), required (list of mandatory keys), items (sub-schema for array elements), minimum/maximum (numeric bounds), minLength/maxLength (string length bounds), pattern (regex constraint), and enum (allowed values).

JSON Schema has become the lingua franca for API contract definition. OpenAPI 3.1 uses JSON Schema directly for request and response bodies, meaning any tool that understands JSON Schema can validate OpenAPI-described payloads. Zod (TypeScript), Pydantic (Python), and Ajv (JavaScript) are popular libraries that validate JSON at runtime against a schema.

Beyond validation, JSON Schema drives form generation (React JSON Schema Form, Formik), API documentation (Redoc, Swagger UI), mock data generation (Faker.js, Mockoon), and test case generation. A well-authored schema simultaneously serves as machine-executable spec, human-readable documentation, and runtime guard.

quickhelp.dev tools define all input and output types as Zod schemas, which are automatically compiled to JSON Schema. These JSON Schemas appear in the /openapi.json spec, in MCP tool descriptors, and in the form UI on each tool page — one schema, four surfaces.
    `.trim(),
    related: ["json-formatter"],
    seeAlso: [
      { label: "OpenAPI Spec", href: "/openapi.json" },
      { label: "JSON Schema specification", href: "https://json-schema.org" },
    ],
  },
  {
    term: "OAuth 2.0",
    slug: "oauth2",
    definition:
      "OAuth 2.0 is an open authorization framework (RFC 6749) that lets a user grant a third-party application limited access to their resources on another service — without sharing their password. Instead of credentials, the user's identity provider issues a short-lived access token that the application uses to make API calls on the user's behalf.",
    extended: `
OAuth 2.0 solves the delegation problem: how can you let one service act on your behalf with another service without giving it your password? The classic example is "Sign in with Google" — you authorize an app to read your Google profile, and Google gives the app a token scoped to just that permission, expiring after a short time.

The four main OAuth 2.0 flows (called grant types) address different client environments. The Authorization Code flow (with PKCE for public clients) is the standard for web apps and mobile apps: the user is redirected to the authorization server, authenticates, approves the requested scopes, and is redirected back with a short-lived authorization code that is exchanged for an access token. The Client Credentials flow is for machine-to-machine authentication where no user is involved — a service authenticates directly with its client ID and secret. Device Code flow handles input-constrained devices like smart TVs. Implicit flow is deprecated.

Access tokens are often JWTs, allowing the receiving API to verify the token without calling back to the authorization server. Refresh tokens (longer-lived) allow clients to obtain new access tokens after expiry without re-prompting the user.

OpenID Connect (OIDC) is a thin identity layer on top of OAuth 2.0 that adds a standardised ID token (always a JWT) containing claims about the authenticated user. Most "Sign in with X" implementations use OIDC.

OAuth 2.0 does not define how tokens are stored, what scopes mean, or how the authorization server behaves internally — these are left to the implementation.
    `.trim(),
    related: ["jwt-decoder"],
    seeAlso: [
      { label: "JWT Decoder", href: "/jwt-decoder" },
      { label: "RFC 6749", href: "https://datatracker.ietf.org/doc/html/rfc6749" },
    ],
  },
  {
    term: "Regex",
    slug: "regex",
    definition:
      "A regular expression (regex or regexp) is a sequence of characters that defines a search pattern. Regex patterns can match, extract, replace, and validate text in ways that simple string operations cannot. They are supported in virtually every programming language and are used extensively in log parsing, form validation, URL routing, and code search.",
    extended: `
Regular expression syntax originates from formal language theory (Kleene's regular languages, 1951) and has been extended by implementations over decades. Core syntax elements include: literal characters that match themselves, . matching any character except newline, ^ and $ anchoring to start and end of a string, * (zero or more), + (one or more), ? (zero or one), {n,m} (between n and m times), | for alternation, [] for character classes, and () for grouping and capture.

Character class shortcuts include \\d (digit, [0-9]), \\w (word character, [a-zA-Z0-9_]), \\s (whitespace), and their uppercase inverses (\\D, \\W, \\S) for negation. Flags modify matching behaviour: i for case-insensitive, g for global (find all matches), m for multiline (^ and $ match line boundaries), and s for dotAll (. matches newlines).

Named capture groups (?<name>...) let you extract matched substrings by name rather than position. Lookaheads (?=...) and lookbehinds (?<=...) assert context without consuming characters, enabling patterns that match only when surrounded by specific text.

Performance traps: catastrophic backtracking can cause a regex engine to run for exponential time on crafted inputs. ReDoS (Regular Expression Denial of Service) exploits this in web applications. Avoid nested quantifiers on overlapping patterns (e.g., (a+)+ against "aaaa...b") and use atomic groups or possessive quantifiers where supported.

Different languages implement slightly different regex dialects. JavaScript uses ECMA-262 syntax, Python uses the re module with some unique extensions, and PCRE (Perl Compatible Regular Expressions) is the standard in PHP, Java, and many other environments. Most differences are minor for everyday use.
    `.trim(),
    related: ["url-encoder"],
    seeAlso: [
      { label: "URL Encoder", href: "/url-encoder" },
    ],
  },
  {
    term: "REST API",
    slug: "rest-api",
    definition:
      "REST (Representational State Transfer) is an architectural style for distributed hypermedia systems, described by Roy Fielding in his 2000 doctoral dissertation. A REST API exposes resources (nouns) at stable URLs and uses standard HTTP methods (verbs) to operate on them — GET to read, POST to create, PUT/PATCH to update, DELETE to remove — with stateless requests and uniform interfaces.",
    extended: `
The six REST constraints are: client-server separation, statelessness (each request contains all the information needed; no session stored server-side), cacheability (responses declare whether they can be cached), layered system (clients cannot tell whether they are talking directly to the server or a proxy), uniform interface (identified resources, manipulation through representations, self-descriptive messages, HATEOAS), and optional code-on-demand (servers can send executable code to clients).

In practice, most "REST APIs" are informally RESTful — they use HTTP methods and JSON representations but omit HATEOAS (hypermedia links). JSON:API, HAL, and Siren are specifications for fully hypermedia-driven REST APIs.

REST became the dominant API style by 2010, replacing SOAP's verbose XML envelopes. Its advantages are simplicity (HTTP tooling everywhere), cacheability, and wide support. Disadvantages include over-fetching (receiving more data than needed) and under-fetching (needing multiple round-trips for related data) — problems that GraphQL addresses with a query language.

OpenAPI (formerly Swagger) is the standard way to describe a REST API's endpoints, request/response schemas, and authentication. A well-authored OpenAPI document enables auto-generated client SDKs, interactive documentation, and AI agent discovery.

quickhelp.dev exposes all tools as REST API endpoints at /api/[tool], described collectively at /openapi.json. No API key is required for personal use.
    `.trim(),
    related: [],
    seeAlso: [
      { label: "OpenAPI Spec", href: "/openapi.json" },
      { label: "API Docs", href: "/docs" },
      { label: "OpenAPI", href: "/glossary/openapi" },
    ],
  },
  {
    term: "SHA-256",
    slug: "sha-256",
    definition:
      "SHA-256 (Secure Hash Algorithm 256-bit) is a cryptographic hash function from the SHA-2 family, standardised by NIST in 2001 (FIPS 180-4). It produces a 256-bit (32-byte, 64 hexadecimal character) digest for any input. SHA-256 is the backbone of TLS certificate chains, code-signing, Git (SHA-256 mode), and Bitcoin's proof-of-work.",
    extended: `
SHA-256 processes input in 512-bit (64-byte) blocks through 64 rounds of mixing using bitwise operations, modular addition, and a message schedule derived from the input. The algorithm maintains an 8-word (256-bit) internal state initialised with the fractional parts of the square roots of the first eight primes. After all blocks are processed, the state becomes the digest.

The output is a fixed-length 256-bit value regardless of input size — an empty string and a 10 GB file both produce a 64-character hex digest. Changing even one bit of the input produces a completely different digest (the avalanche effect). SHA-256 has no known practical preimage or collision attacks as of 2025, making it safe for security-critical uses.

SHA-256 appears everywhere in security infrastructure. TLS 1.3 uses HMAC-SHA256 and HMAC-SHA384 for the handshake PRF. X.509 certificates are signed with SHA-256 (RSA-SHA256 or ECDSA-SHA256). Operating systems verify software updates by comparing the downloaded file's SHA-256 against a signed manifest. Package managers (npm, cargo, pip) record SHA-256 digests of dependencies in lock files to detect tampering. Bitcoin double-hashes block headers with SHA-256 to calculate proof-of-work difficulty targets.

The SHA-2 family also includes SHA-224, SHA-384, SHA-512, SHA-512/224, and SHA-512/256. SHA-3 (Keccak) is a separate algorithm with a different internal structure (sponge construction), standardised in 2015 as a backup in case weaknesses are found in SHA-2.

MD5 and SHA-1 are deprecated for security use due to known collision attacks, but remain common in legacy systems and non-security checksums.
    `.trim(),
    related: ["hash-generator"],
    seeAlso: [
      { label: "Hash Generator", href: "/hash-generator" },
      { label: "HMAC", href: "/glossary/hmac" },
      { label: "FIPS 180-4", href: "https://csrc.nist.gov/publications/detail/fips/180/4/final" },
    ],
  },
  {
    term: "Unix timestamp",
    slug: "unix-timestamp",
    definition:
      "A Unix timestamp (also called Unix time or POSIX time) is the count of seconds that have elapsed since the Unix epoch — 1970-01-01T00:00:00Z (midnight UTC on January 1, 1970). It is the universal, timezone-independent representation of a point in time used by operating systems, databases, APIs, and log files worldwide.",
    extended: `
Unix time counts seconds elapsed since the epoch, excluding leap seconds (UTC leap seconds are smeared out or ignored). A timestamp of 0 corresponds exactly to 1970-01-01T00:00:00Z. The timestamp 1700000000 corresponds to 2023-11-14T22:13:20Z. Negative timestamps represent dates before the epoch.

Most programming languages store Unix timestamps as a 32-bit signed integer, which can represent dates from 1901-12-13 to 2038-01-19. On 2038-01-19 at 03:14:07 UTC, a 32-bit signed integer overflows — the Y2K38 problem. Modern systems use 64-bit integers, which can represent dates billions of years into the future.

Some systems use milliseconds since the epoch instead of seconds (JavaScript's Date.now(), Java, most REST APIs), and others use microseconds (PostgreSQL timestamps, Python's time.time_ns()) or nanoseconds (Go, Linux clock_gettime). Always check the unit when consuming a timestamp — misidentifying seconds as milliseconds produces dates 1000× wrong.

Unix timestamps are used universally because they are timezone-independent, monotonically increasing (for comparison and sorting), easy to arithmetic with (add or subtract seconds), and compact (a 10-digit number fits in a 32-bit integer). Converting to a human-readable date requires knowing the target timezone — the same timestamp reads differently in UTC, US/Eastern, and Asia/Tokyo.

The 2038 overflow, like Y2K, is a real engineering concern for embedded systems, databases with 32-bit timestamp columns, and older software that has not been updated to 64-bit time representations.

Use quickhelp.dev's Timestamp Converter to convert between Unix timestamps and human-readable ISO 8601 dates, with timezone support.
    `.trim(),
    related: ["timestamp-converter"],
    seeAlso: [
      { label: "Timestamp Converter", href: "/timestamp-converter" },
    ],
  },
  {
    term: "URL encoding",
    slug: "url-encoding",
    definition:
      "URL encoding (also called percent-encoding) is a mechanism for encoding arbitrary data in a URI by replacing unsafe characters with a percent sign (%) followed by two hexadecimal digits representing the byte value. RFC 3986 defines which characters are allowed literally in a URL and which must be encoded.",
    extended: `
A URL can only contain a limited set of characters defined as safe by RFC 3986: unreserved characters (A–Z, a–z, 0–9, hyphen, underscore, period, tilde) may appear literally. Reserved characters (; : @ & = + $ , / ? # [ ] !) have structural meaning in URLs (separating scheme, host, path, query, fragment) and must be percent-encoded when they appear as literal data rather than delimiters. Everything else — spaces, non-ASCII Unicode, control characters — must be encoded.

A space becomes %20 (or + in the query string for historical reasons). An ampersand in a query value becomes %26. The string "hello world" becomes "hello%20world" in a path or "hello+world" in an application/x-www-form-urlencoded query string. The accented character é (U+00E9) is encoded as %C3%A9 in UTF-8, because Unicode characters must be UTF-8 encoded first, then each byte percent-encoded.

JavaScript provides encodeURIComponent() for encoding individual values (encodes everything except unreserved characters) and encodeURI() for encoding a full URI (leaves reserved characters literal). The counterparts are decodeURIComponent() and decodeURI(). Most languages offer similar pairs.

Double-encoding is a common mistake: encoding an already-encoded string produces %2520 instead of %20 for a space. Always decode before encoding to avoid this.

URL encoding matters for query parameters (user input containing &, =, or # would break the query string structure), path segments (filenames with spaces or slashes), form submissions, and link construction in templates.

quickhelp.dev's URL Encoder encodes and decodes strings and shows the full percent-encoding table for reference.
    `.trim(),
    related: ["url-encoder"],
    seeAlso: [
      { label: "URL Encoder / Decoder", href: "/url-encoder" },
      { label: "RFC 3986", href: "https://datatracker.ietf.org/doc/html/rfc3986" },
    ],
  },
  {
    term: "UUID",
    slug: "uuid",
    definition:
      "A UUID (Universally Unique Identifier) is a 128-bit label used to uniquely identify information in computer systems. Formatted as 32 hexadecimal digits in five groups separated by hyphens (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx), a UUID is designed to be unique across space and time without a central registration authority.",
    extended: `
UUID versions differ in how the 128 bits are generated. UUID v1 embeds a timestamp and the generating machine's MAC address, making UUIDs sortable by creation time but leaking hardware information. UUID v3 and v5 are name-based — they deterministically hash a namespace UUID and a name string (using MD5 for v3, SHA-1 for v5), so the same input always produces the same UUID. UUID v4 generates all 122 significant bits randomly, making collisions astronomically unlikely (the probability of a collision is negligible until you have generated approximately 2.7 × 10^18 UUIDs). UUID v7, proposed in 2022 (RFC 9562), uses a millisecond Unix timestamp in the most significant bits followed by random bits, making v7 UUIDs both random and lexicographically sortable by creation time — ideal for database primary keys.

The probability of a UUID v4 collision when generating 1 billion UUIDs per second for 100 years is roughly 50% at 10^15 UUIDs — effectively zero for any practical application.

UUIDs are used as database primary keys (replacing sequential integers to avoid enumeration, allow distributed generation, and merge databases without ID conflicts), correlation IDs in distributed tracing, idempotency keys in payment APIs, session identifiers, and file names. The lack of a central authority means any node can generate a UUID independently with essentially no collision risk.

UUID v7 is increasingly preferred over v4 for database keys because its sortable prefix makes B-tree index insertions sequential rather than random, dramatically improving write performance and cache locality for large tables.

quickhelp.dev's UUID Generator generates v4 and v7 UUIDs instantly and explains the structure of each.
    `.trim(),
    related: ["uuid-generator"],
    seeAlso: [
      { label: "UUID Generator", href: "/uuid-generator" },
      { label: "RFC 9562", href: "https://datatracker.ietf.org/doc/html/rfc9562" },
    ],
  },
  {
    term: "Zod",
    slug: "zod",
    definition:
      "Zod is a TypeScript-first schema declaration and runtime validation library. A Zod schema describes the shape and constraints of a value — strings, numbers, objects, arrays, unions — and can parse, validate, and transform input at runtime, inferring the TypeScript type automatically so that compile-time types and runtime validation are always in sync.",
    extended: `
Traditional TypeScript type annotations disappear at compile time — the runtime receives untyped data from APIs, user input, and environment variables with no safety guarantees. Zod bridges this gap by generating both a TypeScript type and a runtime validator from a single schema definition.

Defining a schema like z.object({ name: z.string(), age: z.number().min(0) }) gives you a TypeScript type (automatically inferred with z.infer<typeof schema>), a parse function that throws a detailed ZodError if input does not conform, and a safeParse function that returns { success: true, data } or { success: false, error } without throwing.

Zod schemas compose: z.union(), z.intersection(), z.discriminatedUnion(), z.record(), z.tuple(), z.enum(), and z.literal() cover most data shapes. Transformations (z.string().transform(s => s.trim())) and refinements (z.number().refine(n => n % 2 === 0, "must be even")) extend validation beyond simple type-checking. .optional(), .nullable(), and .default() handle missing values.

Zod has become the de facto standard for TypeScript form validation (react-hook-form, @tanstack/form), API input validation (Next.js route handlers, tRPC), environment variable parsing (the t3-env package), and configuration validation. Its tight TypeScript integration means editors autocomplete validated field names and types throughout the codebase.

quickhelp.dev uses Zod for every tool's inputSchema and outputSchema. These schemas serve four purposes simultaneously: runtime API input validation, OpenAPI 3.1 JSON Schema generation, MCP tool descriptor generation, and automatic UI form generation — one schema, four surfaces, zero duplication.
    `.trim(),
    related: ["json-formatter"],
    seeAlso: [
      { label: "JSON Schema", href: "/glossary/json-schema" },
      { label: "OpenAPI Spec", href: "/openapi.json" },
    ],
  },
  {
    term: "llms.txt",
    slug: "llms-txt",
    definition:
      "llms.txt is an emerging standard (proposed 2024) for web sites to provide AI language models with a structured, concise summary of their content. Similar to robots.txt for search engine crawlers, llms.txt tells AI systems what a site offers, where to find key resources, and how to interact with its APIs.",
    extended: `
The llms.txt format is a plain-text Markdown document placed at the root of a domain (\`/llms.txt\`). It typically starts with a title and brief description of the site, followed by structured lists of pages, APIs, and key resources. Unlike a sitemap (which lists URLs for indexing), llms.txt is written for AI consumption — it explains what the site does, what tools or APIs are available, and how to use them.

An extended variant, llms-full.txt, provides a comprehensive content dump suitable for one-shot context loading by an AI agent. Instead of just listing URLs, it includes the full content of each tool's description, usage steps, and examples.

quickhelp.dev provides both:
- \`/llms.txt\` — lightweight discovery document, one entry per tool
- \`/llms-full.txt\` — complete content of all tools for one-shot loading

These surfaces, combined with \`/openapi.json\` and \`/mcp\`, make quickhelp.dev fully discoverable by any AI agent or model that follows standard discovery patterns.
    `.trim(),
    related: [],
    seeAlso: [
      { label: "llms.txt", href: "/llms.txt" },
      { label: "llms-full.txt", href: "/llms-full.txt" },
    ],
  },
];

export function generateStaticParams() {
  return GLOSSARY.map((entry) => ({ term: entry.slug }));
}

export function generateMetadata({ params }: { params: { term: string } }): Metadata {
  const entry = GLOSSARY.find((e) => e.slug === params.term);
  if (!entry) return {};
  return buildMetadata({
    path: `/glossary/${params.term}`,
    title: `What is ${entry.term}? — Definition`,
    description: entry.definition.slice(0, 160),
    keywords: [entry.term, "definition", "developer glossary", "what is", "explained"],
  });
}

export default function GlossaryTermPage({ params }: { params: { term: string } }) {
  const entry = GLOSSARY.find((e) => e.slug === params.term);
  if (!entry) notFound();

  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "Glossary", url: `${baseUrl}/glossary` },
    { name: entry.term, url: `${baseUrl}/glossary/${entry.slug}` },
  ]);
  const webPage = buildWebPageJsonLd({
    name: `What is ${entry.term}?`,
    description: entry.definition,
    url: `${baseUrl}/glossary/${entry.slug}`,
  });

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={webPage} />
      <article className="mx-auto max-w-3xl space-y-8 py-4">
        <header>
          <nav className="mb-4 text-xs text-muted-foreground">
            <Link href="/">Home</Link> /{" "}
            <Link href="/glossary">Glossary</Link> / {entry.term}
          </nav>
          <h1 className="text-3xl font-bold">What is {entry.term}?</h1>
        </header>

        <section>
          <p className="text-lg text-muted-foreground leading-relaxed">{entry.definition}</p>
        </section>

        <section className="prose prose-sm max-w-none text-muted-foreground">
          {entry.extended.split("\n\n").map((para, i) => (
            <p key={i} className="leading-relaxed mb-4">{para}</p>
          ))}
        </section>

        {entry.seeAlso && entry.seeAlso.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold">See also</h2>
            <ul className="flex flex-wrap gap-2">
              {entry.seeAlso.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-full border border-border px-3 py-1 text-sm hover:bg-muted transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}

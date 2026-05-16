"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, CodeBlock, CopyButton, Select, Textarea } from "@quickhelp/ui";

// ── JWT decode helpers (client-side, no server round-trip) ───────────────────

function b64urlDecode(str: string): Record<string, unknown> {
  try {
    const padded = str.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function decodeToken(token: string): {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  valid: boolean;
} {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return { header: {}, payload: {}, signature: "", valid: false };
  return {
    header: b64urlDecode(parts[0]!),
    payload: b64urlDecode(parts[1]!),
    signature: parts[2]!,
    valid: true,
  };
}

// ── Claim humanization ────────────────────────────────────────────────────────

function formatTs(ts: unknown): string | null {
  if (typeof ts !== "number") return null;
  try {
    return new Date(ts * 1000).toLocaleString();
  } catch {
    return null;
  }
}

function getExpiry(payload: Record<string, unknown>): { label: string; expired: boolean } | null {
  const exp = payload["exp"];
  if (typeof exp !== "number") return null;
  const now = Math.floor(Date.now() / 1000);
  const diff = exp - now;
  if (diff < 0) {
    const ago = Math.abs(diff);
    const mins = Math.floor(ago / 60);
    const hours = Math.floor(ago / 3600);
    const days = Math.floor(ago / 86400);
    const label = days > 1 ? `expired ${days} days ago` : hours > 1 ? `expired ${hours} hours ago` : `expired ${mins} minutes ago`;
    return { label, expired: true };
  }
  const mins = Math.floor(diff / 60);
  const hours = Math.floor(diff / 3600);
  const days = Math.floor(diff / 86400);
  const label = days > 1 ? `expires in ${days} days` : hours > 1 ? `expires in ${hours} hours` : `expires in ${mins} minutes`;
  return { label, expired: false };
}

// ── Signature verification via the API (jose runs server-side for RS/ES/HS) ──

const ALGORITHMS = [
  { value: "HS256", label: "HS256" },
  { value: "HS384", label: "HS384" },
  { value: "HS512", label: "HS512" },
  { value: "RS256", label: "RS256" },
  { value: "RS384", label: "RS384" },
  { value: "RS512", label: "RS512" },
  { value: "ES256", label: "ES256" },
  { value: "ES384", label: "ES384" },
  { value: "ES512", label: "ES512" },
];

type VerifyState = "idle" | "loading" | "valid" | "invalid";

// ── Segment-colored token display ─────────────────────────────────────────────

function TokenDisplay({ token }: { token: string }) {
  const parts = token.split(".");
  const colors = ["var(--jwt-header)", "var(--jwt-payload)", "var(--jwt-signature)"];
  return (
    <span className="break-all font-mono text-sm">
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-muted-foreground select-none">.</span>}
          <span style={{ color: colors[i] }}>{part}</span>
        </React.Fragment>
      ))}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface DecodedState {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  valid: boolean;
}

export function JwtDecoderUI({ sampleToken }: { sampleToken: string }) {
  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<DecodedState | null>(null);

  const [algorithm, setAlgorithm] = useState("HS256");
  const [secret, setSecret] = useState("");
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");

  // Live decode
  useEffect(() => {
    const t = token.trim();
    if (!t) { setDecoded(null); return; }
    setDecoded(decodeToken(t));
  }, [token]);

  const loadSample = useCallback(() => {
    setToken(sampleToken);
    setSecret("your-256-bit-secret");
  }, [sampleToken]);

  const verify = useCallback(async () => {
    if (!token.trim() || !secret.trim()) return;
    setVerifyState("loading");
    try {
      const res = await fetch("/api/jwt-decoder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), secret: secret.trim(), algorithm }),
      });
      const json = (await res.json()) as { verified?: boolean };
      setVerifyState(json.verified ? "valid" : "invalid");
    } catch {
      setVerifyState("invalid");
    }
  }, [token, secret, algorithm]);

  const expiry = decoded?.valid ? getExpiry(decoded.payload) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">JWT Decoder</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Decode and verify JSON Web Tokens. Signature verification runs in your browser — your secret never leaves.
        </p>
      </div>

      {/* Two-pane layout */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left: encoded token */}
        <div className="flex flex-col gap-3">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Encoded</CardTitle>
              <div className="flex items-center gap-1">
                {decoded?.valid && <Badge variant="success">Valid structure</Badge>}
                {token && !decoded?.valid && <Badge variant="danger">Invalid</Badge>}
                {token && <CopyButton text={token.trim()} />}
              </div>
            </CardHeader>
            <CardBody>
              <Textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                rows={8}
                placeholder="Paste a JWT here (eyJ…)"
                className="text-xs leading-relaxed"
                spellCheck={false}
                autoComplete="off"
              />
              {/* Colored token preview */}
              {decoded?.valid && (
                <div className="mt-3 rounded-md bg-muted p-3">
                  <TokenDisplay token={token.trim()} />
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={loadSample} className="mt-2">
                Load example
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Right: decoded panes */}
        <div className="flex flex-col gap-3">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ background: "var(--jwt-header)" }}
                />
                <CardTitle>Header</CardTitle>
              </div>
              {decoded?.valid && <CopyButton text={JSON.stringify(decoded.header, null, 2)} />}
            </CardHeader>
            <CardBody>
              {decoded?.valid ? (
                <CodeBlock code={JSON.stringify(decoded.header, null, 2)} className="text-xs" />
              ) : (
                <p className="text-xs text-muted-foreground italic">Paste a token to decode</p>
              )}
            </CardBody>
          </Card>

          {/* Payload */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ background: "var(--jwt-payload)" }}
                />
                <CardTitle>Payload</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                {expiry && (
                  <Badge variant={expiry.expired ? "danger" : "success"}>{expiry.label}</Badge>
                )}
                {decoded?.valid && <CopyButton text={JSON.stringify(decoded.payload, null, 2)} />}
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {decoded?.valid ? (
                <>
                  <CodeBlock code={JSON.stringify(decoded.payload, null, 2)} className="text-xs" />
                  <ClaimHints payload={decoded.payload} />
                </>
              ) : (
                <p className="text-xs text-muted-foreground italic">Paste a token to decode</p>
              )}
            </CardBody>
          </Card>

          {/* Signature */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ background: "var(--jwt-signature)" }}
                />
                <CardTitle>Signature</CardTitle>
              </div>
              {decoded?.valid && <CopyButton text={decoded.signature} />}
            </CardHeader>
            <CardBody>
              {decoded?.valid ? (
                <p className="break-all font-mono text-xs text-muted-foreground">{decoded.signature}</p>
              ) : (
                <p className="text-xs text-muted-foreground italic">Paste a token to decode</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Verify signature section */}
      <Card>
        <CardHeader>
          <CardTitle>Verify Signature</CardTitle>
          {verifyState === "valid" && <Badge variant="success">Signature Verified ✓</Badge>}
          {verifyState === "invalid" && <Badge variant="danger">Invalid Signature ✗</Badge>}
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="flex gap-3">
            <div className="w-32 flex-shrink-0">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Algorithm</label>
              <Select
                options={ALGORITHMS}
                value={algorithm}
                onChange={(e) => { setAlgorithm(e.target.value); setVerifyState("idle"); }}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Secret or public key (HS*: plain text, RS*/ES*: PEM)
              </label>
              <Textarea
                value={secret}
                onChange={(e) => { setSecret(e.target.value); setVerifyState("idle"); }}
                rows={3}
                placeholder="your-secret"
                className="text-xs"
              />
            </div>
          </div>
          <Button
            onClick={verify}
            disabled={!token.trim() || !secret.trim() || verifyState === "loading"}
            variant="outline"
            size="sm"
          >
            {verifyState === "loading" ? "Verifying…" : "Verify"}
          </Button>
        </CardBody>
      </Card>

      {/* Content block */}
      <div className="space-y-6 border-t border-border pt-8">
        <section>
          <h2 className="text-base font-semibold text-foreground">What is a JWT?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A JSON Web Token (JWT) is a compact, URL-safe way to represent claims. It has three base64url-encoded parts
            separated by dots: a header (algorithm + token type), a payload (claims), and a signature (verification).
            This tool decodes the header and payload, and can optionally verify the signature using your secret or public key.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Is this secure?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Signature verification uses your browser&apos;s Web Crypto API — your secret or private key is sent to our
            server only for the verification call and is never logged or stored. The decoded header and payload are
            computed entirely in your browser, no server involved.
          </p>
        </section>
      </div>
    </div>
  );
}

// ── Registered-claim human-readable hints ─────────────────────────────────────

function ClaimHints({ payload }: { payload: Record<string, unknown> }) {
  const hints: { label: string; value: string }[] = [];

  const addTs = (key: string, label: string) => {
    const v = formatTs(payload[key]);
    if (v) hints.push({ label, value: v });
  };

  addTs("iat", "Issued at");
  addTs("exp", "Expires at");
  addTs("nbf", "Not before");
  if (payload["iss"]) hints.push({ label: "Issuer", value: String(payload["iss"]) });
  if (payload["sub"]) hints.push({ label: "Subject", value: String(payload["sub"]) });
  if (payload["aud"]) hints.push({ label: "Audience", value: Array.isArray(payload["aud"]) ? (payload["aud"] as string[]).join(", ") : String(payload["aud"]) });

  if (hints.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
      {hints.map((h) => (
        <React.Fragment key={h.label}>
          <dt className="text-muted-foreground">{h.label}</dt>
          <dd className="truncate text-foreground font-mono">{h.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

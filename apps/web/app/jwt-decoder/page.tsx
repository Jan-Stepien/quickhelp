import type { Metadata } from "next";
import { JsonLd } from "@quickhelp/seo";
import { buildToolJsonLd } from "@quickhelp/agent-sdk";
import { jwtDecoder } from "@quickhelp/tools-jwt-decoder";
import type { Tool } from "@quickhelp/tool-kit";
import { JwtDecoderUI } from "./JwtDecoderUI";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "JWT Decoder & Verifier",
  description:
    "Decode and verify JSON Web Tokens. Inspect header, payload, and claims. Optionally verify the signature with your secret — all in the browser.",
};

const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDecoderPage() {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonLdItems = buildToolJsonLd(jwtDecoder as unknown as Tool<any, any>, baseUrl);

  return (
    <>
      {jsonLdItems.map((item, i) => (
        <JsonLd key={i} data={item} />
      ))}
      <JwtDecoderUI sampleToken={SAMPLE_TOKEN} />
    </>
  );
}

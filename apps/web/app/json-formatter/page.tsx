import type { Metadata } from "next";
import { JsonLd } from "@quickhelp/seo";
import { buildToolJsonLd } from "@quickhelp/agent-sdk";
import { jsonFormatter } from "@quickhelp/tools-json-formatter";
import type { Tool } from "@quickhelp/tool-kit";
import { JsonFormatterUI } from "./JsonFormatterUI";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator",
  description:
    "Format, validate, and explore JSON. Pretty-print with configurable indentation, minify, sort keys, repair malformed JSON, and browse with an interactive tree view.",
};

export default function JsonFormatterPage() {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonLdItems = buildToolJsonLd(jsonFormatter as unknown as Tool<any, any>, baseUrl);

  return (
    <>
      {jsonLdItems.map((item, i) => (
        <JsonLd key={i} data={item} />
      ))}
      <JsonFormatterUI />
    </>
  );
}

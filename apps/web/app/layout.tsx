import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "quickhelp.dev — Agent-Native Tool Factory",
    template: "%s | quickhelp.dev",
  },
  description:
    "Small, deterministic utility tools — each with a human UI, REST API, OpenAPI schema, and MCP server entry.",
  metadataBase: new URL(process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cfToken = process.env["NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN"] ?? "";
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50 font-sans">
          <header className="border-b bg-white px-6 py-4">
            <nav className="mx-auto flex max-w-5xl items-center justify-between">
              <a href="/" className="text-lg font-semibold tracking-tight text-gray-900">
                quickhelp.dev
              </a>
              <a href="/tools" className="text-sm text-gray-600 hover:text-gray-900">
                All tools
              </a>
            </nav>
          </header>
          <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
          <footer className="border-t bg-white px-6 py-6 text-center text-sm text-gray-500">
            <p>
              Free tier: 30 req/min, watermarked.{" "}
              <a href="/openapi.json" className="underline">OpenAPI</a>
              {" · "}
              <a href="/llms.txt" className="underline">llms.txt</a>
            </p>
          </footer>
        </div>
        {cfToken && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: cfToken })}
          />
        )}
      </body>
    </html>
  );
}

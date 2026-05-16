import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="border-b bg-white px-6 py-4">
        <nav className="mx-auto flex max-w-5xl items-center justify-between">
          <a href="/" className="text-lg font-semibold tracking-tight text-gray-900">
            no.work
          </a>
          <a
            href="/tools"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            All tools
          </a>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      <footer className="border-t bg-white px-6 py-6 text-center text-sm text-gray-500">
        <p>
          Free tier: 30 req/min, watermarked.{" "}
          <a href="/openapi.json" className="underline">
            OpenAPI
          </a>{" "}
          ·{" "}
          <a href="/llms.txt" className="underline">
            llms.txt
          </a>
        </p>
      </footer>
    </div>
  );
}

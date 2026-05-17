import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import { ManageCookiesButton } from "./ManageCookiesButton";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <a href="/" className="text-sm font-semibold tracking-tight text-foreground hover:text-accent transition-colors">
            quickhelp.dev
          </a>
          <div className="flex items-center gap-4">
            <a href="/tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              All tools
            </a>
            <ThemeToggle />
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      <footer className="border-t border-border bg-background px-6 py-6 text-center text-xs text-muted-foreground">
        <p>
          Free tier: 30 req/min, watermarked.{" "}
          <a href="/openapi.json" className="underline underline-offset-2 hover:text-foreground transition-colors">
            OpenAPI
          </a>
          {" · "}
          <a href="/llms.txt" className="underline underline-offset-2 hover:text-foreground transition-colors">
            llms.txt
          </a>
          {" · "}
          <a href="/mcp" className="underline underline-offset-2 hover:text-foreground transition-colors">
            MCP
          </a>
        </p>
        <p className="mt-2">
          <a href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
            Privacy
          </a>
          {" · "}
          <a href="/cookies" className="underline underline-offset-2 hover:text-foreground transition-colors">
            Cookies
          </a>
          {" · "}
          <a href="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">
            Terms
          </a>
          {" · "}
          <ManageCookiesButton />
        </p>
      </footer>
    </div>
  );
}

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
              Tools
            </a>
            <a href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </a>
            <a href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </a>
            <ThemeToggle />
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      <footer className="border-t border-border bg-background px-6 py-8 text-xs text-muted-foreground">
        <div className="mx-auto max-w-5xl grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Tools</p>
            <ul className="space-y-1">
              <li><a href="/tools" className="hover:text-foreground transition-colors">All tools</a></li>
              <li><a href="/jwt-decoder" className="hover:text-foreground transition-colors">JWT Decoder</a></li>
              <li><a href="/json-formatter" className="hover:text-foreground transition-colors">JSON Formatter</a></li>
              <li><a href="/image-converter" className="hover:text-foreground transition-colors">Image Converter</a></li>
              <li><a href="/background-remover" className="hover:text-foreground transition-colors">Background Remover</a></li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Resources</p>
            <ul className="space-y-1">
              <li><a href="/blog" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="/docs" className="hover:text-foreground transition-colors">API Docs</a></li>
              <li><a href="/glossary" className="hover:text-foreground transition-colors">Glossary</a></li>
              <li><a href="/changelog" className="hover:text-foreground transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-foreground">For agents</p>
            <ul className="space-y-1 font-mono">
              <li><a href="/openapi.json" className="hover:text-foreground transition-colors">/openapi.json</a></li>
              <li><a href="/llms.txt" className="hover:text-foreground transition-colors">/llms.txt</a></li>
              <li><a href="/llms-full.txt" className="hover:text-foreground transition-colors">/llms-full.txt</a></li>
              <li><a href="/mcp" className="hover:text-foreground transition-colors">/mcp</a></li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Company</p>
            <ul className="space-y-1">
              <li><a href="/about" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="/cookies" className="hover:text-foreground transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-5xl mt-6 pt-4 border-t border-border flex items-center justify-between">
          <p>© {new Date().getFullYear()} quickhelp.dev — free tier: 30 req/min, watermarked.</p>
          <ManageCookiesButton />
        </div>
      </footer>
    </div>
  );
}

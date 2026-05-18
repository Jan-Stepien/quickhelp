import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found — quickhelp.dev",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-bold text-muted-foreground">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        That page doesn&apos;t exist. Try browsing all tools instead.
      </p>
      <Link
        href="/tools"
        className="mt-6 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-80 transition-opacity"
      >
        Browse all tools
      </Link>
    </div>
  );
}

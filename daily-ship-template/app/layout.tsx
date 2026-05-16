import type { Metadata } from "next";
import "./globals.css";

// REPLACE: app name, description, og image
export const metadata: Metadata = {
  title: "App Name — Tagline",
  description: "One sentence describing what the tool does and who it's for.",
  openGraph: {
    title: "App Name — Tagline",
    description: "One sentence describing what the tool does and who it's for.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}

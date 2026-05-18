import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider, Layout, ConsentProvider, ConsentBanner } from "@quickhelp/ui";
import { AnalyticsLoader } from "./AnalyticsLoader";
import { AdsenseLoader } from "./AdsenseLoader";
import { buildMetadata } from "@/lib/metadata";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const APP_URL = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "quickhelp.dev — Developer Tools",
    template: "%s | quickhelp.dev",
  },
  ...buildMetadata({
    path: "/",
    title: "quickhelp.dev — Developer Tools",
    description:
      "Small, deterministic utility tools — each with a human UI, REST API, OpenAPI schema, and MCP server entry. Free, fast, agent-native.",
    keywords: ["developer tools", "utility tools", "JWT decoder", "JSON formatter", "image converter", "API", "MCP", "OpenAPI"],
  }),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

const noFlashScript = `(function(){try{var t=localStorage.getItem('qh-theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cfToken = process.env["NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN"] ?? "";
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
        {/* AI / agent discovery hints */}
        <link rel="alternate" type="text/plain" href="/llms.txt" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" />
        <link rel="alternate" type="application/json" href="/openapi.json" />
        <meta name="ai-content-declaration" content="human-authored, deterministic-tools" />
      </head>
      <body>
        <ConsentProvider>
          <ThemeProvider>
            <Layout>{children}</Layout>
          </ThemeProvider>
          <ConsentBanner />
          <AnalyticsLoader cfToken={cfToken} />
          <AdsenseLoader />
        </ConsentProvider>
      </body>
    </html>
  );
}

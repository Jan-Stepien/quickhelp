import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider, Layout, ConsentProvider, ConsentBanner } from "@quickhelp/ui";
import { AnalyticsLoader } from "./AnalyticsLoader";
import { AdsenseLoader } from "./AdsenseLoader";

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

export const metadata: Metadata = {
  title: {
    default: "quickhelp.dev — Developer Tools",
    template: "%s | quickhelp.dev",
  },
  description:
    "Small, deterministic utility tools — each with a human UI, REST API, OpenAPI schema, and MCP server entry.",
  metadataBase: new URL(process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev"),
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

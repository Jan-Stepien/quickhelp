import type { Metadata } from "next";

const APP_URL = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
const SITE_NAME = "quickhelp.dev";
const DEFAULT_OG_IMAGE = `${APP_URL}/opengraph-image`;

interface BuildMetadataOptions {
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
}

export function buildMetadata({
  path,
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noindex = false,
  keywords,
  publishedTime,
  modifiedTime,
}: BuildMetadataOptions): Metadata {
  const canonical = `${APP_URL}${path}`;

  return {
    title,
    description,
    applicationName: SITE_NAME,
    authors: [{ name: "quickhelp.dev", url: APP_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "Developer Tools",
    ...(keywords?.length ? { keywords } : {}),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_US",
      type,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    verification: {
      google: process.env["NEXT_PUBLIC_GSC_VERIFICATION"] ?? undefined,
      other: process.env["NEXT_PUBLIC_BING_VERIFICATION"]
        ? { "msvalidate.01": process.env["NEXT_PUBLIC_BING_VERIFICATION"] }
        : undefined,
    },
  };
}

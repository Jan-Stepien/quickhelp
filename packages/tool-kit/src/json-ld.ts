import type { Tool } from "./types.js";

export function manifestToJsonLd(tool: Tool, baseUrl: string): Record<string, unknown>[] {
  const toolUrl = `${baseUrl}/${tool.slug}`;
  const apiUrl = `${baseUrl}/api/${tool.slug}`;

  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": toolUrl,
    name: tool.name,
    description: tool.description,
    url: toolUrl,
    applicationCategory: "WebApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const webApi = {
    "@context": "https://schema.org",
    "@type": "WebAPI",
    name: `${tool.name} API`,
    description: tool.summary,
    url: apiUrl,
    documentation: toolUrl,
  };

  const jsonLd: Record<string, unknown>[] = [softwareApplication, webApi];

  // HowTo schema was deprecated by Google (Sept 2023) — no rich-result benefit.
  // We skip it and rely on visible HTML + Article structured data instead.

  if (tool.content?.faq && tool.content.faq.length > 0) {
    // FAQPage is restricted for Google rich results (Aug 2023, gov/health only) but
    // still valuable for AI/LLM citation visibility (ChatGPT, Perplexity, AI Overviews).
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: tool.content.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return jsonLd;
}

// ── Site-level builders ────────────────────────────────────────────────────

export function buildOrganizationJsonLd(
  baseUrl: string,
  sameAs: string[] = []
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: "quickhelp.dev",
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/icon`,
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@quickhelp.dev",
    },
  };
}

export function buildWebSiteJsonLd(baseUrl: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: "quickhelp.dev",
    url: baseUrl,
    publisher: { "@id": `${baseUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/tools?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildCollectionPageJsonLd(
  tools: Tool[],
  baseUrl: string
): Record<string, unknown>[] {
  const collectionPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${baseUrl}/tools`,
    name: "All Developer Tools",
    description: `${tools.length} deterministic utility tools — each with a human UI, REST API, OpenAPI schema, and MCP entry.`,
    url: `${baseUrl}/tools`,
    isPartOf: { "@id": `${baseUrl}/#website` },
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Developer Tools",
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${baseUrl}/${tool.slug}`,
      name: tool.name,
    })),
  };

  return [collectionPage, itemList];
}

export function buildWebPageJsonLd({
  name,
  description,
  url,
  datePublished,
  dateModified,
}: {
  name: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url,
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
  };
}

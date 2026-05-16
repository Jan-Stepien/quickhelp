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

  if (tool.content) {
    const { howToSteps, faq } = tool.content;

    if (howToSteps.length > 0) {
      jsonLd.push({
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `How to use ${tool.name}`,
        step: howToSteps.map((step, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: step.name,
          text: step.text,
        })),
      });
    }

    if (faq.length > 0) {
      jsonLd.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      });
    }
  }

  return jsonLd;
}

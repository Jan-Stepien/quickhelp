import type { InputFormat, OutputFormat } from "@quickhelp/tools-image-converter";

export const INPUT_FORMATS: InputFormat[] = ["png", "jpeg", "webp", "avif", "tiff", "gif", "svg"];
export const OUTPUT_FORMATS: OutputFormat[] = ["png", "jpeg", "webp", "avif", "tiff", "gif"];

export interface ConversionDirection {
  from: InputFormat;
  to: OutputFormat;
  slug: string;
}

export const FORMAT_INFO: Record<string, { label: string; description: string }> = {
  png: {
    label: "PNG",
    description:
      "PNG is a lossless raster format that supports transparency. Ideal for graphics, logos, and screenshots where pixel-perfect quality matters.",
  },
  jpeg: {
    label: "JPEG",
    description:
      "JPEG is a lossy format optimised for photographs. It achieves small file sizes at the cost of some quality loss, which is usually imperceptible.",
  },
  webp: {
    label: "WebP",
    description:
      "WebP is a modern format developed by Google. It is 25–35% smaller than JPEG or PNG at equivalent quality and is supported by all modern browsers.",
  },
  avif: {
    label: "AVIF",
    description:
      "AVIF is based on the AV1 video codec and achieves up to 50% better compression than JPEG. It is supported by Chrome, Firefox, and Safari.",
  },
  tiff: {
    label: "TIFF",
    description:
      "TIFF is a lossless format used in professional photography and publishing. Files are large but preserve every detail.",
  },
  gif: {
    label: "GIF",
    description:
      "GIF supports animation and transparency but is limited to 256 colours. Best for simple animations and pixel art.",
  },
  svg: {
    label: "SVG",
    description:
      "SVG is a vector format defined in XML. It scales to any size without quality loss. This tool rasterises SVG to pixel-based output formats.",
  },
};

// ── Per-direction content for SEO ──────────────────────────────────────────

interface ConversionContent {
  why: string;          // "Why convert X to Y?"
  useCases: string[];   // bullet points
  qualityNote: string;  // technical note on quality / size / tradeoffs
  faq: { question: string; answer: string }[];
}

const FORMAT_TRAITS: Record<string, { lossy: boolean; transparent: boolean; animated: boolean; vector: boolean; sizeTier: "small" | "medium" | "large" }> = {
  png:  { lossy: false, transparent: true,  animated: false, vector: false, sizeTier: "large"  },
  jpeg: { lossy: true,  transparent: false, animated: false, vector: false, sizeTier: "small"  },
  webp: { lossy: true,  transparent: true,  animated: true,  vector: false, sizeTier: "small"  },
  avif: { lossy: true,  transparent: true,  animated: false, vector: false, sizeTier: "small"  },
  tiff: { lossy: false, transparent: true,  animated: false, vector: false, sizeTier: "large"  },
  gif:  { lossy: false, transparent: true,  animated: true,  vector: false, sizeTier: "medium" },
  svg:  { lossy: false, transparent: true,  animated: false, vector: true,  sizeTier: "small"  },
};

export function getConversionContent(from: string, to: string): ConversionContent {
  const f = FORMAT_TRAITS[from];
  const t = FORMAT_TRAITS[to];
  const fromLabel = FORMAT_INFO[from]?.label ?? from.toUpperCase();
  const toLabel   = FORMAT_INFO[to]?.label   ?? to.toUpperCase();

  // --- WHY convert ---
  const whyParts: string[] = [];
  if (f && t) {
    if (f.sizeTier === "large" && t.sizeTier === "small")
      whyParts.push(`${toLabel} files are typically 50–80% smaller than ${fromLabel}, making them faster to transfer and cheaper to store.`);
    if (!f.lossy && t.lossy)
      whyParts.push(`Converting from ${fromLabel} (lossless) to ${toLabel} (lossy) is a common way to reduce file size when pixel-perfect quality is not needed.`);
    if (f.lossy && !t.lossy)
      whyParts.push(`${toLabel} preserves every pixel without quality loss, useful when you need a lossless archive copy of a ${fromLabel} image.`);
    if (!f.transparent && t.transparent)
      whyParts.push(`${toLabel} supports transparency, so converting from ${fromLabel} lets you add a transparent background to images that originally had a solid background.`);
    if (f.vector)
      whyParts.push(`Converting from ${fromLabel} (vector) to ${toLabel} (raster) is useful when you need a fixed-resolution version of a scalable graphic — for example, an image thumbnail or a social media preview.`);
    if (!t.transparent && f.transparent)
      whyParts.push(`Note: ${fromLabel} may contain transparent areas. Converting to ${toLabel} replaces transparency with a white or black background since ${toLabel} does not support an alpha channel.`);
    if (!f.animated && to === "gif")
      whyParts.push(`GIF is often used as a target when you need wide compatibility — it is supported even in environments that do not accept WebP or AVIF.`);
  }
  if (whyParts.length === 0)
    whyParts.push(`Converting ${fromLabel} to ${toLabel} lets you use the image in contexts that require the ${toLabel} format, whether for compatibility, file-size, or workflow reasons.`);
  const why = whyParts.join(" ");

  // --- USE CASES ---
  const useCases: string[] = [];
  if (to === "webp" || to === "avif")
    useCases.push(`Web optimisation — replace ${fromLabel} assets on your website with ${toLabel} to improve page load speed and Core Web Vitals scores.`);
  if (to === "jpeg")
    useCases.push(`Email attachments — JPEG files are universally supported and significantly smaller than PNG or TIFF, making them ideal for sharing photos by email.`);
  if (to === "png" && from !== "png")
    useCases.push(`Editing pipelines — PNG is the safest intermediate format when you need to re-edit an image without accumulating compression artefacts.`);
  if (to === "tiff")
    useCases.push(`Print and publishing — TIFF is the standard archive format for professional printing workflows.`);
  if (to === "gif")
    useCases.push(`Legacy compatibility — GIF is supported in nearly every image viewer and email client, including ones that reject WebP.`);
  if (from === "svg")
    useCases.push(`Generating thumbnails or preview images from a vector logo or icon.`);
  useCases.push(`Batch conversion of ${fromLabel} files in a CI pipeline using the REST API: POST /api/image-converter.`);
  useCases.push(`Quick one-off conversion without installing software — everything runs in your browser.`);

  // --- QUALITY NOTE ---
  let qualityNote = "";
  if (f && t) {
    if (!f.lossy && !t.lossy)
      qualityNote = `Both ${fromLabel} and ${toLabel} are lossless formats. Converting between them preserves every pixel exactly. The main difference is file size and software support.`;
    else if (!f.lossy && t.lossy)
      qualityNote = `${fromLabel} is lossless; ${toLabel} is lossy. The conversion is irreversible — once you save as ${toLabel}, the original pixel data cannot be recovered. For archival purposes, keep a copy of the original ${fromLabel}.`;
    else if (f.lossy && !t.lossy)
      qualityNote = `${fromLabel} is lossy; ${toLabel} is lossless. Converting to ${toLabel} will not restore quality lost during the original ${fromLabel} compression, but no additional quality loss occurs in this conversion.`;
    else
      qualityNote = `Both formats use lossy compression. Converting between them introduces a second round of compression, which can slightly reduce quality. Where possible, convert from the original lossless source rather than from a previously compressed file.`;
  }

  // --- FAQ ---
  const faq: { question: string; answer: string }[] = [
    {
      question: `Is it safe to convert ${fromLabel} to ${toLabel} in the browser?`,
      answer: `Yes. The conversion runs entirely in your browser using the Canvas API — your images are not uploaded to any server. No data leaves your device.`,
    },
    {
      question: `Does converting ${fromLabel} to ${toLabel} reduce quality?`,
      answer: t?.lossy
        ? `Converting to ${toLabel} uses lossy compression, so some quality reduction is possible. The tool uses high-quality settings by default. For archival use, keep the original ${fromLabel} file.`
        : `${toLabel} is lossless, so no quality is lost in the conversion. The file may be larger than a lossy alternative.`,
    },
    {
      question: `Can I convert multiple files at once?`,
      answer: `The web UI supports multiple files at once — drag and drop a batch of ${fromLabel} images and download them all as ${toLabel}. The REST API also accepts individual files for automated batch workflows.`,
    },
    {
      question: `How do I convert ${fromLabel} to ${toLabel} without software?`,
      answer: `Use this tool — no installation required. Drag your ${fromLabel} file onto the converter, select ${toLabel} as the output format, and click Convert. The result downloads automatically.`,
    },
  ];

  return { why, useCases, qualityNote, faq };
}

export function getAllDirections(): ConversionDirection[] {
  const directions: ConversionDirection[] = [];
  for (const from of INPUT_FORMATS) {
    for (const to of OUTPUT_FORMATS) {
      if (from === to) continue;
      directions.push({ from, to, slug: `${from}-to-${to}` });
    }
  }
  return directions;
}

export function parseDirection(
  direction: string
): ConversionDirection | null {
  const match = direction.match(/^([a-z]+)-to-([a-z]+)$/);
  if (!match) return null;
  const from = match[1] as InputFormat;
  const to = match[2] as OutputFormat;
  if (!INPUT_FORMATS.includes(from) || !OUTPUT_FORMATS.includes(to) || from === to) return null;
  return { from, to, slug: direction };
}

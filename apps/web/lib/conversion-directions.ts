import type { InputFormat, OutputFormat } from "@no-work/tools-image-converter";

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

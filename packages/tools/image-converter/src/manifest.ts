import { z } from "zod";
import { defineTool } from "@quickhelp/tool-kit";

export const SUPPORTED_INPUT_FORMATS = ["png", "jpeg", "webp", "avif", "tiff", "gif", "svg"] as const;
export const SUPPORTED_OUTPUT_FORMATS = ["png", "jpeg", "webp", "avif", "tiff", "gif"] as const;

export type InputFormat = (typeof SUPPORTED_INPUT_FORMATS)[number];
export type OutputFormat = (typeof SUPPORTED_OUTPUT_FORMATS)[number];

const MAX_RAW_BYTES = 3 * 1024 * 1024; // 3 MB — Vercel hobby body limit is 4.5 MB; base64 inflates 33%

export const imageConverter = defineTool({
  id: "image-converter",
  slug: "image-converter",
  name: "Image Converter",
  summary: "Convert images between PNG, JPEG, WebP, AVIF, TIFF, GIF, and SVG formats",
  description:
    "Upload an image and convert it to another format. Supports PNG, JPEG, WebP, AVIF, TIFF, GIF as both input and output; SVG is accepted as input only. Maximum input size is 3 MB. Returns the converted image as a base64 string along with dimensions and file size.",
  category: "conversion",
  inputSchema: z.object({
    image: z.string().describe("Base64-encoded image data (no data-URL prefix)"),
    from: z
      .enum(SUPPORTED_INPUT_FORMATS)
      .describe("Source format of the input image"),
    to: z
      .enum(SUPPORTED_OUTPUT_FORMATS)
      .describe("Target format for the converted image"),
    quality: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(80)
      .describe("Output quality 1–100, applies to JPEG / WebP / AVIF"),
  }),
  outputSchema: z.object({
    image: z.string().describe("Base64-encoded converted image"),
    format: z.string(),
    width: z.number(),
    height: z.number(),
    size_bytes: z.number(),
  }),
  inputUiHints: {
    image: { type: "file", accept: "image/*" },
    from: { type: "text" },
    to: { type: "text" },
    quality: { type: "text" },
  },
  examples: [
    {
      title: "PNG to WebP",
      input: { image: "<base64-png>", from: "png", to: "webp", quality: 80 },
      output: {
        image: "<base64-webp>",
        format: "webp",
        width: 800,
        height: 600,
        size_bytes: 24576,
      },
    },
    {
      title: "JPEG to AVIF",
      input: { image: "<base64-jpeg>", from: "jpeg", to: "avif", quality: 70 },
      output: {
        image: "<base64-avif>",
        format: "avif",
        width: 1280,
        height: 720,
        size_bytes: 38400,
      },
    },
  ],
  async handler({ image, to, quality }) {
    // Dynamic import — keeps module loadable in non-Node runtimes (it will throw at call time, not import time)
    const sharp = (await import("sharp")).default;

    const buffer = Buffer.from(image, "base64");
    if (buffer.byteLength > MAX_RAW_BYTES) {
      throw new Error(
        `Input image is ${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB — maximum is 3 MB.`
      );
    }

    const { data, info } = await sharp(buffer, { density: 150 })
      .toFormat(to as Parameters<ReturnType<typeof sharp>["toFormat"]>[0], { quality })
      .toBuffer({ resolveWithObject: true });

    return {
      image: data.toString("base64"),
      format: info.format,
      width: info.width,
      height: info.height,
      size_bytes: info.size,
    };
  },
  schemaOrg: {
    name: "Image Converter",
    description:
      "Free online image format converter. Convert PNG, JPEG, WebP, AVIF, TIFF, GIF, and SVG images instantly.",
    url: "https://quickhelp.dev/image-converter",
  },
  attribution: {
    text: "Converted by quickhelp.dev/image-converter",
    url: "https://quickhelp.dev/image-converter",
  },
  content: {
    whatIs:
      "Image Converter is a free, browser-based tool that converts image files between popular formats — PNG, JPEG, WebP, AVIF, TIFF, and GIF. SVG files can also be rasterised to any of those formats. No software to install and no sign-up required.",
    howToSteps: [
      {
        name: "Upload",
        text: "Click the file picker and select your image (up to 3 MB).",
      },
      {
        name: "Choose formats",
        text: "Select the source format and your desired output format, then adjust quality if needed.",
      },
      {
        name: "Convert & download",
        text: "Click Run. A preview appears immediately and you can download the converted file.",
      },
    ],
    faq: [
      {
        question: "What is the maximum file size?",
        answer:
          "3 MB. This is set by the Vercel free tier request body limit. For larger images, clone the repo and run locally — there is no size cap when self-hosted.",
      },
      {
        question: "Does conversion affect image quality?",
        answer:
          "Lossless formats (PNG, TIFF) preserve every pixel. Lossy formats (JPEG, WebP, AVIF) use the quality slider — 80 is a good default that balances file size and visual fidelity.",
      },
      {
        question: "Why convert to WebP or AVIF?",
        answer:
          "WebP is 25–35% smaller than JPEG/PNG at equivalent quality and is supported by all modern browsers. AVIF is 50% smaller still but takes longer to encode. Both are great for web delivery.",
      },
    ],
    relatedTools: ["jwt-decoder", "json-formatter"],
  },
});

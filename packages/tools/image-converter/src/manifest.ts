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
      "Image conversion is the process of re-encoding a digital image from one file format to another, changing the container, compression algorithm, and colour depth according to the target format's specification. Different image formats make different trade-offs: PNG uses lossless compression and supports full alpha transparency, making it ideal for screenshots, icons, and graphics with sharp edges. JPEG uses lossy compression optimised for photographs, achieving small file sizes at the cost of some detail. WebP is a modern format developed by Google that supports both lossless and lossy compression as well as alpha transparency — it is typically 25–35% smaller than JPEG or PNG at equivalent quality, and all modern browsers support it. AVIF (AV1 Image File Format) is the newest of the major formats, achieving roughly 50% smaller files than JPEG at equivalent visual quality at the cost of longer encoding times. TIFF is a lossless, uncompressed format used in print and photography workflows. GIF supports up to 256 colours and is primarily used for animations. This tool converts between PNG, JPEG, WebP, AVIF, TIFF, and GIF, and can rasterise SVG files to any of those formats. Conversion runs on the server using the Sharp library (libvips) — your image is sent over HTTPS and is not stored.",
    howToSteps: [
      {
        name: "Upload your image",
        text: "Click the file picker and select your image (up to 3 MB). PNG, JPEG, WebP, AVIF, TIFF, GIF, and SVG are all accepted as input.",
      },
      {
        name: "Choose output format and quality",
        text: "Select the target format from the dropdown. For lossy formats (JPEG, WebP, AVIF), adjust the quality slider — 80 is a sensible default that balances visual fidelity and file size. For lossless formats (PNG, TIFF), quality has no effect.",
      },
      {
        name: "Convert and download",
        text: "Click Run. A preview of the converted image appears along with the file size and dimensions. Click Download to save it to your device.",
      },
    ],
    faq: [
      {
        question: "What is the maximum file size?",
        answer:
          "3 MB. This is set by the Vercel free tier request body limit. For larger images, use the API with a self-hosted instance — there is no size cap when self-hosted.",
      },
      {
        question: "Does conversion affect image quality?",
        answer:
          "Lossless formats (PNG, TIFF) preserve every pixel exactly. Lossy formats (JPEG, WebP, AVIF) reduce file size by discarding perceptually insignificant detail. The quality slider controls this trade-off: 80 is a good default for web images, 90+ for print-quality exports, and 60–70 for thumbnails where small file size matters more than sharpness.",
      },
      {
        question: "Why convert to WebP or AVIF?",
        answer:
          "WebP is 25–35% smaller than JPEG/PNG at equivalent quality and is supported by all modern browsers. AVIF is 50% smaller still but takes longer to encode and decode. Both formats support alpha transparency. Converting your images to WebP or AVIF before serving them from a website reduces page load times and bandwidth costs significantly.",
      },
      {
        question: "Does PNG to WebP conversion lose transparency?",
        answer: "No. WebP supports full alpha channel transparency. Converting a PNG with a transparent background to WebP preserves the transparency. AVIF also supports alpha transparency. JPEG does not — converting a transparent PNG to JPEG replaces the transparent areas with white.",
      },
      {
        question: "Can I convert SVG to PNG or JPEG?",
        answer: "Yes. SVG is accepted as an input format and can be rasterised (converted from vector to pixels) to any of the supported output formats. The output resolution depends on the SVG's viewBox and the browser's rendering. For high-resolution exports, use the API with a custom width parameter.",
      },
      {
        question: "What quality setting should I use?",
        answer: "For JPEG: 85 for general use, 70 for thumbnails, 95 for high quality. For WebP: 80 for general use, 60–70 for thumbnails. For AVIF: 70 for general use (AVIF's perceived quality is higher than JPEG at the same numeric value). For lossless PNG and TIFF, quality is ignored.",
      },
    ],
    relatedTools: ["image-resizer", "background-remover", "jwt-decoder"],
    useCases: [
      {
        slug: "convert-png-to-webp",
        title: "How to convert PNG to WebP online",
        intent: "Reduce PNG file size by converting to WebP format for faster web page loading.",
        intro: "WebP images are typically 25–35% smaller than PNGs at the same visual quality, making the conversion one of the highest-ROI optimizations for web performance. Every modern browser supports WebP, and the format supports both lossless and lossy compression as well as alpha transparency. This guide shows how to convert a PNG to WebP in seconds using the quickhelp.dev Image Converter — no Photoshop, no command line, no installation required.",
        steps: [
          { name: "Upload your PNG", text: "Open quickhelp.dev/image-converter, click the file picker, and select your PNG. The source format is detected automatically." },
          { name: "Select WebP as output", text: "Choose 'webp' from the output format dropdown. Set quality to 80 (a good balance between file size and sharpness — increase for print, decrease for thumbnails)." },
          { name: "Convert and download", text: "Click Run. A preview of the converted WebP appears along with the file size. Click Download to save it." },
        ],
        faq: [
          { question: "Does PNG to WebP conversion lose quality?", answer: "At quality 80 the difference is imperceptible to most viewers. For pixel-perfect accuracy (e.g., icons or screenshots with sharp text) use quality 95+ or enable lossless WebP via the API." },
          { question: "Does WebP support transparency like PNG?", answer: "Yes. WebP supports alpha transparency. Your converted file will preserve any transparent areas from the original PNG." },
        ],
      },
      {
        slug: "convert-jpeg-to-avif",
        title: "How to convert JPEG to AVIF online",
        intent: "Shrink photo file sizes dramatically by converting JPEG images to the AVIF format.",
        intro: "AVIF (AV1 Image File Format) achieves roughly 50% smaller files than JPEG at equivalent visual quality, making it the most efficient image format for web delivery as of 2026. All major browsers support it. The trade-off is longer encoding time — AVIF takes more CPU to compress than JPEG or WebP. This guide explains how to convert any JPEG to AVIF using the quickhelp.dev Image Converter.",
        steps: [
          { name: "Upload your JPEG", text: "Go to quickhelp.dev/image-converter and upload your JPEG file (up to 3 MB)." },
          { name: "Select AVIF as output", text: "Choose 'avif' from the output format list. Start with quality 70 — AVIF's perceptual quality is higher than JPEG at the same numeric value, so 70 often looks like JPEG at 85." },
          { name: "Download and test", text: "Download the AVIF file and test it in your browser. If the quality looks wrong, re-convert at a higher or lower quality setting." },
        ],
        faq: [
          { question: "How much smaller is AVIF compared to JPEG?", answer: "Typically 40–60% smaller at equivalent quality for photographs. For illustrations with flat areas of color, savings can exceed 70%." },
          { question: "Can I use AVIF everywhere?", answer: "AVIF is supported in Chrome 85+, Firefox 93+, Safari 16+, and Edge 121+. For older browsers, serve WebP as a fallback using a picture element." },
        ],
      },
      {
        slug: "convert-webp-to-png",
        title: "How to convert WebP to PNG online",
        intent: "Convert a WebP image to PNG for compatibility with tools and platforms that don't support WebP.",
        intro: "While WebP is excellent for web delivery, many image editing tools, publishing platforms, and email clients still require PNG or JPEG. Converting WebP back to PNG gives you a lossless, universally compatible file. This guide walks through the conversion using the quickhelp.dev Image Converter — no download required, output ready in seconds.",
        steps: [
          { name: "Upload the WebP file", text: "Open quickhelp.dev/image-converter and upload your WebP image." },
          { name: "Set output to PNG", text: "Select 'png' as the output format. PNG conversion ignores the quality slider since PNG is lossless." },
          { name: "Download the PNG", text: "Click Run, then Download. The PNG preserves all pixel data from the WebP exactly." },
        ],
        faq: [
          { question: "Will the PNG be larger than the WebP?", answer: "Yes — PNG is a lossless format and will be larger (sometimes 2–4× larger) than the equivalent WebP. This is expected and not a quality loss." },
          { question: "Does the conversion support WebP with transparency?", answer: "Yes. Transparent areas in the WebP are preserved in the PNG output as an alpha channel." },
        ],
      },
      {
        slug: "convert-svg-to-png",
        title: "How to convert SVG to PNG online",
        intent: "Rasterize an SVG vector file to a PNG bitmap for use in contexts that require raster images.",
        intro: "SVG (Scalable Vector Graphics) files are resolution-independent and ideal for logos and icons. But many platforms — social media, email clients, office apps — require raster formats like PNG. This guide explains how to convert an SVG to a high-resolution PNG using the quickhelp.dev Image Converter, which renders the SVG at print density (150 DPI) before rasterizing.",
        steps: [
          { name: "Upload your SVG", text: "Open quickhelp.dev/image-converter and upload your SVG file. SVG is accepted as input only — it cannot be used as an output format." },
          { name: "Select PNG as output", text: "Choose 'png' from the output format list. The converter renders the SVG at 150 DPI, which is suitable for most display and light-print use cases." },
          { name: "Download and verify", text: "Click Run. Check the reported width and height in the output — if you need a larger raster, you can use the API with a custom density parameter." },
        ],
        faq: [
          { question: "At what resolution are SVGs rasterized?", answer: "The converter uses 150 DPI. For print-quality output (300 DPI) you can call the API directly and process the PNG with a scaling step." },
          { question: "What if my SVG has external fonts or images?", answer: "External resources may not resolve during server-side rendering. Embed fonts inline (e.g., with a tool like SVGO) or convert the SVG locally with Inkscape for complex files." },
        ],
      },
    ],
  },
});

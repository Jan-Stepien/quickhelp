import { z } from "zod";
import { defineTool } from "@quickhelp/tool-kit";

export const backgroundRemover = defineTool({
  id: "background-remover",
  slug: "background-remover",
  name: "Background Remover",
  summary: "Remove image backgrounds instantly with AI — returns a transparent PNG",
  description:
    "Upload any image and the AI model removes the background, returning a transparent PNG. Processing runs in your browser — your image is never uploaded to our servers. Supports JPG, PNG, WebP, and more.",
  category: "conversion",
  inputSchema: z.object({
    image: z.string().describe("Base64-encoded image data (no data-URL prefix)"),
  }),
  outputSchema: z.object({
    image: z.string().describe("Base64-encoded transparent PNG with background removed"),
  }),
  examples: [
    {
      title: "Remove background from a photo",
      input: { image: "<base64-image>" },
      output: { image: "<base64-transparent-png>" },
    },
  ],
  async handler() {
    // Background removal runs entirely in the browser via @imgly/background-removal.
    // This server-side handler exists for registry and OpenAPI discoverability only.
    throw new Error(
      "Background removal is a browser-only operation. Use the web UI at /background-remover"
    );
  },
  schemaOrg: {
    name: "Background Remover",
    description:
      "Free AI-powered background remover. Upload a photo and get a transparent PNG instantly. No sign-up, no server upload.",
    url: "https://quickhelp.dev/background-remover",
  },
  attribution: {
    text: "Powered by quickhelp.dev/background-remover",
    url: "https://quickhelp.dev/background-remover",
  },
  content: {
    whatIs:
      "Background Remover uses an AI model running entirely in your browser to detect and remove image backgrounds, returning a transparent PNG. No image is ever sent to a server — all processing is local.",
    howToSteps: [
      { name: "Upload", text: "Drop an image or click to browse. PNG, JPEG, WebP are all supported." },
      {
        name: "Wait",
        text: "The AI model loads from a CDN on first use (about 40 MB, cached afterwards) then processes your image in seconds.",
      },
      {
        name: "Download",
        text: "Click Download to save the transparent PNG. Use it on websites, presentations, or social media.",
      },
    ],
    faq: [
      {
        question: "Is my image uploaded anywhere?",
        answer:
          "No. The AI model runs entirely in your browser using WebAssembly. Your image never leaves your device.",
      },
      {
        question: "Why does the first run take longer?",
        answer:
          "The AI model (~40 MB) is downloaded from a CDN on first use and cached by your browser. Subsequent runs are instant.",
      },
      {
        question: "What image formats are supported?",
        answer: "PNG, JPEG, WebP, AVIF, TIFF, and GIF as input. Output is always a transparent PNG.",
      },
    ],
    relatedTools: ["image-converter", "jwt-decoder"],
  },
});

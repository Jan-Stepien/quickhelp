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
      "Background Remover uses an AI model running entirely in your browser to detect and remove image backgrounds, returning a transparent PNG. The model is based on U-2-Net, a neural network architecture trained specifically for salient object detection — it identifies the main subject in an image and masks out everything else. Processing happens via WebAssembly (ONNX Runtime Web), which means the AI runs at near-native speed directly in your browser tab. No image is ever sent to a server — all processing is local, making it suitable even for confidential or proprietary photos. The output is always a 32-bit RGBA PNG with a transparent alpha channel where the background was, ready to be placed on any color or design without white halos or fringing.",
    howToSteps: [
      { name: "Upload your image", text: "Drop an image onto the upload area or click to browse. PNG, JPEG, WebP, AVIF, TIFF, and GIF are all supported as input." },
      {
        name: "Wait for AI processing",
        text: "The AI model (~40 MB) downloads from a CDN on first use and is cached by your browser. After the initial download, processing takes 2–5 seconds for a typical photo at full resolution.",
      },
      {
        name: "Download the transparent PNG",
        text: "Click Download to save the result as a transparent PNG. Use it in design tools (Figma, Canva, Photoshop), e-commerce listings, presentations, or social media graphics.",
      },
    ],
    faq: [
      {
        question: "Is my image uploaded anywhere?",
        answer:
          "No. The AI model runs entirely in your browser using WebAssembly. Your image never leaves your device — not even for the initial model download, which is just the model weights, not your photos.",
      },
      {
        question: "Why does the first run take longer?",
        answer:
          "The AI model weights (~40 MB) are downloaded from a CDN on first use and cached by your browser. Subsequent runs skip the download entirely and start processing immediately.",
      },
      {
        question: "What image formats are supported?",
        answer: "PNG, JPEG, WebP, AVIF, TIFF, and GIF are accepted as input. Output is always a transparent PNG (RGBA), since PNG is the only widely supported raster format with full alpha channel transparency.",
      },
      {
        question: "How does the quality compare to remove.bg or Photoshop?",
        answer: "For portraits, products with clear contrast, and logos on simple backgrounds, the quality is comparable to remove.bg. Complex subjects — fine hair, transparent objects, fur, or scenes where the foreground blends with the background — produce better results in Photoshop's Select Subject feature, which has had more training data and more years of tuning.",
      },
      {
        question: "Is there a file size limit?",
        answer: "The limit is your browser's available memory, typically several hundred megabytes. Very large images (above 20 megapixels) may be slow to process or cause memory errors on devices with less than 4 GB of RAM. Downscaling to 2000px on the longest side before uploading is a practical workaround.",
      },
      {
        question: "Can I use the transparent PNG output in Canva or Google Slides?",
        answer: "Yes. Both Canva and Google Slides support PNG files with transparency. Upload the downloaded PNG and it will appear on a transparent background, ready to be placed over any slide color or image.",
      },
      {
        question: "What AI model powers the background removal?",
        answer: "The tool uses U-2-Net (Universal Salient Object Detection Network), an open-source neural network optimized for detecting and segmenting salient objects. It is loaded via ONNX Runtime Web, which compiles the model to WebAssembly for in-browser execution without any server-side inference.",
      },
    ],
    relatedTools: ["image-converter", "image-resizer"],
    useCases: [
      {
        slug: "remove-background-from-product-photo",
        title: "How to remove the background from a product photo",
        intent: "Create a transparent-background PNG of a product for e-commerce listings, catalogs, and marketing assets.",
        intro: "Product photos with transparent backgrounds look clean on any colored web page and are required by most e-commerce platforms (Amazon, Shopify, Etsy) for their main product images. Traditionally this required a designer with Photoshop. With AI-powered background removal, you get a transparent PNG in seconds — entirely in your browser. This guide explains how to remove a background from a product photo using the quickhelp.dev Background Remover, which runs the AI model locally using WebAssembly.",
        steps: [
          { name: "Upload the product photo", text: "Open quickhelp.dev/background-remover and upload your product image. JPEG, PNG, and WebP are all supported." },
          { name: "Wait for AI processing", text: "The first run downloads the AI model (~40 MB) and caches it in your browser. Processing takes 2–5 seconds for a typical product photo." },
          { name: "Download the transparent PNG", text: "Click Download to save the transparent PNG. Upload it directly to your e-commerce platform or drop it into your design tool." },
        ],
        faq: [
          { question: "Is the photo uploaded to a server?", answer: "No. The AI model runs entirely in your browser using WebAssembly. Your product photos never leave your device." },
          { question: "What if the AI cuts out part of the product?", answer: "AI background removal works best when the product has clear contrast against the background. For complex subjects (e.g., transparent products, fine hair), results may vary. Use an image editor to touch up edges if needed." },
        ],
      },
      {
        slug: "remove-background-from-headshot",
        title: "How to remove the background from a headshot photo",
        intent: "Create a transparent or white-background version of a professional headshot for LinkedIn, CVs, and company pages.",
        intro: "A clean, background-free headshot looks polished on a LinkedIn profile, company team page, or CV header — and it lets you place the portrait on any color or branded background. This guide shows how to remove a background from a headshot using the quickhelp.dev Background Remover, which uses an AI model running locally in your browser. Your photo is never sent to a server.",
        steps: [
          { name: "Prepare your headshot", text: "Use a high-resolution photo (at least 800×800 px) where your face is well-lit and clearly separated from the background. Plain or blurred backgrounds give the best results." },
          { name: "Upload and process", text: "Open quickhelp.dev/background-remover, upload the photo, and wait for the AI to detect and remove the background. The result appears as a transparent PNG preview." },
          { name: "Download and use", text: "Download the transparent PNG. In your design tool (Canva, Figma, Google Slides) place it on a white, brand-color, or gradient background." },
        ],
        faq: [
          { question: "Does it handle hair and fine details accurately?", answer: "The AI model is optimized for portraits and handles hair reasonably well in most cases. Very fine, wispy hair or complex hairstyles may have minor edge artifacts." },
          { question: "What resolution should I use?", answer: "Higher resolution gives better edge quality. Aim for at least 800×800 px. The tool processes images up to the memory limits of your browser (typically several megabytes)." },
        ],
      },
      {
        slug: "extract-logo-from-screenshot",
        title: "How to extract a logo from a screenshot",
        intent: "Isolate a company logo by removing the surrounding background from a screenshot or image.",
        intro: "When you need a transparent-background version of a logo but only have a screenshot — from a website, presentation slide, or PDF — AI background removal can isolate the logo from its surroundings. The result is a transparent PNG you can use in documents, presentations, or designs. This guide explains when this approach works and how to use the quickhelp.dev Background Remover to extract a logo from a screenshot.",
        steps: [
          { name: "Crop the screenshot", text: "Before uploading, crop the screenshot to show only the logo with minimal surrounding content. A tightly cropped image gives the AI better context." },
          { name: "Upload and remove the background", text: "Open quickhelp.dev/background-remover and upload the cropped screenshot. The AI removes the solid color or gradient background around the logo." },
          { name: "Inspect and refine", text: "Check the edges of the transparent output. For logos with a simple background (white, black, solid color) the result is typically clean. Complex or multicolor backgrounds may need manual touch-up." },
        ],
        faq: [
          { question: "Is this the best way to get a vector logo?", answer: "No — for a proper vector version, contact the company's marketing team or check their brand kit. This method gives you a raster (PNG) extraction, not a scalable vector." },
          { question: "What backgrounds work best?", answer: "Solid colors, light gradients, and plain white/dark backgrounds give the cleanest results. Busy or textured backgrounds behind the logo are harder for the AI to remove accurately." },
        ],
      },
    ],
  },
});

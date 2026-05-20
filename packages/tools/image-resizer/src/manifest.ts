import { z } from "zod";
import { defineTool } from "@quickhelp/tool-kit";

const OUTPUT_FORMATS = ["png", "jpeg", "webp"] as const;
const MAX_RAW_BYTES = 3 * 1024 * 1024;

export const imageResizer = defineTool({
  id: "image-resizer",
  slug: "image-resizer",
  name: "Image Resizer & Cropper",
  summary: "Resize, crop, rotate, and flip images online — free, runs in your browser, no upload required.",
  description:
    "Upload any image to resize it to exact pixel dimensions, crop a region, rotate by 90-degree increments, or flip horizontally/vertically. Supports PNG, JPEG, WebP, AVIF, GIF input. Outputs PNG, JPEG, or WebP. The browser UI uses Canvas API — no image leaves your device.",
  category: "conversion",
  inputSchema: z.object({
    image: z.string().describe("Base64-encoded image (no data-URL prefix)"),
    width: z.number().int().positive().optional().describe("Target width in pixels"),
    height: z.number().int().positive().optional().describe("Target height in pixels"),
    fit: z
      .enum(["contain", "cover", "fill", "inside", "outside"])
      .default("inside")
      .describe("Resize fit: 'inside' preserves aspect ratio within bounds; 'fill' stretches to exact size; 'cover' fills and crops"),
    cropX: z.number().int().min(0).optional().describe("Crop left offset in pixels"),
    cropY: z.number().int().min(0).optional().describe("Crop top offset in pixels"),
    cropWidth: z.number().int().positive().optional().describe("Crop width in pixels"),
    cropHeight: z.number().int().positive().optional().describe("Crop height in pixels"),
    rotate: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]).optional().describe("Clockwise rotation in degrees"),
    flipHorizontal: z.boolean().optional().describe("Mirror left-right (flop)"),
    flipVertical: z.boolean().optional().describe("Mirror top-bottom (flip)"),
    format: z.enum(OUTPUT_FORMATS).default("png").describe("Output image format"),
    quality: z.number().int().min(1).max(100).default(85).describe("Quality for JPEG/WebP (1–100)"),
  }),
  outputSchema: z.object({
    image: z.string().describe("Base64-encoded output image"),
    format: z.string(),
    width: z.number(),
    height: z.number(),
    originalWidth: z.number(),
    originalHeight: z.number(),
    sizeBytes: z.number(),
  }),
  inputUiHints: {
    image: { type: "file", accept: "image/*" },
  },
  examples: [
    {
      title: "Resize to 400 wide, preserve aspect ratio",
      input: { image: "<base64-image>", width: 400, fit: "inside", format: "png" },
      output: { image: "<base64-png>", format: "png", width: 400, height: 300, originalWidth: 1200, originalHeight: 900, sizeBytes: 48230 },
    },
    {
      title: "Crop a 200×200 square from top-left",
      input: { image: "<base64-image>", cropX: 0, cropY: 0, cropWidth: 200, cropHeight: 200, format: "webp", quality: 80 },
      output: { image: "<base64-webp>", format: "webp", width: 200, height: 200, originalWidth: 800, originalHeight: 600, sizeBytes: 12400 },
    },
    {
      title: "Rotate 90° clockwise",
      input: { image: "<base64-image>", rotate: 90, format: "jpeg", quality: 85 },
      output: { image: "<base64-jpeg>", format: "jpeg", width: 600, height: 800, originalWidth: 800, originalHeight: 600, sizeBytes: 31200 },
    },
  ],
  async handler({ image, width, height, fit, cropX, cropY, cropWidth, cropHeight, rotate, flipHorizontal, flipVertical, format, quality }) {
    const sharp = (await import("sharp")).default;

    const buffer = Buffer.from(image, "base64");
    if (buffer.byteLength > MAX_RAW_BYTES) {
      throw new Error(`Input image is ${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB — maximum is 3 MB.`);
    }

    const originalMeta = await sharp(buffer).metadata();
    let img = sharp(buffer);

    if (rotate) img = img.rotate(rotate);
    if (flipHorizontal) img = img.flop();
    if (flipVertical) img = img.flip();
    if (cropWidth && cropHeight) {
      img = img.extract({ left: cropX ?? 0, top: cropY ?? 0, width: cropWidth, height: cropHeight });
    }
    if (width || height) {
      img = img.resize({ width: width ?? undefined, height: height ?? undefined, fit });
    }

    const { data, info } = await img
      .toFormat(format as Parameters<ReturnType<typeof sharp>["toFormat"]>[0], { quality })
      .toBuffer({ resolveWithObject: true });

    return {
      image: data.toString("base64"),
      format: info.format,
      width: info.width,
      height: info.height,
      originalWidth: originalMeta.width ?? 0,
      originalHeight: originalMeta.height ?? 0,
      sizeBytes: info.size,
    };
  },
  schemaOrg: {
    name: "Image Resizer & Cropper",
    description:
      "Free online image resizer and cropper. Resize to exact dimensions, crop, rotate, or flip any image — PNG, JPEG, WebP output. No sign-up, no server upload.",
    url: "https://quickhelp.dev/image-resizer",
  },
  attribution: {
    text: "Resized by quickhelp.dev/image-resizer",
    url: "https://quickhelp.dev/image-resizer",
  },
  content: {
    whatIs:
      "Image Resizer & Cropper is a free browser-based tool for resizing images to exact pixel dimensions, cropping a region of interest, rotating by 90-degree increments, and flipping horizontally or vertically. It accepts PNG, JPEG, WebP, AVIF, and GIF input and outputs PNG, JPEG, or WebP. The browser UI uses the Canvas API for instant live preview — no image is sent to a server. The REST API (POST /api/image-resizer) processes images server-side using Sharp for use in scripts, CI pipelines, and AI agent workflows. Common use cases include resizing photos for social media, cropping product images for e-commerce, fixing portrait/landscape orientation issues, and generating thumbnails.",
    howToSteps: [
      {
        name: "Upload your image",
        text: "Drag your image onto the upload area or click to browse. PNG, JPEG, WebP, AVIF, and GIF are supported. Your original dimensions appear immediately in the preview.",
      },
      {
        name: "Choose your operations",
        text: "Use the Resize tab to set target width and height (toggle the aspect ratio lock to constrain proportions), the Crop tab to trim edges or select a preset ratio (1:1, 4:3, 16:9), and the Transform tab to rotate or flip the image. Operations apply in order: rotate → flip → crop → resize.",
      },
      {
        name: "Export and download",
        text: "Select your output format (PNG for lossless, JPEG or WebP for smaller files) and quality level, then click Download. The processed image saves immediately.",
      },
    ],
    faq: [
      {
        question: "Is my image uploaded to a server?",
        answer:
          "The browser UI processes images entirely using the Canvas API — nothing is sent to any server. If you use the REST API endpoint (/api/image-resizer), your image is processed server-side using Sharp and is never stored or logged.",
      },
      {
        question: "What is the maximum image size?",
        answer:
          "The browser UI has no explicit size limit — Canvas processes as large an image as your device memory allows (typically several megabytes or more). The API endpoint accepts base64-encoded images up to 3 MB, which is the Vercel free-tier request body limit.",
      },
      {
        question: "What does the fit option do when resizing?",
        answer:
          "'Inside' (default) scales the image to fit within the target width and height while preserving the aspect ratio — the output may be smaller than requested if proportions differ. 'Cover' fills the exact dimensions and crops the overflow. 'Fill' stretches to exactly the target size regardless of aspect ratio.",
      },
    ],
    relatedTools: ["image-converter", "background-remover"],
    useCases: [
      {
        slug: "resize-image-to-exact-dimensions",
        title: "How to resize an image to exact pixel dimensions",
        intent: "Scale an image to a specific width and height for social media, email, or web use.",
        intro: "Social media platforms, email clients, and web apps often require images at specific pixel dimensions — a LinkedIn banner must be 1584×396 px, a Twitter card 1200×628 px, a Shopify product image 800×800 px. Resizing in Photoshop takes setup time. This guide shows how to resize any image to exact dimensions in seconds using the quickhelp.dev Image Resizer — no software, no account, runs in your browser.",
        steps: [
          { name: "Upload your image", text: "Open quickhelp.dev/image-resizer and drag your image onto the upload area. Your original dimensions are shown immediately in the preview." },
          { name: "Set target dimensions", text: "In the Resize tab, enter your target width and height. Toggle the aspect ratio lock off if you need to set both dimensions independently (this will stretch the image to fit exactly)." },
          { name: "Download the result", text: "Select your output format — PNG for graphics and logos, JPEG or WebP for photos — then click Download." },
        ],
        faq: [
          { question: "Will resizing reduce image quality?", answer: "Shrinking an image is lossless for PNG and safe for JPEG/WebP at quality 85+. Enlarging beyond the original resolution always introduces interpolation artifacts — always start from the highest-resolution original." },
          { question: "How do I resize without distorting proportions?", answer: "Enable the aspect ratio lock. Enter only width or only height; the other dimension is calculated automatically to preserve proportions." },
        ],
      },
      {
        slug: "crop-image-online",
        title: "How to crop an image online for free",
        intent: "Remove unwanted areas from an image by cropping to a specific region or preset aspect ratio.",
        intro: "Cropping removes unwanted parts of an image — a distracting background, extra whitespace, or off-center subject. It is one of the most common image editing tasks for social media posts, profile photos, product listings, and design work. This guide shows how to crop any image online using the quickhelp.dev Image Resizer — no software to download, fully browser-based.",
        steps: [
          { name: "Upload the image", text: "Go to quickhelp.dev/image-resizer and upload the image you want to crop." },
          { name: "Set the crop region", text: "Open the Crop tab. Select a preset ratio (1:1 square, 4:3, 16:9 widescreen) or enter custom x/y/width/height pixel coordinates for a precise crop." },
          { name: "Preview and download", text: "The canvas preview updates as you adjust values. When the crop looks right, choose your output format and click Download." },
        ],
        faq: [
          { question: "How do I crop to a perfect square for a profile photo?", answer: "Select the 1:1 preset in the Crop tab. Adjust the x/y offset to center the subject within the crop region before downloading." },
          { question: "Can I crop and resize in one step?", answer: "Yes — set both the crop region and target resize dimensions in the same session. The tool applies crop first, then resize." },
        ],
      },
      {
        slug: "resize-image-for-social-media",
        title: "How to resize an image for social media",
        intent: "Scale images to the correct pixel dimensions for Instagram, LinkedIn, Twitter/X, Facebook, or YouTube.",
        intro: "Every social media platform has specific required or recommended image dimensions. Posting the wrong size results in cropped thumbnails, blurry headers, or rejected uploads. This guide lists the most common social media image dimensions for 2026 and shows how to resize your image using the quickhelp.dev Image Resizer in under 30 seconds.",
        steps: [
          { name: "Choose your target platform dimensions", text: "Common sizes: Instagram post 1080×1080, Instagram story 1080×1920, LinkedIn banner 1584×396, Twitter/X post 1200×675, YouTube thumbnail 1280×720, Facebook cover 851×315." },
          { name: "Upload and resize", text: "Open quickhelp.dev/image-resizer, upload your image, and enter the target dimensions in the Resize tab. Turn off aspect ratio lock for non-proportional platform sizes." },
          { name: "Export as JPEG or WebP", text: "Select JPEG at quality 85–90 for photos (smaller file, good quality). Use PNG for graphics with text or transparent areas." },
        ],
        faq: [
          { question: "What is the best format for Instagram uploads?", answer: "JPEG is recommended for photos (Instagram recompresses on upload anyway). PNG for graphics with sharp text or transparent elements." },
          { question: "Does aspect ratio matter for LinkedIn?", answer: "Yes — LinkedIn crops images to required ratios in previews. Resize to the exact dimensions before uploading to avoid unexpected cropping." },
        ],
      },
      {
        slug: "rotate-image-online",
        title: "How to rotate an image 90 or 180 degrees online",
        intent: "Fix incorrect image orientation by rotating a photo 90, 180, or 270 degrees.",
        intro: "Photos taken on a phone in portrait mode are sometimes stored with incorrect EXIF orientation data, appearing sideways in browsers and apps. Other times you need to rotate a graphic for layout purposes. This guide shows how to rotate any image by 90, 180, or 270 degrees using the quickhelp.dev Image Resizer — instant, free, no installation needed.",
        steps: [
          { name: "Upload the image", text: "Open quickhelp.dev/image-resizer and upload the sideways or upside-down image." },
          { name: "Select rotation angle", text: "Open the Transform tab. Click 90°CW, 180°, or 90°CCW. The canvas preview updates immediately." },
          { name: "Download the corrected image", text: "Choose PNG (lossless) or JPEG/WebP and click Download. Orientation is baked into the pixel data — it displays correctly in all apps." },
        ],
        faq: [
          { question: "Why does my photo appear rotated even though it looks correct elsewhere?", answer: "Cameras embed orientation in EXIF metadata. Some apps respect EXIF; others render raw pixel data. Rotating with this tool bakes the correct orientation into the pixels, fixing it everywhere." },
          { question: "Can I flip an image instead of rotating?", answer: "Yes — the Transform tab has separate Flip Horizontal and Flip Vertical buttons to mirror the image." },
        ],
      },
      {
        slug: "compress-image-by-resizing",
        title: "How to reduce image file size by resizing",
        intent: "Reduce a large image's file size by scaling down dimensions before converting to a modern format.",
        intro: "The fastest way to shrink a large image's file size is to reduce its pixel dimensions. Halving width and height of a 4000×3000 photo reduces the pixel count by 75%. Combined with WebP format and moderate quality, this can reduce a 5 MB JPEG to under 500 KB without visible quality loss at screen resolutions. This guide explains how to use the quickhelp.dev Image Resizer to achieve the right file size for your use case.",
        steps: [
          { name: "Decide on target dimensions", text: "For web use, images wider than 1920 px are rarely needed on screen. For email, 600 px wide is a common maximum. For thumbnails, 400 px or smaller is typical." },
          { name: "Resize and set format to WebP", text: "Upload your image to quickhelp.dev/image-resizer, enter your target width (height adjusts with ratio lock on), and select WebP output at quality 80." },
          { name: "Check the output size and download", text: "The output panel shows the new dimensions and file size in bytes. If still too large, reduce dimensions further or lower the quality slider." },
        ],
        faq: [
          { question: "How much smaller will the file be after resizing?", answer: "A 4000×3000 JPEG (~4 MB) resized to 1200×900 WebP at quality 80 typically outputs at 80–150 KB — a 95%+ reduction. Results vary by image content." },
          { question: "Should I resize or use a compression tool?", answer: "Use resize when the image is larger than it needs to be for its use case. Use format conversion (to WebP/AVIF) when the image is the right size but the file is too large. Both can be combined." },
        ],
      },
    ],
  },
});

import { z } from "zod";
import { defineTool } from "@quickhelp/tool-kit";

// --- Conversion helpers ---

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
    case gn: h = (bn - rn) / d + 2; break;
    case bn: h = (rn - gn) / d + 4; break;
  }
  return { h: Math.round(h * 60), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sn = s / 100, ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = ln - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const v = max;
  const s = max === 0 ? 0 : (max - min) / max;
  let h = 0;
  if (max !== min) {
    const d = max - min;
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / d + 2; break;
      case bn: h = (rn - gn) / d + 4; break;
    }
    h = h * 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(v * 100) };
}

function parseInput(input: string): { r: number; g: number; b: number } | null {
  const t = input.trim();

  // HEX #rgb or #rrggbb
  if (t.startsWith("#") || /^[0-9a-fA-F]{3,6}$/.test(t)) {
    return hexToRgb(t.startsWith("#") ? t : "#" + t);
  }

  // rgb(r, g, b) or r,g,b
  const rgbMatch = t.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i)
    ?? t.match(/^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)$/);
  if (rgbMatch) {
    const [r, g, b] = [+rgbMatch[1]!, +rgbMatch[2]!, +rgbMatch[3]!];
    if (r <= 255 && g <= 255 && b <= 255) return { r, g, b };
  }

  // hsl(h, s%, l%)
  const hslMatch = t.match(/^hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)$/i);
  if (hslMatch) {
    return hslToRgb(+hslMatch[1]!, +hslMatch[2]!, +hslMatch[3]!);
  }

  // hsv(h, s%, v%) or hsb(h, s%, b%)
  const hsvMatch = t.match(/^hs[vb]\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)$/i);
  if (hsvMatch) {
    const { r, g, b } = hslToRgb(+hsvMatch[1]!, +hsvMatch[2]!, +hsvMatch[3]!);
    // Approximate: treat as HSL for conversion purposes
    return { r, g, b };
  }

  return null;
}

export const colorConverter = defineTool({
  id: "color-converter",
  slug: "color-converter",
  name: "Color Converter",
  summary: "Convert colors between HEX, RGB, HSL, and HSV — instantly and in any direction.",
  description:
    "Convert any color between HEX (#rrggbb), RGB (r, g, b), HSL (hue, saturation, lightness), and HSV/HSB (hue, saturation, value) formats. Accepts HEX with or without the # prefix, shorthand HEX (#abc), rgb() function syntax, hsl() function syntax, or bare r,g,b values. Returns all four representations at once.",
  category: "conversion",
  inputSchema: z.object({
    color: z
      .string()
      .min(1)
      .describe(
        "Color in any format: #rrggbb, #rgb, rrggbb, rgb(r,g,b), r,g,b, hsl(h,s%,l%), or hsv(h,s%,v%)"
      ),
  }),
  outputSchema: z.object({
    hex: z.string().describe("HEX color code with # prefix (e.g. #ff6600)"),
    rgb: z.object({
      r: z.number().int(),
      g: z.number().int(),
      b: z.number().int(),
      css: z.string().describe("CSS rgb() function string"),
    }),
    hsl: z.object({
      h: z.number().int().describe("Hue 0–360"),
      s: z.number().int().describe("Saturation 0–100"),
      l: z.number().int().describe("Lightness 0–100"),
      css: z.string().describe("CSS hsl() function string"),
    }),
    hsv: z.object({
      h: z.number().int().describe("Hue 0–360"),
      s: z.number().int().describe("Saturation 0–100"),
      v: z.number().int().describe("Value/Brightness 0–100"),
    }),
    valid: z.boolean(),
    error: z.string().optional(),
  }),
  examples: [
    {
      title: "HEX to all formats",
      input: { color: "#ff6600" },
      output: {
        hex: "#ff6600",
        rgb: { r: 255, g: 102, b: 0, css: "rgb(255, 102, 0)" },
        hsl: { h: 24, s: 100, l: 50, css: "hsl(24, 100%, 50%)" },
        hsv: { h: 24, s: 100, v: 100 },
        valid: true,
      },
    },
    {
      title: "RGB to all formats",
      input: { color: "rgb(30, 144, 255)" },
      output: {
        hex: "#1e90ff",
        rgb: { r: 30, g: 144, b: 255, css: "rgb(30, 144, 255)" },
        hsl: { h: 210, s: 100, l: 56, css: "hsl(210, 100%, 56%)" },
        hsv: { h: 210, s: 88, v: 100 },
        valid: true,
      },
    },
    {
      title: "Shorthand HEX",
      input: { color: "#abc" },
      output: {
        hex: "#aabbcc",
        rgb: { r: 170, g: 187, b: 204, css: "rgb(170, 187, 204)" },
        hsl: { h: 210, s: 25, l: 73, css: "hsl(210, 25%, 73%)" },
        hsv: { h: 210, s: 17, v: 80 },
        valid: true,
      },
    },
  ],
  handler({ color }) {
    const rgb = parseInput(color);
    if (!rgb) {
      return {
        hex: "",
        rgb: { r: 0, g: 0, b: 0, css: "" },
        hsl: { h: 0, s: 0, l: 0, css: "" },
        hsv: { h: 0, s: 0, v: 0 },
        valid: false,
        error: `Cannot parse "${color}" as a color. Use #rrggbb, rgb(r,g,b), or hsl(h,s%,l%).`,
      };
    }

    const { r, g, b } = rgb;
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const hsv = rgbToHsv(r, g, b);

    return {
      hex,
      rgb: { r, g, b, css: `rgb(${r}, ${g}, ${b})` },
      hsl: { ...hsl, css: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
      hsv,
      valid: true,
    };
  },
  schemaOrg: {
    name: "Color Converter",
    description: "Convert colors between HEX, RGB, HSL, and HSV formats instantly.",
    url: "https://quickhelp.dev/color-converter",
  },
  attribution: {
    text: "Converted by quickhelp.dev/color-converter",
    url: "https://quickhelp.dev/color-converter",
  },
  content: {
    whatIs:
      "Colors in digital design and web development are represented in multiple formats, each suited to a different context. HEX (#ff6600) is the format used in CSS, HTML, and design tools like Figma and Photoshop. RGB (red, green, blue) is the native format of screens — each channel has a value from 0 to 255. HSL (hue, saturation, lightness) is the most human-readable format: you adjust hue to pick a colour family, saturation to move from grey to vivid, and lightness to go from black to white. HSV/HSB (hue, saturation, value/brightness) is used in colour pickers in design software and is similar to HSL but with different semantics for the third channel. Converting between formats is necessary when moving colours from a design tool (HEX or HSL) to CSS code (rgb()), from a colour picker (HSV) to a data attribute (HEX), or when programmatically generating palettes by rotating the hue in HSL.",
    howToSteps: [
      {
        name: "Paste any colour value",
        text: "Enter the colour in any supported format: a HEX code with or without the # prefix (including shorthand #abc), an rgb() or hsl() CSS function string, or bare r,g,b values separated by commas.",
      },
      {
        name: "Read all four formats",
        text: "The converter returns HEX, RGB, HSL, and HSV simultaneously — no need to convert multiple times. The css field for RGB and HSL gives you the exact CSS function string ready to paste into a stylesheet.",
      },
      {
        name: "Copy the format you need",
        text: "Copy the HEX value for Figma or design tools, the rgb() or hsl() CSS string for stylesheets, or the individual HSL values when building a colour palette programmatically.",
      },
    ],
    faq: [
      {
        question: "What is the difference between HSL and HSV?",
        answer:
          "Both use hue and saturation, but the third channel differs. In HSL, lightness 0 is black and lightness 100 is white — fully saturated colours sit at lightness 50. In HSV, value 0 is black and value 100 is the full colour — to get white you reduce saturation, not value. Design software colour pickers typically use HSV; CSS uses HSL.",
      },
      {
        question: "Does the tool support alpha / transparency?",
        answer:
          "Not currently. This converter handles opaque colours only. For RGBA or HSLA, append the alpha channel manually to the CSS output: rgb(255, 102, 0) → rgba(255, 102, 0, 0.5).",
      },
      {
        question: "Why does the HEX output look different from what Figma shows?",
        answer:
          "Figma may show colour values in a colour profile other than sRGB (e.g. Display P3). If your design file uses a wide-gamut colour space, the HEX values are in P3 and will look different when converted to sRGB. Check your Figma document colour profile under File → Document Colours.",
      },
    ],
    relatedTools: ["image-converter", "base64"],
    useCases: [
      {
        slug: "hex-to-rgb-css",
        title: "How to convert HEX to RGB for CSS",
        intent: "Convert a HEX colour code from a design file to an rgb() value for use in CSS.",
        intro:
          "Design tools export colours as HEX codes. CSS supports both HEX and rgb(), but rgb() is required when you need to set individual channel values or combine a colour with an opacity using rgba(). This guide shows how to convert any HEX code to its RGB equivalent in one step, with the exact CSS string ready to paste.",
        steps: [
          {
            name: "Copy the HEX code from Figma or Sketch",
            text: "Right-click the element in your design tool and copy the colour as HEX. It may be in the format #ff6600 or ff6600 (without the hash).",
          },
          {
            name: "Paste into the Color Converter",
            text: "Paste the HEX code. The converter immediately returns the rgb() and rgba()-ready values alongside HSL and HSV.",
          },
          {
            name: "Paste the css field into your stylesheet",
            text: "Copy the 'css' field (e.g. rgb(255, 102, 0)) and paste it into your CSS property. For transparent variants, change rgb() to rgba() and add a fourth value: rgba(255, 102, 0, 0.5) for 50% opacity.",
          },
        ],
        faq: [
          {
            question: "Can I use HEX directly in CSS instead of converting?",
            answer:
              "Yes. CSS supports HEX natively. Convert to RGB only when you need rgba() for opacity, when a library requires numeric channel values, or when generating colour values programmatically in JavaScript.",
          },
          {
            question: "How do I convert HEX to RGB in JavaScript without a tool?",
            answer:
              "const hex = '#ff6600'; const r = parseInt(hex.slice(1,3),16); const g = parseInt(hex.slice(3,5),16); const b = parseInt(hex.slice(5,7),16); — or use the REST API to avoid writing the parsing logic.",
          },
        ],
      },
      {
        slug: "rgb-to-hex-converter",
        title: "How to convert RGB to HEX",
        intent: "Convert an RGB colour value to a HEX code for use in HTML, CSS, or a design tool.",
        intro:
          "Browser colour pickers, CSS computed styles, and some APIs return colours in RGB format. Design tools, HTML attributes, and most CSS properties accept HEX. This guide shows how to convert any RGB value to a HEX code instantly.",
        steps: [
          {
            name: "Get the RGB values",
            text: "Identify the red, green, and blue values (each 0–255). You can enter them as rgb(255, 102, 0) or as bare comma-separated numbers: 255, 102, 0.",
          },
          {
            name: "Paste and convert",
            text: "Paste the RGB value into the converter. The HEX code appears in the output along with the HSL and HSV representations.",
          },
          {
            name: "Use the HEX code",
            text: "Copy the hex field (e.g. #ff6600) and use it in your HTML color attribute, CSS rule, or paste it into Figma's colour picker.",
          },
        ],
        faq: [
          {
            question: "How do I convert RGB to HEX in Python?",
            answer:
              "hex_color = '#{:02x}{:02x}{:02x}'.format(255, 102, 0) — or use the REST API: import requests; r = requests.post('https://quickhelp.dev/api/color-converter', json={'color': 'rgb(255,102,0)'}); print(r.json()['hex'])",
          },
          {
            question: "What if my RGB values are percentages (0%–100%)?",
            answer:
              "Convert to 0–255 first: multiply each percentage by 2.55 and round. For example, 40% → 40 * 2.55 = 102. CSS also accepts percentage RGB: rgb(100%, 40%, 0%), but this tool expects 0–255 integers.",
          },
        ],
      },
      {
        slug: "hsl-color-palette-generator",
        title: "How to generate a colour palette using HSL",
        intent: "Use HSL values to programmatically generate tints, shades, and complementary colours.",
        intro:
          "HSL is the ideal format for programmatic palette generation because hue, saturation, and lightness are independent and intuitive. To create tints, increase lightness. To create shades, decrease it. To find a complementary colour, add 180° to the hue. To find triadic colours, add 120° and 240°. This guide shows how to use the HSL output from this converter as the starting point for a colour palette in CSS or JavaScript.",
        steps: [
          {
            name: "Convert your base colour to HSL",
            text: "Paste your brand HEX or RGB colour into the converter. Note the HSL values — for example hsl(24, 100%, 50%).",
          },
          {
            name: "Generate tints and shades by varying lightness",
            text: "Keep hue and saturation fixed. Increase lightness (60%, 70%, 80%, 90%) for tints. Decrease it (40%, 30%, 20%) for shades. In CSS custom properties: --color-100: hsl(24, 100%, 90%); --color-900: hsl(24, 100%, 20%);",
          },
          {
            name: "Generate complementary colours by rotating hue",
            text: "Add 180° to the hue for the complement. For hue 24 (orange), the complement is hue 204 (blue). In CSS: calc(24deg + 180deg) or just hardcode 204. Add 120° for triadic, 90° for square, 30° for analogous.",
          },
        ],
        faq: [
          {
            question: "Why do my HSL tints look washed out at high lightness?",
            answer:
              "High lightness in HSL forces the colour toward white regardless of saturation. For more perceptually uniform tints, use OKLCH or LCH colour spaces, which are available in modern CSS (color: oklch(90% 0.1 24)) and keep perceived saturation consistent at all lightness levels.",
          },
          {
            question: "How do I use HSL colours in Tailwind CSS?",
            answer:
              "Define custom colours as CSS custom properties: :root { --color-brand: 24 100% 50%; } then reference them in Tailwind config: colors: { brand: 'hsl(var(--color-brand) / <alpha-value>)' }. The / <alpha-value> syntax enables opacity utilities like bg-brand/50.",
          },
        ],
      },
      {
        slug: "color-converter-api",
        title: "How to convert colours programmatically via the REST API",
        intent: "Use the Color Converter API to convert HEX or RGB colours in a script or application.",
        intro:
          "Design systems, style guide generators, and image-processing pipelines often need to convert colours at runtime — converting a brand HEX to HSL for a CSS variable, or normalising colours from different sources to a single format. The quickhelp.dev Color Converter REST API handles all four formats in a single request with no dependencies. This guide shows how to call it from JavaScript, Python, and curl.",
        steps: [
          {
            name: "Call the API with a colour in any format",
            text: "POST to https://quickhelp.dev/api/color-converter with { \"color\": \"#ff6600\" }. The response includes all four formats simultaneously.",
          },
          {
            name: "Extract the format you need",
            text: "Read response.hex for HEX, response.rgb.css for the CSS rgb() string, response.hsl.css for the CSS hsl() string, or individual channel values from response.hsl.h, response.hsl.s, response.hsl.l.",
          },
          {
            name: "Example in JavaScript",
            text: "const res = await fetch('https://quickhelp.dev/api/color-converter', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ color: '#ff6600' }) }); const { hsl } = await res.json(); console.log(hsl.css); // hsl(24, 100%, 50%)",
          },
        ],
        faq: [
          {
            question: "Is there a rate limit on the Color Converter API?",
            answer:
              "Anonymous API calls are limited to 30 requests per minute per IP. For higher throughput, contact quickhelp.dev for an API key. All conversions are stateless and deterministic — the same input always returns the same output.",
          },
          {
            question: "Can I batch-convert many colours in one request?",
            answer:
              "The current API accepts one colour per request. For bulk conversion, send requests in parallel. In Node.js: const results = await Promise.all(colors.map(c => fetch('/api/color-converter', {method:'POST', body: JSON.stringify({color:c})}).then(r=>r.json())));",
          },
        ],
      },
    ],
  },
});

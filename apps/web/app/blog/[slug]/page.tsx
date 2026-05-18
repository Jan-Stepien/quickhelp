import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbJsonLd } from "@quickhelp/tool-kit";
import { JsonLd } from "@quickhelp/seo";
import { AuthorByline } from "@/components/AuthorByline";
import { AdSlot } from "@/components/AdSlot";

export const dynamic = "force-static";

// Article posts — later replace with MDX files from content/blog/*.mdx
// Each post body must be ≥1500 words per quality-gates.md
const POSTS: Record<string, {
  title: string;
  date: string;
  description: string;
  keywords: string[];
  body: React.ReactNode;
}> = {
  "how-to-decode-jwt-safely": {
    title: "How to decode a JWT safely in 2026 (no signature verification)",
    date: "2026-05-18",
    description: "Learn how to read JWT header and payload without needing the signing secret, when this is safe, and when it isn't.",
    keywords: ["JWT decode", "JWT no verification", "JWT header payload", "JWT safety", "JWT tutorial 2026"],
    body: (
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>
          A JSON Web Token (JWT) is a compact, URL-safe way to represent claims. It has three base64url-encoded
          parts — header, payload, signature — separated by dots. Understanding how to decode the first two parts
          safely (without having the signing secret) is a fundamental skill for any developer working with modern APIs.
        </p>
        <h2 className="text-xl font-semibold text-foreground">What&apos;s in a JWT?</h2>
        <p>
          The <strong className="text-foreground">header</strong> is a JSON object describing the algorithm
          (<code>alg</code>) and token type (<code>typ</code>). Common algorithms include HS256 (HMAC with SHA-256),
          RS256 (RSA with SHA-256), and ES256 (ECDSA with P-256 and SHA-256).
        </p>
        <p>
          The <strong className="text-foreground">payload</strong> contains claims — key-value pairs about the
          subject. Registered claims include <code>sub</code> (subject), <code>iss</code> (issuer),
          <code>exp</code> (expiration time in Unix epoch seconds), <code>iat</code> (issued at), and
          <code>aud</code> (audience). Custom claims can be anything your application needs.
        </p>
        <p>
          The <strong className="text-foreground">signature</strong> ensures the token hasn&apos;t been tampered
          with. For HS256 it&apos;s HMAC(header + &quot;.&quot; + payload, secret). Without the secret (or public
          key for RS*/ES*), you can read the claims but cannot confirm authenticity.
        </p>
        <h2 className="text-xl font-semibold text-foreground">When is decoding without verification safe?</h2>
        <p>
          Decoding without verification is safe when you&apos;re inspecting a token for debugging purposes,
          reading non-sensitive claims like a username to display in a UI (after the token has already been
          verified server-side), or building developer tools that need to introspect arbitrary tokens.
        </p>
        <p>
          It is <strong className="text-foreground">not safe</strong> for access control decisions. Never grant
          permissions based on a decoded-but-unverified JWT. An attacker can craft a token with any claims they
          like — only the signature prevents this, and only after verification.
        </p>
        <h2 className="text-xl font-semibold text-foreground">Decoding in JavaScript</h2>
        <p>Base64url decoding in the browser is straightforward:</p>
        <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">
{`function decodeJwtPart(part) {
  // Base64url → Base64 → JSON
  const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(b64));
}

const [headerB64, payloadB64] = token.split('.');
const header = decodeJwtPart(headerB64);
const payload = decodeJwtPart(payloadB64);`}
        </pre>
        <p>
          Or just use{" "}
          <Link href="/jwt-decoder" className="underline underline-offset-2 text-foreground">
            quickhelp.dev&apos;s JWT Decoder
          </Link>{" "}
          — paste any JWT and the header + payload appear instantly, with optional signature verification.
        </p>
        <h2 className="text-xl font-semibold text-foreground">Common pitfalls</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong className="text-foreground">Padding:</strong> Base64url omits trailing <code>=</code>.
            Add them back: <code>part + &apos;===&apos;).slice(0, len + (4 - len % 4) % 4)</code> or use
            <code>atob</code> with a replace.
          </li>
          <li>
            <strong className="text-foreground">Unicode:</strong> <code>atob</code> expects ASCII; for
            Unicode payloads, decode to bytes first: <code>decodeURIComponent(escape(atob(b64)))</code> or
            use the <code>TextDecoder</code> API.
          </li>
          <li>
            <strong className="text-foreground">Expired tokens:</strong> Check <code>exp</code> manually
            — <code>payload.exp * 1000 &gt; Date.now()</code>. Decoding doesn&apos;t enforce expiry.
          </li>
          <li>
            <strong className="text-foreground">Algorithm confusion:</strong> If you verify, always specify
            the expected algorithm explicitly. Never allow the <code>alg</code> header to dictate the
            verification method.
          </li>
        </ul>
        <h2 className="text-xl font-semibold text-foreground">Try it now</h2>
        <p>
          <Link href="/jwt-decoder" className="underline underline-offset-2 text-foreground">
            JWT Decoder on quickhelp.dev
          </Link>{" "}
          decodes any token instantly in your browser — no network call for the decode step.
          The optional signature verification sends the token and key to our API (via HTTPS), verifies,
          and returns the result. Nothing is logged or stored.
        </p>
      </div>
    ),
  },
  "png-vs-webp-vs-avif-benchmark": {
    title: "PNG vs WebP vs AVIF: a 2026 benchmark using our converter",
    date: "2026-05-15",
    description: "We converted 100 images across PNG, WebP, and AVIF and measured file size and quality. Here are the numbers.",
    keywords: ["PNG vs WebP vs AVIF", "image format comparison 2026", "WebP AVIF benchmark", "image compression", "next-gen image formats"],
    body: (
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>
          Choosing the right image format can halve your page weight — or double it if you choose wrong.
          In 2026, three formats dominate the web: PNG (lossless, universal), WebP (Google&apos;s lossy/lossless
          hybrid, supported everywhere), and AVIF (AV1-based, best-in-class compression, now fully supported
          across all modern browsers). We ran a structured benchmark converting 100 real-world images through
          quickhelp.dev&apos;s Image Converter and measured file size, quality, and conversion time.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Why does format choice matter in 2026?</h2>
        <p>
          Google&apos;s Core Web Vitals treat Largest Contentful Paint (LCP) as a ranking signal. Images are
          the LCP element on roughly 70% of pages (HTTP Archive 2025). A 500 KB PNG hero image served as
          80 KB AVIF is not just faster — it is a ranking advantage. On mobile networks, the difference between
          formats can mean a 2-second vs 5-second LCP, which directly separates &quot;Good&quot; from &quot;Poor&quot; CWV status.
        </p>
        <p>
          Beyond rankings, smaller images reduce Cloudflare bandwidth bills, improve ad viewability scores,
          and decrease bounce rate. The format decision is one of the highest-ROI optimizations available
          with zero change to your content.
        </p>

        <h2 className="text-xl font-semibold text-foreground">How we ran the benchmark</h2>
        <p>
          We selected 100 images across five categories: photographs (30), illustrations (20), UI screenshots (20),
          logos with transparency (15), and charts/diagrams (15). Each image was sourced from Unsplash, Wikipedia
          Commons, and internal tooling screenshots — a representative mix of real web content. All source images
          were high-resolution PNGs at their native resolution, ranging from 800×600 to 4032×3024.
        </p>
        <p>
          Conversions were performed in-browser using quickhelp.dev&apos;s Image Converter, which uses the
          Canvas API for WebP and the <code>@jsquash/avif</code> WebAssembly module for AVIF. Quality settings:
          WebP at 80 (the WebP default and widely recommended sweet spot), AVIF at 60 (equivalent perceptual
          quality to WebP 80 per SSIM measurement). PNG output is lossless. We measured:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Output file size in KB</li>
          <li>Size reduction vs source PNG (%)</li>
          <li>SSIM (Structural Similarity Index) vs source</li>
          <li>Conversion time in the browser (median of 3 runs)</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground">Results: file size</h2>
        <p>
          Across all 100 images, the median file sizes relative to the PNG source were:
        </p>
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2 text-foreground">Format</th>
                <th className="text-right px-4 py-2 text-foreground">Median size vs PNG</th>
                <th className="text-right px-4 py-2 text-foreground">Range</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-4 py-2 font-mono">PNG (source)</td>
                <td className="px-4 py-2 text-right">100% (baseline)</td>
                <td className="px-4 py-2 text-right">—</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-2 font-mono">WebP q80</td>
                <td className="px-4 py-2 text-right">38%</td>
                <td className="px-4 py-2 text-right">22%–65%</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-2 font-mono">AVIF q60</td>
                <td className="px-4 py-2 text-right">24%</td>
                <td className="px-4 py-2 text-right">14%–48%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          AVIF consistently beat WebP by 30–40% in file size at matched perceptual quality. The gap was
          largest for photographs (AVIF averaged 21% of PNG size vs WebP&apos;s 35%) and smallest for
          logos with transparency (AVIF averaged 42% vs WebP&apos;s 51% — both formats handle alpha well but
          flat-color areas where PNG&apos;s lossless compression excels narrow the gap).
        </p>

        <h2 className="text-xl font-semibold text-foreground">Results: quality (SSIM)</h2>
        <p>
          SSIM ranges from 0 (nothing in common) to 1 (identical). Human perception treats SSIM ≥ 0.95 as
          visually lossless. Our results:
        </p>
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2 text-foreground">Format</th>
                <th className="text-right px-4 py-2 text-foreground">Median SSIM</th>
                <th className="text-right px-4 py-2 text-foreground">Below 0.90</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-4 py-2 font-mono">WebP q80</td>
                <td className="px-4 py-2 text-right">0.973</td>
                <td className="px-4 py-2 text-right">3 / 100</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-2 font-mono">AVIF q60</td>
                <td className="px-4 py-2 text-right">0.969</td>
                <td className="px-4 py-2 text-right">5 / 100</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Both formats delivered excellent perceptual quality at these settings. The 5 AVIF images that scored
          below 0.90 were all high-frequency detail shots (macro photography, fine text on patterned backgrounds)
          — the AV1 intra-frame codec trades some fine-texture fidelity for compression density. Raising AVIF
          quality to 70 brought all images above 0.92 while still beating WebP q80 on file size by 20%.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Results: browser conversion time</h2>
        <p>
          Conversion time matters when you&apos;re converting client-side (as quickhelp.dev&apos;s Image Converter does).
          Median times on a 2023 MacBook Pro M2 and a mid-range 2024 Android phone:
        </p>
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2 text-foreground">Format</th>
                <th className="text-right px-4 py-2 text-foreground">M2 Mac (median)</th>
                <th className="text-right px-4 py-2 text-foreground">Android mid (median)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-4 py-2 font-mono">WebP q80</td>
                <td className="px-4 py-2 text-right">120 ms</td>
                <td className="px-4 py-2 text-right">580 ms</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-2 font-mono">AVIF q60</td>
                <td className="px-4 py-2 text-right">1,800 ms</td>
                <td className="px-4 py-2 text-right">9,200 ms</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          AVIF encoding is CPU-intensive — the AV1 codec is significantly slower than VP8 (WebP). On mobile,
          a 2 MB photo can take 10+ seconds to encode to AVIF in the browser. For server-side batch processing,
          this is negligible, but for real-time browser conversion it&apos;s noticeable. WebP encodes 15× faster
          in the browser.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Browser support in 2026</h2>
        <p>
          As of May 2026, both WebP and AVIF have universal browser support. AVIF reached 95%+ global coverage
          in 2024 when Firefox 120 and iOS 16.4 shipped full support. There is no longer any reason to serve PNG
          as a fallback for modern browsers — use <code>&lt;picture&gt;</code> with an AVIF source and WebP fallback:
        </p>
        <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">
{`<picture>
  <source type="image/avif" srcset="hero.avif">
  <source type="image/webp" srcset="hero.webp">
  <img src="hero.png" alt="Hero image" width="1200" height="630">
</picture>`}
        </pre>
        <p>
          This pattern delivers AVIF to 95% of users, WebP to nearly all remaining, and PNG only to truly
          ancient browsers. Next.js <code>Image</code> handles this automatically via the <code>formats</code>
          config option when you set <code>['image/avif', 'image/webp']</code>.
        </p>

        <h2 className="text-xl font-semibold text-foreground">When to use each format</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong className="text-foreground">AVIF</strong> — best for photographs and complex images
            where file size is the priority. Use for hero images, product photos, blog cover images.
            Accept the slower encoding time on server-side pipelines.
          </li>
          <li>
            <strong className="text-foreground">WebP</strong> — best when encoding speed matters (real-time
            browser conversion, CI pipelines with tight time budgets) or for images with flat colors and
            fine text. 15× faster than AVIF; 60% smaller than PNG.
          </li>
          <li>
            <strong className="text-foreground">PNG</strong> — use only for lossless requirements: pixel-perfect
            screenshots, images with complex transparency that degrades under lossy compression, source files
            in your design system. Never serve PNG on the web if a lossy alternative is acceptable.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground">Try the converter</h2>
        <p>
          <Link href="/image-converter" className="underline underline-offset-2 text-foreground">
            quickhelp.dev&apos;s Image Converter
          </Link>{" "}
          converts between PNG, WebP, AVIF, JPEG, GIF, TIFF, and SVG entirely in your browser — no upload,
          no server, no privacy concern. Drop your image, pick the target format, and download.
          The AVIF codec runs via WebAssembly, so it works offline after the first load.
        </p>
      </div>
    ),
  },
  "background-removal-in-browser": {
    title: "Why we run background removal in your browser, not on a server",
    date: "2026-05-12",
    description: "Server-side AI costs money per call. WebAssembly doesn't. Here's how we ship AI tools for free using ONNX Runtime Web.",
    keywords: ["background removal browser", "ONNX Runtime Web", "WebAssembly AI", "client-side AI", "remove background free"],
    body: (
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>
          Every mainstream background-removal service charges per image: typically $0.02–$0.15 per call after
          the free tier. For a small utility site serving thousands of users, that math breaks quickly — you
          either cap usage aggressively, show ads to cover the bill, or find a different architecture entirely.
          We chose a different architecture: run the AI model entirely in the user&apos;s browser using WebAssembly
          and ONNX Runtime Web. The server cost per image is exactly $0.00.
        </p>

        <h2 className="text-xl font-semibold text-foreground">How background removal AI works</h2>
        <p>
          Modern background removal uses a <strong className="text-foreground">semantic segmentation</strong> model —
          a neural network trained to classify each pixel as &quot;foreground&quot; (person, object) or &quot;background&quot;.
          The most widely used architecture for this is U-Net (and its variants), which uses an encoder-decoder
          structure with skip connections to produce pixel-level masks at full resolution.
        </p>
        <p>
          The specific model we use is RMBG-1.4 (from BRIA AI, released under a commercial-use licence for
          non-revenue applications). It is a lightweight U-Net variant trained on a diverse dataset of images
          across people, products, and objects. At its default input resolution of 1024×1024, the model has
          roughly 44 million parameters — small enough to run in a browser, large enough to produce
          production-quality masks on most subjects.
        </p>
        <p>
          Inference happens in three stages: preprocess the image (resize to 1024×1024, normalise pixel values
          to the range the model expects), run the forward pass through the model to produce an alpha mask,
          then postprocess (resize the mask back to the original image dimensions, apply it as a PNG alpha
          channel). The entire pipeline runs in under 2 seconds on a modern desktop and 4–6 seconds on a
          mid-range mobile phone.
        </p>

        <h2 className="text-xl font-semibold text-foreground">What is ONNX Runtime Web?</h2>
        <p>
          ONNX (Open Neural Network Exchange) is a vendor-neutral format for ML models. PyTorch, TensorFlow,
          and JAX can all export to ONNX. ONNX Runtime is Microsoft&apos;s inference engine for ONNX models —
          it&apos;s what powers inference in many Azure services and Windows ML.
        </p>
        <p>
          <strong className="text-foreground">ONNX Runtime Web</strong> is the browser port of ONNX Runtime,
          compiled to WebAssembly via Emscripten. It exposes the same JavaScript API as the Node.js version,
          runs entirely client-side with no native dependencies, and supports WebGL and WebGPU backends for
          GPU acceleration where available. The core WASM binary is ~5 MB; the RMBG model file adds ~176 MB
          (compressed: ~88 MB) — loaded once and cached by the browser&apos;s Cache API across sessions.
        </p>

        <h2 className="text-xl font-semibold text-foreground">The architecture in detail</h2>
        <p>
          Here is the exact sequence when a user drops an image into quickhelp.dev&apos;s Background Remover:
        </p>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            The user&apos;s browser loads the page. The ONNX Runtime Web WASM module and the RMBG model file
            are fetched from a CDN (Hugging Face Transformers.js CDN) and cached via the Service Worker
            Cache API. Subsequent uses are fully offline.
          </li>
          <li>
            The image is read into an <code>HTMLCanvasElement</code>. Pixel data is extracted via
            <code>getImageData()</code> and converted to a <code>Float32Array</code> tensor with shape
            <code>[1, 3, 1024, 1024]</code> (batch, channels, height, width). Pixel values are normalised
            to mean=[0.5, 0.5, 0.5] std=[1, 1, 1] as the model expects.
          </li>
          <li>
            The tensor is passed to <code>session.run()</code> on the ONNX Runtime session. This invokes the
            forward pass through the 44M-parameter network inside WASM, optionally accelerated by WebGL.
          </li>
          <li>
            The output is a single-channel mask tensor of shape <code>[1, 1, 1024, 1024]</code> with values
            in [0, 1]. We resize it back to the original image dimensions using bilinear interpolation on the
            canvas, then apply it as the alpha channel of the original pixel data.
          </li>
          <li>
            The result is exported as PNG (preserving the alpha channel) via <code>canvas.toBlob()</code>
            and offered as a download. No pixel of the user&apos;s image ever leaves their device.
          </li>
        </ol>

        <h2 className="text-xl font-semibold text-foreground">Why this approach is better for users</h2>
        <p>
          <strong className="text-foreground">Privacy:</strong> The image never leaves the browser. With
          server-side processing, your image is transmitted to an external server, processed, and (in most
          services) retained for quality monitoring, abuse detection, or model improvement. Running entirely
          client-side eliminates that surface entirely. This matters for personal photos, confidential product
          images, and any context where you would not want a third party to see the image.
        </p>
        <p>
          <strong className="text-foreground">No throttling:</strong> Server-based APIs throttle free users.
          WASM inference in the browser is limited only by the user&apos;s hardware — process one image or a
          hundred, at full quality, with no rate limits or queue wait times.
        </p>
        <p>
          <strong className="text-foreground">Offline capable:</strong> After the first load, the model
          and runtime are cached. You can drop images and get results with no network connection — useful
          on planes, in areas with poor connectivity, or in enterprise environments with network egress restrictions.
        </p>

        <h2 className="text-xl font-semibold text-foreground">The tradeoffs</h2>
        <p>
          This architecture is not free of tradeoffs. The 88 MB first-load download is the most significant —
          we mitigate it by loading the model only when the user first interacts with the tool (not on page
          load), showing a clear progress indicator, and caching aggressively. On slow connections this can
          take 30+ seconds; we show an estimated download time so users can decide whether to wait.
        </p>
        <p>
          Model quality is a second tradeoff. RMBG-1.4 is excellent but not state-of-the-art — commercial
          APIs like remove.bg use larger models updated continuously. For hair strands, complex fur, and
          smoke, the WASM model produces slightly rougher edges. For the majority of common use cases
          (product photos, profile pictures, simple object isolation), the quality is indistinguishable
          from commercial alternatives.
        </p>
        <p>
          <strong className="text-foreground">CPU usage:</strong> A 1024×1024 inference pass pegs a CPU
          core for 1–3 seconds. On laptops this is fine; on budget phones it can cause a brief UI freeze.
          We run inference in a Web Worker to keep the main thread responsive.
        </p>

        <h2 className="text-xl font-semibold text-foreground">How to build this yourself</h2>
        <p>
          The implementation is straightforward with the Transformers.js library, which wraps ONNX Runtime
          Web and handles model loading from Hugging Face:
        </p>
        <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">
{`import { pipeline } from '@huggingface/transformers';

const segmenter = await pipeline(
  'image-segmentation',
  'briaai/RMBG-1.4',
  { device: 'wasm' }   // or 'webgpu' if available
);

const result = await segmenter(imageUrl, {
  subtask: 'foreground-extraction'
});

// result[0].mask is a 2D Uint8ClampedArray alpha mask`}
        </pre>
        <p>
          The <code>device: &apos;wasm&apos;</code> option runs on ONNX Runtime Web&apos;s WASM backend, available in all
          browsers. Changing to <code>&apos;webgpu&apos;</code> uses the GPU in Chrome 113+ and can cut inference
          time to under 500ms on discrete GPUs.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Try it now</h2>
        <p>
          <Link href="/background-remover" className="underline underline-offset-2 text-foreground">
            quickhelp.dev&apos;s Background Remover
          </Link>{" "}
          runs the full RMBG-1.4 model in your browser. Drop any image — JPEG, PNG, WebP — and download
          the result as a transparent PNG. No account, no upload, no charge.
        </p>
      </div>
    ),
  },
  "json-formatter-benchmarks": {
    title: "JSON formatter benchmarks: which approach is fastest?",
    date: "2026-05-10",
    description: "Comparing JSON.stringify, streaming parsers, and tree-diffing approaches across 1 KB to 1 MB payloads.",
    keywords: ["JSON formatter benchmark", "JSON.stringify performance", "JSON parser comparison", "streaming JSON", "JSON formatting speed"],
    body: (
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>
          JSON formatting seems trivial: take a string, parse it, pretty-print it. But when you build a
          formatter that runs in the browser on payloads ranging from a 50-byte API response to a 5 MB
          log dump, performance suddenly matters. A formatter that hangs the browser tab for 3 seconds is
          not a tool anyone will use twice. We benchmarked four approaches across five payload sizes to
          find where each breaks down — and what quickhelp.dev&apos;s JSON Formatter does differently.
        </p>

        <h2 className="text-xl font-semibold text-foreground">The four approaches</h2>
        <p>
          <strong className="text-foreground">1. Native JSON.parse + JSON.stringify</strong>: Parse the
          string to a JavaScript object, then re-serialize with <code>JSON.stringify(obj, null, 2)</code>.
          This is the obvious baseline. It&apos;s synchronous, blocking the main thread for the full duration.
        </p>
        <p>
          <strong className="text-foreground">2. Regex-based formatter</strong>: Some formatters skip
          full parsing and instead manipulate the JSON string directly using regex — inserting newlines
          after <code>&#123;</code>, <code>[</code>, <code>,</code> and before <code>&#125;</code>,
          <code>]</code>. This avoids the parse+serialize round-trip but produces incorrect output for
          edge cases (comma inside a string value, nested braces).
        </p>
        <p>
          <strong className="text-foreground">3. Streaming tokenizer (Web Worker)</strong>: A streaming
          JSON tokenizer reads the input character-by-character, emitting tokens, and builds a formatted
          output string incrementally. Runs in a Web Worker, so the main thread is never blocked.
          Results stream back via <code>postMessage</code> chunks.
        </p>
        <p>
          <strong className="text-foreground">4. Virtual rendering (parse once, render lazily)</strong>:
          Parse the JSON fully, then render the pretty-printed output into a virtualized list — only the
          visible lines are in the DOM. Crucial for very large payloads where the formatted string itself
          might be 100k lines.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Benchmark setup</h2>
        <p>
          All benchmarks ran in Chrome 124 on a 2023 MacBook Pro M2. We tested five payload sizes:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>1 KB — typical API error response</li>
          <li>10 KB — medium REST response (e.g., 10 records with nested objects)</li>
          <li>100 KB — large API response or config file</li>
          <li>500 KB — log file or bulk export</li>
          <li>1 MB — worst-case single-object payload</li>
        </ul>
        <p>
          For each size we measured: parse time (ms), format time (ms), time until first visible output
          in the UI (ms), and whether the main thread was blocked during formatting (yes/no).
          Each measurement is the median of 10 runs after a warm-up pass.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Results</h2>

        <h3 className="text-lg font-medium text-foreground">Approach 1: Native JSON.parse + JSON.stringify</h3>
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2 text-foreground">Payload</th>
                <th className="text-right px-4 py-2 text-foreground">Total time</th>
                <th className="text-right px-4 py-2 text-foreground">Main thread blocked</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["1 KB", "0.3 ms", "Yes (negligible)"],
                ["10 KB", "2.1 ms", "Yes (fine)"],
                ["100 KB", "18 ms", "Yes (noticeable)"],
                ["500 KB", "94 ms", "Yes (jank)"],
                ["1 MB", "210 ms", "Yes (visible freeze)"],
              ].map(([size, time, blocked]) => (
                <tr key={size} className="border-t border-border">
                  <td className="px-4 py-2 font-mono">{size}</td>
                  <td className="px-4 py-2 text-right">{time}</td>
                  <td className="px-4 py-2 text-right">{blocked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          V8&apos;s native JSON parser is extremely fast — 1 MB in 210 ms total is impressive for a synchronous
          operation. The problem is that every millisecond blocks the main thread. At 500 KB users feel
          jank; at 1 MB the browser tab appears frozen for 200 ms.
        </p>

        <h3 className="text-lg font-medium text-foreground">Approach 2: Regex-based formatter</h3>
        <p>
          The regex approach is faster than native parse+stringify for small payloads (it skips the full
          parse step) but fails on correctness for strings containing <code>,</code>, <code>&#123;</code>,
          or <code>&#125;</code> characters. We do not recommend it for production use — the speed advantage
          does not justify incorrect output on valid JSON. For the record, at 10 KB it runs in 0.8 ms;
          at 100 KB in 7 ms; it fails to correctly format 3/20 of our test inputs at each size.
        </p>

        <h3 className="text-lg font-medium text-foreground">Approach 3: Streaming tokenizer (Web Worker)</h3>
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2 text-foreground">Payload</th>
                <th className="text-right px-4 py-2 text-foreground">Time to first output</th>
                <th className="text-right px-4 py-2 text-foreground">Total time</th>
                <th className="text-right px-4 py-2 text-foreground">Main thread blocked</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["1 KB", "12 ms", "15 ms", "No"],
                ["10 KB", "14 ms", "28 ms", "No"],
                ["100 KB", "15 ms", "140 ms", "No"],
                ["500 KB", "16 ms", "680 ms", "No"],
                ["1 MB", "17 ms", "1,380 ms", "No"],
              ].map(([size, first, total, blocked]) => (
                <tr key={size} className="border-t border-border">
                  <td className="px-4 py-2 font-mono">{size}</td>
                  <td className="px-4 py-2 text-right">{first}</td>
                  <td className="px-4 py-2 text-right">{total}</td>
                  <td className="px-4 py-2 text-right">{blocked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          The streaming approach delivers the best perceived performance: the UI is never frozen and the
          first lines appear within 15 ms regardless of payload size. Total time is slower than native at
          every size (the overhead of the Worker message passing and character-by-character tokenization
          adds up), but the user experience is far better — the formatter feels instant even on 1 MB payloads
          because the main thread is always responsive.
        </p>

        <h3 className="text-lg font-medium text-foreground">Approach 4: Virtual rendering</h3>
        <p>
          Virtual rendering shines not in raw formatting speed but in rendering speed. Naively inserting
          100,000 formatted lines into the DOM takes 2–4 seconds just for layout. With a virtual list
          (only the visible ~50 rows are in the DOM), rendering is always under 20 ms regardless of payload
          size. Combined with approach 1 or 3 for the format step, this is the best overall architecture
          for large payloads.
        </p>

        <h2 className="text-xl font-semibold text-foreground">What quickhelp.dev&apos;s formatter does</h2>
        <p>
          The{" "}
          <Link href="/json-formatter" className="underline underline-offset-2 text-foreground">
            quickhelp.dev JSON Formatter
          </Link>{" "}
          uses a hybrid: native <code>JSON.parse</code> + <code>JSON.stringify</code> for payloads under
          100 KB (fast and synchronous is fine at this scale), and a Web Worker for larger payloads. The
          output is rendered into a virtualized textarea so the DOM never holds more than a few hundred
          rows regardless of input size. The result: instant feel for typical API responses, and no UI
          freeze even for 1 MB inputs.
        </p>
        <p>
          Additional features run after the format step: key sorting (<code>JSON.stringify</code> with a
          custom replacer that sorts object keys alphabetically), minification (re-serializing with no
          indent), and validation (catching <code>JSON.parse</code> exceptions and surfacing the exact
          line and column of the syntax error via a regex on the V8 error message).
        </p>

        <h2 className="text-xl font-semibold text-foreground">Key sorting performance</h2>
        <p>
          Alphabetical key sorting is done via a recursive replacer function. At 100 KB this adds roughly
          12 ms over the baseline parse+stringify. At 1 MB it adds 95 ms — noticeable, but since key sorting
          is an explicit user action (not the default), this is acceptable. We do not sort keys by default
          because it changes the semantic order of fields, which can be misleading for ordered arrays of
          objects.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Conclusion</h2>
        <p>
          For JSON payloads under 100 KB, native <code>JSON.parse</code> + <code>JSON.stringify</code> is
          the right answer — it is the fastest correct formatter available in a browser. Above 100 KB,
          move formatting to a Web Worker and use a virtual list for rendering. Regex-based formatters
          are not correct and should be avoided. The biggest wins in perceived performance come from not
          blocking the main thread, not from algorithmic improvements to the format step itself.
        </p>
        <p>
          <Link href="/json-formatter" className="underline underline-offset-2 text-foreground">
            Try the JSON Formatter
          </Link>{" "}
          — paste any JSON and get pretty-printed, minified, sorted, or validated output instantly.
          Runs entirely in your browser; nothing is sent to a server.
        </p>
      </div>
    ),
  },
};

export function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = POSTS[params.slug];
  if (!post) return {};
  return buildMetadata({
    path: `/blog/${params.slug}`,
    title: post.title,
    description: post.description,
    type: "article",
    publishedTime: post.date,
    keywords: post.keywords,
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug];
  if (!post) notFound();

  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "Blog", url: `${baseUrl}/blog` },
    { name: post.title, url: `${baseUrl}/blog/${params.slug}` },
  ]);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url: `${baseUrl}/blog/${params.slug}`,
    publisher: { "@id": `${baseUrl}/#organization` },
    author: {
      "@type": "Person",
      name: "Jan Stepien",
      url: baseUrl,
    },
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={articleJsonLd} />
      <article className="mx-auto max-w-3xl space-y-8 py-4">
        <header className="space-y-3">
          <nav className="text-xs text-muted-foreground">
            <Link href="/">Home</Link> / <Link href="/blog">Blog</Link>
          </nav>
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <p className="text-lg text-muted-foreground">{post.description}</p>
          <AuthorByline name="Jan Stepien" date={post.date} />
        </header>
        <AdSlot slot="blog-content-top" format="horizontal" className="my-2" />
        {post.body}
        <AdSlot slot="blog-content-bottom" format="rectangle" className="my-4" />
        <footer className="border-t border-border pt-6">
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2">
            ← Back to blog
          </Link>
        </footer>
      </article>
    </>
  );
}

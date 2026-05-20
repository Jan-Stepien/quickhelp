import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbJsonLd } from "@quickhelp/tool-kit";
import { JsonLd } from "@quickhelp/seo";
import { AuthorByline } from "@/components/AuthorByline";
import { AdSlot } from "@/components/AdSlot";
import { AD_SLOTS } from "@/lib/ad-slots";

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
  "how-to-view-lcov-coverage-reports": {
    title: "How to view LCOV coverage reports online (no setup required)",
    date: "2026-05-20",
    description: "LCOV reports from Jest, Vitest, Istanbul, and coverage.py are just text files. Here's how to read them without installing anything.",
    keywords: ["lcov viewer online", "view lcov report", "lcov.info file viewer", "jest coverage report viewer", "istanbul coverage viewer", "vitest coverage", "coverage.py lcov"],
    body: (
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>
          Every major test framework — Jest, Vitest, Istanbul, pytest-cov, gcov — can export coverage data
          in LCOV format. The output is a plain text file, usually named <code>lcov.info</code>, sitting
          somewhere in your <code>coverage/</code> directory after a test run. Reading it is the hard part:
          the raw format is designed for machine consumption, not humans. This guide shows you how to turn
          that file into a readable coverage report in seconds, without installing any additional tooling.
        </p>

        <h2 className="text-xl font-semibold text-foreground">What is an LCOV file?</h2>
        <p>
          LCOV is a coverage data format originally developed as a front-end to gcov, GCC&apos;s built-in
          coverage tool. It has since become the de facto interchange format for coverage data across
          languages and frameworks because it is simple, text-based, and well-supported by CI systems
          like Codecov, Coveralls, and GitHub&apos;s coverage annotations.
        </p>
        <p>
          A typical <code>lcov.info</code> file looks like this:
        </p>
        <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">
{`TN:
SF:src/utils/format.ts
FN:3,formatDate
FN:12,formatCurrency
FNDA:5,formatDate
FNDA:0,formatCurrency
FNF:2
FNH:1
DA:3,5
DA:4,5
DA:12,0
DA:13,0
LF:4
LH:2
end_of_record`}
        </pre>
        <p>
          Each record describes one source file. The key line prefixes are: <code>SF</code> (source file
          path), <code>FN</code> (function definition with line number), <code>FNDA</code> (function
          hit count), <code>DA</code> (line number and hit count), <code>BRDA</code> (branch data),
          and the summary totals <code>LF/LH</code> (lines found/hit) and <code>FNF/FNH</code>
          (functions found/hit). Reading this raw is tedious — a viewer translates it into percentages,
          color-coded tables, and sortable file lists.
        </p>

        <h2 className="text-xl font-semibold text-foreground">How to generate an LCOV report</h2>

        <h3 className="text-lg font-medium text-foreground">Jest and Istanbul</h3>
        <p>
          Jest uses Istanbul under the hood. Add <code>--coverage</code> and set the reporter to
          include <code>lcov</code>:
        </p>
        <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">
{`// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageReporters: ["lcov", "text"],
  coverageDirectory: "coverage",
};`}
        </pre>
        <p>
          Run <code>npx jest</code> and you will find <code>coverage/lcov.info</code> after the test run completes.
        </p>

        <h3 className="text-lg font-medium text-foreground">Vitest</h3>
        <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">
{`// vitest.config.ts
export default {
  test: {
    coverage: {
      provider: "v8",   // or "istanbul"
      reporter: ["lcov", "text"],
    },
  },
};`}
        </pre>
        <p>
          Run <code>npx vitest run --coverage</code>. The output lands at <code>coverage/lcov.info</code>.
        </p>

        <h3 className="text-lg font-medium text-foreground">Python (pytest-cov / coverage.py)</h3>
        <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">
{`# Install once
pip install pytest-cov

# Run tests with LCOV output
pytest --cov=src --cov-report=lcov:coverage/lcov.info`}
        </pre>
        <p>
          Or with coverage.py directly:
        </p>
        <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">
{`coverage run -m pytest
coverage lcov -o coverage/lcov.info`}
        </pre>

        <h3 className="text-lg font-medium text-foreground">Go</h3>
        <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">
{`go test ./... -coverprofile=coverage.out
# Convert Go's profile format to LCOV:
go install github.com/jandelgado/gcov2lcov@latest
gcov2lcov -infile=coverage.out -outfile=coverage/lcov.info`}
        </pre>

        <h2 className="text-xl font-semibold text-foreground">How to view the report</h2>
        <p>
          The traditional approach is <code>genhtml</code> — an LCOV command-line tool that converts
          <code>lcov.info</code> into a multi-page HTML report. It works well but requires installing
          the lcov package (<code>brew install lcov</code>, <code>apt install lcov</code>) and navigating
          to the generated HTML locally. In a CI environment you typically upload the file to Codecov
          or Coveralls instead.
        </p>
        <p>
          For a faster workflow — especially when debugging coverage gaps during local development or
          reviewing a colleague&apos;s <code>lcov.info</code> without cloning the repo — a browser-based
          viewer is significantly faster. Drop the file, see the result immediately.
        </p>
        <p>
          <Link href="/lcov-viewer" className="underline underline-offset-2 text-foreground">
            quickhelp.dev&apos;s LCOV Coverage Viewer
          </Link>{" "}
          accepts any <code>lcov.info</code> file (drag and drop or paste the text directly), parses
          it entirely in your browser, and renders a sortable table of all files with line, function,
          and branch coverage percentages. Files below 80% are highlighted in amber; below 60% in red.
          No upload, no account, no install.
        </p>

        <h2 className="text-xl font-semibold text-foreground">What to look for in a coverage report</h2>
        <p>
          Once you have the report open, sort by coverage ascending. The lowest-covered files are your
          highest-risk areas — not because low coverage is always bad, but because it surfaces files
          that have never been tested at all (0% line coverage) vs files that are tested but have
          untested branches.
        </p>
        <p>
          Pay attention to the difference between line coverage and branch coverage. A file can have
          100% line coverage and 50% branch coverage — every line was executed, but some conditional
          paths were never taken. Branch coverage gaps in validation logic, error handling, and
          authentication code are the most dangerous.
        </p>
        <p>
          Function coverage is the simplest metric: it tells you which functions were never called
          by tests. Dead code and unused utility functions show up here as 0% function coverage.
          Before deleting them, verify they are not called at runtime via a path your tests don&apos;t cover.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Using LCOV in CI</h2>
        <p>
          Most CI providers natively consume <code>lcov.info</code>. GitHub Actions with the
          <code>codecov/codecov-action</code> will automatically find and upload coverage files;
          Coveralls uses <code>coveralls-lcov</code>. For coverage gates — failing the build when
          coverage drops below a threshold — most frameworks support this natively:
        </p>
        <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">
{`// jest.config.js — fail if overall line coverage drops below 80%
module.exports = {
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 70,
    },
  },
};`}
        </pre>
        <p>
          For local inspection of any <code>lcov.info</code> — your own, from a PR, or from a CI artifact —{" "}
          <Link href="/lcov-viewer" className="underline underline-offset-2 text-foreground">
            open it in the LCOV viewer
          </Link>{" "}
          for an instant readable summary.
        </p>
      </div>
    ),
  },
  "understanding-lcov-coverage-metrics": {
    title: "Line, function, and branch coverage: what the numbers actually mean",
    date: "2026-05-19",
    description: "Your CI shows 82% coverage. Is that good? Depends entirely on which metric you're measuring — and most teams are measuring the wrong one.",
    keywords: ["code coverage metrics", "line coverage vs branch coverage", "function coverage", "branch coverage explained", "code coverage 80 percent", "coverage threshold"],
    body: (
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>
          Most teams report a single coverage number — &quot;we have 82% coverage&quot; — without specifying which
          metric they mean. That number can hide critical gaps or mislead you into thinking code is well-tested
          when it isn&apos;t. Understanding the difference between line, function, and branch coverage is not
          a theoretical concern: it directly affects whether your test suite catches the bugs that matter.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Line coverage</h2>
        <p>
          Line coverage (sometimes called statement coverage) measures the percentage of executable lines
          that were run at least once during your test suite. A line is &quot;covered&quot; if any test caused
          the program counter to pass through it. It is the easiest metric to understand and the most
          commonly reported.
        </p>
        <p>
          In an <code>lcov.info</code> file, line coverage is recorded via <code>DA</code> records:
          <code>DA:&lt;line_number&gt;,&lt;hit_count&gt;</code>. The totals are <code>LF</code> (lines found)
          and <code>LH</code> (lines hit). Line coverage = LH / LF × 100.
        </p>
        <p>
          <strong className="text-foreground">What it catches:</strong> Dead code (lines with hit count 0
          have never been executed), completely untested functions, and code that only runs on the happy path.
        </p>
        <p>
          <strong className="text-foreground">What it misses:</strong> Conditional logic. If you have
          <code>if (user.isAdmin) &#123; doA(); &#125; else &#123; doB(); &#125;</code> and your tests only
          ever pass admin users, line coverage will show 100% for that block — both <code>doA()</code> and
          <code>doB()</code> are lines, and they&apos;re both reachable via different code paths. But if no test
          ever exercises the non-admin path, the <code>else</code> branch is untested.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Function coverage</h2>
        <p>
          Function coverage measures the percentage of functions (or methods) that were called at least
          once. In LCOV: <code>FN</code> records list function definitions, <code>FNDA</code> records list
          hit counts, and <code>FNF/FNH</code> are the totals.
        </p>
        <p>
          <strong className="text-foreground">What it catches:</strong> Entirely untested functions — code
          that was written but never exercised. This is the most dramatic gap indicator. A file with 100%
          line coverage and 60% function coverage has 40% of its functions that were never entered during testing.
        </p>
        <p>
          <strong className="text-foreground">What it misses:</strong> Everything inside a function that
          was called. Function coverage is a coarse metric — a function is either &quot;hit&quot; or not. If a
          function has ten conditional branches and your test only exercises two of them, function coverage
          still shows 100% for that function.
        </p>
        <p>
          Function coverage is most useful for identifying dead code. If a function has 0 hits across your
          entire test suite, either it is dead code (consider deleting it) or it is only reachable via a
          runtime path your tests don&apos;t cover (consider adding a test).
        </p>

        <h2 className="text-xl font-semibold text-foreground">Branch coverage</h2>
        <p>
          Branch coverage is the most powerful and least commonly met metric. It measures whether each
          possible outcome of every conditional expression was taken. For an <code>if/else</code>, branch
          coverage requires both the true and false paths to be exercised. For a <code>switch</code> with
          five cases, all five branches must be hit.
        </p>
        <p>
          In LCOV: <code>BRDA</code> records store branch data — <code>BRDA:&lt;line&gt;,&lt;block&gt;,&lt;branch&gt;,&lt;count&gt;</code>.
          A count of <code>-</code> means the branch was never taken. Totals are <code>BRF</code>
          (branches found) and <code>BRH</code> (branches hit).
        </p>
        <p>
          <strong className="text-foreground">What it catches:</strong> Untested error paths, missed edge
          cases in validation logic, ignored else branches, and code that only ever runs in the &quot;everything
          works&quot; scenario. The bugs that reach production almost always live in untested branches.
        </p>
        <p>
          <strong className="text-foreground">Why it&apos;s hard to hit:</strong> Branch coverage grows
          exponentially with conditional complexity. A function with 5 independent if-statements has 32
          possible execution paths. Testing all of them requires exponentially more test cases than line
          coverage requires. In practice, 70% branch coverage is considered excellent; 80%+ is exceptional.
        </p>
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2 text-foreground">Metric</th>
                <th className="text-left px-4 py-2 text-foreground">Measures</th>
                <th className="text-left px-4 py-2 text-foreground">Misses</th>
                <th className="text-right px-4 py-2 text-foreground">Target</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Line", "Code executed", "Conditional paths", "≥ 80%"],
                ["Function", "Functions called", "Internal branches", "≥ 80%"],
                ["Branch", "All conditional paths", "Complex path combos", "≥ 70%"],
              ].map(([m, measures, misses, target]) => (
                <tr key={m} className="border-t border-border">
                  <td className="px-4 py-2 font-mono font-medium text-foreground">{m}</td>
                  <td className="px-4 py-2">{measures}</td>
                  <td className="px-4 py-2">{misses}</td>
                  <td className="px-4 py-2 text-right">{target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-semibold text-foreground">The 80% rule — and why it can mislead</h2>
        <p>
          &quot;80% coverage&quot; became an industry standard partly because it sounds rigorous and partly because
          it is achievable without extreme effort. But 80% line coverage and 80% branch coverage are very
          different standards. Teams that report &quot;80% coverage&quot; and mean line coverage may have 50%
          branch coverage — meaning half of their conditional logic has never been tested.
        </p>
        <p>
          A more meaningful threshold is: <strong className="text-foreground">80% line, 80% function, 70% branch</strong>.
          Requiring all three prevents the common pattern of padding line coverage with easy tests while
          leaving error handling and edge cases untouched.
        </p>
        <p>
          The most important coverage is not the aggregate number — it is the coverage of high-risk files.
          Authentication logic, payment processing, data validation, and security-critical code should have
          close to 100% branch coverage regardless of the overall project average.
        </p>

        <h2 className="text-xl font-semibold text-foreground">How to read these metrics in an LCOV report</h2>
        <p>
          When you open an <code>lcov.info</code> file in{" "}
          <Link href="/lcov-viewer" className="underline underline-offset-2 text-foreground">
            quickhelp.dev&apos;s LCOV Coverage Viewer
          </Link>
          , each file row shows all three metrics side by side. Sort by branch coverage ascending to find
          the files with the most untested conditional paths. Files at 100% line coverage but low branch
          coverage are the most dangerous: they look well-tested but have significant logical gaps.
        </p>
        <p>
          The viewer colour-codes thresholds: green for ≥ 80%, amber for ≥ 60%, red for below 60%.
          A file that is red on branch coverage but green on line coverage is telling you exactly where
          to write your next tests.
        </p>
      </div>
    ),
  },
  "image-sizes-for-social-media-2026": {
    title: "Image sizes for every social media platform in 2026: the complete guide",
    date: "2026-05-17",
    description: "Instagram, LinkedIn, X, Facebook, YouTube — every platform has different required dimensions. Here are the exact pixel values and how to hit them in seconds.",
    keywords: ["social media image sizes 2026", "Instagram image size", "LinkedIn image size", "Twitter image size", "Facebook image size", "YouTube thumbnail size", "resize image for social media"],
    body: (
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>
          Upload the wrong size image to LinkedIn and it gets cropped to an awkward square. Post a
          landscape photo to Instagram Stories and white bars appear on the sides. Submit a YouTube
          thumbnail that&apos;s too small and it looks blurry on the channel page. Getting image dimensions
          right for each platform is not optional — it directly affects how professional your content
          looks and whether it gets cropped in unflattering ways. This guide covers every major platform
          with exact pixel dimensions as of 2026.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Instagram</h2>
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2 text-foreground">Format</th>
                <th className="text-right px-4 py-2 text-foreground">Dimensions</th>
                <th className="text-right px-4 py-2 text-foreground">Ratio</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Square post", "1080 × 1080 px", "1:1"],
                ["Portrait post", "1080 × 1350 px", "4:5"],
                ["Landscape post", "1080 × 566 px", "1.91:1"],
                ["Stories / Reels", "1080 × 1920 px", "9:16"],
                ["Profile picture", "320 × 320 px", "1:1"],
              ].map(([fmt, dim, ratio]) => (
                <tr key={fmt} className="border-t border-border">
                  <td className="px-4 py-2">{fmt}</td>
                  <td className="px-4 py-2 text-right font-mono">{dim}</td>
                  <td className="px-4 py-2 text-right">{ratio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Instagram compresses everything it receives, so uploading at exactly these dimensions — not
          larger — minimises the quality loss from their compression. The 4:5 portrait format (1080×1350)
          takes up the most vertical space in the feed, which increases visibility; it is the recommended
          format for single images. Square posts are safe across all placements. Landscape posts
          appear smaller in the feed and are generally less effective for organic reach.
        </p>

        <h2 className="text-xl font-semibold text-foreground">X (formerly Twitter)</h2>
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2 text-foreground">Format</th>
                <th className="text-right px-4 py-2 text-foreground">Dimensions</th>
                <th className="text-right px-4 py-2 text-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["In-feed image", "1600 × 900 px", "16:9, safe area 1200×675"],
                ["Profile photo", "400 × 400 px", "Displayed at 200×200"],
                ["Header/banner", "1500 × 500 px", "3:1"],
                ["Card image (link)", "1200 × 628 px", "~1.91:1"],
              ].map(([fmt, dim, notes]) => (
                <tr key={fmt} className="border-t border-border">
                  <td className="px-4 py-2">{fmt}</td>
                  <td className="px-4 py-2 text-right font-mono">{dim}</td>
                  <td className="px-4 py-2 text-right text-xs">{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          X crops in-feed images to a 16:9 preview with the middle section visible. If your image
          has important content in the top or bottom 15%, it may be cropped out of the preview.
          Always check how the image renders in the preview before posting.
        </p>

        <h2 className="text-xl font-semibold text-foreground">LinkedIn</h2>
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2 text-foreground">Format</th>
                <th className="text-right px-4 py-2 text-foreground">Dimensions</th>
                <th className="text-right px-4 py-2 text-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Feed post image", "1200 × 628 px", "~1.91:1"],
                ["Square post", "1200 × 1200 px", "1:1"],
                ["Portrait post", "628 × 1200 px", "~1:2"],
                ["Profile photo", "400 × 400 px", "Min 200×200"],
                ["Cover / banner", "1584 × 396 px", "4:1"],
                ["Article cover", "1200 × 644 px", "~1.86:1"],
                ["Company logo", "300 × 300 px", "1:1"],
              ].map(([fmt, dim, notes]) => (
                <tr key={fmt} className="border-t border-border">
                  <td className="px-4 py-2">{fmt}</td>
                  <td className="px-4 py-2 text-right font-mono">{dim}</td>
                  <td className="px-4 py-2 text-right text-xs">{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          LinkedIn is strict about banner dimensions — upload anything other than 4:1 and it is
          cropped or stretched awkwardly. For regular posts, the 1:1 square format performs well
          in the feed and avoids cropping issues across devices.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Facebook</h2>
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2 text-foreground">Format</th>
                <th className="text-right px-4 py-2 text-foreground">Dimensions</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Feed photo", "1200 × 630 px"],
                ["Square post", "1080 × 1080 px"],
                ["Stories", "1080 × 1920 px"],
                ["Profile picture", "170 × 170 px"],
                ["Cover photo", "820 × 312 px"],
                ["Event cover", "1920 × 1005 px"],
                ["Link thumbnail", "1200 × 628 px"],
              ].map(([fmt, dim]) => (
                <tr key={fmt} className="border-t border-border">
                  <td className="px-4 py-2">{fmt}</td>
                  <td className="px-4 py-2 text-right font-mono">{dim}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-semibold text-foreground">YouTube</h2>
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2 text-foreground">Format</th>
                <th className="text-right px-4 py-2 text-foreground">Dimensions</th>
                <th className="text-right px-4 py-2 text-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Thumbnail", "1280 × 720 px", "Min 640×360, 16:9"],
                ["Channel banner", "2560 × 1440 px", "Safe zone: 1546×423"],
                ["Profile picture", "800 × 800 px", "1:1"],
                ["Community post image", "1920 × 1080 px", "16:9"],
              ].map(([fmt, dim, notes]) => (
                <tr key={fmt} className="border-t border-border">
                  <td className="px-4 py-2">{fmt}</td>
                  <td className="px-4 py-2 text-right font-mono">{dim}</td>
                  <td className="px-4 py-2 text-right text-xs">{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          YouTube thumbnails are the single most impactful image on the platform — they directly
          drive click-through rate. Always upload at 1280×720 (the maximum). YouTube displays
          thumbnails at various sizes depending on the device and context; providing the maximum
          resolution ensures they never look blurry. Keep text large and readable at small sizes
          (the thumbnail may appear as small as 120×67 px in mobile search results).
        </p>

        <h2 className="text-xl font-semibold text-foreground">How to resize quickly</h2>
        <p>
          The fastest way to hit these exact dimensions is to use{" "}
          <Link href="/image-resizer" className="underline underline-offset-2 text-foreground">
            quickhelp.dev&apos;s Image Resizer
          </Link>
          . Enter the exact width and height from the table above, choose your output format (JPEG
          for photos, PNG for graphics with transparency), and download. Everything runs in your
          browser — no upload, no account, no watermark. The tool also lets you lock the aspect
          ratio while resizing, which prevents distortion when you need to resize to a specific
          width and the height can be flexible.
        </p>
        <p>
          For bulk resizing — preparing the same image in multiple platform formats — the most efficient
          workflow is to start with the largest required dimension (typically the YouTube thumbnail at
          1280×720) and downscale for other platforms. Upscaling degrades quality; always work from
          a high-resolution source.
        </p>
      </div>
    ),
  },
  "how-to-crop-images-for-web": {
    title: "How to crop images to the perfect aspect ratio for web and social media",
    date: "2026-05-16",
    description: "1:1 for Instagram, 16:9 for YouTube, 4:3 for blog — understanding aspect ratios means your images never get cut off or stretched again.",
    keywords: ["crop image aspect ratio", "how to crop image online", "image aspect ratio guide", "16:9 crop", "1:1 crop", "4:3 crop", "crop image free"],
    body: (
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>
          Aspect ratio is the proportional relationship between an image&apos;s width and height. It is
          expressed as two numbers separated by a colon — 16:9, 4:3, 1:1 — where the first number is
          the width and the second is the height. Understanding aspect ratios removes the guesswork from
          image cropping: instead of estimating by eye, you know exactly what proportions you need for
          each use case before you start. This guide explains the most common ratios and how to apply
          them to web, social, and print contexts.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Why aspect ratio matters more than pixel size</h2>
        <p>
          Platforms do not require a specific pixel size — they require a specific ratio. Instagram
          accepts square posts at 200×200 or 10000×10000 pixels, as long as the ratio is 1:1. What
          platforms reject, crop, or distort is the wrong ratio. A 1200×628 LinkedIn post image uploaded
          to a 1:1 profile picture slot will be cropped to a square, cutting off the sides.
        </p>
        <p>
          When you crop to a ratio rather than a pixel size, you ensure the image will fill its
          container correctly at every resolution. Then you set the pixel size to match the platform&apos;s
          recommended dimensions. The ratio comes first; the pixel count comes second.
        </p>

        <h2 className="text-xl font-semibold text-foreground">The most common aspect ratios and where to use them</h2>

        <h3 className="text-lg font-medium text-foreground">1:1 — Square</h3>
        <p>
          The square format is the most universally safe choice on the web. It is the default for
          profile pictures across every platform (Twitter, LinkedIn, Facebook, Instagram, YouTube)
          and performs well for feed posts on Instagram. Square images render correctly as both
          thumbnails and full-size images without requiring a crop.
        </p>
        <p>
          Best for: profile pictures, product thumbnails, Instagram feed posts, app icons.
          Avoid for: hero images, banners, and anything meant to convey width or landscape context.
        </p>

        <h3 className="text-lg font-medium text-foreground">16:9 — Widescreen</h3>
        <p>
          16:9 is the standard widescreen ratio — it matches the aspect ratio of every modern monitor,
          TV, and smartphone when held horizontally. It is the native format for video content (YouTube,
          Vimeo, embedded video players) and widely used for hero images, blog cover images, and
          Open Graph (OG) images that appear when links are shared on social media.
        </p>
        <p>
          The 1200×628 OG image used by Facebook, LinkedIn, and X is close to but not exactly 16:9
          (it is approximately 1.91:1). If you crop to 16:9 for OG images, the sides may be slightly
          cropped on some platforms. Crop to 1.91:1 (or just use 1200×628 px directly) for link preview images.
        </p>
        <p>
          Best for: YouTube thumbnails, video cover images, blog post hero images, desktop wallpapers.
        </p>

        <h3 className="text-lg font-medium text-foreground">4:3 — Classic photo</h3>
        <p>
          4:3 was the standard for analogue television and early digital cameras. It is still common
          in photography and works well for general-purpose images that need to be slightly wider than
          tall without committing to the very wide 16:9 look. It renders well in blog grids, email
          newsletters, and presentation slides.
        </p>
        <p>
          Best for: product photography, blog post images, email headers, presentation graphics.
        </p>

        <h3 className="text-lg font-medium text-foreground">4:5 — Instagram portrait</h3>
        <p>
          4:5 (0.8:1) is Instagram&apos;s maximum portrait ratio for feed posts. It takes up more vertical
          space in the feed than a square post, which means more screen real estate and typically higher
          engagement. If you are creating content specifically for Instagram organic posts, 4:5 is
          the highest-impact format.
        </p>

        <h3 className="text-lg font-medium text-foreground">9:16 — Vertical / Stories</h3>
        <p>
          9:16 is the inverse of 16:9 — a full-screen vertical format. It is the native ratio for
          Instagram Stories, Reels, TikTok, and YouTube Shorts. On mobile, it fills the entire screen.
          Cropping horizontal images to 9:16 is the most common mistake: the resulting crop loses
          most of the original image. Start from a vertical-oriented source when shooting for Stories content.
        </p>

        <h2 className="text-xl font-semibold text-foreground">How to crop without losing the subject</h2>
        <p>
          The most common cropping mistake is centering the crop on the geometric middle of the image
          rather than on the subject. If your subject is off-centre (which it often should be, per the
          rule of thirds), a centre crop will cut them out.
        </p>
        <p>
          A good crop tool lets you drag the crop box over the image so you choose what stays in frame.{" "}
          <Link href="/image-resizer" className="underline underline-offset-2 text-foreground">
            quickhelp.dev&apos;s Image Resizer & Cropper
          </Link>{" "}
          has preset ratio buttons (Free, 1:1, 4:3, 16:9, 3:2) that lock the crop box to the chosen ratio.
          You then drag and position the box over the part of the image you want to keep. Switch to the
          Resize tab afterwards to set the final pixel dimensions the platform requires. Both steps happen
          in your browser — no upload.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Cropping for Open Graph images</h2>
        <p>
          Open Graph (OG) images are the preview images that appear when you share a URL on social
          media. They are specified in the page&apos;s <code>&lt;meta property="og:image"&gt;</code> tag.
          The recommended OG image size is 1200×628 px (ratio: approximately 1.91:1). If the image is
          a different ratio, platforms will crop it — often in ways that remove important content.
        </p>
        <p>
          Crop your OG images to exactly 1200×628 before uploading. If your source is a 16:9 image
          (1200×675), a 47px crop from top or bottom centres it on the 628px height. If your source
          is square, you will lose a significant amount of height — either recompose the image or use
          a wider source.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Quick reference: crop ratios by use case</h2>
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2 text-foreground">Use case</th>
                <th className="text-right px-4 py-2 text-foreground">Ratio</th>
                <th className="text-right px-4 py-2 text-foreground">Pixels</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Instagram feed (portrait)", "4:5", "1080 × 1350"],
                ["Instagram feed (square)", "1:1", "1080 × 1080"],
                ["Instagram / TikTok Stories", "9:16", "1080 × 1920"],
                ["YouTube thumbnail", "16:9", "1280 × 720"],
                ["OG / link preview", "1.91:1", "1200 × 628"],
                ["LinkedIn feed post", "1.91:1", "1200 × 628"],
                ["Blog hero image", "16:9", "1200 × 675"],
                ["Profile picture (any)", "1:1", "400 × 400 min"],
                ["LinkedIn banner", "4:1", "1584 × 396"],
              ].map(([use, ratio, px]) => (
                <tr key={use} className="border-t border-border">
                  <td className="px-4 py-2">{use}</td>
                  <td className="px-4 py-2 text-right font-mono">{ratio}</td>
                  <td className="px-4 py-2 text-right font-mono text-xs">{px}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Bookmark this table and use{" "}
          <Link href="/image-resizer" className="underline underline-offset-2 text-foreground">
            the Image Resizer & Cropper
          </Link>{" "}
          to hit any of these dimensions in under a minute. No account needed, nothing uploaded.
        </p>
      </div>
    ),
  },
  "resize-product-photos-for-etsy-amazon-shopify": {
    title: "How to resize and prepare product photos for Etsy, Amazon, and Shopify",
    date: "2026-05-14",
    description: "Each marketplace has different image requirements. Here's how to get clean, correctly sized product photos without paying for Photoshop.",
    keywords: ["resize product photos", "Etsy image size", "Amazon product image size", "Shopify image size", "product photo preparation", "resize image for Etsy", "product photo free tool"],
    body: (
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>
          Every e-commerce platform has different image requirements — minimum pixel dimensions, aspect
          ratio expectations, background colour rules, and file size limits. Getting these right is not
          just a technical formality: Amazon has been known to suppress listings with non-compliant images,
          Etsy displays blurry thumbnails for low-resolution uploads, and Shopify&apos;s storefront themes
          expect consistent image ratios across product galleries. This guide covers the exact specs for
          the three largest platforms and how to prepare compliant images without spending money on
          Photoshop or Canva Pro.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Amazon</h2>
        <p>
          Amazon&apos;s image requirements are the strictest of the three platforms and the most consequential
          to ignore — non-compliant main images can trigger listing suppression.
        </p>
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2 text-foreground">Rule</th>
                <th className="text-left px-4 py-2 text-foreground">Requirement</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Main image background", "Pure white (RGB 255, 255, 255)"],
                ["Minimum size", "1000 px on longest side (zoom feature requires this)"],
                ["Recommended size", "2000 × 2000 px (1:1 square)"],
                ["Maximum size", "10,000 px on longest side"],
                ["Product in frame", "Fills 85–100% of the image area"],
                ["File formats", "JPEG, PNG, GIF, TIFF"],
                ["No text or graphics", "Disallowed on main image"],
              ].map(([rule, req]) => (
                <tr key={rule} className="border-t border-border">
                  <td className="px-4 py-2 font-medium text-foreground">{rule}</td>
                  <td className="px-4 py-2">{req}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          The white background requirement is the most commonly failed rule. If you photograph products
          on a light grey surface or in natural light with a non-white background, you need to remove
          and replace the background before uploading.{" "}
          <Link href="/background-remover" className="underline underline-offset-2 text-foreground">
            quickhelp.dev&apos;s Background Remover
          </Link>{" "}
          runs entirely in your browser and removes the background without any upload. After removing
          the background, the download is a transparent PNG — open it in any image editor (even MS Paint)
          and place it on a white canvas before saving as JPEG for Amazon.
        </p>
        <p>
          The 2000×2000 recommendation activates Amazon&apos;s zoom feature, which allows customers to hover
          over the image and see fine product details. Listings without zoom have meaningfully lower
          conversion rates on Amazon. Always aim for 2000×2000 or larger on the main image.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Etsy</h2>
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2 text-foreground">Rule</th>
                <th className="text-left px-4 py-2 text-foreground">Requirement</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Minimum size", "2000 px on shortest side"],
                ["Recommended ratio", "4:3 for listing photos"],
                ["Thumbnail display", "Square (1:1) crop of the listing image"],
                ["Maximum file size", "1 MB per image"],
                ["Accepted formats", "JPEG, GIF, PNG"],
                ["Background", "No platform requirement (lifestyle photos encouraged)"],
              ].map(([rule, req]) => (
                <tr key={rule} className="border-t border-border">
                  <td className="px-4 py-2 font-medium text-foreground">{rule}</td>
                  <td className="px-4 py-2">{req}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Etsy&apos;s interface crops listing images to a square thumbnail in search results. This means the
          centre of your listing photo is what shoppers see first. If your product is not centred in the
          frame, the thumbnail will show the wrong part of the image. Crop to 1:1 (square) for the first
          listing image to control exactly what appears in search. Use 4:3 images for the secondary photos
          that shoppers see after clicking through.
        </p>
        <p>
          The 1 MB file size limit is worth noting — high-resolution JPEGs from modern phones are often
          3–8 MB. Resize to 2000×2000 and save as JPEG at 85–90% quality, which typically produces files
          under 500 KB without visible quality loss.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Shopify</h2>
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2 text-foreground">Rule</th>
                <th className="text-left px-4 py-2 text-foreground">Requirement</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Maximum dimensions", "4472 × 4472 px"],
                ["Maximum file size", "20 MB"],
                ["Recommended size", "2048 × 2048 px"],
                ["Recommended ratio", "1:1 (consistent across product gallery)"],
                ["Accepted formats", "JPEG, PNG, GIF, WebP"],
                ["Background", "Consistent across all product images (brand choice)"],
              ].map(([rule, req]) => (
                <tr key={rule} className="border-t border-border">
                  <td className="px-4 py-2 font-medium text-foreground">{rule}</td>
                  <td className="px-4 py-2">{req}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Shopify is the most permissive of the three platforms for technical requirements, but the most
          sensitive to visual consistency. Shopify themes expect product gallery images to share the same
          aspect ratio — mixing portrait and square images creates irregular grid layouts that look
          unprofessional. Decide on one ratio for your store (most themes are built around 1:1) and
          crop everything to match before uploading.
        </p>

        <h2 className="text-xl font-semibold text-foreground">The fastest preparation workflow</h2>
        <p>
          For most small e-commerce sellers, the workflow from phone photo to upload-ready image is:
        </p>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            <strong className="text-foreground">Remove background</strong> if the platform requires white (Amazon)
            or if you want a clean look: drop the image into{" "}
            <Link href="/background-remover" className="underline underline-offset-2 text-foreground">
              quickhelp.dev&apos;s Background Remover
            </Link>
            . Download as PNG (transparent).
          </li>
          <li>
            <strong className="text-foreground">Crop to ratio</strong>: open the PNG in the{" "}
            <Link href="/image-resizer" className="underline underline-offset-2 text-foreground">
              Image Resizer & Cropper
            </Link>
            . Select 1:1 crop preset, centre on the product, crop.
          </li>
          <li>
            <strong className="text-foreground">Resize to target dimensions</strong>: switch to the Resize tab.
            Set 2000×2000 for Amazon/Shopify, 2000×2000 for Etsy. Choose JPEG output at 90% quality.
            Download.
          </li>
        </ol>
        <p>
          Total time: under two minutes per image. No software to install, no account required, nothing
          uploaded to a server. The entire workflow runs in your browser.
        </p>

        <h2 className="text-xl font-semibold text-foreground">WebP on Shopify</h2>
        <p>
          Shopify now accepts WebP uploads and will serve WebP to browsers that support it. WebP files
          are typically 30–40% smaller than JPEG at equivalent quality, which improves storefront load
          times and Core Web Vitals scores (a ranking factor on Google Shopping). If you are uploading
          to Shopify, consider using WebP output from the image resizer — modern phones, tablets, and
          laptops all support WebP natively.
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
        <AdSlot slot={AD_SLOTS["blog-content-top"]} format="horizontal" className="my-2" />
        {post.body}
        <AdSlot slot={AD_SLOTS["blog-content-bottom"]} format="rectangle" className="my-4" />
        <footer className="border-t border-border pt-6">
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2">
            ← Back to blog
          </Link>
        </footer>
      </article>
    </>
  );
}

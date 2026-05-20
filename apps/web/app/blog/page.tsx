import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbJsonLd } from "@quickhelp/tool-kit";
import { JsonLd } from "@quickhelp/seo";

export const dynamic = "force-static";

export const metadata = buildMetadata({
  path: "/blog",
  title: "Blog",
  description: "Technical articles about developer tools, image formats, JWT, JSON, and building agent-native APIs on quickhelp.dev.",
  keywords: ["developer blog", "technical articles", "JWT guide", "JSON guide", "image conversion", "WebAssembly", "MCP"],
});

// Seed posts — replace with MDX loader once content/blog/*.mdx files are added
const POSTS = [
  {
    slug: "how-to-decode-jwt-safely",
    title: "How to decode a JWT safely in 2026 (no signature verification)",
    date: "2026-05-18",
    summary:
      "Learn how to read JWT header and payload without needing the signing secret, when this is safe, and when it isn't.",
    readingTime: "5 min read",
  },
  {
    slug: "png-vs-webp-vs-avif-benchmark",
    title: "PNG vs WebP vs AVIF: a 2026 benchmark using our converter",
    date: "2026-05-15",
    summary:
      "We converted 100 images across three formats and measured file size and quality. Here are the numbers.",
    readingTime: "8 min read",
  },
  {
    slug: "background-removal-in-browser",
    title: "Why we run background removal in your browser, not on a server",
    date: "2026-05-12",
    summary:
      "Server-side AI costs money per call. WebAssembly doesn't. Here's how we ship AI tools for free using ONNX Runtime Web.",
    readingTime: "6 min read",
  },
  {
    slug: "json-formatter-benchmarks",
    title: "JSON formatter benchmarks: which approach is fastest?",
    date: "2026-05-10",
    summary:
      "Comparing JSON.stringify, streaming parsers, and tree-diffing approaches across 1 KB to 1 MB payloads.",
    readingTime: "7 min read",
  },
  {
    slug: "how-to-view-lcov-coverage-reports",
    title: "How to view LCOV coverage reports online (no setup required)",
    date: "2026-05-20",
    summary:
      "LCOV reports from Jest, Vitest, Istanbul, and coverage.py are just text files. Here's how to read them without installing anything.",
    readingTime: "6 min read",
  },
  {
    slug: "understanding-lcov-coverage-metrics",
    title: "Line, function, and branch coverage: what the numbers actually mean",
    date: "2026-05-19",
    summary:
      "Your CI shows 82% coverage. Is that good? Depends entirely on which metric you're measuring — and most teams are measuring the wrong one.",
    readingTime: "7 min read",
  },
  {
    slug: "image-sizes-for-social-media-2026",
    title: "Image sizes for every social media platform in 2026: the complete guide",
    date: "2026-05-17",
    summary:
      "Instagram, LinkedIn, X, Facebook, YouTube — every platform has different required dimensions. Here are the exact pixel values and how to hit them in seconds.",
    readingTime: "8 min read",
  },
  {
    slug: "how-to-crop-images-for-web",
    title: "How to crop images to the perfect aspect ratio for web and social media",
    date: "2026-05-16",
    summary:
      "1:1 for Instagram, 16:9 for YouTube, 4:3 for blog — understanding aspect ratios means your images never get cut off or stretched again.",
    readingTime: "5 min read",
  },
  {
    slug: "resize-product-photos-for-etsy-amazon-shopify",
    title: "How to resize and prepare product photos for Etsy, Amazon, and Shopify",
    date: "2026-05-14",
    summary:
      "Each marketplace has different image requirements. Here's how to get clean, correctly sized product photos without paying for Photoshop.",
    readingTime: "6 min read",
  },
];

export default function BlogPage() {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "Blog", url: `${baseUrl}/blog` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <div className="mx-auto max-w-3xl space-y-8 py-4">
        <header>
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="mt-2 text-muted-foreground">
            Technical articles about developer tools, image formats, and building agent-native APIs.
          </p>
        </header>

        <ul className="space-y-6">
          {POSTS.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block space-y-1">
                <time
                  dateTime={post.date}
                  className="text-xs font-mono text-muted-foreground"
                >
                  {post.date}
                </time>
                <h2 className="text-lg font-semibold group-hover:underline underline-offset-2">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground">{post.summary}</p>
                <span className="text-xs text-muted-foreground">{post.readingTime}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

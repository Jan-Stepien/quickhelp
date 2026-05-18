/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  transpilePackages: [
    "@quickhelp/ui",
    "@quickhelp/seo",
    "@quickhelp/analytics",
    "@quickhelp/tool-kit",
    "@quickhelp/agent-sdk",
    "@quickhelp/tools-jwt-decoder",
    "@quickhelp/tools-json-formatter",
    "@quickhelp/tools-image-converter",
    "@quickhelp/tools-background-remover",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },
  async headers() {
    return [
      // Security headers for all routes
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      // Agent-facing discovery surfaces: open CORS + aggressive caching
      {
        source: "/(openapi\\.json|llms\\.txt|llms-full\\.txt|sitemap\\.xml|robots\\.txt)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      // API responses: noindex (page UI is what gets indexed, not raw JSON)
      {
        source: "/api/(.*)",
        headers: [
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },
  // Keep sharp out of the webpack bundle — loaded by Node at runtime
  experimental: {
    serverComponentsExternalPackages: [
      "sharp",
      // onnxruntime-web and background-removal are browser-only; prevent server bundling
      "@imgly/background-removal",
      "onnxruntime-web",
    ],
    optimizePackageImports: ["lucide-react"],
  },
  webpack(config) {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };

    // ort.bundle.min.mjs uses `new URL("ort.bundle.min.mjs", import.meta.url)` to build a
    // proxy-worker URL. Webpack replaces import.meta.url with the build-time file:// path;
    // that path starts with "file:" so a branch executes that calls new URL(moduleObject, …),
    // and moduleObject.replace() throws "e.replace is not a function" at runtime.
    // The loader rewrites import.meta.url to globalThis.location?.href before webpack sees the
    // file; at runtime that's an http:// URL, the "file:" branch is never taken, no crash.
    config.module.rules.push({
      test: /ort\.bundle\.min\.mjs$/,
      include: /node_modules[\\/]onnxruntime-web/,
      use: [{ loader: new URL("./onnx-import-meta-patch.cjs", import.meta.url).pathname }],
      type: "javascript/auto",
      resolve: { fullySpecified: false },
    });

    // Fix: @imgly/background-removal and other node_modules .mjs files mix ESM import with
    // createRequire(). Webpack's default CJS processing fails on the bare `import` keyword.
    // "javascript/auto" lets webpack pass them through.
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
      resolve: { fullySpecified: false },
    });

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    return config;
  },
};

export default nextConfig;

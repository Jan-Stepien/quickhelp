/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Keep sharp out of the webpack bundle — loaded by Node at runtime
  experimental: {
    serverComponentsExternalPackages: [
      "sharp",
      // onnxruntime-web and background-removal are browser-only; prevent server bundling
      "@imgly/background-removal",
      "onnxruntime-web",
    ],
  },
  webpack(config) {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };

    // Fix: onnxruntime-web ships .mjs files that mix ESM import with createRequire(import.meta.url).
    // Webpack's default CJS processing fails on the bare `import` keyword.
    // Treating node_modules .mjs files as "javascript/auto" lets webpack pass them through.
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

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "quickhelp.dev — Developer Tools",
    short_name: "quickhelp",
    description:
      "Small, deterministic utility tools — each with a human UI, REST API, OpenAPI schema, and MCP server entry.",
    start_url: "/",
    display: "minimal-ui",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}

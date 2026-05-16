import type { Tool } from "@no-work/tool-kit";
import { jwtDecoder } from "@no-work/tools-jwt-decoder";
import { jsonFormatter } from "@no-work/tools-json-formatter";
import { imageConverter } from "@no-work/tools-image-converter";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTool = Tool<any, any>;

export const registry: AnyTool[] = [jwtDecoder, jsonFormatter, imageConverter];

export function getToolBySlug(slug: string): AnyTool | undefined {
  return registry.find((t) => t.slug === slug);
}

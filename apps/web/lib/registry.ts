import type { Tool } from "@quickhelp/tool-kit";
import { jwtDecoder } from "@quickhelp/tools-jwt-decoder";
import { jsonFormatter } from "@quickhelp/tools-json-formatter";
import { imageConverter } from "@quickhelp/tools-image-converter";
import { backgroundRemover } from "@quickhelp/tools-background-remover";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTool = Tool<any, any>;

export const registry: AnyTool[] = [jwtDecoder, jsonFormatter, imageConverter, backgroundRemover];

export function getToolBySlug(slug: string): AnyTool | undefined {
  return registry.find((t) => t.slug === slug);
}

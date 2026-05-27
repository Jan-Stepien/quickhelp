import type { Tool } from "@quickhelp/tool-kit";
import { jwtDecoder } from "@quickhelp/tools-jwt-decoder";
import { jsonFormatter } from "@quickhelp/tools-json-formatter";
import { imageConverter } from "@quickhelp/tools-image-converter";
import { backgroundRemover } from "@quickhelp/tools-background-remover";
import { lcovViewer } from "@quickhelp/tools-lcov-viewer";
import { imageResizer } from "@quickhelp/tools-image-resizer";
import { base64 } from "@quickhelp/tools-base64";
import { hashGenerator } from "@quickhelp/tools-hash-generator";
import { urlEncoder } from "@quickhelp/tools-url-encoder";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTool = Tool<any, any>;

export const registry: AnyTool[] = [jwtDecoder, jsonFormatter, imageConverter, backgroundRemover, lcovViewer, imageResizer, base64, hashGenerator, urlEncoder];

export function getToolBySlug(slug: string): AnyTool | undefined {
  return registry.find((t) => t.slug === slug);
}

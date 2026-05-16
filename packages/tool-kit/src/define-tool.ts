import type { z } from "zod";
import type { Tool } from "./types.js";

export function defineTool<
  TInput extends z.ZodTypeAny,
  TOutput extends z.ZodTypeAny,
>(tool: Tool<TInput, TOutput>): Tool<TInput, TOutput> {
  return tool;
}

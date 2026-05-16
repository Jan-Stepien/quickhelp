import type { z } from "zod";

export type Category =
  | "encoding"
  | "formatting"
  | "conversion"
  | "generation"
  | "validation"
  | "cryptography"
  | "network"
  | "text"
  | "datetime"
  | "other";

export interface HowToStep {
  name: string;
  text: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ToolContent {
  whatIs: string;
  howToSteps: HowToStep[];
  faq: FaqItem[];
  relatedTools?: string[];
}

export interface ToolAttribution {
  text: string;
  url: string;
}

export interface ToolExample {
  title: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
}

export interface SchemaOrg {
  name: string;
  description: string;
  url: string;
}

export interface Tool<
  TInput extends z.ZodTypeAny = z.ZodTypeAny,
  TOutput extends z.ZodTypeAny = z.ZodTypeAny,
> {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  category: Category;
  inputSchema: TInput;
  outputSchema: TOutput;
  examples: ToolExample[];
  handler: (input: z.infer<TInput>) => z.infer<TOutput> | Promise<z.infer<TOutput>>;
  schemaOrg: SchemaOrg;
  attribution?: ToolAttribution;
  content?: ToolContent;
  inputUiHints?: Record<string, { type: "text" | "textarea" | "file" | "select"; accept?: string; options?: string[] }>;
}

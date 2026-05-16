import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { defineTool } from "./define-tool.js";
import { manifestToJsonLd } from "./json-ld.js";

const testTool = defineTool({
  id: "test-tool",
  slug: "test-tool",
  name: "Test Tool",
  summary: "A test tool",
  description: "A tool used in tests",
  category: "other",
  inputSchema: z.object({ value: z.string() }),
  outputSchema: z.object({ result: z.string() }),
  examples: [],
  handler: ({ value }) => ({ result: value }),
  schemaOrg: { name: "Test Tool", description: "A test tool", url: "https://example.com/test-tool" },
  content: {
    whatIs: "A test tool",
    howToSteps: [{ name: "Step 1", text: "Do something" }],
    faq: [{ question: "What is this?", answer: "A test" }],
  },
});

describe("manifestToJsonLd", () => {
  it("includes SoftwareApplication and WebAPI", () => {
    const ld = manifestToJsonLd(testTool, "https://example.com");
    const types = ld.map((n) => n["@type"]);
    assert.ok(types.includes("SoftwareApplication"));
    assert.ok(types.includes("WebAPI"));
  });

  it("includes HowTo when howToSteps present", () => {
    const ld = manifestToJsonLd(testTool, "https://example.com");
    const types = ld.map((n) => n["@type"]);
    assert.ok(types.includes("HowTo"));
  });

  it("includes FAQPage when faq present", () => {
    const ld = manifestToJsonLd(testTool, "https://example.com");
    const types = ld.map((n) => n["@type"]);
    assert.ok(types.includes("FAQPage"));
  });

  it("omits HowTo and FAQPage when content absent", () => {
    const { content: _, ...toolWithoutContent } = testTool;
    const ld = manifestToJsonLd(toolWithoutContent as typeof testTool, "https://example.com");
    const types = ld.map((n) => n["@type"]);
    assert.ok(!types.includes("HowTo"));
    assert.ok(!types.includes("FAQPage"));
  });

  it("generates correct URLs", () => {
    const ld = manifestToJsonLd(testTool, "https://example.com");
    const app = ld.find((n) => n["@type"] === "SoftwareApplication") as Record<string, unknown>;
    assert.equal(app["url"], "https://example.com/test-tool");
    const api = ld.find((n) => n["@type"] === "WebAPI") as Record<string, unknown>;
    assert.equal(api["url"], "https://example.com/api/test-tool");
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { defineTool } from "@quickhelp/tool-kit";
import { buildOpenAPI } from "./build-openapi.js";
import { buildLlmsTxt } from "./build-llms-txt.js";
import { buildSitemap } from "./build-sitemap.js";
import { buildMcpTools } from "./build-mcp-tools.js";
import { buildToolJsonLd } from "./build-tool-json-ld.js";

const tool = defineTool({
  id: "test-tool",
  slug: "test-tool",
  name: "Test Tool",
  summary: "A test tool",
  description: "Used in tests",
  category: "other",
  inputSchema: z.object({ value: z.string().describe("Input value") }),
  outputSchema: z.object({ result: z.string() }),
  examples: [{ title: "Basic", input: { value: "hello" }, output: { result: "hello" } }],
  handler: ({ value }) => ({ result: value }),
  schemaOrg: { name: "Test Tool", description: "A test tool", url: "https://example.com/test-tool" },
});

describe("buildOpenAPI", () => {
  it("produces valid OpenAPI 3.1 structure", () => {
    const doc = buildOpenAPI([tool], { baseUrl: "https://example.com" });
    assert.equal(doc.openapi, "3.1.0");
    assert.ok(doc.paths["/api/test-tool"]);
  });

  it("includes operationId and tags", () => {
    const doc = buildOpenAPI([tool]);
    const op = (doc.paths["/api/test-tool"] as Record<string, unknown>)["post"] as Record<string, unknown>;
    assert.equal(op["operationId"], "test-tool");
    assert.deepEqual(op["tags"], ["other"]);
  });

  it("handles multiple tools", () => {
    const tool2 = defineTool({ ...tool, id: "tool-2", slug: "tool-2" });
    const doc = buildOpenAPI([tool, tool2]);
    assert.ok(doc.paths["/api/test-tool"]);
    assert.ok(doc.paths["/api/tool-2"]);
  });
});

describe("buildLlmsTxt", () => {
  it("contains tool name and slug", () => {
    const txt = buildLlmsTxt([tool], "https://example.com");
    assert.ok(txt.includes("Test Tool"));
    assert.ok(txt.includes("test-tool"));
  });

  it("contains API and UI URLs", () => {
    const txt = buildLlmsTxt([tool], "https://example.com");
    assert.ok(txt.includes("https://example.com/api/test-tool"));
    assert.ok(txt.includes("https://example.com/test-tool"));
  });

  it("includes example", () => {
    const txt = buildLlmsTxt([tool]);
    assert.ok(txt.includes("Basic"));
  });
});

describe("buildSitemap", () => {
  it("is valid XML with tool URL", () => {
    const xml = buildSitemap([tool], "https://example.com");
    assert.ok(xml.startsWith("<?xml"));
    assert.ok(xml.includes("https://example.com/test-tool"));
  });

  it("includes static routes", () => {
    const xml = buildSitemap([tool], "https://example.com");
    assert.ok(xml.includes("https://example.com/tools"));
    assert.ok(xml.includes("https://example.com/openapi.json"));
  });
});

describe("buildMcpTools", () => {
  it("maps tool to MCP definition", () => {
    const defs = buildMcpTools([tool]);
    assert.equal(defs.length, 1);
    assert.equal(defs[0]!.name, "test-tool");
    assert.equal(defs[0]!.inputSchema.type, "object");
    assert.ok(defs[0]!.inputSchema.properties["value"]);
  });
});

describe("buildToolJsonLd", () => {
  it("returns array with SoftwareApplication", () => {
    const ld = buildToolJsonLd(tool, "https://example.com");
    const types = ld.map((n) => n["@type"]);
    assert.ok(types.includes("SoftwareApplication"));
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { zodToJsonSchema } from "./zod-helpers.js";

describe("zodToJsonSchema", () => {
  it("converts ZodString", () => {
    const schema = zodToJsonSchema(z.string().min(1).max(100).describe("A string"));
    assert.equal(schema.type, "string");
    assert.equal(schema.minLength, 1);
    assert.equal(schema.maxLength, 100);
    assert.equal(schema.description, "A string");
  });

  it("converts ZodNumber", () => {
    const schema = zodToJsonSchema(z.number().min(0).max(255));
    assert.equal(schema.type, "number");
    assert.equal(schema.minimum, 0);
    assert.equal(schema.maximum, 255);
  });

  it("converts ZodNumber with int()", () => {
    const schema = zodToJsonSchema(z.number().int());
    assert.equal(schema.type, "integer");
  });

  it("converts ZodBoolean", () => {
    const schema = zodToJsonSchema(z.boolean());
    assert.equal(schema.type, "boolean");
  });

  it("converts ZodEnum", () => {
    const schema = zodToJsonSchema(z.enum(["a", "b", "c"]));
    assert.equal(schema.type, "string");
    assert.deepEqual(schema.enum, ["a", "b", "c"]);
  });

  it("converts ZodObject with required and optional fields", () => {
    const schema = zodToJsonSchema(
      z.object({ name: z.string(), age: z.number().optional() })
    );
    assert.equal(schema.type, "object");
    assert.ok(schema.properties?.["name"]);
    assert.ok(schema.properties?.["age"]);
    assert.deepEqual(schema.required, ["name"]);
  });

  it("converts ZodArray", () => {
    const schema = zodToJsonSchema(z.array(z.string()));
    assert.equal(schema.type, "array");
    assert.equal(schema.items?.type, "string");
  });

  it("converts ZodOptional by unwrapping", () => {
    const schema = zodToJsonSchema(z.string().optional());
    assert.equal(schema.type, "string");
  });

  it("converts ZodDefault", () => {
    const schema = zodToJsonSchema(z.string().default("hello"));
    assert.equal(schema.type, "string");
    assert.equal(schema.default, "hello");
  });
});

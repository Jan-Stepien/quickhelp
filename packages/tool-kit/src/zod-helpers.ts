import { z } from "zod";

type JsonSchemaType = "string" | "number" | "integer" | "boolean" | "object" | "array" | "null";

interface JsonSchemaProperty {
  type?: JsonSchemaType | JsonSchemaType[];
  description?: string;
  enum?: unknown[];
  items?: JsonSchema;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  default?: unknown;
  nullable?: boolean;
}

export type JsonSchema = JsonSchemaProperty;

export function zodToJsonSchema(schema: z.ZodTypeAny): JsonSchema {
  return _convert(schema);
}

function _convert(schema: z.ZodTypeAny): JsonSchema {
  if (schema instanceof z.ZodString) {
    const result: JsonSchema = { type: "string" };
    const checks = (schema as z.ZodString)._def.checks;
    for (const check of checks) {
      if (check.kind === "min") result.minLength = check.value;
      if (check.kind === "max") result.maxLength = check.value;
    }
    const description = schema.description;
    if (description) result.description = description;
    return result;
  }

  if (schema instanceof z.ZodNumber) {
    const result: JsonSchema = { type: "number" };
    const checks = (schema as z.ZodNumber)._def.checks;
    for (const check of checks) {
      if (check.kind === "min") result.minimum = check.value;
      if (check.kind === "max") result.maximum = check.value;
      if (check.kind === "int") result.type = "integer";
    }
    const description = schema.description;
    if (description) result.description = description;
    return result;
  }

  if (schema instanceof z.ZodBoolean) {
    const result: JsonSchema = { type: "boolean" };
    const description = schema.description;
    if (description) result.description = description;
    return result;
  }

  if (schema instanceof z.ZodEnum) {
    const result: JsonSchema = { type: "string", enum: (schema as z.ZodEnum<[string, ...string[]]>).options };
    const description = schema.description;
    if (description) result.description = description;
    return result;
  }

  if (schema instanceof z.ZodArray) {
    const result: JsonSchema = { type: "array", items: _convert((schema as z.ZodArray<z.ZodTypeAny>).element) };
    const description = schema.description;
    if (description) result.description = description;
    return result;
  }

  if (schema instanceof z.ZodObject) {
    const shape = (schema as z.ZodObject<z.ZodRawShape>).shape;
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];
    for (const [key, value] of Object.entries(shape)) {
      properties[key] = _convert(value as z.ZodTypeAny);
      if (!(value instanceof z.ZodOptional)) {
        required.push(key);
      }
    }
    const result: JsonSchema = { type: "object", properties };
    if (required.length > 0) result.required = required;
    const description = schema.description;
    if (description) result.description = description;
    return result;
  }

  if (schema instanceof z.ZodOptional) {
    return _convert((schema as z.ZodOptional<z.ZodTypeAny>).unwrap());
  }

  if (schema instanceof z.ZodNullable) {
    const inner = _convert((schema as z.ZodNullable<z.ZodTypeAny>).unwrap());
    return { ...inner, nullable: true };
  }

  if (schema instanceof z.ZodDefault) {
    const inner = _convert((schema as z.ZodDefault<z.ZodTypeAny>)._def.innerType);
    return { ...inner, default: (schema as z.ZodDefault<z.ZodTypeAny>)._def.defaultValue() };
  }

  if (schema instanceof z.ZodLiteral) {
    const val = (schema as z.ZodLiteral<unknown>).value;
    const type = typeof val as JsonSchemaType;
    return { type, enum: [val] };
  }

  return {};
}

export function zodToOpenAPI(schema: z.ZodTypeAny): JsonSchema {
  const base = zodToJsonSchema(schema);
  // OpenAPI 3.1 uses nullable inline, same as our JsonSchema — no transform needed
  return base;
}

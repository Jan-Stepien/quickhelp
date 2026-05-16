import { NextRequest, NextResponse } from "next/server";
import { generate } from "@/lib/claude";

// REPLACE: system prompt and user message construction
const SYSTEM_PROMPT = `You are a helpful assistant that [describe what this tool does].

Rules:
- Be concise and practical
- Output ready-to-use content, not explanations
- Format output as plain text unless specified otherwise`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // REPLACE: destructure your actual form fields
    const { field1, field2 } = body;

    if (!field1 || !field2) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // REPLACE: construct the user message from your form fields
    const userMessage = `
Field 1: ${field1}
Field 2: ${field2}

Generate [output type] based on the above.
    `.trim();

    const result = await generate(SYSTEM_PROMPT, userMessage);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}

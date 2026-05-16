/**
 * Tolerant JSON pre-parser — fixes common mistakes before JSON.parse.
 * Handles: trailing commas, single-quoted strings, // and /* comments, unquoted keys.
 */
export function repairJson(input: string): string {
  let s = input;

  // Remove /* ... */ block comments
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");

  // Remove // line comments (but not inside strings)
  s = s.replace(/("(?:[^"\\]|\\.)*")|\/\/[^\n]*/g, (m, str) => (str ? str : ""));

  // Replace single-quoted strings with double-quoted
  s = s.replace(/'(?:[^'\\]|\\.)*'/g, (m) => `"${m.slice(1, -1).replace(/"/g, '\\"').replace(/\\'/g, "'")}"`);

  // Quote bare/unquoted object keys (word characters before a colon)
  s = s.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, '$1"$2"$3');

  // Remove trailing commas before } or ]
  s = s.replace(/,(\s*[}\]])/g, "$1");

  return s;
}

export function extractErrorPosition(err: unknown): { line: number; column: number } | null {
  if (!(err instanceof SyntaxError)) return null;
  const msg = err.message;
  // "JSON Parse error: ... at position N" (Safari)
  const posMatch = /position (\d+)/i.exec(msg);
  if (posMatch) {
    const pos = parseInt(posMatch[1]!, 10);
    return posToLineCol(msg, pos);
  }
  // "Unexpected token X in JSON at position N" (V8)
  const v8Match = /at position (\d+)/.exec(msg);
  if (v8Match) {
    const pos = parseInt(v8Match[1]!, 10);
    return posToLineCol(msg, pos);
  }
  // "… line N column N …" (Firefox)
  const lcMatch = /line (\d+) column (\d+)/.exec(msg);
  if (lcMatch) return { line: parseInt(lcMatch[1]!, 10), column: parseInt(lcMatch[2]!, 10) };
  return null;
}

function posToLineCol(_text: string, pos: number): { line: number; column: number } {
  // We don't have the original text here, so return a rough approximation
  void pos;
  return { line: 1, column: pos + 1 };
}

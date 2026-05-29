import { z } from "zod";
import { defineTool } from "@quickhelp/tool-kit";

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = val;
    }
  }
  return result;
}

export const jsonToCsv = defineTool({
  id: "json-to-csv",
  slug: "json-to-csv",
  name: "JSON to CSV Converter",
  summary: "Convert a JSON array of objects to CSV, or parse CSV back to JSON.",
  description:
    "Convert a JSON array of objects to a comma-separated values (CSV) file with a header row, or parse a CSV string back to a JSON array. Handles nested objects by dot-notation flattening (e.g. address.city), quoted fields with embedded commas or newlines, and configurable delimiters (comma, semicolon, tab).",
  category: "formatting",
  inputSchema: z.object({
    input: z.string().min(1).describe("A JSON array of objects (e.g. [{\"name\":\"Alice\"}]) or a CSV string to parse back to JSON"),
    mode: z
      .enum(["json-to-csv", "csv-to-json"])
      .default("json-to-csv")
      .describe("json-to-csv — convert JSON array to CSV; csv-to-json — parse CSV to JSON array"),
    delimiter: z
      .enum([",", ";", "\t"])
      .default(",")
      .describe("Field delimiter character: , (comma), ; (semicolon), or \\t (tab)"),
    flatten: z
      .boolean()
      .default(true)
      .describe("When true, nested objects are flattened using dot notation (address.city). When false, nested objects are JSON-stringified in the cell."),
  }),
  outputSchema: z.object({
    output: z.string().describe("The converted CSV or JSON string"),
    row_count: z.number().int().describe("Number of data rows (excluding header)"),
    column_count: z.number().int().describe("Number of columns"),
    columns: z.array(z.string()).describe("Column headers"),
    mode: z.enum(["json-to-csv", "csv-to-json"]),
    error: z.string().optional(),
  }),
  examples: [
    {
      title: "JSON array to CSV",
      input: {
        input: '[{"name":"Alice","age":30,"city":"London"},{"name":"Bob","age":25,"city":"Paris"}]',
        mode: "json-to-csv",
        delimiter: ",",
        flatten: true,
      },
      output: {
        output: "name,age,city\nAlice,30,London\nBob,25,Paris",
        row_count: 2,
        column_count: 3,
        columns: ["name", "age", "city"],
        mode: "json-to-csv",
      },
    },
    {
      title: "CSV to JSON array",
      input: {
        input: "name,age,city\nAlice,30,London\nBob,25,Paris",
        mode: "csv-to-json",
        delimiter: ",",
        flatten: true,
      },
      output: {
        output: '[{"name":"Alice","age":"30","city":"London"},{"name":"Bob","age":"25","city":"Paris"}]',
        row_count: 2,
        column_count: 3,
        columns: ["name", "age", "city"],
        mode: "csv-to-json",
      },
    },
    {
      title: "Nested object flattening",
      input: {
        input: '[{"name":"Alice","address":{"city":"London","zip":"EC1A"}}]',
        mode: "json-to-csv",
        delimiter: ",",
        flatten: true,
      },
      output: {
        output: "name,address.city,address.zip\nAlice,London,EC1A",
        row_count: 1,
        column_count: 3,
        columns: ["name", "address.city", "address.zip"],
        mode: "json-to-csv",
      },
    },
  ],
  handler({ input, mode, delimiter, flatten }) {
    try {
      if (mode === "json-to-csv") {
        let parsed: unknown;
        try {
          parsed = JSON.parse(input.trim());
        } catch {
          return { output: "", row_count: 0, column_count: 0, columns: [], mode, error: "Invalid JSON: " + (input.length > 80 ? input.slice(0, 80) + "…" : input) };
        }

        if (!Array.isArray(parsed)) {
          return { output: "", row_count: 0, column_count: 0, columns: [], mode, error: "Input must be a JSON array of objects." };
        }

        if (parsed.length === 0) {
          return { output: "", row_count: 0, column_count: 0, columns: [], mode };
        }

        // Collect all columns across all rows (union)
        const colSet = new Set<string>();
        const rows: Record<string, unknown>[] = parsed.map((row) => {
          if (typeof row !== "object" || row === null || Array.isArray(row)) return { value: row };
          const r = flatten ? flattenObject(row as Record<string, unknown>) : (row as Record<string, unknown>);
          Object.keys(r).forEach((k) => colSet.add(k));
          return r;
        });
        const columns = Array.from(colSet);

        const headerRow = columns.map(escapeCell).join(delimiter);
        const dataRows = rows.map((row) =>
          columns.map((col) => escapeCell(row[col])).join(delimiter)
        );
        const output = [headerRow, ...dataRows].join("\n");

        return { output, row_count: dataRows.length, column_count: columns.length, columns, mode };
      } else {
        // csv-to-json
        const lines = input.split(/\r?\n/).filter((l) => l.trim() !== "");
        if (lines.length < 2) {
          return { output: "[]", row_count: 0, column_count: 0, columns: [], mode };
        }

        const parseRow = (line: string): string[] => {
          const cells: string[] = [];
          let cur = "";
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i]!;
            if (ch === '"') {
              if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
              else inQuotes = !inQuotes;
            } else if (ch === delimiter && !inQuotes) {
              cells.push(cur); cur = "";
            } else {
              cur += ch;
            }
          }
          cells.push(cur);
          return cells;
        };

        const columns = parseRow(lines[0]!);
        const result = lines.slice(1).map((line) => {
          const values = parseRow(line);
          const obj: Record<string, string> = {};
          columns.forEach((col, i) => { obj[col] = values[i] ?? ""; });
          return obj;
        });

        return {
          output: JSON.stringify(result, null, 2),
          row_count: result.length,
          column_count: columns.length,
          columns,
          mode,
        };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return { output: "", row_count: 0, column_count: 0, columns: [], mode, error: msg };
    }
  },
  schemaOrg: {
    name: "JSON to CSV Converter",
    description: "Convert a JSON array of objects to CSV, or parse CSV back to a JSON array.",
    url: "https://quickhelp.dev/json-to-csv",
  },
  attribution: {
    text: "Converted by quickhelp.dev/json-to-csv",
    url: "https://quickhelp.dev/json-to-csv",
  },
  content: {
    whatIs:
      "JSON (JavaScript Object Notation) and CSV (Comma-Separated Values) are the two most common formats for exchanging tabular data. JSON is the native format for REST APIs, NoSQL databases, and JavaScript applications. CSV is the native format for spreadsheet tools like Excel and Google Sheets, SQL import utilities, data pipelines, and business reporting tools. Converting between them is one of the most frequent data engineering tasks: you might export an API response to a spreadsheet for analysis, import a CSV upload into a database, or transform a data warehouse export into JSON for an API. This tool converts a JSON array of objects to a CSV with a header row derived from the object keys, or parses a CSV back to a JSON array. Nested objects are optionally flattened using dot-notation keys (address.city) so the entire structure fits into a flat table.",
    howToSteps: [
      {
        name: "Paste your JSON array or CSV",
        text: "For JSON-to-CSV: paste a JSON array of objects (e.g. [{\"name\":\"Alice\",\"age\":30}]). For CSV-to-JSON: paste a CSV string with a header row as the first line.",
      },
      {
        name: "Choose mode and delimiter",
        text: "Select 'json-to-csv' or 'csv-to-json'. Choose the field delimiter — comma is the universal default; semicolon is common in European locales where comma is the decimal separator; tab (TSV) is used by Excel exports and some databases.",
      },
      {
        name: "Copy the output",
        text: "The converted CSV or JSON appears instantly. For CSV output, paste it directly into a spreadsheet or save it as a .csv file. For JSON output, paste it into your application or use it in a script.",
      },
    ],
    faq: [
      {
        question: "What happens to nested objects?",
        answer:
          "With flatten enabled (the default), nested objects are expanded using dot-notation keys. For example, {address: {city: 'London'}} becomes a column named 'address.city'. With flatten disabled, the nested object is JSON-stringified and placed in a single cell.",
      },
      {
        question: "What if my CSV values contain commas or newlines?",
        answer:
          "The converter follows RFC 4180: values containing the delimiter, double quotes, or newlines are enclosed in double quotes, and any double quotes within the value are escaped as two consecutive double quotes. The CSV-to-JSON parser handles this correctly.",
      },
      {
        question: "Does the JSON-to-CSV converter handle arrays of arrays or mixed types?",
        answer:
          "The converter expects a JSON array of flat objects. Arrays of arrays are not tabular data and cannot be meaningfully converted to CSV. Mixed types (some rows have extra fields) are handled by taking the union of all keys across all rows and leaving cells empty where a field is absent.",
      },
    ],
    relatedTools: ["json-formatter", "text-case-converter"],
    useCases: [
      {
        slug: "convert-json-to-csv-spreadsheet",
        title: "How to convert a JSON API response to a CSV spreadsheet",
        intent: "Export API data to a CSV file for analysis in Excel or Google Sheets.",
        intro:
          "REST APIs return data as JSON, but business users want spreadsheets. Converting an API response to CSV lets you open it in Excel, share it by email, or import it into a reporting tool — without writing a Python script or installing software. This guide shows how to convert any JSON array response to a CSV file you can open directly in a spreadsheet.",
        steps: [
          {
            name: "Copy the JSON array from the API response",
            text: "Use your browser's DevTools Network tab, Postman, or curl to capture the API response. Copy the JSON array — it should look like [{...}, {...}]. If the array is nested inside a wrapper object, extract just the array.",
          },
          {
            name: "Paste and convert",
            text: "Paste the JSON into the converter with mode set to 'json-to-csv'. The header row is generated from the keys of the first object. Enable 'flatten' if the response contains nested objects like address or metadata.",
          },
          {
            name: "Save as .csv and open in Excel",
            text: "Copy the output, paste it into a text editor, and save with a .csv extension. Open in Excel or drag into Google Sheets. All column headers and values appear in the correct cells.",
          },
        ],
        faq: [
          {
            question: "Why does my data appear in one column in Excel?",
            answer:
              "Excel uses the system locale's list separator. In European locales, Excel expects semicolons instead of commas. Re-run the conversion with delimiter set to ';', or use Excel's Data → Text to Columns wizard to split the single column.",
          },
          {
            question: "What if the JSON array has thousands of rows?",
            answer:
              "The REST API accepts up to 1 MB of input. For larger datasets, use Node.js: const rows = JSON.parse(fs.readFileSync('data.json')); const headers = Object.keys(rows[0]); const csv = [headers, ...rows.map(r => headers.map(h => r[h]))].map(r => r.join(',')).join('\\n'); fs.writeFileSync('data.csv', csv);",
          },
        ],
      },
      {
        slug: "convert-csv-to-json",
        title: "How to convert a CSV file to JSON",
        intent: "Parse a CSV export from a database or spreadsheet into a JSON array for use in code.",
        intro:
          "Database exports, CRM data dumps, and spreadsheet reports arrive as CSV files. Modern applications expect JSON. Converting CSV to JSON lets you feed that data into a REST API, import it into MongoDB, or process it with JavaScript without a heavyweight ETL tool. This guide shows how to parse any CSV to a clean JSON array in seconds.",
        steps: [
          {
            name: "Open the CSV and copy its contents",
            text: "Open the .csv file in a text editor (not Excel — Excel may reformat values). Copy all content including the header row.",
          },
          {
            name: "Select csv-to-json mode",
            text: "Paste into the converter and set mode to 'csv-to-json'. If the CSV uses semicolons or tabs, set the matching delimiter.",
          },
          {
            name: "Use the JSON array in your code",
            text: "The output is a JSON array of objects where each key is a column header and each value is a string. Use JSON.parse() in JavaScript or json.loads() in Python to work with the result programmatically.",
          },
        ],
        faq: [
          {
            question: "Why are all values strings in the JSON output?",
            answer:
              "CSV has no type information — every cell is plain text. The converter preserves this by outputting all values as strings. To type your data, post-process the JSON: parseInt(row.age), parseFloat(row.price), new Date(row.created_at).",
          },
          {
            question: "What if my CSV has no header row?",
            answer:
              "The converter treats the first row as headers. If your CSV has no header row, add one manually before pasting. For example, prepend 'id,name,email\\n' to a headerless CSV.",
          },
        ],
      },
      {
        slug: "flatten-nested-json-to-csv",
        title: "How to flatten nested JSON to CSV",
        intent: "Convert a JSON response with nested objects into a flat CSV table.",
        intro:
          "Many APIs return nested JSON structures — an order object might contain a customer sub-object and a shipping address sub-object. Spreadsheets and SQL tables are flat. This guide shows how to automatically flatten nested JSON using dot-notation column names so every property ends up in its own column.",
        steps: [
          {
            name: "Identify the nesting depth",
            text: "Look at your JSON structure. If objects contain sub-objects (but not deeply nested arrays), the flatten option handles them automatically. Deeply nested or array-valued fields are stringified into single cells.",
          },
          {
            name: "Enable flatten and convert",
            text: "Paste the JSON array with flatten enabled. The converter uses dot-notation: {address: {city: 'London'}} becomes a column named 'address.city'. Multiple levels of nesting are handled recursively.",
          },
          {
            name: "Verify the column names",
            text: "The 'columns' field in the response lists all generated column names. Check that dot-notation names are meaningful for your downstream tool before importing.",
          },
        ],
        faq: [
          {
            question: "What happens to array-valued fields during flattening?",
            answer:
              "Arrays (e.g. tags: ['a', 'b']) are not recursively expanded — they are JSON-stringified into a single cell ('[\"a\",\"b\"]'). Expanding arrays into multiple rows requires a different transformation that is outside the scope of a flat table.",
          },
          {
            question: "Can I import dot-notation column names into a database?",
            answer:
              "Most databases require column names without dots. Rename the columns after import, or set flatten to false and handle the nesting in your application code instead.",
          },
        ],
      },
      {
        slug: "json-to-csv-python",
        title: "How to convert JSON to CSV in Python",
        intent: "Use the REST API or Python's csv module to convert JSON data to CSV programmatically.",
        intro:
          "Python scripts that process API responses, database exports, or data pipeline outputs frequently need to write CSV files. The quickhelp.dev JSON-to-CSV REST API lets you convert data without writing the CSV logic yourself — useful in notebooks, automation scripts, and quick data tasks. This guide shows both the API approach and the native Python csv module approach.",
        steps: [
          {
            name: "Use the REST API from Python",
            text: "import requests, json; data = [{\"name\": \"Alice\", \"age\": 30}]; r = requests.post('https://quickhelp.dev/api/json-to-csv', json={'input': json.dumps(data), 'mode': 'json-to-csv', 'delimiter': ',', 'flatten': True}); print(r.json()['output'])",
          },
          {
            name: "Or use Python's built-in csv module",
            text: "import csv, io, json; data = json.loads(open('data.json').read()); buf = io.StringIO(); w = csv.DictWriter(buf, fieldnames=data[0].keys()); w.writeheader(); w.writerows(data); print(buf.getvalue())",
          },
          {
            name: "Write the CSV to a file",
            text: "Replace io.StringIO() with open('output.csv', 'w', newline='') to write directly to disk. Use encoding='utf-8-sig' if the file will be opened in Excel on Windows — the BOM prevents encoding issues with non-ASCII characters.",
          },
        ],
        faq: [
          {
            question: "Which is faster: the API or Python's csv module?",
            answer:
              "Python's built-in csv module is faster for large datasets because there is no network round-trip. Use the API for quick one-off conversions or when you need the flatten option without writing custom code.",
          },
          {
            question: "How do I handle pandas DataFrames?",
            answer:
              "pandas has built-in JSON and CSV conversion: df = pd.read_json('data.json') then df.to_csv('output.csv', index=False). Use pd.json_normalize(data) if the JSON is nested.",
          },
        ],
      },
    ],
  },
});

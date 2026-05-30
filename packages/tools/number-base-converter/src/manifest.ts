import { z } from "zod";
import { defineTool } from "@quickhelp/tool-kit";

const BASE_LABELS: Record<number, string> = {
  2: "binary",
  8: "octal",
  10: "decimal",
  16: "hexadecimal",
};

function toBigIntSafe(input: string, fromBase: number): bigint {
  const trimmed = input.trim().toLowerCase().replace(/^0x/, "");
  if (trimmed === "") throw new Error("Input is empty");
  const validChars = "0123456789abcdefghijklmnopqrstuvwxyz".slice(0, fromBase);
  const invalid = [...trimmed].find((c) => !validChars.includes(c));
  if (invalid) {
    throw new Error(
      `Character '${invalid}' is not valid in base ${fromBase} (${BASE_LABELS[fromBase] ?? `base-${fromBase}`})`
    );
  }
  // Use BigInt constructor with a prefix to parse the value correctly
  let bigIntStr: string;
  if (fromBase === 16) bigIntStr = `0x${trimmed}`;
  else if (fromBase === 8) bigIntStr = `0o${trimmed}`;
  else if (fromBase === 2) bigIntStr = `0b${trimmed}`;
  else bigIntStr = trimmed;
  return BigInt(bigIntStr);
}

const ZERO = BigInt(0);
const ONE = BigInt(1);

function formatBase(value: bigint, base: number): string {
  if (value === ZERO) return "0";
  const isNeg = value < ZERO;
  const abs = isNeg ? -value : value;
  return (isNeg ? "-" : "") + abs.toString(base).toUpperCase();
}

function groupDigits(s: string, groupSize: number): string {
  const neg = s.startsWith("-");
  const digits = neg ? s.slice(1) : s;
  const pad = (groupSize - (digits.length % groupSize)) % groupSize;
  const padded = "0".repeat(pad) + digits;
  const groups: string[] = [];
  for (let i = 0; i < padded.length; i += groupSize) {
    groups.push(padded.slice(i, i + groupSize));
  }
  return (neg ? "-" : "") + groups.join(" ");
}

const inputSchema = z.object({
  input: z.string().min(1, "Input is required"),
  from_base: z.union([
    z.literal(2),
    z.literal(8),
    z.literal(10),
    z.literal(16),
  ]),
});

const outputSchema = z.object({
  input_normalized: z.string(),
  from_base: z.number(),
  decimal: z.string(),
  binary: z.string(),
  octal: z.string(),
  hexadecimal: z.string(),
  binary_grouped: z.string(),
  hex_grouped: z.string(),
  bit_length: z.number(),
  is_power_of_two: z.boolean(),
});

export const numberBaseConverter = defineTool({
  id: "number-base-converter",
  slug: "number-base-converter",
  name: "Number Base Converter",
  summary: "Convert numbers between binary, octal, decimal, and hexadecimal.",
  description:
    "Convert any integer between base 2 (binary), base 8 (octal), base 10 (decimal), and base 16 (hexadecimal). Returns all four representations at once, with grouped formats for readability. Supports arbitrarily large integers via BigInt.",
  category: "encoding",
  inputSchema,
  outputSchema,
  examples: [
    {
      title: "Decimal 255 to all bases",
      input: { input: "255", from_base: 10 },
      output: {
        input_normalized: "255",
        from_base: 10,
        decimal: "255",
        binary: "11111111",
        octal: "377",
        hexadecimal: "FF",
        binary_grouped: "1111 1111",
        hex_grouped: "FF",
        bit_length: 8,
        is_power_of_two: false,
      },
    },
    {
      title: "Hex FF to all bases",
      input: { input: "FF", from_base: 16 },
      output: {
        input_normalized: "FF",
        from_base: 16,
        decimal: "255",
        binary: "11111111",
        octal: "377",
        hexadecimal: "FF",
        binary_grouped: "1111 1111",
        hex_grouped: "FF",
        bit_length: 8,
        is_power_of_two: false,
      },
    },
  ],
  handler({ input, from_base }) {
    const value = toBigIntSafe(input, from_base);
    const dec = formatBase(value, 10);
    const bin = formatBase(value, 2);
    const oct = formatBase(value, 8);
    const hex = formatBase(value, 16);
    const absValue = value < ZERO ? -value : value;
    const bitLength = absValue === ZERO ? 1 : absValue.toString(2).length;
    const isPow2 = absValue > ZERO && (absValue & (absValue - ONE)) === ZERO;

    return {
      input_normalized: input.trim().toUpperCase().replace(/^0X/, "0x"),
      from_base,
      decimal: dec,
      binary: bin,
      octal: oct,
      hexadecimal: hex,
      binary_grouped: groupDigits(bin, 4),
      hex_grouped: groupDigits(hex, 2),
      bit_length: bitLength,
      is_power_of_two: isPow2,
    };
  },
  schemaOrg: {
    name: "Number Base Converter",
    description:
      "Convert integers between binary, octal, decimal, and hexadecimal. Returns all four bases at once with grouped formats.",
    url: "https://quickhelp.dev/number-base-converter",
  },
  attribution: {
    text: "Converted by quickhelp.dev/number-base-converter",
    url: "https://quickhelp.dev/number-base-converter",
  },
  content: {
    whatIs:
      "The Number Base Converter converts integers between the four bases used in computing: binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16). Enter a number in any base and the tool returns all four representations instantly — no manual arithmetic required. It also returns a grouped binary format (4-digit nibbles) and grouped hex (2-digit bytes) for easier reading, the bit length of the value, and whether it is a power of two.",
    howToSteps: [
      {
        name: "Enter your number",
        text: "Type the value in the Input field. For hexadecimal, use digits 0–9 and letters A–F (case-insensitive). The 0x prefix is optional.",
      },
      {
        name: "Select the input base",
        text: "Choose the base your number is in: Binary (base 2), Octal (base 8), Decimal (base 10), or Hexadecimal (base 16).",
      },
      {
        name: "Read all four outputs",
        text: "The result shows the value in all four bases simultaneously — decimal, binary, octal, and hexadecimal — along with grouped formats and bit length.",
      },
    ],
    faq: [
      {
        question: "What is binary (base 2)?",
        answer:
          "Binary is the native number system of computers. Every integer is represented using only the digits 0 and 1. Each digit position represents a power of 2: the rightmost is 2^0 (1), then 2^1 (2), 2^2 (4), 2^3 (8), and so on. The decimal number 10 is 1010 in binary (8 + 2).",
      },
      {
        question: "What is hexadecimal (base 16) and why do developers use it?",
        answer:
          "Hexadecimal uses 16 digits: 0–9 and A–F. Developers prefer hex because it maps cleanly to binary: each hex digit represents exactly 4 binary digits (a nibble). This makes hex a compact way to express binary values — the 8-bit byte 11111111 is simply FF in hex, and 32-bit memory addresses fit in 8 hex characters. CSS color values (#FF6600), file magic bytes, and network masks are all commonly expressed in hex.",
      },
      {
        question: "What is octal (base 8) used for?",
        answer:
          "Octal uses digits 0–7. It is most commonly encountered in Unix file permission modes: chmod 755 means owner can read/write/execute (7 = 111 in binary), group can read/execute (5 = 101), others can read/execute (5 = 101). Octal also appears in older C codebases and network protocols. Each octal digit represents exactly 3 binary digits.",
      },
      {
        question: "Does this tool handle large numbers?",
        answer:
          "Yes. The converter uses JavaScript's BigInt internally, so it handles arbitrarily large integers without precision loss — unlike Number, which loses precision above 2^53. You can convert a 256-bit integer accurately.",
      },
      {
        question: "How do I convert a hex color code to decimal RGB values?",
        answer:
          "A CSS hex color like #FF6600 has three 2-digit hex components: R=FF, G=66, B=00. Convert each pair to decimal: FF → 255, 66 → 102, 00 → 0. The result is rgb(255, 102, 0). Use this tool for each pair, or use the Color Converter tool which handles full CSS color conversions.",
      },
    ],
    relatedTools: ["hash-generator", "color-converter", "base64", "url-encoder"],
    useCases: [
      {
        slug: "binary-to-decimal-converter",
        title: "Binary to Decimal Converter",
        intent: "Convert binary (base 2) number to decimal",
        intro:
          "Binary numbers use only 0 and 1. To convert to decimal, multiply each binary digit by its positional power of 2 and sum the results. This converter does that instantly for any length binary string, including 8-bit bytes, 16-bit words, and 32-bit integers.",
        steps: [
          {
            name: "Enter the binary number",
            text: "Type your binary digits (e.g. 11111111) in the Input field — only 0s and 1s are valid.",
          },
          {
            name: "Select Binary as the input base",
            text: "Choose Binary (base 2) from the From base selector.",
          },
          {
            name: "Read the decimal result",
            text: "The Decimal output shows the converted value — for 11111111 that is 255.",
          },
          {
            name: "Check the bit length",
            text: "The Bit length field tells you how many bits are needed to represent the value — useful for choosing the right integer type.",
          },
        ],
        faq: [
          {
            question: "How do I manually convert binary 1010 to decimal?",
            answer:
              "Write out each bit position from right: 0×2^0 + 1×2^1 + 0×2^2 + 1×2^3 = 0 + 2 + 0 + 8 = 10. The converter handles this arithmetic for any length automatically.",
          },
          {
            question: "What is the decimal value of the binary byte 10000000?",
            answer: "128. It is 2^7, the highest bit in an 8-bit byte. The tool also reports this as a power of two.",
          },
          {
            question: "Can I convert negative binary numbers?",
            answer:
              "This tool converts unsigned binary integers. For two's complement negative numbers, the interpretation depends on the word width — a convention the tool does not assume.",
          },
        ],
      },
      {
        slug: "hex-to-decimal-converter",
        title: "Hex to Decimal Converter",
        intent: "Convert hexadecimal to decimal and other bases",
        intro:
          "Hexadecimal (hex) values appear constantly in programming — memory addresses, color codes, cryptographic hashes, and network protocols. Converting them to decimal or binary by hand is tedious and error-prone. This tool converts any hex value to decimal, binary, and octal simultaneously.",
        steps: [
          {
            name: "Enter the hex value",
            text: "Type the hex digits in the Input field. The 0x prefix is optional; A–F can be uppercase or lowercase.",
          },
          {
            name: "Select Hexadecimal as the input base",
            text: "Choose Hexadecimal (base 16) from the From base selector.",
          },
          {
            name: "Read all four outputs at once",
            text: "The result shows decimal, binary, and octal simultaneously.",
          },
          {
            name: "Use the grouped hex field",
            text: "The Hex grouped field splits the value into 2-digit bytes (e.g. FF 6A 00) for easier reading.",
          },
        ],
        faq: [
          {
            question: "What does the hex value FF equal in decimal?",
            answer: "255. FF = 15×16 + 15 = 255. It is also the maximum value of an 8-bit unsigned byte.",
          },
          {
            question: "How do I convert a hex memory address like 0x7FFF to decimal?",
            answer:
              "Enter 7FFF and select Hexadecimal. The decimal value is 32767 — the maximum positive value of a signed 16-bit integer.",
          },
          {
            question: "Why do hex values only use digits 0–9 and letters A–F?",
            answer:
              "Hexadecimal needs 16 symbols. After the 10 digits 0–9, the letters A (10), B (11), C (12), D (13), E (14), F (15) represent the remaining values.",
          },
        ],
      },
      {
        slug: "decimal-to-binary-converter",
        title: "Decimal to Binary Converter",
        intent: "Convert decimal integers to binary representation",
        intro:
          "Converting decimal numbers to binary is a fundamental operation in computer science — used when working with bitmasks, flags, file permissions, network subnets, and low-level programming. This tool converts any decimal integer to binary, octal, and hex simultaneously.",
        steps: [
          {
            name: "Enter the decimal number",
            text: "Type any positive integer in the Input field (e.g. 42).",
          },
          {
            name: "Select Decimal as the input base",
            text: "Choose Decimal (base 10) from the From base selector.",
          },
          {
            name: "Read the binary output",
            text: "The Binary field shows the binary representation — for 42 that is 101010.",
          },
          {
            name: "Check if it is a power of two",
            text: "The Is power of two field is useful when working with memory allocation, bitmasks, or hash table sizes that must be powers of 2.",
          },
        ],
        faq: [
          {
            question: "How many bits does the decimal number 255 need?",
            answer:
              "8 bits. 255 in binary is 11111111 — all eight bits set. The tool reports bit length in the output.",
          },
          {
            question: "How do I convert decimal to binary manually?",
            answer:
              "Repeatedly divide by 2, noting the remainder each time, until the quotient is 0. Reading the remainders in reverse order gives the binary representation. For 42: 42÷2=21 r0, 21÷2=10 r1, 10÷2=5 r0, 5÷2=2 r1, 2÷2=1 r0, 1÷2=0 r1. Reversed: 101010.",
          },
          {
            question: "What is the binary for Unix file permission 755?",
            answer:
              "755 in octal is rwxr-xr-x. In binary: 7=111, 5=101, 5=101 — the full 9-bit mask is 111101101.",
          },
        ],
      },
      {
        slug: "number-base-converter-api",
        title: "Number Base Conversion API",
        intent: "Programmatically convert numbers between bases via REST API",
        intro:
          "The Number Base Converter is available as a REST API for scripts, CI pipelines, and automated workflows. Send a JSON body with the number and its base; receive all four representations in the response. No API key required.",
        steps: [
          {
            name: "Send a POST request",
            text: "POST to https://quickhelp.dev/api/number-base-converter with Content-Type: application/json.",
          },
          {
            name: "Set the input fields",
            text: "Set input to your number as a string, and from_base to 2, 8, 10, or 16.",
          },
          {
            name: "Parse the response",
            text: "The response JSON contains decimal, binary, octal, and hexadecimal fields with all converted values.",
          },
          {
            name: "Use grouped fields for readability",
            text: "binary_grouped and hex_grouped split values into nibbles and bytes — useful for logs and reports.",
          },
        ],
        faq: [
          {
            question: "What does the API request look like?",
            answer:
              "curl -X POST https://quickhelp.dev/api/number-base-converter -H 'Content-Type: application/json' -d '{\"input\":\"FF\",\"from_base\":16}'. The response includes all four representations plus bit_length and is_power_of_two.",
          },
          {
            question: "Is there a rate limit on the API?",
            answer:
              "The anonymous free tier has a per-IP rate limit suitable for personal projects and scripts. For higher volume, contact us.",
          },
          {
            question: "Can I use this in a CI pipeline?",
            answer:
              "Yes. The API is stateless and deterministic — the same input always produces the same output, making it safe for reproducible CI environments.",
          },
        ],
      },
    ],
  },
});

import { z } from "zod";
import { defineTool } from "@quickhelp/tool-kit";

const CaseEnum = z.enum([
  "camelCase",
  "PascalCase",
  "snake_case",
  "SCREAMING_SNAKE_CASE",
  "kebab-case",
  "COBOL-CASE",
  "dot.case",
  "Title Case",
  "Sentence case",
  "lowercase",
  "UPPERCASE",
]);
type Case = z.infer<typeof CaseEnum>;

function tokenise(input: string): string[] {
  // Split on whitespace, hyphens, underscores, dots, or camelCase/PascalCase boundaries
  return input
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[\s\-_./]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function convert(tokens: string[], targetCase: Case): string {
  const lower = tokens.map((t) => t.toLowerCase());
  switch (targetCase) {
    case "camelCase":
      return lower.map((t, i) => (i === 0 ? t : t[0]!.toUpperCase() + t.slice(1))).join("");
    case "PascalCase":
      return lower.map((t) => t[0]!.toUpperCase() + t.slice(1)).join("");
    case "snake_case":
      return lower.join("_");
    case "SCREAMING_SNAKE_CASE":
      return lower.join("_").toUpperCase();
    case "kebab-case":
      return lower.join("-");
    case "COBOL-CASE":
      return lower.join("-").toUpperCase();
    case "dot.case":
      return lower.join(".");
    case "Title Case":
      return lower.map((t) => t[0]!.toUpperCase() + t.slice(1)).join(" ");
    case "Sentence case":
      return lower.map((t, i) => (i === 0 ? t[0]!.toUpperCase() + t.slice(1) : t)).join(" ");
    case "lowercase":
      return lower.join(" ");
    case "UPPERCASE":
      return lower.join(" ").toUpperCase();
  }
}

export const textCaseConverter = defineTool({
  id: "text-case-converter",
  slug: "text-case-converter",
  name: "Text Case Converter",
  summary: "Convert text between camelCase, snake_case, kebab-case, PascalCase, and 7 other naming conventions.",
  description:
    "Convert any identifier or phrase between 11 naming conventions: camelCase, PascalCase, snake_case, SCREAMING_SNAKE_CASE, kebab-case, COBOL-CASE, dot.case, Title Case, Sentence case, lowercase, and UPPERCASE. Intelligently splits on whitespace, hyphens, underscores, dots, and camelCase boundaries so you can convert between any two formats in one step.",
  category: "text",
  inputSchema: z.object({
    input: z.string().min(1).describe("The text or identifier to convert"),
    to: CaseEnum.describe(
      "Target case: camelCase | PascalCase | snake_case | SCREAMING_SNAKE_CASE | kebab-case | COBOL-CASE | dot.case | Title Case | Sentence case | lowercase | UPPERCASE"
    ),
  }),
  outputSchema: z.object({
    output: z.string().describe("The converted text"),
    tokens: z.array(z.string()).describe("Words extracted from the input before conversion"),
    from_detected: z.string().describe("The naming convention detected in the input"),
  }),
  examples: [
    {
      title: "camelCase to snake_case",
      input: { input: "myVariableName", to: "snake_case" },
      output: { output: "my_variable_name", tokens: ["my", "variable", "name"], from_detected: "camelCase" },
    },
    {
      title: "snake_case to kebab-case",
      input: { input: "my_variable_name", to: "kebab-case" },
      output: { output: "my-variable-name", tokens: ["my", "variable", "name"], from_detected: "snake_case" },
    },
    {
      title: "Phrase to PascalCase",
      input: { input: "hello world example", to: "PascalCase" },
      output: { output: "HelloWorldExample", tokens: ["hello", "world", "example"], from_detected: "Sentence case" },
    },
  ],
  handler({ input, to }) {
    const tokens = tokenise(input);
    const output = convert(tokens, to);

    // Detect the source convention
    let from_detected = "unknown";
    if (/^[a-z][a-zA-Z0-9]*$/.test(input) && /[A-Z]/.test(input)) from_detected = "camelCase";
    else if (/^[A-Z][a-zA-Z0-9]*$/.test(input) && /[a-z]/.test(input)) from_detected = "PascalCase";
    else if (/^[a-z0-9]+(_[a-z0-9]+)+$/.test(input)) from_detected = "snake_case";
    else if (/^[A-Z0-9]+(_[A-Z0-9]+)+$/.test(input)) from_detected = "SCREAMING_SNAKE_CASE";
    else if (/^[a-z0-9]+(-[a-z0-9]+)+$/.test(input)) from_detected = "kebab-case";
    else if (/^[A-Z0-9]+(-[A-Z0-9]+)+$/.test(input)) from_detected = "COBOL-CASE";
    else if (/^[a-z0-9]+(\.[a-z0-9]+)+$/.test(input)) from_detected = "dot.case";
    else if (/^[A-Z][a-z]/.test(input) && input.includes(" ")) from_detected = "Title Case";
    else if (input === input.toUpperCase() && !/[_\-.]/.test(input)) from_detected = "UPPERCASE";
    else if (input === input.toLowerCase() && !/[_\-.]/.test(input)) from_detected = "lowercase";
    else if (/^[A-Z]/.test(input) && input.includes(" ")) from_detected = "Sentence case";

    return { output, tokens: tokens.map((t) => t.toLowerCase()), from_detected };
  },
  schemaOrg: {
    name: "Text Case Converter",
    description: "Convert text between camelCase, snake_case, kebab-case, PascalCase, and other naming conventions.",
    url: "https://quickhelp.dev/text-case-converter",
  },
  attribution: {
    text: "Converted by quickhelp.dev/text-case-converter",
    url: "https://quickhelp.dev/text-case-converter",
  },
  content: {
    whatIs:
      "Naming conventions define how words are combined into identifiers in code, configuration files, APIs, and databases. camelCase (myVariable) is the standard in JavaScript and Java. snake_case (my_variable) is the norm in Python, Ruby, and SQL. kebab-case (my-variable) is used in CSS, HTML attributes, and URL slugs. PascalCase (MyVariable) is used for class names and React components across most languages. SCREAMING_SNAKE_CASE (MY_VARIABLE) marks constants. Different tools, frameworks, and languages enforce different conventions, so converting between them is a constant need when writing glue code, generating API clients, or adapting data from one system to another. This tool splits any identifier or phrase into its component words — intelligently handling camelCase boundaries, underscores, hyphens, and dots — then reassembles them in the target convention.",
    howToSteps: [
      {
        name: "Paste the identifier or phrase",
        text: "Enter any identifier or multi-word phrase. The tool automatically splits on whitespace, underscores, hyphens, dots, and camelCase/PascalCase word boundaries — so you can convert from any format to any other in one step.",
      },
      {
        name: "Select the target case",
        text: "Choose from 11 naming conventions: camelCase, PascalCase, snake_case, SCREAMING_SNAKE_CASE, kebab-case, COBOL-CASE, dot.case, Title Case, Sentence case, lowercase, or UPPERCASE.",
      },
      {
        name: "Copy the result",
        text: "The converted identifier appears instantly. The 'tokens' field shows the words extracted from your input — useful for verifying the split was correct before using the output in code.",
      },
    ],
    faq: [
      {
        question: "How does the tool split compound words like 'innerHTML' or 'XMLParser'?",
        answer:
          "camelCase splitting uses two regex passes: first it inserts a space before any lowercase-to-uppercase transition (innerHTML → inner Html), then before any sequence of uppercase letters followed by an uppercase-then-lowercase transition (XMLParser → XML Parser). Both passes together correctly split 'XMLParser' into ['xml', 'parser'] and 'innerHTML' into ['inner', 'html'].",
      },
      {
        question: "Does the tool preserve acronyms like 'URL' or 'HTTP'?",
        answer:
          "Acronyms are lowercased as part of tokenisation and then recased according to the target convention. In camelCase, 'parseURL' becomes 'parseUrl'; in PascalCase it becomes 'ParseUrl'. If your codebase uses a style guide that keeps acronyms uppercase (e.g. 'parseURL'), apply the conversion and then manually restore the acronym casing.",
      },
      {
        question: "Can I convert multiple identifiers at once?",
        answer:
          "This tool converts one identifier per call. For bulk conversion in a script, use the REST API: POST /api/text-case-converter with each identifier. In Node.js, you can also use the 'change-case' npm package for programmatic bulk conversion.",
      },
      {
        question: "When should I use SCREAMING_SNAKE_CASE?",
        answer:
          "SCREAMING_SNAKE_CASE (all uppercase with underscores) is the conventional style for constants and environment variables across many languages — Python's PEP 8, Java's constant fields, and shell scripts all use it. Examples: MAX_RETRY_COUNT, DATABASE_URL, API_TIMEOUT_SECONDS. Using it signals to readers that the value never changes at runtime.",
      },
      {
        question: "What is COBOL-CASE and when is it used?",
        answer:
          "COBOL-CASE (also called TRAIN-CASE or HTTP-HEADER-CASE) uses uppercase letters with hyphens between words: Content-Type, X-Request-Id, Accept-Encoding. It is the standard casing for HTTP header names. Outside of HTTP headers, it is rarely used in modern code.",
      },
      {
        question: "How does the tool handle numbers in identifiers?",
        answer:
          "Numbers are treated as opaque tokens and preserved in position. 'base64Encode' splits into ['base64', 'encode'] — the number is kept with its preceding word rather than split out as a separate token. If you need different behavior, split the identifier manually before converting.",
      },
    ],
    relatedTools: ["json-formatter", "url-encoder"],
    useCases: [
      {
        slug: "camelcase-to-snake-case",
        title: "How to convert camelCase to snake_case",
        intent: "Convert JavaScript variable names to Python or SQL naming conventions.",
        intro:
          "JavaScript uses camelCase for variables and functions; Python and SQL use snake_case. When writing a backend that bridges both ecosystems — serialising a JavaScript object to a Python API, or mapping JSON keys to database column names — you need to convert dozens of identifiers at once. This guide shows how to convert any camelCase identifier to snake_case in one step, and how to automate the conversion in a script.",
        steps: [
          {
            name: "Paste the camelCase identifier",
            text: "Enter the camelCase name — for example 'firstName', 'createdAt', or 'isEmailVerified'. The tool recognises camelCase word boundaries automatically.",
          },
          {
            name: "Select snake_case as the target",
            text: "Choose 'snake_case' from the target case selector. The output will be all-lowercase with underscores between words.",
          },
          {
            name: "Use in Python or SQL",
            text: "Copy the result and use it as a Python variable name, a database column name, or a key in a snake_case API payload. In Django or SQLAlchemy, snake_case field names map directly to database columns.",
          },
        ],
        faq: [
          {
            question: "How do I convert an entire JSON object's keys from camelCase to snake_case?",
            answer:
              "In Python, use a library like 'humps': import humps; humps.decamelize({'firstName': 'Jan'}). In Node.js, use 'snakecase-keys': const snakecaseKeys = require('snakecase-keys'); snakecaseKeys({ firstName: 'Jan' }). For a one-off check, convert each key with this tool.",
          },
          {
            question: "Is 'myID' converted to 'my_id' or 'my_i_d'?",
            answer:
              "The tool treats a run of uppercase letters as a single word: 'myID' → tokens ['my', 'id'] → 'my_id'. If your input uses 'myId' (only the first letter capitalised), it also correctly produces 'my_id'.",
          },
        ],
      },
      {
        slug: "snake-case-to-camelcase",
        title: "How to convert snake_case to camelCase",
        intent: "Convert Python or database identifiers to JavaScript naming conventions.",
        intro:
          "When consuming a Python API or reading from a database in a JavaScript application, field names often arrive in snake_case but your frontend code expects camelCase. Manually renaming a dozen fields is error-prone. This guide shows how to convert any snake_case identifier to camelCase instantly, and how to automate the conversion across an API client.",
        steps: [
          {
            name: "Paste the snake_case name",
            text: "Enter the snake_case identifier — for example 'first_name', 'created_at', or 'is_email_verified'.",
          },
          {
            name: "Select camelCase as the target",
            text: "Choose 'camelCase'. The first word stays lowercase; each subsequent word is capitalised.",
          },
          {
            name: "Apply to your API client",
            text: "Copy the result. In JavaScript/TypeScript, libraries like 'camelcase-keys' can transform all keys in a response object automatically: camelcaseKeys(responseBody, { deep: true }).",
          },
        ],
        faq: [
          {
            question: "Does the converter handle numbers in identifiers like 'user_2_name'?",
            answer:
              "Yes. Numbers are treated as part of the preceding token. 'user_2_name' splits into ['user', '2', 'name'] and converts to 'user2Name' in camelCase.",
          },
          {
            question: "What is the difference between camelCase and lowerCamelCase?",
            answer:
              "They are the same thing. 'lowerCamelCase' is a more explicit name for the convention where the first word is lowercase (firstName), to distinguish it from PascalCase/UpperCamelCase (FirstName).",
          },
        ],
      },
      {
        slug: "to-kebab-case-for-css",
        title: "How to convert identifiers to kebab-case for CSS and URLs",
        intent: "Convert variable names or phrases to the kebab-case convention used in CSS and URL slugs.",
        intro:
          "CSS custom properties, HTML data attributes, URL slugs, and npm package names all use kebab-case (words-separated-by-hyphens). When you name a CSS variable based on a JavaScript constant, or create a URL slug from a title, you need to convert to kebab-case. This guide shows how to convert from any naming convention to kebab-case in one step.",
        steps: [
          {
            name: "Paste the source identifier or phrase",
            text: "Enter the identifier in any format — camelCase, snake_case, PascalCase, or a plain phrase like 'My Component Name'.",
          },
          {
            name: "Select kebab-case",
            text: "Choose 'kebab-case'. All words are lowercased and joined with hyphens.",
          },
          {
            name: "Use in CSS, HTML, or URLs",
            text: "Copy the result for use as a CSS custom property (--my-component-name), an HTML data attribute (data-component-name), or a URL slug (/my-component-name).",
          },
        ],
        faq: [
          {
            question: "What is the difference between kebab-case and COBOL-CASE?",
            answer:
              "Both use hyphens as separators. kebab-case is all-lowercase; COBOL-CASE is all-uppercase. COBOL-CASE is rarely used outside legacy systems and some HTTP header conventions (Content-Type uses Title-Case, but some older headers used COBOL-CASE).",
          },
          {
            question: "Can I use kebab-case in JavaScript variable names?",
            answer:
              "No. Hyphens are not valid in JavaScript identifiers because they are the subtraction operator. Use camelCase for JavaScript variables and kebab-case only for CSS properties, HTML attributes, file names, and URLs.",
          },
        ],
      },
      {
        slug: "to-pascal-case-for-classes",
        title: "How to convert identifiers to PascalCase for class names",
        intent: "Convert snake_case or camelCase identifiers to PascalCase for React components and class names.",
        intro:
          "PascalCase (also called UpperCamelCase) is the standard for class names in Java, C#, and TypeScript, React component names, and Python class names. When generating code, scaffolding components from a CLI, or adapting names from a database schema to a type definition, you need to convert identifiers to PascalCase reliably. This guide shows how to do it in one step from any source format.",
        steps: [
          {
            name: "Paste the source name",
            text: "Enter the name in any format — snake_case ('user_profile'), camelCase ('userProfile'), or a plain phrase ('user profile').",
          },
          {
            name: "Select PascalCase",
            text: "Choose 'PascalCase'. Every word's first letter is capitalised and the rest is lowercase; no separators.",
          },
          {
            name: "Use as a class or component name",
            text: "Copy the result for use as a React component name (UserProfile), a TypeScript interface name, a Python class, or a Java/C# class. The tokens field confirms the words that were detected.",
          },
        ],
        faq: [
          {
            question: "Is PascalCase the same as UpperCamelCase?",
            answer:
              "Yes. PascalCase and UpperCamelCase are synonyms. Both refer to the convention where every word starts with an uppercase letter (UserProfile, HttpRequest). The name 'PascalCase' comes from the Pascal programming language, which popularised the style.",
          },
          {
            question: "Should React component file names use PascalCase or kebab-case?",
            answer:
              "React component names (the JSX tag) must be PascalCase — React uses capitalisation to distinguish components from native HTML elements. File names are a project convention: many teams use PascalCase (UserProfile.tsx) for component files, but kebab-case (user-profile.tsx) is also common. Check your project's ESLint or StyleGuide config.",
          },
        ],
      },
    ],
  },
});

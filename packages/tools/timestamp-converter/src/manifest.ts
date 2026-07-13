import { z } from "zod";
import { defineTool } from "@quickhelp/tool-kit";

export const timestampConverter = defineTool({
  id: "timestamp-converter",
  slug: "timestamp-converter",
  name: "Unix Timestamp Converter",
  summary: "Convert Unix timestamps to human-readable dates and ISO 8601, or convert dates back to epoch seconds.",
  description:
    "Convert Unix epoch timestamps (seconds or milliseconds since 1970-01-01T00:00:00Z) to ISO 8601, UTC, and local date-time strings — or parse any date string back to a Unix timestamp. Shows the relative time from now (e.g. '3 days ago'). Accepts seconds, milliseconds, or an ISO 8601 / RFC 2822 date string as input.",
  category: "datetime",
  inputSchema: z.object({
    input: z
      .string()
      .min(1)
      .describe(
        "A Unix timestamp in seconds or milliseconds (e.g. 1716998400 or 1716998400000), or a date string in ISO 8601 or RFC 2822 format (e.g. '2024-05-29T12:00:00Z' or 'Wed, 29 May 2024 12:00:00 +0000')"
      ),
    mode: z
      .enum(["auto", "to-date", "to-timestamp"])
      .default("auto")
      .describe(
        "auto — detects whether the input is a timestamp or a date string; to-date — treat input as a Unix timestamp and convert to date strings; to-timestamp — parse input as a date string and return epoch seconds and milliseconds"
      ),
  }),
  outputSchema: z.object({
    unix_seconds: z.number().int().describe("Unix timestamp in seconds"),
    unix_ms: z.number().int().describe("Unix timestamp in milliseconds"),
    iso8601: z.string().describe("ISO 8601 UTC string (e.g. 2024-05-29T12:00:00.000Z)"),
    utc: z.string().describe("Human-readable UTC string (e.g. Wed, 29 May 2024 12:00:00 UTC)"),
    relative: z.string().describe("Relative time from now (e.g. '3 days ago', 'in 2 hours')"),
    valid: z.boolean(),
    error: z.string().optional(),
  }),
  examples: [
    {
      title: "Unix seconds to date",
      input: { input: "1716998400", mode: "to-date" },
      output: {
        unix_seconds: 1716998400,
        unix_ms: 1716998400000,
        iso8601: "2024-05-29T16:00:00.000Z",
        utc: "Wed, 29 May 2024 16:00:00 UTC",
        relative: "about 1 year ago",
        valid: true,
      },
    },
    {
      title: "ISO 8601 date to Unix timestamp",
      input: { input: "2024-05-29T16:00:00Z", mode: "to-timestamp" },
      output: {
        unix_seconds: 1716998400,
        unix_ms: 1716998400000,
        iso8601: "2024-05-29T16:00:00.000Z",
        utc: "Wed, 29 May 2024 16:00:00 UTC",
        relative: "about 1 year ago",
        valid: true,
      },
    },
    {
      title: "Unix milliseconds auto-detected",
      input: { input: "1716998400000", mode: "auto" },
      output: {
        unix_seconds: 1716998400,
        unix_ms: 1716998400000,
        iso8601: "2024-05-29T16:00:00.000Z",
        utc: "Wed, 29 May 2024 16:00:00 UTC",
        relative: "about 1 year ago",
        valid: true,
      },
    },
  ],
  handler({ input, mode }) {
    try {
      let ms: number;
      const trimmed = input.trim();

      // Determine whether input is a numeric timestamp or a date string
      const isNumeric = /^-?\d+$/.test(trimmed);

      if (mode === "to-timestamp" || (!isNumeric && mode === "auto")) {
        // Parse as date string
        const parsed = new Date(trimmed);
        if (isNaN(parsed.getTime())) {
          return {
            unix_seconds: 0,
            unix_ms: 0,
            iso8601: "",
            utc: "",
            relative: "",
            valid: false,
            error: `Cannot parse "${trimmed}" as a date. Use ISO 8601 (e.g. 2024-05-29T12:00:00Z) or a Unix timestamp.`,
          };
        }
        ms = parsed.getTime();
      } else {
        // Parse as numeric timestamp
        const num = parseInt(trimmed, 10);
        // Heuristic: timestamps > 1e10 are milliseconds (year 2001+ in ms), otherwise seconds
        ms = Math.abs(num) > 1e10 ? num : num * 1000;
      }

      const date = new Date(ms);
      if (isNaN(date.getTime())) {
        return {
          unix_seconds: 0,
          unix_ms: 0,
          iso8601: "",
          utc: "",
          relative: "",
          valid: false,
          error: "The timestamp produced an invalid date.",
        };
      }

      const unix_seconds = Math.floor(ms / 1000);
      const unix_ms = ms;
      const iso8601 = date.toISOString();

      // RFC 2822-style UTC string
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const pad = (n: number) => String(n).padStart(2, "0");
      const utc = `${days[date.getUTCDay()]}, ${pad(date.getUTCDate())} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} UTC`;

      // Relative time
      const nowMs = Date.now();
      const diffMs = nowMs - ms;
      const absDiff = Math.abs(diffMs);
      const future = diffMs < 0;
      let relative: string;
      if (absDiff < 45000) {
        relative = "just now";
      } else if (absDiff < 90000) {
        relative = future ? "in 1 minute" : "1 minute ago";
      } else if (absDiff < 45 * 60 * 1000) {
        const mins = Math.round(absDiff / 60000);
        relative = future ? `in ${mins} minutes` : `${mins} minutes ago`;
      } else if (absDiff < 90 * 60 * 1000) {
        relative = future ? "in about 1 hour" : "about 1 hour ago";
      } else if (absDiff < 22 * 60 * 60 * 1000) {
        const hrs = Math.round(absDiff / 3600000);
        relative = future ? `in about ${hrs} hours` : `about ${hrs} hours ago`;
      } else if (absDiff < 36 * 60 * 60 * 1000) {
        relative = future ? "in about 1 day" : "about 1 day ago";
      } else if (absDiff < 345 * 24 * 60 * 60 * 1000) {
        const days = Math.round(absDiff / 86400000);
        relative = future ? `in ${days} days` : `${days} days ago`;
      } else {
        const years = Math.round(absDiff / (365.25 * 24 * 60 * 60 * 1000));
        relative = future ? `in about ${years} year${years > 1 ? "s" : ""}` : `about ${years} year${years > 1 ? "s" : ""} ago`;
      }

      return { unix_seconds, unix_ms, iso8601, utc, relative, valid: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return { unix_seconds: 0, unix_ms: 0, iso8601: "", utc: "", relative: "", valid: false, error: msg };
    }
  },
  schemaOrg: {
    name: "Unix Timestamp Converter",
    description:
      "Convert Unix epoch timestamps to ISO 8601 and human-readable dates, or convert date strings back to Unix timestamps.",
    url: "https://quickhelp.dev/timestamp-converter",
  },
  attribution: {
    text: "Converted by quickhelp.dev/timestamp-converter",
    url: "https://quickhelp.dev/timestamp-converter",
  },
  content: {
    whatIs:
      "A Unix timestamp (also called epoch time or POSIX time) is the number of seconds that have elapsed since 00:00:00 UTC on 1 January 1970 — a moment known as the Unix epoch. Timestamps are the universal language of time in software: databases store them as integers, APIs return them in JSON, log files record them for every event, and JWT tokens use them for 'iat' (issued-at) and 'exp' (expiry) claims. Unlike formatted date strings, Unix timestamps are unambiguous — they have no timezone, no locale, and no format variation. JavaScript and many APIs also use millisecond timestamps (Unix seconds × 1000). This tool converts in both directions: paste a timestamp to get a human-readable date in UTC and ISO 8601, or paste a date string to get the corresponding epoch seconds and milliseconds.",
    howToSteps: [
      {
        name: "Paste the timestamp or date string",
        text: "Enter a Unix timestamp in seconds (e.g. 1716998400) or milliseconds (e.g. 1716998400000), or a date string in ISO 8601 format (e.g. 2024-05-29T16:00:00Z). The tool auto-detects the format.",
      },
      {
        name: "Read the converted output",
        text: "The result shows the Unix timestamp in both seconds and milliseconds, the ISO 8601 UTC string, a human-readable UTC date, and a relative time (e.g. '3 days ago' or 'in 2 hours') calculated from the current moment.",
      },
      {
        name: "Copy the value you need",
        text: "Click Copy next to the field you need — unix_seconds for database storage, iso8601 for API payloads, utc for display strings, or unix_ms for JavaScript Date objects.",
      },
    ],
    faq: [
      {
        question: "How do I tell if a timestamp is in seconds or milliseconds?",
        answer:
          "Seconds timestamps for dates after 2001 are 10 digits (≥ 1,000,000,000). Milliseconds timestamps are 13 digits (≥ 1,000,000,000,000). This tool auto-detects: any number larger than 10,000,000,000 is treated as milliseconds.",
      },
      {
        question: "What timezone does the output use?",
        answer:
          "All output is in UTC. Unix timestamps have no timezone — they always count seconds from the UTC epoch. The ISO 8601 string ends with 'Z' (Zulu / UTC). To display in a local timezone, use your application's date-formatting library with a timezone identifier (e.g. 'America/New_York').",
      },
      {
        question: "What date formats can I convert to a Unix timestamp?",
        answer:
          "Any string parseable by the JavaScript Date constructor: ISO 8601 (2024-05-29T16:00:00Z), RFC 2822 (Wed, 29 May 2024 16:00:00 +0000), or common formats like '2024-05-29'. Ambiguous formats like '05/29/2024' may be parsed incorrectly — prefer ISO 8601 with an explicit timezone offset.",
      },
      {
        question: "What is the maximum Unix timestamp?",
        answer:
          "The 32-bit signed integer Unix timestamp overflows on 2038-01-19T03:14:07Z — the Year 2038 problem. Systems using 32-bit timestamps will wrap around to a negative number and misinterpret dates after that point. Modern systems use 64-bit integers, which will not overflow for billions of years. JavaScript's Date uses 64-bit millisecond timestamps, so web applications are not affected.",
      },
      {
        question: "Why do JWT tokens use Unix timestamps?",
        answer:
          "JWT claims like 'iat' (issued at), 'exp' (expires), and 'nbf' (not before) store Unix timestamps in seconds. Using epoch seconds makes the values language-agnostic and timezone-free — a Python server, a JavaScript client, and a Go microservice all interpret 1716998400 identically as the same moment in UTC. This tool is useful for debugging JWT expiry issues: decode the token, find the 'exp' field, and paste it here to read the human-readable expiry time.",
      },
      {
        question: "How do I convert a timestamp to a specific timezone?",
        answer:
          "This tool outputs UTC. To convert to a local timezone, use your language's date library: in JavaScript, new Date(timestamp * 1000).toLocaleString('en-US', { timeZone: 'America/New_York' }); in Python, datetime.fromtimestamp(timestamp, tz=ZoneInfo('Europe/Warsaw')); in Go, time.Unix(timestamp, 0).In(location).Format(time.RFC3339). Storing and transmitting timestamps in UTC is always recommended — convert to local time only at the display layer.",
      },
    ],
    relatedTools: ["jwt-decoder", "json-formatter"],
    useCases: [
      {
        slug: "convert-unix-timestamp-to-date",
        title: "How to convert a Unix timestamp to a readable date",
        intent: "Turn an epoch seconds value from a database, API, or log file into a human-readable date.",
        intro:
          "Unix timestamps appear everywhere in software — database columns, API responses, log files, and JWT claims — but they are meaningless to humans at a glance. Converting 1716998400 to 'Wed, 29 May 2024 16:00:00 UTC' takes seconds with this tool. This guide shows how to convert any Unix timestamp to a readable date without writing code or installing software.",
        steps: [
          {
            name: "Copy the timestamp",
            text: "Copy the numeric timestamp from your database query result, API response JSON field, or log entry. It may be 10 digits (seconds) or 13 digits (milliseconds).",
          },
          {
            name: "Paste and read the output",
            text: "Paste the number into the converter. The tool auto-detects seconds vs milliseconds and immediately shows the ISO 8601 UTC string, a human-readable UTC date, and the relative time from now.",
          },
          {
            name: "Copy the format you need",
            text: "Copy the ISO 8601 string for API payloads or data exchange, or the UTC string for a human-readable display. Use the milliseconds value if you need to construct a JavaScript Date object.",
          },
        ],
        faq: [
          {
            question: "What if the date shown is off by several hours?",
            answer:
              "The output is always UTC. Your local time may differ by your timezone offset. For example, if you are in UTC+5:30, a timestamp showing 16:00 UTC is 21:30 in your local time. There is no error — apply your timezone offset to get your local time.",
          },
          {
            question: "The timestamp in my database is a float, not an integer. Does that work?",
            answer:
              "Paste only the integer part (truncate or round the decimal). The fractional part represents sub-second precision, which the tool ignores. For millisecond precision, multiply by 1000 and use the integer result.",
          },
        ],
      },
      {
        slug: "convert-date-to-unix-timestamp",
        title: "How to convert a date to a Unix timestamp",
        intent: "Get the Unix epoch seconds for a specific date to use in a database, API, or JWT.",
        intro:
          "Many systems — SQL databases, REST APIs, JWT tokens, and cron schedulers — store or accept time as Unix epoch seconds. If you know the human-readable date you want but need the timestamp, this converter does it instantly. This guide shows how to convert any date string to Unix seconds and milliseconds without writing code.",
        steps: [
          {
            name: "Enter the date in ISO 8601 format",
            text: "Type or paste the date as 'YYYY-MM-DDTHH:MM:SSZ' — for example, '2025-01-01T00:00:00Z' for midnight UTC on New Year's Day 2025. Always include the 'Z' suffix to specify UTC and avoid timezone ambiguity.",
          },
          {
            name: "Read the unix_seconds field",
            text: "The unix_seconds output is the value to use in SQL timestamps, API query parameters, and JWT 'exp' or 'iat' claims. The unix_ms field is the value for JavaScript Date constructors.",
          },
          {
            name: "Verify with the relative time",
            text: "The 'relative' field (e.g. 'in 3 days' or '6 months ago') lets you sanity-check that the timestamp represents the date you intended before inserting it into a database or generating a token.",
          },
        ],
        faq: [
          {
            question: "How do I get the timestamp for a date in a specific timezone other than UTC?",
            answer:
              "Append the UTC offset to the date string. For example, '2025-01-01T09:00:00+05:30' represents 9:00 AM in UTC+5:30 (India). The tool converts it to UTC internally and returns the correct Unix timestamp.",
          },
          {
            question: "What Unix timestamp is midnight tonight?",
            answer:
              "Enter today's date as 'YYYY-MM-DDT00:00:00Z' for UTC midnight, or with your local UTC offset. For example, midnight Pacific Standard Time (UTC-8) on 2025-06-01 would be '2025-06-01T08:00:00Z'.",
          },
        ],
      },
      {
        slug: "check-jwt-expiry-timestamp",
        title: "How to check a JWT expiry timestamp",
        intent: "Convert the 'exp' claim in a JWT payload from Unix seconds to a readable expiry date.",
        intro:
          "JWT tokens contain an 'exp' claim — a Unix timestamp in seconds indicating when the token expires. When a token is rejected with a 401 error, the first debugging step is to check whether it has expired. This guide shows how to convert the 'exp' value from a decoded JWT to a readable date and compare it against the current time.",
        steps: [
          {
            name: "Decode the JWT and find the exp claim",
            text: "Use the JWT Decoder tool to paste your token and read the payload. Find the 'exp' field — it is a 10-digit Unix timestamp in seconds, for example 1716998400.",
          },
          {
            name: "Paste the exp value here",
            text: "Copy the numeric value of 'exp' and paste it into the Timestamp Converter. The output shows the exact expiry date in UTC and the relative time — for example '3 minutes ago' (expired) or 'in 4 hours' (still valid).",
          },
          {
            name: "Compare against the current time",
            text: "If the relative time says 'X minutes/hours ago', the token is expired and must be refreshed. If it says 'in X minutes/hours', the token is still valid. Also check the 'iat' (issued-at) claim the same way to verify the token was issued when expected.",
          },
        ],
        faq: [
          {
            question: "The exp shows a time far in the future — is the token never expiring?",
            answer:
              "Long-lived tokens are a valid but risky design. An expiry of years in the future means the token never needs refreshing, which increases the blast radius if it is stolen. If you did not intend this, check your token-signing code for a miscalculated expiry duration.",
          },
          {
            question: "Can I set a specific expiry time when generating a JWT?",
            answer:
              "Yes. Convert your desired expiry date to Unix seconds here, then pass that value as the 'exp' claim when signing the token. For example, 'in 1 hour' = Date.now() / 1000 + 3600.",
          },
        ],
      },
      {
        slug: "debug-log-timestamp",
        title: "How to read a Unix timestamp in a log file",
        intent: "Convert a numeric timestamp from a log entry to a readable date for incident debugging.",
        intro:
          "Application logs, web server access logs, and cloud audit trails often record events as Unix timestamps for compactness and precision. During an incident, quickly reading those timestamps without mental arithmetic is essential. This guide shows how to convert log timestamps to readable UTC dates in seconds.",
        steps: [
          {
            name: "Find the timestamp in the log entry",
            text: "Look for a 10-digit integer (seconds) or 13-digit integer (milliseconds) near the start of a log line. In Nginx access logs it appears as a float like 1716998400.123 — use the integer part. In structured JSON logs, it may be a field like 'timestamp' or 'time'.",
          },
          {
            name: "Paste and convert",
            text: "Paste the integer timestamp into the converter. The ISO 8601 UTC string and the relative time appear immediately. For high-volume log analysis, use the REST API: POST /api/timestamp-converter with the timestamp in the 'input' field.",
          },
          {
            name: "Cross-reference with other events",
            text: "Convert timestamps from multiple log entries to identify the sequence of events during an incident. The relative time field ('3 minutes before the deploy' vs 'during the spike') helps you narrate the incident timeline without converting every entry manually.",
          },
        ],
        faq: [
          {
            question: "My log timestamp has a decimal — what does the fractional part mean?",
            answer:
              "Fractional seconds — for example 1716998400.456 means 456 milliseconds past the second. Use the integer part (1716998400) for second-level precision, or multiply the full float by 1000 and truncate to get milliseconds (1716998400456).",
          },
          {
            question: "Can I convert timestamps in bulk?",
            answer:
              "Use the REST API in a shell loop: for ts in 1716998400 1716998401 1716998402; do curl -s -X POST https://quickhelp.dev/api/timestamp-converter -H 'Content-Type: application/json' -d \"{\\\"input\\\":\\\"$ts\\\"}\" | jq .iso8601; done",
          },
        ],
      },
    ],
  },
});

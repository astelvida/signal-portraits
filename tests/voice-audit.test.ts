import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["app", "components"];
const EXTS = [".tsx", ".mdx", ".md"];

const BANNED = [
  "revolutionary",
  "revolution",
  "game-changer",
  "paradigm shift",
  "super excited",
  "incredibly proud",
  "honored to announce",
  "groundbreaking",
  "cutting-edge",
  "leverage", // verb-form ban — surface as a violation for inspection
  "interestingly",
  "notably",
  "importantly",
  "moreover",
  "furthermore",
  "additionally",
  "AI-powered",
  "democratizing",
  "next-generation",
  "super app",
  "the intersection of",
  "I'd love to hear",
  "Drop your thoughts below",
  "Tag someone who",
  "let that sink in",
  "broke my brain",
  "this hits different",
];

const ALLOWED_EMOJI = ["🔴", "🟠", "🟡", "⚪", "❌", "✅", "⏳", "↑", "↓", "↗", "—"];
// The four tier emojis are functional and allowed. "—" appears in JS code comments only (banned for user-facing strings).

function* walkFiles(dir: string): Generator<string> {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (name === "node_modules" || name.startsWith(".") || name === "qa" || name === "docs") continue;
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) {
      yield* walkFiles(full);
    } else if (EXTS.some((e) => name.endsWith(e))) {
      yield full;
    }
  }
}

function visibleText(source: string): string {
  // Strip the obvious code parts: imports, type annotations, comments.
  // The remainder still contains JSX expressions but that's fine — banned vocab
  // is unlikely to appear in code identifiers.
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/^\s*import\s.*$/gm, "")
    .replace(/^\s*export\s+(type|interface)[\s\S]*?\}\s*;?\s*$/gm, "");
}

interface Violation {
  file: string;
  line: number;
  rule: string;
  excerpt: string;
}

function scanFile(path: string): Violation[] {
  const source = readFileSync(path, "utf8");
  const visible = visibleText(source);
  const violations: Violation[] = [];
  const lines = visible.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    // Em dashes — visible string violation
    if (line.includes("—") && !line.includes("// allow-emdash")) {
      // Allow "—" only inside JS-string fallbacks for empty values (e.g., "—" as null marker).
      // Heuristic: if the line contains `?? "—"` or `: "—"` (ternary fallback) we tolerate.
      const isNullMarker = /["']—["']\s*[);}]|\?\?\s*["']—["']|:\s*["']—["']/.test(line);
      if (!isNullMarker) {
        violations.push({ file: path, line: i + 1, rule: "em-dash", excerpt: line.trim().slice(0, 120) });
      }
    }
    // Banned vocabulary (case-insensitive whole-word match)
    for (const term of BANNED) {
      const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (pattern.test(line)) {
        violations.push({
          file: path,
          line: i + 1,
          rule: `banned-vocab:${term}`,
          excerpt: line.trim().slice(0, 120),
        });
      }
    }
  }
  return violations;
}

describe("voice audit", () => {
  it("no banned vocabulary or em dashes in app/ + components/", () => {
    const all: Violation[] = [];
    for (const dir of SCAN_DIRS) {
      for (const path of walkFiles(join(ROOT, dir))) {
        all.push(...scanFile(path));
      }
    }
    if (all.length > 0) {
      const summary = all
        .slice(0, 30)
        .map((v) => `  ${v.file.replace(ROOT + "/", "")}:${v.line}  [${v.rule}]  ${v.excerpt}`)
        .join("\n");
      throw new Error(
        `${all.length} voice violation(s):\n${summary}${all.length > 30 ? `\n  ...and ${all.length - 30} more` : ""}`,
      );
    }
    expect(all).toEqual([]);
  });
});

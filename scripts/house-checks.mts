// fallow-ignore-file coverage-gaps
import { spawnSync } from "node:child_process";

const ignoredPathParts = [
  "/node_modules/",
  "/dist/",
  "/build/",
  "/coverage/",
  "/.vinxi/",
  "/.output/",
  "/web/src/routeTree.gen.ts",
];

const sourceExtensions = [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"];

type Finding = {
  column: number;
  line: number;
  message: string;
  path: string;
};

function capture(command: string, args: Array<string>) {
  return spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

function isSourcePath(path: string) {
  return (
    sourceExtensions.some((extension) => path.endsWith(extension)) &&
    !ignoredPathParts.some((part) => `/${path}`.includes(part))
  );
}

function scanPattern(pattern: string, message: string) {
  const result = capture("rg", [
    "--line-number",
    "--column",
    "--glob",
    "!node_modules",
    "--glob",
    "!dist",
    "--glob",
    "!build",
    "--glob",
    "!coverage",
    pattern,
    ".",
  ]);

  if (result.status !== 0 && result.status !== 1) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }

  return result.stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [path = "", lineNumber = "0", column = "0"] = line.split(":", 3);

      return {
        column: Number(column),
        line: Number(lineNumber),
        message,
        path: path.replace(/^\.\//, ""),
      };
    })
    .filter((finding) => isSourcePath(finding.path));
}

/** Runs Canaveral-specific source lint checks that Biome cannot express. */
export function runHouseChecks() {
  return [
    ...scanPattern(
      "(:\\s*(any|unknown)\\b|<\\s*(any|unknown)\\b|\\bas\\s+(any|unknown)\\b)",
      "Do not use explicit any or unknown types.",
    ),
    ...scanPattern(
      "\\b(function\\s+\\w+|\\)\\s*=>|\\))\\s*:\\s*[A-Za-z_$][A-Za-z0-9_$<>{}\\[\\]|&., ?]*(\\s*\\{|\\s*=>)",
      "Let function return types be inferred.",
    ),
    ...scanPattern(
      "\\b(const|let|var)\\s+[A-Za-z_$][A-Za-z0-9_$]*\\s*:\\s*[^=;]+=",
      "Let variable types be inferred.",
    ),
    ...scanPattern(
      "\\buse(Effect|LayoutEffect|InsertionEffect|State)\\s*\\(",
      "Prefer useSyncExternalStore-backed state before useEffect/useState patterns.",
    ),
  ];
}

/** Prints Canaveral house-check findings in a compiler-like format. */
export function printFindings(findings: Array<Finding>) {
  for (const finding of findings) {
    process.stderr.write(
      `${finding.path}:${finding.line}:${finding.column} lint/canaveral ${finding.message}\n`,
    );
  }
}

// fallow-ignore-file coverage-gaps
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { printFindings, runHouseChecks } from "./house-checks.mts";

const checks = [
  "tsc",
  "biome",
  "house",
  "freview",
  "health",
  "coverage",
  "docstrings",
  "duplication",
  "complexity",
  "hotspots",
];

function run(command: string, args: Array<string>) {
  return spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "inherit",
  });
}

function capture(command: string, args: Array<string>) {
  return spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

function currentBranch() {
  const result = capture("git", ["branch", "--show-current"]);

  if (result.status !== 0) {
    return "";
  }

  return result.stdout.trim();
}

function bypasses() {
  const fromArgs = process.argv
    .slice(2)
    .filter((arg) => arg.startsWith("--bypass="))
    .flatMap((arg) => arg.replace("--bypass=", "").split(","));
  const fromEnv = (process.env.CANAVERAL_GATE_BYPASS ?? "").split(",");
  const bypassSet = new Set([...fromArgs, ...fromEnv].map((item) => item.trim()).filter(Boolean));

  if (bypassSet.has("all")) {
    return new Set(checks);
  }

  return bypassSet;
}

function isBypassed(check: string, bypassSet: Set<string>, branch: string) {
  return branch !== "main" && bypassSet.has(check);
}

function extractNumber(report: string, pattern: RegExp) {
  const match = report.match(pattern);

  if (!match?.[1]) {
    return Number.NaN;
  }

  return Number(match[1].replaceAll(",", ""));
}

function requireNumberMetric(
  failures: Array<string>,
  check: string,
  actual: number,
  expected: number,
  bypassSet: Set<string>,
  branch: string,
) {
  if (isBypassed(check, bypassSet, branch) || actual === expected) {
    return;
  }

  failures.push(
    `${check.toUpperCase()} must be ${expected}; found ${Number.isNaN(actual) ? "unknown" : actual}.`,
  );
}

function requireReportMatch(
  failures: Array<string>,
  check: string,
  passed: boolean,
  message: string,
  bypassSet: Set<string>,
  branch: string,
) {
  if (isBypassed(check, bypassSet, branch) || passed) {
    return;
  }

  failures.push(message);
}

function freviewFailures(report: string, bypassSet: Set<string>, branch: string) {
  const failures = [];
  const health = extractNumber(report, /Health S(?:core|core:)\s*:?\s+(\d+(?:\.\d+)?)/i);
  const coverage = extractNumber(report, /(\d+(?:\.\d+)?)%\s+file coverage/);
  const docstrings = report.includes("✔︎ 100% docstring coverage")
    ? 100
    : extractNumber(report, /Docstring coverage:\s+(\d+(?:\.\d+)?)%/);
  const hotspots = report.includes("| Hotspots |")
    ? extractNumber(report, /\| Hotspots \|\s*(\d+(?:,\d+)*)\s*\|/)
    : extractNumber(report, /(\d+(?:,\d+)*)\s+churn hotspots/);

  requireNumberMetric(failures, "health", health, 97, bypassSet, branch);
  requireNumberMetric(failures, "coverage", coverage, 100, bypassSet, branch);
  requireNumberMetric(failures, "docstrings", docstrings, 100, bypassSet, branch);
  requireNumberMetric(failures, "hotspots", hotspots, 0, bypassSet, branch);
  requireReportMatch(
    failures,
    "duplication",
    report.includes("✓ No code duplication found") ||
      report.includes("Fallow: no code duplication found"),
    "DUPLICATION must be 0.",
    bypassSet,
    branch,
  );
  requireReportMatch(
    failures,
    "complexity",
    !report.includes("High complexity functions"),
    "COMPLEXITY must be 0.",
    bypassSet,
    branch,
  );

  return failures;
}

function freviewReport(output: string) {
  if (output.trim().length > 0) {
    return output;
  }

  if (existsSync("REVIEW.md")) {
    return readFileSync("REVIEW.md", "utf8");
  }

  return output;
}

const branch = currentBranch();
const bypassSet = bypasses();

if (branch === "main" && bypassSet.size > 0) {
  process.stderr.write("Canaveral gate bypasses are not allowed on main.\n");
  process.exit(1);
}

const failures = [];

if (!isBypassed("tsc", bypassSet, branch)) {
  const typecheck = run("bun", ["tsc"]);

  if (typecheck.status !== 0) {
    failures.push("tsc failed.");
  }
}

if (!isBypassed("biome", bypassSet, branch)) {
  const biome = run("bun", ["x", "biome", "check", "--error-on-warnings", "."]);

  if (biome.status !== 0) {
    failures.push("Biome failed.");
  }
}

if (!isBypassed("house", bypassSet, branch)) {
  const findings = runHouseChecks();

  if (findings.length > 0) {
    printFindings(findings);
    failures.push("Canaveral house checks failed.");
  }
}

const freviewPath = `${process.env.HOME ?? ""}/bin/freview`;

if (!isBypassed("freview", bypassSet, branch)) {
  if (!existsSync(freviewPath)) {
    failures.push("~/bin/freview was not found.");
  } else {
    const freview = capture(freviewPath, []);
    const report = freviewReport(`${freview.stdout}${freview.stderr}`);
    process.stdout.write(report);

    failures.push(...freviewFailures(report, bypassSet, branch));

    if (freview.status !== 0 && failures.length === 0) {
      failures.push(`freview exited with code ${freview.status}.`);
    }
  }
}

if (failures.length > 0) {
  process.stderr.write(`\nCanaveral gate failed on ${branch || "unknown branch"}:\n`);

  for (const failure of failures) {
    process.stderr.write(`- ${failure}\n`);
  }

  if (branch !== "main") {
    process.stderr.write(
      "\nBypass locally with CANAVERAL_GATE_BYPASS=all or --bypass=health,coverage,docstrings,duplication,complexity,hotspots.\n",
    );
  }

  process.exit(1);
}

process.stdout.write("Canaveral gate passed.\n");

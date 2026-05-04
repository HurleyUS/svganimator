// fallow-ignore-file coverage-gaps
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { printFindings, runHouseChecks } from "./house-checks.mts";

function run(command: string, args: Array<string>) {
  return spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "inherit",
  });
}

const typecheck = run("bun", ["tsc"]);
const biome = run("bun", ["x", "biome", "check", "--error-on-warnings", "."]);
const findings = runHouseChecks();

if (findings.length > 0) {
  printFindings(findings);
}

const failed = [typecheck.status, biome.status, findings.length > 0 ? 1 : 0].some(
  (status) => status !== 0,
);

if (failed) {
  process.exit(typecheck.status || biome.status || 1);
}

const freviewPath = `${process.env.HOME ?? ""}/bin/freview`;

if (existsSync(freviewPath)) {
  const freview = run(freviewPath, []);

  if (freview.status !== 0) {
    process.stderr.write(`~/bin/freview exited with code ${freview.status ?? 1}.\n`);
  }

  process.exit(0);
}

process.stdout.write("Biome and Canaveral lint checks passed. ~/bin/freview was not found.\n");

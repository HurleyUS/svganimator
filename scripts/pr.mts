// fallow-ignore-file coverage-gaps
import { spawnSync } from "node:child_process";

const [command, ...args] = process.argv.slice(2);
const allowedCommands = new Set(["create", "merge"]);

if (!(command && allowedCommands.has(command))) {
  process.stderr.write(
    "Usage: bun scripts/pr.mts <create|merge> [...gh args]\n",
  );
  process.exit(1);
}

const gate = spawnSync("bun", ["scripts/gate.mts"], {
  cwd: process.cwd(),
  stdio: "inherit",
});

if (gate.status !== 0) {
  process.exit(gate.status ?? 1);
}

const pr = spawnSync("gh", ["pr", command, ...args], {
  cwd: process.cwd(),
  stdio: "inherit",
});

process.exit(pr.status ?? 1);

// fallow-ignore-file coverage-gaps
import { type SpawnSyncReturns, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type CommandRunner = (
  command: string,
  args: Array<string>,
) => SpawnSyncReturns<string>;

/** Ensures the global Caddyfile imports project dev-site snippets. */
export function ensureCaddyImport(caddyfilePath: string, snippetsDir: string) {
  const importLine = `import ${path.join(snippetsDir, "*.caddy")}`;
  const legacyImportLine = "import ~/.local/etc/caddy/dev-sites/*.caddy";
  const marker = "# Project dev sites";
  const existing = existsSync(caddyfilePath)
    ? readFileSync(caddyfilePath, "utf8")
    : "";
  const replacedLegacy = existing.replaceAll(legacyImportLine, importLine);

  if (replacedLegacy.includes(importLine)) {
    if (replacedLegacy !== existing) {
      writeFileSync(caddyfilePath, replacedLegacy, "utf8");
    }

    return;
  }

  const suffix = replacedLegacy.trimEnd().length > 0 ? "\n\n" : "";
  writeFileSync(
    caddyfilePath,
    `${replacedLegacy.trimEnd()}${suffix}${marker}\n${importLine}\n`,
    "utf8",
  );
}

/** Writes a Caddy reverse-proxy snippet for the current project. */
export function writeProjectSnippet(
  snippetPath: string,
  host: string,
  port: number,
) {
  const content = `${host} {\n\treverse_proxy 127.0.0.1:${port}\n}\n`;
  writeFileSync(snippetPath, content, "utf8");
}

function printCommandResult(
  result: SpawnSyncReturns<string>,
  output = process,
) {
  if (result.stdout) {
    output.stdout.write(result.stdout);
  }

  if (result.stderr) {
    output.stderr.write(result.stderr);
  }
}

function runCommand(command: string, args: Array<string>) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  return result;
}

function caddyAdminUnavailable(result: SpawnSyncReturns<string>) {
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  const loadUrls = ["http://localhost:2019/load", "http://127.0.0.1:2019/load"];

  return (
    loadUrls.some((url) => output.includes(url)) &&
    output.includes("connect: connection refused")
  );
}

function reloadCaddy(caddyfilePath: string, commandRunner: CommandRunner) {
  return commandRunner("caddy", [
    "reload",
    "--config",
    caddyfilePath,
    "--address",
    "127.0.0.1:2019",
  ]);
}

function startCaddy(caddyfilePath: string, commandRunner: CommandRunner) {
  return commandRunner("caddy", ["start", "--config", caddyfilePath]);
}

function resolveLoadOptions(options: {
  commandRunner?: CommandRunner;
  exit?: (code?: number) => never;
  output?: typeof process;
  warn?: (message: string) => void;
}) {
  return {
    commandRunner: options.commandRunner ?? runCommand,
    exit: options.exit ?? process.exit,
    output: options.output ?? process,
    warn: options.warn ?? process.stderr.write.bind(process.stderr),
  };
}

/** Reloads Caddy, starting it when the admin endpoint is unavailable. */
export function ensureCaddyLoaded(
  caddyfilePath: string,
  options: {
    commandRunner?: CommandRunner;
    exit?: (code?: number) => never;
    output?: typeof process;
    warn?: (message: string) => void;
  } = {},
) {
  const resolved = resolveLoadOptions(options);
  const reload = reloadCaddy(caddyfilePath, resolved.commandRunner);
  printCommandResult(reload, resolved.output);

  if (reload.status === 0) {
    return;
  }

  if (!caddyAdminUnavailable(reload)) {
    resolved.exit(reload.status ?? 1);
  }

  resolved.warn(
    "[dev-localhost] Caddy is not running. Starting it now. You may be prompted once for your password so Caddy can finish local HTTPS setup.\n",
  );

  const start = startCaddy(caddyfilePath, resolved.commandRunner);
  printCommandResult(start, resolved.output);

  if (start.status !== 0) {
    resolved.exit(start.status ?? 1);
  }
}

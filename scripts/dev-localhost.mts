// fallow-ignore-file coverage-gaps
import { type ChildProcess, spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import {
  ensureCaddyImport,
  ensureCaddyLoaded,
  writeProjectSnippet,
} from "./dev-localhost-caddy.mts";
import { portForSlug, repoSlugFromCwd } from "./dev-localhost-info.mts";

type StartDevLocalhostOptions = {
  createDirectory?: typeof mkdirSync;
  env?: NodeJS.ProcessEnv;
  exit?: (code?: number) => never;
  homeDirectory?: () => string;
  kill?: typeof process.kill;
  log?: (message: string) => void;
  spawnProcess?: typeof spawn;
};

function resolveOptions(options: StartDevLocalhostOptions) {
  return {
    createDirectory: options.createDirectory ?? mkdirSync,
    env: options.env ?? process.env,
    exit: options.exit ?? process.exit,
    homeDirectory: options.homeDirectory ?? homedir,
    kill: options.kill ?? process.kill,
    log: options.log ?? process.stdout.write.bind(process.stdout),
    spawnProcess: options.spawnProcess ?? spawn,
  };
}

function devSitePaths(cwd: string, homeDirectory: () => string) {
  const slug = repoSlugFromCwd(cwd);
  const host = `${slug}.localhost`;
  const port = portForSlug(slug);
  const caddyfilePath = path.join(homeDirectory(), ".local", "etc", "Caddyfile");
  const snippetsDir = path.join(homeDirectory(), ".local", "etc", "caddy", "dev-sites");
  const snippetPath = path.join(snippetsDir, `${slug}.caddy`);

  return { caddyfilePath, host, port, snippetPath, snippetsDir };
}

function ensureDevSiteFiles(
  paths: ReturnType<typeof devSitePaths>,
  createDirectory: typeof mkdirSync,
) {
  createDirectory(path.dirname(paths.caddyfilePath), { recursive: true });
  createDirectory(paths.snippetsDir, { recursive: true });
  ensureCaddyImport(paths.caddyfilePath, paths.snippetsDir);
  writeProjectSnippet(paths.snippetPath, paths.host, paths.port);
}

function loadCaddyOrExit(caddyfilePath: string, exit: (code?: number) => never) {
  try {
    ensureCaddyLoaded(caddyfilePath);
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) {
      throw error;
    }

    process.stderr.write("[dev-localhost] `caddy` was not found on PATH.\n");
    exit(1);
  }
}

function attachExitForwarding(
  child: ChildProcess,
  kill: typeof process.kill,
  exit: (code?: number) => never,
) {
  child.on("exit", (code, signal) => {
    if (signal) {
      kill(process.pid, signal);
      return;
    }

    exit(code ?? 0);
  });
}

/** Starts the web dev server behind a Caddy-managed localhost domain. */
export function startDevLocalhost(cwd = process.cwd(), options: StartDevLocalhostOptions = {}) {
  const resolved = resolveOptions(options);
  const paths = devSitePaths(cwd, resolved.homeDirectory);
  const url = `https://${paths.host}`;

  ensureDevSiteFiles(paths, resolved.createDirectory);
  loadCaddyOrExit(paths.caddyfilePath, resolved.exit);
  resolved.log(`[dev-localhost] ${url} -> 127.0.0.1:${paths.port}\n`);

  const child = resolved.spawnProcess(
    "bun",
    ["--filter", "@canaveral/web", "dev:raw", "--port", String(paths.port)],
    {
      cwd,
      env: {
        ...resolved.env,
        DEV_HOST: paths.host,
        DEV_URL: url,
        PORT: String(paths.port),
        PUBLIC_APP_URL: url,
      },
      stdio: "inherit",
    },
  );

  attachExitForwarding(child, resolved.kill, resolved.exit);

  return child as ChildProcess;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startDevLocalhost();
}

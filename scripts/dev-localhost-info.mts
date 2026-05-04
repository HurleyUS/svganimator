// fallow-ignore-file coverage-gaps
import path from "node:path";

/** Derives a stable localhost slug from the repository directory. */
export function repoSlugFromCwd(cwd = process.cwd()) {
  return path
    .basename(cwd)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Maps a project slug to a deterministic local development port. */
export function portForSlug(slug: string) {
  let hash = 0;

  for (const character of slug) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return 3300 + (hash % 5000);
}

/** Returns the derived local host, port, slug, and HTTPS URL. */
export function getDevLocalhostInfo(cwd = process.cwd()) {
  const slug = repoSlugFromCwd(cwd);
  const host = `${slug}.localhost`;
  const port = portForSlug(slug);

  return { host, port, slug, url: `https://${host}` };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(getDevLocalhostInfo(), null, 2)}\n`);
}

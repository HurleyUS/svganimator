# Canaveral Agent Guide

Canaveral is a Bun-native TanStack Start launch pad. Treat this file as the source of truth for automated coding agents. `CLAUDE.md` and `GEMINI.md` intentionally point back here.

## Runtime And Tooling

- Use Bun exclusively for package management and scripts.
- `bun run dev` is Caddy-controlled and serves the web app at `<project-name>.localhost`.
- `bun run dev:raw` bypasses Caddy and runs the TanStack Start/Vite dev server directly.
- `bun run dev:info` prints the derived localhost slug, host, port, and URL.
- `bun run build` is a production bundle check, not the main correctness gate.
- `bun run typecheck` uses `tsgo --noEmit` across all workspaces.
- `bun run lint` runs Biome with warnings as failures, then Canaveral house checks, then `~/bin/freview`.
- `bun run lint:fix` runs Biome writes only; it does not bypass house lint rules.

## House TypeScript Rules

- Do not use explicit `any` or explicit `unknown`.
- Prefer inferred variable and function return types.
- Do not write `function foo(): Foo` unless a framework contract absolutely requires it.
- Do not write `const foo: Foo = ...`; shape the value and let TypeScript infer it.
- If a boundary needs validation, use Zod schemas and infer from them.
- Prefer `useSyncExternalStore`-backed state for shared reactive state. Treat `useEffect` and `useState` as suspicious until proven necessary.

## Tailwind V4 Standards

- Tailwind v4 CSS-first configuration lives in `web/src/styles.css`.
- Prefer `@theme inline`, CSS custom properties, and semantic tokens over ad hoc utility sprawl.
- Keep dark/light variants CSS-driven with `@custom-variant`.
- Use Tailwind plugins through CSS `@plugin` declarations.
- Avoid one-off colors in components when a semantic token exists.
- Keep app UI dense, scannable, and product-focused.

## Fallow Local Gate

Before any `git commit` or `git push`, run:

```sh
fallow audit --format json --quiet --explain
```

If the verdict is `fail`, fix the reported findings before retrying. Treat JSON runtime errors like `{ "error": true, ... }` as non-blocking.

`bun run lint` also runs `~/bin/freview` after Biome and Canaveral house checks pass. In a brand-new non-git scaffold, `freview` can report missing git/base/docstring context; read the report, but do not confuse that with Biome/typecheck failure.

## Workspace Shape

```txt
pub/
web/
desktop/
mobile/
shared/config
shared/env
shared/forms
shared/state
shared/ui
shared/utils
```

Keep runtime-specific integrations in their runtime workspace. Keep pure contracts, schemas, config, and utilities in `shared/*`.

---

<!-- fallow:setup-hooks:start -->
## Fallow local gate

Before any `git commit` or `git push`, run `fallow audit --format json --quiet --explain`. If the verdict is `fail`, fix the reported findings before retrying. Treat JSON runtime errors like `{ "error": true, ... }` as non-blocking.

Audit defaults to `gate=new-only`: only findings introduced by the current changeset affect the verdict. Inherited findings on touched files are reported under `attribution` and annotated with `introduced: false`, but do not block the commit. Set `[audit] gate = "all"` in `fallow.toml` to gate every finding in changed files.
<!-- fallow:setup-hooks:end -->

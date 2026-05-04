# Canaveral

Canaveral is a Bun-native TanStack Start launch pad. It starts as a monorepo with web, desktop, mobile, public/devrel, and shared package workspaces.

## Stack

- Bun workspaces
- TanStack Start and TanStack Router
- Clerk, Convex, Resend, Stripe, PostHog, and Sentry wiring points
- Varlock-style environment contract plus Zod runtime validation
- Zustand, Zod, React Hook Form, and `@hookform/resolvers`
- `tsgo`/TypeScript and strict Biome

## Workspaces

```txt
pub/
web/
desktop/
mobile/
shared/
  config/
  env/
  forms/
  state/
  ui/
  utils/
```

## Setup

```sh
bun install
cp .env.example .env
bun run env:check
bun run dev
```

The default web app runs through Caddy at `https://canaveral.localhost`. Use `bun run dev:raw` to run Vite directly.

# Flareo Web

Standalone Astro app for the Flareo marketing/landing page. Same UI, behaviour, and interactivity as the original dashboard landing.

## Setup

```bash
bun install
```

## Dev

```bash
bun run dev
```

From the repo root:

```bash
bun run dev:web
```

## Build

```bash
bun run build
```

Output is in `dist/` (static HTML/CSS/JS). Can be deployed to Cloudflare Pages, or any static host.

## Environment

- **`PUBLIC_API_URL`** – API base URL for the live workflow demo (e.g. `http://localhost:8787`). Used to fetch `/nodes`.
- **`PUBLIC_DASHBOARD_URL`** – Dashboard app URL. Links like “Sign in”, “Get started”, “Try editor” point here. If unset, links use the current origin (same host as the landing).

Example for separate landing and dashboard origins:

```env
PUBLIC_DASHBOARD_URL=https://app.flareo.com
PUBLIC_API_URL=https://api.flareo.com
```

# Flareo Dashboard

Nuxt 3 app for the Flareo UI (flows, runs, editor). Deploy as a **separate Cloudflare Pages project** and point it at your Worker API.

## Local dev

```bash
# From repo root
bun run dev:dashboard
```

API URL defaults to `http://localhost:8787`. Override with `NUXT_PUBLIC_API_URL` if needed.

## Deploy

One-click deploy (see [one-click-deploy.md](../../docs/one-click-deploy.md)) runs the root deploy script, which deploys the Worker then builds this dashboard with the Worker URL and deploys it to Pages. Set `CLOUDFLARE_WORKER_URL` or `CLOUDFLARE_WORKERS_SUBDOMAIN` in the build env so the dashboard is included.

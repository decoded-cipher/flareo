#!/usr/bin/env sh
set -e

# 1. Deploy Worker (API, D1, R2, Workflows)
echo "Deploying Worker..."
npx wrangler deploy 2>&1 | tee deploy.log

# 2. Resolve Worker URL for dashboard build
WORKER_URL="${CLOUDFLARE_WORKER_URL}"
if [ -z "$WORKER_URL" ] && [ -n "$CLOUDFLARE_WORKERS_SUBDOMAIN" ]; then
  WORKER_URL="https://flareo-api.${CLOUDFLARE_WORKERS_SUBDOMAIN}.workers.dev"
fi
if [ -z "$WORKER_URL" ]; then
  WORKER_URL=$(grep -oE 'https://[a-zA-Z0-9.-]+\.workers\.dev' deploy.log 2>/dev/null | head -1 || true)
fi
if [ -z "$WORKER_URL" ]; then
  echo "Skipping Pages: set CLOUDFLARE_WORKER_URL or CLOUDFLARE_WORKERS_SUBDOMAIN in your build env to deploy the dashboard."
  rm -f deploy.log
  exit 0
fi
rm -f deploy.log
echo "Worker URL: $WORKER_URL"

# 3. Build dashboard with Worker URL
echo "Building dashboard..."
NUXT_PUBLIC_API_URL="$WORKER_URL" bun run --filter flareo-dashboard generate
rm -rf dist-dashboard
cp -r apps/dashboard/.output/public dist-dashboard

# 4. Create Pages project if needed, then deploy
echo "Deploying dashboard to Pages..."
npx wrangler pages project create flareo-dashboard --production-branch=main 2>/dev/null || true
npx wrangler pages deploy dist-dashboard --project-name=flareo-dashboard

echo "Done. Worker: $WORKER_URL | Dashboard: see Cloudflare Pages dashboard for URL."

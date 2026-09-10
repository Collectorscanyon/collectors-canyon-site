# Collector's Canyon - Public Website

## Development

```bash
# Install dependencies
npm install

# Refresh public API JSON from in-repo source data
npm run freshness

# Build site locally
npm run build

# Serve locally
npm run dev
```

## Daily Freshness Path (No Auto-Deploy)

This repo includes a safe daily freshness check to keep public site data
fresh without auto-publishing to production.

### What runs daily

- Workflow: `.github/workflows/daily-freshness.yml`
- Triggers:
  - `workflow_dispatch` (manual run)
  - daily schedule (`cron: 17 13 * * *`)
- Steps:
  1. `npm ci`
  2. `npm run freshness` (`scripts/refresh-site-data.cjs`)
  3. `npm run build`
  4. Upload artifacts only (`public/api/*.json`, `dist/`)

### Data sources and fail-closed behavior

`npm run freshness` reads only in-repo files:
- `state/dashboard/current.json` (**required**)
- `data/spotlight.json` (optional)

If `state/dashboard/current.json` is missing, malformed, or stale beyond
`MAX_STALENESS_HOURS` (default `36`), the script exits non-zero. It does not
invent inventory, ownership, or pricing.

The script preserves existing pricing authority fields from source data
(`pcPrice`) and does not fabricate replacements.

### What still needs human approval before Pages deploy

This workflow does not deploy to Cloudflare Pages and does not change DNS.
A person must review outputs and explicitly approve any deploy process.

### Perry runbook: one freshness pass and review

1. Open GitHub Actions and run **Daily Freshness Check** manually.
2. Confirm the workflow succeeds.
3. Download and review:
   - `refreshed-public-api` artifact (`public.json`, `snapshot.json`)
   - `site-dist` artifact (static build output)
4. Verify the `freshness` block in `public/api/*.json` for recency.
5. If output is acceptable, proceed with your separate manual Pages deploy flow.

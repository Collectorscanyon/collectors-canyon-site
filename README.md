# Collector's Canyon - Public Website

## Development

```bash
# Install dependencies
npm install

# Optional: set local offer inbox + Courtyard seller URL
# export VITE_OFFER_FORM_ENDPOINT="https://formspree.io/f/<your-form-id>"
# export VITE_COURTYARD_SELLER_URL="https://courtyard.io/<seller-or-collection-url>"

# Refresh public API JSON from in-repo source data
npm run freshness

# Build site locally
npm run build

# Serve locally
npm run dev
```

## Offer inbox (inbound interest only)

The public site includes an offer inbox section for inbound buyer interest on owned sell-side cards.

- It does **not** execute or accept marketplace buys/offers.
- Live Courtyard listings remain the authoritative source of availability and ask.
- HOLD/museum pieces are display-only and not for sale from the form.

### Owner configuration

Set these variables in Cloudflare Pages project settings (or local shell before `npm run build`):

- `VITE_OFFER_FORM_ENDPOINT`  
  Formspree/Getform endpoint URL (example: `https://formspree.io/f/<form_id>`).
- `VITE_COURTYARD_SELLER_URL`  
  Public Courtyard profile/collection URL used by CTA buttons.

No production deploy is automated from this repository. Perry should deploy Pages separately after review.

## Local verification checklist

1. `npm run dev` and open the site.
2. Confirm **Offer Inbox** section appears with inbound-only disclaimer text.
3. With `VITE_OFFER_FORM_ENDPOINT` unset, submit should fail closed with a configuration message.
4. With `VITE_OFFER_FORM_ENDPOINT` set, submit should return success from your form provider.
5. Confirm SEO basics:
   - page title + description + OG/Twitter tags
   - `public/robots.txt`
   - `public/sitemap.xml`
6. Confirm CTAs route to Courtyard and copy distinguishes live listings vs HOLD/museum display pieces.

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

## Grading submissions tracker

Private page at `/submissions` (alias `/track`) so a friend can log in with a
shared access code and check current grading submissions. Works with any
company name in the JSON (PSA, Beckett, CGC, etc.).

This slice does **not** sync live PSA/Beckett APIs. Seed rows are marked
**EXAMPLE**. The owner updates the file and redeploys Pages.

The tracker does **not** write marketplace offers, accept Courtyard buys, or
invent nets / fees / profit numbers.

### Access code (fail closed)

Set at build time (Cloudflare Pages env, or a local `.env` — see `.env.example`):

- `VITE_SUBMISSIONS_ACCESS_CODE`

If this variable is missing or blank, `/submissions` shows
**coming soon / not configured** and does **not** fetch or render submission
rows. That is intentional so an unconfigured deploy cannot leak the list.

This is a simple shared-password UI gate baked into the frontend build. It is
not per-user accounts. Do not put highly sensitive personal data in the JSON.

The gated page sets `noindex, nofollow` (meta + `X-Robots-Tag` on
`/submissions` and `/track`).

### How to add or update a submission

1. Edit `public/data/submissions.json`.
2. Add or change a row in `submissions` using this shape:

```json
{
  "id": "unique-row-id",
  "example": false,
  "company": "PSA",
  "submissionId": "company-or-internal-id",
  "submittedAt": "2026-04-24",
  "itemCount": 12,
  "status": "QC",
  "etaDays": 140,
  "notes": "What changed today",
  "lastUpdated": "2026-09-11"
}
```

Known statuses: `Preparing`, `Received`, `QC`, `Grading`, `Graded`,
`Shipped`, `Delivered`, `On Hold`. Other status strings still render.

3. Bump `lastRefreshedAt` (ISO timestamp) when you do a daily pass.
4. Mark demo rows with `"example": true` so the UI shows an EXAMPLE badge.
5. Validate, then commit and redeploy Pages (manual — this repo does not
   auto-deploy):

```bash
npm run validate:submissions
npm run build
```

### Daily refresh (owner runbook)

There is no grader scraper. Daily update means:

1. Open `public/data/submissions.json`.
2. Set `status`, `etaDays`, `notes`, `itemCount`, and `lastUpdated` from the
   company portal or your own notes.
3. Set `lastRefreshedAt` to today.
4. Run `npm run validate:submissions`.
5. Commit the JSON and deploy Cloudflare Pages yourself.

`etaDays` is an owner-entered estimate (for example a PSA QC ~140-day turn).
It is not calculated from a live API.

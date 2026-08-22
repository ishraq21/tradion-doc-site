# Screenshot pipeline

Every screenshot in the docs is captured by a script, not by hand. That's the only way a docs site for a product shipping this fast stays accurate.

## One-time setup

### 1. Install

```bash
cd docs-site
npm install
npx playwright install chromium
```

### 2. Seed a demo account

The captures need an account with realistic-but-fake data. Create it once against your local or staging database:

```bash
node scripts/seed-docs-demo.js   # TODO: write this, see "Seed data" below
```

Note the resulting `Profile.id` — that's `DOCS_DEMO_USER_ID`.

### 3. Add `data-doc` attributes

Full-page shots work out of the box. Cropped shots (`clip` in `shots.ts`) need a stable hook on the element, because class names change every time someone touches the styling.

Add `data-doc="..."` to the component in the app:

```tsx
<div data-doc="verdict-card" className="...">
```

The full list of hooks the script expects is in `shots.ts`. Grep for `data-doc=` to see which ones exist. This is a one-time cost of about an hour and it makes the whole pipeline stop breaking.

## Running

```bash
DOCS_BASE_URL=http://localhost:3000 \
JWT_SECRET=<same secret the server uses> \
DOCS_DEMO_USER_ID=<profile id> \
npm run shots
```

| Flag | Effect |
| --- | --- |
| `--only=portfolio` | Capture only slugs containing "portfolio" |
| `--headed` | Watch the browser drive itself |
| `--keep-missing` | Report failures without a non-zero exit |

Output lands in `docs-site/images/<slug>.png` at 1600×1000 @2× (so 3200×2000 actual — retina-crisp in Mintlify's lightbox).

A run report is written to `images/_capture-report.json`.

## How it works

Three things make this reliable:

**Navigation without URLs.** Tradion routes on the `ViewState` enum in localStorage (`tradion_active_view`), not React Router. The script seeds that key via `addInitScript` and reloads.

**Auth without OAuth.** The script mints the same HS256 JWT the server issues and sets it as the `auth_token` cookie. No Google flow, no magic-link inbox polling.

**Determinism.** Animations and transitions are zeroed, `Date` is pinned to a fixed timestamp so relative times don't drift, the caret is hidden, and live tickers are suppressed via `[data-doc-freeze]`. Without this, every run produces a diff on every image and you learn nothing from reviewing them.

<!-- prettier-ignore -->
> **Never point `DOCS_BASE_URL` at production.** The script refuses `app.tradionlabs.com` explicitly. Run it against localhost or a dedicated staging deploy.

## Seed data

The demo account should carry enough history that no screen shows an empty state:

| Needs | Why |
| --- | --- |
| ~40 closed trades across 8–10 tickers, mixed W/L | Trade log, broker trades, patterns |
| ≥ 5 completed autopsies | Unlocks the Psychological Profile and populates the scorecard |
| ≥ 3 playbook rules | Playbook manager, pre-flight checklist |
| A portfolio of 10–14 positions across 5+ sectors | Portfolio dashboard, allocation chart |
| ~90 days of portfolio snapshots | Net worth equity curve |
| 4 automations: 1-condition, 2-condition, options, agent | Every canvas screenshot |
| ~20 automation runs, at least one failed delivery | Runs list and run detail |
| 3 saved quant analyses with charts | Terminal, canvas, multi-cell |
| 2 chart analyses, 2 Lens analyses, 2 earnings reports | Verdict cards, history lists |

Use recognisable but clearly fake tickers and round-ish numbers. Nothing that could be mistaken for a real customer's book.

## When to re-run

- Before every docs deploy
- After any UI change to a documented screen
- On a monthly cron regardless, to catch drift nobody flagged

## CI

```yaml
# .github/workflows/docs-screenshots.yml
name: Docs screenshots
on:
  workflow_dispatch:
  schedule: [{ cron: '0 6 1 * *' }]   # monthly
jobs:
  capture:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd docs-site && npm ci && npx playwright install --with-deps chromium
      - run: cd docs-site && npm run shots
        env:
          DOCS_BASE_URL: ${{ secrets.DOCS_STAGING_URL }}
          JWT_SECRET: ${{ secrets.DOCS_STAGING_JWT_SECRET }}
          DOCS_DEMO_USER_ID: ${{ secrets.DOCS_DEMO_USER_ID }}
      - uses: peter-evans/create-pull-request@v6
        with:
          branch: docs/screenshot-refresh
          title: 'docs: refresh screenshots'
          add-paths: docs-site/images/**
```

Opening a PR rather than committing directly means a human reviews the image diff — which is exactly where you catch "the dashboard silently lost its sector chart three weeks ago."

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Timeout waiting for selector` on a `clip` shot | The `data-doc` attribute isn't in the component yet |
| Blank or skeleton screenshot | Increase `settle` for that shot, or add a `waitFor` on a real content selector |
| Empty state instead of data | Seed data missing for that feature |
| 401 / bounced to login | `JWT_SECRET` doesn't match the server, or `DOCS_DEMO_USER_ID` isn't a real profile |
| Every image diffs on every run | Something animated or time-based isn't frozen — add it to `STABILISE_CSS` or tag it `data-doc-freeze` |

# Captured screenshots

Real screens from the live app, captured with `scripts/capture-mask.js` active so no account data survives into a public page. The `earnings-research-*` captures are the exception: they were taken by hand from a test account, and hold only public tickers and role labels (no names).

| File | Screen | Used on | Masked |
| --- | --- | --- | --- |
| `chart-analyzer-history.jpg` | Chart Analyzer history | `research/chart-analyzer` | Nothing needed |
| `earnings-research-thread.jpg`, `earnings-research-overview.jpg`, `earnings-research-what-changed.jpg`, `earnings-research-compare.jpg`, `earnings-research-scenarios.jpg` | AI Earnings Research thread and its four views | `research/ai-earnings-research` | Nothing needed, public tickers only |
| `earnings-research-working-notes.jpg` | AI Earnings Research, working notes mid-run | `research/ai-earnings-research` | Cropped to the progress area |
| `earnings-research-sources.jpg`, `earnings-research-estimates.jpg` | AI Earnings Research, Sources panel and estimates table | `research/earnings-evidence` | Nothing needed, public tickers only |
| `earnings-research-thesis-form.jpg` | Research Notebook, New Thesis form | `research/earnings-notebook` | Cropped to the dialog |
| `trade-autopsy-overview.jpg` | Trade Autopsy → Overview | `trade-intelligence/trade-autopsy` | Ticker, P&L |
| `account-settings.jpg` | Settings | `account/settings` | Name, email |
| `home.jpg` | Home | `get-started/welcome`, `get-started/tour` | Nothing needed: a demo account (first name "Jane"), public tickers. Cropped to the content column, so the sidebar is not shown |
| `asset-manager.jpg` | AI Portfolio Analyst | `portfolio/ai-portfolio-analyst` | Nothing needed |
| `lens-analysis.jpg`, `lens-chart.jpg`, `lens-signals.jpg` | Lens | `research/lens` | Nothing needed |

Captured in dark mode, most at 1452×840.

## Screens deliberately NOT captured

**Profile.** Every panel is personal behavioural analysis, and the AI verdict states real losses and real tickers *inside written sentences* — "AAPL and PLTR alone have erased over $X". Masking prose without wrecking the sentence is not reliably possible. Use `images/diagrams/profile-anatomy.svg`, which labels what each panel measures without showing a single figure.

**Portfolio.** Not a privacy problem: the account available for capture holds almost nothing, so a screenshot of it teaches a reader less than the prose does. `portfolio/reading-the-dashboard` runs without an image on purpose. Recapture against an account with real positions and it becomes worth including.

## Recapturing

1. Open `app.tradionlabs.com`, sign in, set the window to roughly 1450×840.
2. Paste `scripts/capture-mask.js` into the DevTools console. It returns a count of what it rewrote and keeps re-applying as you navigate.
3. Navigate, wait for the screen to settle, and check the mask took hold **before** you capture. Read the actual pixels — do not assume.
4. Save as `<name>.jpg` here and update the table above.

<!-- prettier-ignore -->
> Check every image by eye before publishing. The mask is a filter, not a guarantee — it caught nine things during the first run and missed two that needed the rule tightening. `npm run audit` checks the prose in the `.mdx` files; it cannot read pixels.

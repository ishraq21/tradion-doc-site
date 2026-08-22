# Captured screenshots

Real screens from the live app, captured with `scripts/capture-mask.js` active so no account data survives into a public page.

| File | Screen | Used on | Masked |
| --- | --- | --- | --- |
| `home.jpg` | Home | `get-started/tour` | Name, portfolio value, win rate, trade count |
| `quant-analysis.jpg` | AI Quant Research, saved session | `research/quant-research` | Nothing needed — public tickers only |
| `chart-analyzer-history.jpg` | Chart Analyzer history | `research/chart-analyzer` | Nothing needed |
| `earnings-analysis.jpg` | Earnings Spider report | `research/earnings-spider` | Nothing needed |
| `trade-autopsy-overview.jpg` | Trade Autopsy → Overview | `trade-intelligence/trade-autopsy` | Ticker, P&L |
| `automations-list.jpg` | Automations | `automations/overview` | Nothing needed |
| `account-settings.jpg` | Settings | `account/settings` | Name, email |

Captured at 1452×840 in dark mode.

## Screens deliberately NOT captured

**Profile.** Every panel is personal behavioural analysis, and the AI verdict states real losses and real tickers *inside written sentences* — "AAPL and PLTR alone have erased over $X". Masking prose without wrecking the sentence is not reliably possible. Use `images/diagrams/profile-anatomy.svg`, which labels what each panel measures without showing a single figure.

**The AI verdict block on Home.** Same problem, same reason. `home.jpg` was captured from an account where that block was short; check it every time before reusing this screen.

**Portfolio.** Not a privacy problem — the account it was captured from holds almost nothing, so the screenshot teaches a reader less than `images/diagrams/portfolio-anatomy.svg` does. Recapture it against an account with real positions and it becomes worth including.

## Recapturing

1. Open `app.tradionlabs.com`, sign in, set the window to roughly 1450×840.
2. Paste `scripts/capture-mask.js` into the DevTools console. It returns a count of what it rewrote and keeps re-applying as you navigate.
3. Navigate, wait for the screen to settle, and check the mask took hold **before** you capture. Read the actual pixels — do not assume.
4. Save as `<name>.jpg` here and update the table above.

<!-- prettier-ignore -->
> Check every image by eye before publishing. The mask is a filter, not a guarantee — it caught nine things during the first run and missed two that needed the rule tightening. `npm run audit` checks the prose in the `.mdx` files; it cannot read pixels.

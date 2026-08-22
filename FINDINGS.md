# Findings from documenting Tradion

Writing these docs meant reading the code for every feature. That surfaced a pile of places where the README, the internal docs, or the UI copy claim something the code does not do — plus a few things that look like real bugs.

Nothing here was written into the docs. The docs describe what the code actually does. This file is the list of gaps for you to act on.

---

## Likely bugs

| # | Where | What |
| --- | --- | --- |
| 1 | `AnalysisSession.tsx:1129` | `ScenarioModal`'s `onRunSimulation` is wired to `() => {}`. **Clicking "Run Simulation" does nothing.** It only ever worked in the dead `ChatInterface`. Same for the command palette's "Toggle Dashboard" at `:1119`. |
| 2 | `automationWorker.js:2062` · `streamEvaluator.js` | The **volume signal compares raw share count**, but the UI hint, the wizard copy, and the default message string all say "× the 20-day average". A user entering `1.5` gets a condition that is true on every check. |
| 3 | `automationWorker.js:539` | **Forex `change_percent` conditions can never fire** — the forex snapshot sets `changePercent: null`. |
| 4 | `automationWorker.js:581` · `canvasSerializer.ts:546` | **Options automations query an OCC contract symbol against the equities snapshot endpoint.** Likely returns nothing. |
| 5 | `automations.js:154` | Multi-condition asset validation falls back to `body.triggerType`, which the serializer sets to `'standard'` — a value in no `SIGNAL_ASSET_MAP` array. Reads like it should **reject every multi-condition save**. No test covers it. |
| 6 | `Briefing.tsx:646` | `TradeCalendar` calls `useMemo` after two early returns — a hooks-order violation that will throw when the calendar goes from empty to populated without remounting. |
| 7 | `tradeAutopsyService.js:180` vs `index.js:3661` | `overallGrade` is computed two different ways: mean of three named categories in one place, mean of all scorecard rows in the other. |
| 8 | `index.js:8395,8489,8884` | Model id `'claude-sonnet-5'` for Lens follow-up Q&A, where everything else uses `claude-sonnet-4-6`. Looks stale. |
| 9 | `TradeAutopsy.couldHaveSaved` | Read in three places, **written nowhere**. The Recoverable P&L panel on Profile is permanently empty for every account. |
| 10 | `estimateRoute.js` | Only implements RSI/SMA/EMA/MACD/Bollinger; silently falls back to the latest close for every other indicator and degrades crossing operators to plain comparisons. Its numbers would be wrong for most indicators if it were re-exposed. |

---

## README claims the code does not support

### Chart Analyzer
- **Pine Script and Python strategy generation does not exist.** No `pine` identifier anywhere in the app or server.
- **"Live Price Validation"** — `currentPrice`, `priceLoading`, `streamStatus`, `levelValidation` are all computed and never rendered.
- **Options strategies** — removed (`index.tsx:1236`, "Removed per user request").
- **Follow-up questions** — `CustomQuestion` is explicitly removed from Chart Analyzer (`index.tsx:27`); it only runs in Lens.
- **Upcoming events panel** lives in `ChartAnalyzer/` but is imported only by Lens.

### Lens
- **Lens cannot capture "any chart from TradingView, thinkorswim, or any platform".** It calls `getDisplayMedia({ preferCurrentTab: true })` and captures the Tradion tab's own embedded chart. This is the single biggest gap between the README and reality, and it changes how Lens should be positioned.
- **Enrichment is Alpaca, not yfinance.**
- **Personalised feedback is not ticker-scoped** — `getPersonalizationContext` is called with a null ticker.
- **Browser support** — the tooltip says Chrome, Edge, or Firefox; the code needs `ImageCapture.grabFrame`, which is Chromium-only.

### Earnings Spider
- **Images are not accepted.** The input is `accept="application/pdf,text/plain"`.
- **There is no straddle calculator.** `StraddleCalculator.tsx` has zero imports. Its content lives inside the Options Implied Move panel.
- **`KeyMetricsCard.tsx` and `EarningsVerdictCard.tsx` are both dead** — the live equivalents are inside `EarningsReportView.tsx`.
- **Price-reaction and signal-accuracy tracking are computed server-side and never rendered.**
- **Undocumented and good:** ticker + quarter analysis with no file at all, fetching the transcript from Alpha Vantage. Worth promoting.

### Quant Research
- **No add-cell, re-run, or delete-cell control** exists. Cell count is chosen by the model per request.
- **Canvas code is read-only** — no editor.
- **No widget pinning.** `pinnedWidgets` state is written and never rendered.
- **Export offers one item** (Jupyter notebook), not a report.
- **365 templates, not "100+".** No save-your-own-template feature exists.
- `DashboardPanel.tsx` and `CanvasWorkspace.tsx` are unreachable legacy.

### Trade Autopsy
- **`TradeIntake.tsx` is orphaned** — it calls `/api/autopsy/parse-broker`, a route that does not exist. The live third intake mode is **Upload**, not Paste.
- **`ImportTradesModal.tsx` is orphaned.** There is no manual import flow; import is automatic only.
- **`PreFlightProtocol.tsx` and `PreFlightModal.tsx` are unreachable.** The README's pre-flight checklist is not a shipping feature.
- **Autopsies are generated by Claude, not Gemini.** Gemini 2.5 Flash is used only for parsing uploaded files.
- **Pattern detection is not ML** — it is a deterministic group-and-count with a weighted priority formula.
- **The "blame pie" is not a pie** — it renders as a text list with impact chips.
- **No trade editing UI** despite a live `PUT /api/trades/:id`.
- **Playbook review tracking does not exist** — `timesReviewed` / `lastReviewed` are on the model and never rendered or incremented.

### Profile
- `briefing.playbook` and `briefing.tradingProfile` are returned by the API and **rendered nowhere**.
- The risk score has **no trend indicator**.
- The "behavioural cost waterfall" is a **top-5 sorted bar list**, labelled "Estimated Mistake Losses" on screen.

### Automations
- **There is no form wizard.** `AutomationWizard.tsx` is not imported. The real choice is *Start from scratch* vs *Use a template*.
- **Frequency estimation, trigger backtest, and the indicator sparkline preview are all unreachable** — they render only from the dead wizard.
- **Automations run 24/7.** `marketHoursOnly` is set on create and never read.
- **92 indicators in the automation picker**, not 132 (README) or 75 (wizard copy).
- **5 research sources**, not 6.
- **6 addable agent goals**, not 8. `quant_analysis` has a full config UI and no toolbar entry, so users cannot add it.
- **The AI filter layer is not shipping** — `aiFilter` is hardcoded `false`.
- **`automationsMax` is a total cap, not concurrent.** Pausing does not free a slot.
- **Template variables use single braces** — `{symbol}`, not `{{symbol}}`. Unknown names render literally.
- **No auto-disable on delivery failure.** A revoked Discord webhook fails forever.
- The canvas Guide panel says "up to 4" agents; the real cap is 7.

### Elsewhere
- **Psychological Profile unlocks at 2 autopsies**, not 5. `docs/ai_memory.md` and `docs/AI_MODELS_REFERENCE.md` both say 5 — both are stale.
- **Holdings sparklines are 10 sessions, not 5.**
- **The holdings table has three sort columns, not four** — `weight` is in the type and has no header.
- **The net worth chart has no backfill.** Snapshots are written when you load the page, so the chart is empty on day one and gaps if the page goes unopened.
- **Sector data is a 16-ticker lookup.** Everything outside the mega-caps falls to "Other".
- **`WAIT` renders as `HOLD`** in `VerdictCard.tsx:22` while the model's enum is `WAIT`.
- **Goal count is inconsistent**: README and schema say max 3, the server enforces 5, the UI allows one per metric across 4 metrics.
- **The Telegram chat-ID instructions cannot be right** — there is no bot update handler anywhere in `server/`, only outbound `sendMessage`.
- **`WEBHOOK_SIGNING_SECRET` is one platform-wide env var** with no per-user provisioning and no UI. If it is unset, the signature header is omitted entirely.
- **`kernelManager.js`, `Dashboard.tsx`, `Watchlist.tsx`, `Briefing.tsx`, `AIMemory.tsx`, `Pricing.tsx`, `MemoGenerator.tsx`, `ProtectedRoute.tsx`, `Terminal/ChatInterface.tsx`** and `ViewState.WATCHLIST` / `ViewState.TRADE_GPT` are all dead. Worth deleting.

---

## Suggested order

1. **Fix #2 (volume signal).** Anyone who set up a volume alert following the in-app hint has a broken automation right now.
2. **Fix #1 (Run Simulation no-op)** or hide the button.
3. **Correct the README.** It is the single biggest source of the gap, and it is what a new engineer reads first.
4. **Decide on the orphaned components** — either wire them up or delete them. `PreFlightProtocol` in particular is a README headline feature that users cannot reach.
5. Work through the rest as capacity allows. The docs are accurate to the code today, so anything you fix means a docs edit — grep `docs-site/` for the feature name.

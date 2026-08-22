# Remediation brief

Shared standard for the fix pass. Read with `HOUSE-STYLE.md`; where they disagree, this wins.

## The reader, restated

A self-taught retail trader from Reddit or a Whop community. Trades their own money. Knows RSI because they've used it, not because they studied stats. Does **not** know: drawdown, volatility, backtest, standard deviation, correlation, delta, open interest, counterfactual, basis point. Wants quant analysis, can't write code, is intimidated by it. Scans before reading.

## The six rules

**1. Gloss on first use, on every page — including inside tables and bullets.**
The old pass glossed well when a page was *about* a term and skipped it in lists and table cells. Those are what a scanner reads first. A table cell gets a gloss in the cell or in a line under the table. No exceptions.

> ✅ "a golden cross — when the 50-day average price crosses above the 200-day, often read as a trend turning up"
> ❌ "a golden cross where the 50-day moving average crosses above the 200-day"

**2. Never define a term with harder terms.** If the gloss needs its own gloss, rewrite it. Test: could someone who has placed twenty trades and read no textbook follow it?

**3. Cut, don't add.** Nine pages are over the 1,200-word ceiling. Every fix pass should end with fewer words than it started, unless the page was under 500. Glossing costs words; pay for them by deleting duplication and throat-clearing.

**4. One home per explanation.** If something is explained on two pages, the deeper page keeps it and the other links. Never restate near-verbatim.

**5. Stop lecturing.** Ban list for this pass:
- "honest" / "honestly" as self-description — the site says it 11 times. Delete every one.
- "**Do this:**" as a repeated imperative — one per page maximum.
- "the point is" / "that's the point" / "is the whole point"
- "actually" where it adds nothing — it appears 53 times
- Second-guessing the reader's character: "This is the step people skip", "The uncomfortable part is the point", "the version of the trade that makes them feel least bad"

State what the tool does and what it's for. The reader decides how to feel about it.

**6. No engineer vocabulary.** Banned: stateless, state machine, dead-letter queue, surfaces (noun), surfaced (verb), idempotent, payload (outside the webhook reference), enum, boolean.

## Required structure

Every page ends with a closing `<CardGroup>` or one clear link. No page dead-ends.

Every page describing a feature carries a short **"In plain English"** section wherever a concept could confuse. This is the house signature and it is currently missing from 24 pages.

## Accuracy

`FINDINGS.md` is the record of where the README lies. If a claim isn't in the code, it doesn't go in the docs. Verified numbers:

| Claim | Truth |
| --- | --- |
| Automation indicator picker | **92**, not 132 |
| Automation templates | **45** |
| Quant templates | **365** |
| Quant session | one message in **Analysis** mode; Ask mode is free |
| Canvas cells | Tradion picks the count; no cap, no add-cell control |
| Automations run | **24/7**, not market hours only |
| Operator labels | "Goes Below (continuous)" / "Crosses Below (one-shot)" |
| Template variables | single braces — `{symbol}`, `{price}`, `{signal}` |
| Plans | three. **There is no Free tier** in user-facing docs |

## Before you finish

```bash
cd docs-site && npm run verify:nav && npm run audit
```

Report word count before and after for every page you touch.

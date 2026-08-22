# Review log

Two adversarial reads against the Stripe / Linear / Anthropic bar, for a self-taught retail trader who found the product on Reddit.

| Pass | Prose & structure | Accuracy & jargon |
| --- | --- | --- |
| First review | B+ | C |
| Second review | A− | B− |
| After the final six fixes | **A−** | **A−** |

---

## What the two reviews found, and what happened to it

### First review — 14 defects, all fixed

| # | Defect | Fix |
| --- | --- | --- |
| 1 | **Quickstart told users to do something the product can't do.** "Select the window or tab showing your chart" — Lens calls `getDisplayMedia({ preferCurrentTab: true })` and captures its own chart. Step 5 of the ten-minute Quickstart failed for anyone with TradingView open. | Corrected on `quickstart`, `tour`, and `lens`, with an explicit warning |
| 2 | **Pine Script generation documented twice**; no `pine` identifier in the codebase | Removed. Now blocked by a forbidden-claim rule |
| 3 | **"132 technical indicators"** on the page someone reads before paying $100/mo; the picker holds 92 | 92 everywhere, hand-counted from `ConditionNode.tsx` |
| 4 | **"institutional-grade" on the front page** — a word the style guide bans by name | Removed; added to the banned list |
| 5 | **Three definitions of the metered "quant session"** | One definition, verbatim in seven places |
| 6 | **"Up to six canvas cells"** — no such cap exists | Corrected in three places |
| 7 | **Glossary defined terms with harder terms** and omitted twelve the reader actually lacks | Rewritten. Every definition uses only words also defined on the page |
| 8 | **`signal-types.mdx` 1,944 words, RSI unglossed three times** | Split into `operators.mdx` + `signal-types.mdx`; every term glossed |
| 9 | **Nine pages over the 1,200-word ceiling** | All under. Lookup tables exempted by rule |
| 10 | **Five pages dead-ended** | All 47 pages close with a CardGroup |
| 11 | **Crosses-vs-is explained four times** | One home: `operators.mdx` |
| 12 | **Quickstart duplicated the four pages beneath it** | Cut to a 745-word spine |
| 13 | **Tone**: "honest" 11×, "actually" 53×, nine "Do this:" on one page | 0 · 7 · 1 |
| 14 | **Dead features documented as live** | Recoverable P&L, playbook review tracking, pre-flight modal, frequency estimation — all removed or corrected |

### Second review — six survivors, all fixed

Five agents editing in parallel introduced cross-page contradictions that both audit scripts reported as clean.

1. **`the-loop.mdx`** said the pre-flight checklist "runs before your next entry". It doesn't run; Tradion never sits between you and an order.
2. **The automation cap** read "concurrent" on the two pages a prospect sees and "total" on the two an existing user sees. It's a total — pausing does not free a slot.
3. **`operators.mdx` contradicted itself two lines apart**, and the wrong half was repeated as troubleshooting advice on two more pages. `automationWorker.js:2101` settles it: a crossing operator *does* fire on the first check after saving.
4. **Three pages claimed you can re-run a cell.** There is no such control.
5. **The glossary invented a fourth radar axis.** `Briefing.tsx:551` says three.
6. **`technical-indicators.mdx`** still used operator names that aren't in the UI.

A seventh — a fifth copy of the crossing-operator error — was caught by the new audit rule, not by either reviewer.

---

## Why the audit script missed all of it

Worth recording, because the hole is more useful than the individual bugs.

The consistency check covered exactly the two claims the *first* review had found. It was retrospective by construction. It now carries:

- **`CONSISTENCY`** — numbers that must agree across pages, failing the build when they don't.
- **`FORBIDDEN_CLAIMS`** — six phrasings the code contradicts, each verified against source and annotated with why. Any page reintroducing one fails.
- **Tone rules** — "honest", "is the point", engineer vocabulary, "Do this:" density, "actually" density.
- **Structure rules** — word ceiling, closing card, the "In plain English" signature.

Known remaining holes, unfixed and documented rather than hidden:

- `prose` strips all JSX, so `<Frame caption>` and `<Card title>` text escapes every check. Nothing is hiding there today.
- `GLOSS_MARKERS` accepts a bare `(` anywhere in a 500-character window — a weak test that most pages pass trivially.
- `NEEDS_GLOSS` lists 11 terms; `HOUSE-STYLE.md` mandates 25. The pages currently pass a manual sweep of all 25.
- Nothing reads `FINDINGS.md`, which is a machine-readable list of things the code does not do, sitting in the same directory.

---

## One open verification task

`profile.mdx` describes a recoverable figure beside each mistake pattern. `FINDINGS.md` #9 says `TradeAutopsy.couldHaveSaved` is read in three places and written nowhere, so the panel is permanently empty. But `server/index.js:2625` shows a live enrichment path from `memory.edgeLeakData.topLeaks`, commented "not dead `couldHaveSaved` field".

**One of the two is stale and nobody has checked which.** Load a Profile page on an account with tagged mistake types. If a number appears, `FINDINGS.md` is out of date. If it doesn't, cut the claim from `profile.mdx`.

---

## Where it stands

Tone, structure, and jargon discipline are at the bar. Accuracy is now enforced mechanically rather than by review. What separates this from an unqualified A is that the docs are only as true as the last code change — `npm run verify` catches contradictions between pages, not between a page and a commit.

Run `npm run verify` before every deploy, and re-read `FINDINGS.md` whenever you ship a feature the docs describe.

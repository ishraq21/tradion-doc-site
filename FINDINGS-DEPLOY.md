# Findings: verifying the docs against your commit

> **Status update — re-verified after your merge.**
> The branch is now on `main` (`27bbd1d`), plus two follow-ups: `5ac156e` settling the
> indicator counts and `6137b6d` deleting the unreachable components. Findings 3, 4 and 5
> are resolved and `npm run verify` is green end to end.
> **The only thing still blocking publication is finding 1: `docs-site/` is untracked.**

Checked the branch, the code, and the live domain. Three blockers, one content bug your change created, and one gap between your test suite and this site.

---

## 1. docs.tradionlabs.com is serving the Mintlify starter kit

The domain resolves and Mintlify is live, but it's rendering the default template — "Introduction · Welcome to your project · Write a short description of your product here", with a two-page sidebar.

**Cause:** `docs-site/` has never been committed.

```
$ git ls-files docs-site | wc -l
0
$ git status --porcelain docs-site
?? docs-site/
```

102 files, untracked, not gitignored. Mintlify is connected to the repo and finding nothing, so it falls back to the starter.

**Fix:** `git add docs-site && git commit`, push, then set the Mintlify project's root directory to `docs-site`.

---

## 2. Your work is on an unmerged branch

`git log` on `main` shows none of it. The commit is on `tradion/tradion-docs-gaps-bugs-6f2402`, and `git merge-base --is-ancestor` confirms it is **not** an ancestor of main. The worktree is also marked `prunable`.

31 files, +2,596/−213. Nothing in `docs-site/`.

---

## 3. ~~Your change inverted the volume signal~~ — RESOLVED; docs and code now agree

This is the one that would have shipped wrong.

`automationWorker.js:2354` on your branch:

```js
actualValue = Number.isFinite(marketData.volume) ? marketData.volume / avgVolume : null;
```

with the comment at :1006 — *"A `volume` condition's value is a MULTIPLE of this average (1.5 = 150% of normal)"*.

My docs said the opposite, in four places, because it was true when I wrote it:

> "The volume signal compares **the raw number of shares traded today**, not a multiple of the average, whatever the helper text beside the field says."
> — `first-automation.mdx`, plus `signal-types.mdx` and a `value: 30000000 # shares traded today` example

**Fixed.** Both pages now describe a multiple, note that the baseline is the 20 bars *before* the live one, state the 11-bar minimum and the *no average volume available* message, and record that volume takes no operator (`OPERATOR_RULES.volume = ['above']`).

Your `ConditionNode.tsx` helper-text change — "2x its 20-bar average (20 days at the default timeframe)" — now agrees with the docs. It didn't before.

I also updated the Telegram procedure to match the hint you added to `ActionNode.tsx`: message `@userinfobot` for a personal chat ID, with the `web.telegram.org` address-bar method kept for groups, since a group ID has a leading minus and `@userinfobot` won't give you one.

---

## 4. `tests/docsMatchCode.test.ts` does not cover this site

It reads exactly five files:

```js
const README            = read('README.md');
const AUTOMATIONS_DOC   = read('docs/automations.md');
const INDICATORS_DOC    = read('docs/TECHNICAL_INDICATORS_REFERENCE.md');
const AI_MEMORY_DOC     = read('docs/ai_memory.md');
const MODELS_DOC        = read('docs/AI_MODELS_REFERENCE.md');
```

All internal. The public documentation was unguarded — which is precisely why the volume inversion reached it.

**Closed from this side.** `npm run check:code` derives facts from the application source and asserts the published pages against them. It reads `automationWorker.js`, `lib/automationConstants.js`, `ConditionNode.tsx`, and `tiers.js` — nothing is hardcoded, so it fails when the code moves rather than when someone forgets to update a list.

It currently reports:

```
volume signal          raw share count   automationWorker.js
volume operators       above             OPERATOR_RULES
agent goals defined    8                 VALID_AGENT_GOALS
indicator count quoted 92                (must be one value)
Trader automations     10                tiers.js
Quant automations      50                tiers.js
```

and one deliberate failure, described next.

---

## 5. ~~The docs are now ahead of `main`~~ — RESOLVED by the merge

`check:code` runs against the checked-out tree, which is `main`, where volume is **still a raw share count**. So it fails — correctly:

> docs describe relative volume, but the checked-out tree still compares a raw share count.
> The fix exists on `tradion/tradion-docs-gaps-bugs-6f2402` and is **NOT merged**.

The script distinguishes "the docs are wrong" from "the code is not merged yet", because those need opposite responses. Merge the branch and it passes.

**Do not publish the docs before merging.** Right now the site would tell users to type `2` into a field that reads it as two shares.

---

## What I could not verify

- **The live worker.** No DB, Redis, or Alpaca credentials here, same constraint you had. Your options-snapshot and forex `change_percent` checks still need a real run.
- **The migration.** `scripts/migrate-volume-conditions-to-relative.js` exists and its plan is unit-tested, but existing volume automations hold raw share counts. Until it runs, a threshold of `30000000` is compared as "30 million times normal" and silently never fires. Run it dry first, as you said.
- **"132 indicators."** Still unaudited, and `docs/TECHNICAL_INDICATORS_REFERENCE.md` contains four different totals (126, 132, 51, 92) in the same file. The published docs sidestep this: they quote **92** for the automation picker, which I hand-counted from `ConditionNode.tsx`, and claim no total for the quant kernel. Your `docsMatchCode` test asserts `toContain('132 Technical Indicators**: RSI, MACD')` against the README — that pins a string nobody has verified.

---

## Order

1. Merge `tradion/tradion-docs-gaps-bugs-6f2402`.
2. `cd docs-site && npm run verify` — should go green once merged.
3. Run the volume migration dry, then for real.
4. `git add docs-site && git commit && git push`.
5. Point the Mintlify project at root directory `docs-site`.
6. Confirm one options and one forex automation in the worker log.


---

## Re-verification after the merge

| Was | Now |
| --- | --- |
| Branch unmerged | Merged at `27bbd1d`, two follow-ups on top |
| Volume: docs ahead of code | `automationWorker.js:2354` is `volume / avgVolume`; `check:code` confirms docs and code agree |
| `AVG_VOLUME_MIN_BARS` unverified | Read from source: 10, so **11 bars** needed. Matches the page |
| Indicator total unknowable | Settled: **92 picker entries = 61 indicators + 31 candlestick patterns** |
| Dead components documented | All 20 deleted in `6137b6d`. No published page references any of them as live |

### Two things I changed in response

**A false positive in my own checker.** `check:code` and the audit both flagged the corrected pages, because their pattern matched the phrase `share count` inside my *negation* — "a multiple of normal, **not a share count**". The fix was the thing being reported as the defect. Both patterns now use a negative lookbehind so a denial passes and only an assertion fails.

**Precision on the 92.** A candlestick pattern is not an indicator, and four pages were calling all 92 "technical indicators". They now read **92 technical readings — 61 indicators plus 31 candlestick patterns**, matching what `5ac156e` established. More precise than the README, which still says "92 Technical Indicators" and has a test pinned to that string.

### Still open

- **The migration.** Existing volume automations hold raw share counts. Until `migrate-volume-conditions-to-relative.js` runs, a stored `30000000` is read as *30 million times normal* and silently never fires. Dry run first.
- **A live worker run.** No credentials here. One options and one forex `change_percent` automation still need eyes on the log.
~~The 132 assertion.~~ Checked — you inverted it in the same commit. `docsMatchCode.test.ts:96` now reads `expect(quant).not.toMatch(/\*\*132 Technical Indicators\*\*/)`, so the suite guards against the number coming back rather than pinning it. Nothing to do.

---

## Deploy attempt — what landed and what is blocked

### ✅ App smoke test: clean

Checked the live app after `6137b6d` deleted twenty components. `tsc --noEmit` passes and no file still imports any of the twenty.

In the browser, with an error hook on `window.onerror`, `unhandledrejection`, and `console.error`:

| Surface | Result |
| --- | --- |
| All 9 sidebar views | Rendered, **0 errors** |
| Trade Autopsy → Trade Log / Broker Trades / Autopsies / Playbook | All 4 tabs render (`TradeIntake`, `ImportTradesModal`, `PreFlightModal`, `PreFlightProtocol` deleted) |
| Earnings Spider → saved report | 11,273 chars rendered (`KeyMetricsCard`, `EarningsVerdictCard`, `StraddleCalculator` deleted) |
| Automations → Create | "Start from Scratch / Use a Template · 45" — no wizard (`AutomationWizard` deleted) |
| Settings | Renders |

**Zero console errors across the whole walk.** The deletions were clean.

### ✅ docs-site committed — `9e34309`

105 files, 9,924 insertions. Added a `docs-site/.gitignore` for `node_modules/`, `.mintlify/`, and the capture run-report.

### ❌ Push blocked — no credentials in this environment

```
$ git push
fatal: could not read Username for 'https://github.com': No such device or address
```

The commit is on your disk. **Run `git push` from your own terminal.**

### ❌ Migration blocked — no database reachable

```
$ node scripts/migrate-volume-conditions-to-relative.js
Can't reach database server at 127.0.0.1:54322
```

It resolved to a **local Supabase dev instance**, not the production URL in `.env`. Something in the environment overrides `DATABASE_URL` — worth knowing before you run it, because a migration silently pointed at the wrong database is the kind of thing that ends badly.

Run it yourself, dry first:

```bash
node scripts/migrate-volume-conditions-to-relative.js            # plan only
node scripts/migrate-volume-conditions-to-relative.js --apply    # write
```

Check the printed `DATABASE_URL` host is Supabase and not `127.0.0.1` before passing `--apply`.

### ⏸️ Mintlify root directory — needs you, deliberately

Your project is on Mintlify's **web editor**, holding its own copy of the starter `docs.json`, `Introduction`, and `Quickstart`. There is no repository connected — Site settings only edits the editor's own files.

Pointing it at `docs-site` means installing the Mintlify GitHub App and granting it access to `ishraq21/Tradion`. **I did not do that.** Authorizing a third-party app against your GitHub account is yours to grant, not mine, and it would fail anyway until the push lands.

After you push:

1. Mintlify dashboard → connect the GitHub repository `ishraq21/Tradion`
2. Set **root directory** to `docs-site`
3. Deploy, then confirm `docs.tradionlabs.com` shows "Welcome to Tradion" rather than "Welcome to your project"

Deleting the starter `Introduction` and `Quickstart` pages from the web editor afterwards will avoid two sets of content competing.

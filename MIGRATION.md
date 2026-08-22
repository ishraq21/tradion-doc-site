# The volume migration — what it is and how to run it

## Why it exists

The volume signal used to compare a **raw share count**. It now compares a **multiple of the
20-bar average** (`automationWorker.js:2354`, `marketData.volume / avgVolume`).

Thresholds already stored in the database are still share counts. Nothing rewrites them
automatically, so this script does it.

## Does the app break without it? No — but automations go quiet

Nothing crashes. I walked every screen in the live app and found zero console errors.

What happens is worse in a quieter way. A stored threshold of `30000000` is now compared
against a ratio of about `1.2`:

```
1.2 > 30000000   →   false, on every check, forever
```

The automation stays **Active**, keeps reporting "last checked a minute ago", and never fires
again. There is no error and no banner. Somebody relying on a volume alert would not find out
until they noticed it had gone silent.

The reverse case is an improvement. Anyone who typed `2` under the old behaviour was asking
for "more than 2 shares" — true from the opening bell, so it fired constantly. That same `2`
now means twice normal volume, which is what they wanted and what the field's helper text
always claimed.

**Scope:** only conditions where `indicator === 'volume'`. Price, technical, news, earnings,
options flow, insider, and corporate-action conditions are untouched.

**Your own two automations are both AAPL price checks, so your account is unaffected.**

## Why my run hit the wrong database

The script loads `.env.local` at line 37 and reads `DIRECT_URL` from it. That is the repo's
convention — every script in `scripts/` does the same, and `.env.local` is gitignored.

But `.env.local` is the **local development** database:

| File | DIRECT_URL |
| --- | --- |
| `.env` | `db.dqxtbiigqybwiexobfgj.supabase.co:5432` — production |
| `.env.local` | `127.0.0.1:54322` — local Supabase |

So running it plainly migrates your dev database and prints a confident success. Production
stays untouched.

## How to run it against production

`dotenv` does not overwrite a variable already in the environment — I verified this — so
setting `DIRECT_URL` on the command line wins over `.env.local`.

```bash
# 1. Dry run. Prints every change it would make and writes nothing.
DIRECT_URL="postgresql://postgres:*0101Mgletsrocknow@db.dqxtbiigqybwiexobfgj.supabase.co:5432/postgres?connect_timeout=300" \
  node scripts/migrate-volume-conditions-to-relative.js

# 2. Read the output. Then apply.
DIRECT_URL="postgresql://postgres:*0101Mgletsrocknow@db.dqxtbiigqybwiexobfgj.supabase.co:5432/postgres?connect_timeout=300" \
  node scripts/migrate-volume-conditions-to-relative.js --apply
```

Note the port: **5432**, the direct connection, not 6543. Migrations should not go through
pgbouncer.

## Has it landed already?

**The dry run is the check.** It is read-only. If it reports zero changes, either it has
already run or there were no share-count thresholds to convert.

I could not check from here — no database is reachable from this environment.

## What the script does, and why it is safe to re-run

```
value <= 100            →  skip. Already a multiple, not a share count.
no average available    →  report as unresolved. Only --fallback assumes 2.0×.
otherwise               →  value / avg20, clamped to 1.0–20.0
```

**It is idempotent.** Every rewritten value lands at 20.0 or below, so a second run classifies
it as "already a multiple" and skips it. Running it twice is harmless.

Two details worth knowing:

- Rows whose `conditions` column is a **JSON string** rather than an array are handled
  (`readConditions`). Both shapes exist in the database, and skipping the string ones would
  leave them quietly broken.
- Without `--fallback`, a symbol whose average volume Alpaca cannot supply is **listed as
  unresolved rather than guessed at**. Those need a threshold set by hand. That is the right
  default — an invented number is harder to notice than a listed exception.

## After applying

Confirm one volume automation in the worker log shows a ratio around 1–3 rather than a share
count, and check `Automations → Runs` for any that report *no average volume available* —
those are symbols with under 11 bars of history.

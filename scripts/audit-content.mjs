/**
 * Content audit — the rules from HOUSE-STYLE.md, enforced.
 *
 *   node scripts/audit-content.mjs
 *
 * Errors block a deploy. Warnings are judgement calls worth a human look.
 */

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

/* ── rules ─────────────────────────────────────────────────────────────── */

// Hard privacy rule.
//
// Product constants — plan prices, monthly limits, thresholds — are fine and
// often necessary. What is never fine is a figure framed as somebody's money:
// a balance, a P&L, what a mistake "cost you". The tell is the vocabulary
// around the number, so that is what we match on.
const MONEY = /(?:\$\s?\d[\d,]*(?:\.\d+)?)|(?:\b\d[\d,]*(?:\.\d+)?\s*(?:USD|dollars)\b)/g;
const PERSONAL = /\b(you|your|yours|my|mine|their|cost|costs|lost|lose|losing|made|gain|gains|earned|profit|loss|losses|P&L|balance|balances|portfolio|holdings|equity|net worth|account value|drawdown of|down by|up by)\b/i;
const PERSONAL_WINDOW = 110;

/**
 * Pages granted more than the standard word ceiling, with the reason.
 *
 * Deliberately a short, awkward list. When a page outgrows the ceiling the
 * honest options are "cut it" or "split it"; landing here is the third one and
 * should have to be argued for, which is why it is not a wildcard.
 */
const LONG_FORM = {
  // Walks four verdict words, five confidence factors, three trade levels and
  // three reference prices, and now also explains the break-even arithmetic.
  // Splitting it would put the ratio on a different page from what the ratio
  // costs you, which is the one pairing a beginner needs to see together.
  'concepts/reading-a-verdict.mdx': 1800,
};

const PRIVACY = [
  [/\b(?!contact@tradionlabs\.com)[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, 'an email address'],
  [/\b(?:acct|account)\s*(?:no\.?|number|#)\s*:?\s*\d{3,}/gi, 'an account number'],
  [/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, 'something card-shaped'],
  [/\b\d{3}-\d{2}-\d{4}\b/g, 'something SSN-shaped'],
];

// Words the house style bans outright.
// This list must stay in sync with the tables in HOUSE-STYLE.md — the first
// version of this script omitted half of them and shipped "institutional-grade"
// onto the front page while reporting the site clean.
const BANNED = [
  'simply', 'obviously', 'seamless', 'seamlessly', 'utilise', 'utilize',
  'facilitate', 'holistic', 'synergy', 'granular', 'ingest',
  'institutional-grade', 'best-in-class', 'world-class', 'cutting-edge',
  'game-changing', 'revolutionary', 'effortless', 'blazing', 'turnkey',
];

// Numbers and definitions that must not disagree between pages. A reader who
// finds two answers trusts neither.
const CONSISTENCY = [
  { name: 'automation indicator count', re: /(\d+)\s+technical indicators?\b/gi, scope: /automation|automations|signal|plan|loop/i },
  { name: 'canvas cell count', re: /up to (six|eight|ten|twelve|\d+) (?:canvas )?cells/gi },
  { name: 'behavioural fingerprint axes', re: /radar chart[^.]*?\b(three|3|four|4)\s+ax/gi },
];

// Claims that were wrong once and must never reappear anywhere on the site.
// Each is a phrasing the code contradicts, verified against the source.
const FORBIDDEN_CLAIMS = [
  [/\b(running at once|concurrent(ly)? automations|automations \(concurrent\))/i,
   'the automation cap is a TOTAL, not a concurrent count — pausing does not free a slot'],
  [/re-?run(ning)? (an? )?(existing )?cell/i,
   'there is no way to re-run a single cell'],
  [/pre-?flight checklist that runs\b|checklist that runs before/i,
   'pre-flight does not run itself — Tradion never sits between you and an order'],
  [/\bis (above|below)\b\s*\/\s*\bis (above|below)\b|"is below" option/i,
   'the operator labels on screen are "Goes Below (continuous)" and "Crosses Below (one-shot)"'],
  [/pine ?script/i, 'Pine Script generation does not exist in the codebase'],
  [/nothing (left )?to cross/i,
   'a crossing operator DOES fire on the first check after saving — automationWorker.js:2101'],
  // Negations are the fix, not the defect — "not a share count" must pass.
  [/(?<!not )(?<!never )(?<!isn't )(?<!is not )\b(raw (number of )?shares?( count)? traded|shares traded today|raw share count)\b/i,
   'the volume signal takes a MULTIPLE of the 20-bar average, not a share count — automationWorker.js:2354'],
];
// Banned only as a filler adverb, not in every grammatical use.
const BANNED_SOFT = [
  [/\bjust\b/gi, '"just"'],
  [/\bit'?s easy\b/gi, '"easy"'],
  [/\bvery easy\b/gi, '"easy"'],
  [/\bleverage\b/gi, '"leverage" as a verb'],
];

// Terms that must be glossed. If a page uses one, it should also contain
// an explanation nearby — we look for a gloss marker anywhere on the page.
const NEEDS_GLOSS = [
  'implied volatility', 'open interest', 'counterfactual', 'FIFO', 'OPRA',
  'HMAC', 'SSRF', 'drawdown', 'Sharpe', 'straddle', 'Form 4',
];
const GLOSS_MARKERS = /,\s(?:the|a|an|how|what|when|which|where)\b|\bmeans\b|\bthat is\b|\bin other words\b|\bwhich is\b|\bi\.e\.|\bshort for\b|\bstands for\b|\bactually is\b|\brefers to\b|\bis when\b|\bis the\b|\(/i;

/* ── walk ──────────────────────────────────────────────────────────────── */

async function findMdx(dir, acc = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || ['node_modules', 'images', 'scripts', 'logo'].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) await findMdx(p, acc);
    else if (e.name.endsWith('.mdx')) acc.push(p);
  }
  return acc;
}

const files = await findMdx(ROOT);
let words = 0;

const wordsIn = (s) => s.split(/\s+/).filter(Boolean).length;

for (const file of files) {
  const rel = relative(ROOT, file);
  const raw = await readFile(file, 'utf8');

  // Strip frontmatter, fenced code, and JSX attributes — none of those are prose.
  const body = raw
    .replace(/^---[\s\S]*?---\n/, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '');
  const prose = body.replace(/<[^>]+>/g, ' ');

  words += prose.split(/\s+/).filter(Boolean).length;

  for (const [re, what] of PRIVACY) {
    for (const m of body.matchAll(re)) {
      errors.push(`${rel}: contains ${what} — "${m[0].trim()}"`);
    }
  }

  // A money figure is only a problem when it is framed as someone's money.
  // Two things are never that: our own plan prices, and the $1 used to
  // explain how an option moves. Both are product or market facts.
  const PLAN_PRICES = new Set(['$25', '$100', '$200']);
  for (const m of body.matchAll(MONEY)) {
    const at = m.index ?? 0;
    const value = m[0].trim();
    const context = body.slice(Math.max(0, at - PERSONAL_WINDOW), at + PERSONAL_WINDOW);
    if (PLAN_PRICES.has(value)) continue;
    if (/^\$1$/.test(value) && /\bmove\b|\bper\b/i.test(context)) continue;
    if (PERSONAL.test(context)) {
      const line = body.slice(0, at).split('\n').length;
      errors.push(
        `${rel}:${line}: "${m[0].trim()}" appears alongside personal-money wording — ` +
        `rewrite as a percentage, a ratio, or a placeholder`,
      );
    }
  }

  for (const w of BANNED) {
    const re = new RegExp(`\\b${w}\\b`, 'gi');
    for (const m of prose.matchAll(re)) errors.push(`${rel}: banned word "${m[0]}"`);
  }
  for (const [re, what] of BANNED_SOFT) {
    for (const m of prose.matchAll(re)) warnings.push(`${rel}: ${what} — "${m[0]}"`);
  }

  // A term passes if *any* of its appearances on the page sits next to an
  // explanation. Glossing once per page is the rule, not once per mention.
  for (const term of NEEDS_GLOSS) {
    const all = new RegExp(`\\b${term}\\b`, 'gi');
    const hits = [...prose.matchAll(all)];
    if (!hits.length) continue;
    // An <Accordion title="Term"> IS the gloss — the definition is its body.
    const definedAsEntry = new RegExp(`<Accordion title="[^"]*\\b${term}\\b`, 'i').test(raw);
    const glossed = definedAsEntry || hits.some((h) => {
      const at = h.index ?? 0;
      return GLOSS_MARKERS.test(prose.slice(Math.max(0, at - 180), at + 320));
    });
    if (!glossed) warnings.push(`${rel}: uses "${term}" ${hits.length}× and never explains it`);
  }

  // ── Tone ────────────────────────────────────────────────────────────
  // A writer who keeps announcing their honesty starts to sound like they
  // are selling. Same for lecturing the reader about their character.
  for (const m of prose.matchAll(/\bhonest(ly)?\b/gi)) {
    errors.push(`${rel}: "${m[0]}" — say the thing, don't announce that you're being honest`);
  }
  for (const m of prose.matchAll(/\b(is|that'?s) the (whole )?point\b/gi)) {
    errors.push(`${rel}: "${m[0].trim()}" — state what it does instead`);
  }
  const doThis = [...raw.matchAll(/\*\*Do this:?\*\*/gi)];
  if (doThis.length > 1) warnings.push(`${rel}: "Do this:" used ${doThis.length}× — one per page maximum`);
  const actually = [...prose.matchAll(/\bactually\b/gi)];
  if (actually.length > 2) warnings.push(`${rel}: "actually" used ${actually.length}× — mostly filler`);

  // Engineer vocabulary in reader-facing prose.
  for (const w of ['stateless', 'state machine', 'dead-letter queue', 'idempotent', 'enum', 'boolean']) {
    const re = new RegExp(`\\b${w}\\b`, 'gi');
    for (const m of prose.matchAll(re)) errors.push(`${rel}: engineer vocabulary "${m[0]}"`);
  }
  for (const m of prose.matchAll(/\bsurfac(e|es|ed|ing)\b/gi)) {
    // "surface" as a verb or as a noun for a screen — both banned.
    if (!/sea surface|road surface/i.test(prose)) warnings.push(`${rel}: "${m[0]}" — say show, find, or screen`);
  }

  // ── Structure ───────────────────────────────────────────────────────
  // Every page must hand the reader somewhere to go next.
  const tail = body.trimEnd().slice(-900);
  if (!/<CardGroup|<Card\s|\]\(\/|href="\//.test(tail)) {
    errors.push(`${rel}: dead end — no closing CardGroup or link in the last section`);
  }

  // The house signature: an explanation in plain terms wherever a concept
  // could confuse. Required on feature pages. Exempt: lookup tables, and
  // pages that are themselves an index of short answers.
  const isReference = rel.startsWith('reference/') || rel.startsWith('help/glossary');
  const isIndex = /^(help\/(faq|troubleshooting|contact)|get-started\/quickstart|account\/deleting-your-account)/.test(rel);
  const hasSignature = /In plain English|What this actually means|really counts|really means/i.test(raw);
  if (!isReference && !isIndex && wordsIn(prose) > 600 && !hasSignature) {
    warnings.push(`${rel}: no "In plain English" section`);
  }

  // Word ceiling. Reference pages are lookup tables and are exempt.
  // Per-page allowances live in LONG_FORM at the top of this file.
  //
  // Raised from 1,200 to 1,500. The ceiling is here to stop a page rambling,
  // and at 1,200 it had started doing the opposite: the two "reading a ..."
  // pages walk every field of a report card in order, and trimming them to fit
  // meant deleting the sentence that said what a field was *for*. A guard that
  // makes the docs worse is a bad guard. 1,500 still bites well before a page
  // becomes two pages.
  // Individual pages can be granted more, but only deliberately. Moving the
  // global bar every time one page outgrows it turns the guard into a
  // rubber stamp; an explicit list keeps each exception visible in review.
  const n = wordsIn(prose);
  const allowed = LONG_FORM[rel] ?? 1500;
  if (!isReference && !/^help\/(troubleshooting|faq)/.test(rel) && n > allowed) {
    errors.push(`${rel}: ${n} words of prose — over its ${allowed.toLocaleString('en-US')} ceiling, split or cut`);
  }

  // Mirza asked for no em dashes anywhere. The redaction glyph is exempt:
  // it stands in for a withheld number rather than punctuating a sentence.
  for (const m of body.matchAll(/\u2014/g)) {
    const at = m.index ?? 0;
    const around = body.slice(Math.max(0, at - 3), at + 4);
    if (/^[\s\u2014.\/%-]+$/.test(around)) continue;
    const line = body.slice(0, at).split('\n').length;
    errors.push(`${rel}:${line}: em dash in prose. Use a comma, a colon, parentheses, or two sentences.`);
  }

  // Table cells holding nothing but punctuation.
  //
  // The em-dash sweep above was run as a blind find-and-replace of " — " with
  // ", ". In a table an em dash is often the whole cell, meaning "none", so
  // twenty-two cells across three pages silently became a bare comma and
  // shipped that way. An empty cell is fine and deliberate (the blank corner
  // of a comparison table); a cell containing only punctuation never is.
  // Runs on `raw`, not `body`. `body` has inline code spans stripped, which
  // turns the perfectly good cell `` `fast`, `slow` `` into ", " and reports it
  // as broken. Using raw also means the line number is the real one.
  let inFence = false;
  for (const [i, ln] of raw.split('\n').entries()) {
    if (ln.trim().startsWith('```')) { inFence = !inFence; continue; }
    if (inFence || !/^\s*\|/.test(ln)) continue;
    if (/^\s*\|[\s|:-]*\|?\s*$/.test(ln)) continue;   // the header separator row
    for (const cell of ln.split('|').slice(1, -1)) {
      if (/^\s*[,.;:]+\s*$/.test(cell)) {
        errors.push(`${rel}:${i + 1}: table cell contains only "${cell.trim()}". Write the value, or "None".`);
      }
    }
  }

  // Claims the code contradicts. These were each shipped once.
  for (const [re, why] of FORBIDDEN_CLAIMS) {
    const m = body.match(re);
    if (m) errors.push(`${rel}: "${m[0].trim()}" — ${why}`);
  }

  if (!/^---\n[\s\S]*?\btitle:/m.test(raw)) errors.push(`${rel}: missing a title in frontmatter`);
  if (!/\bdescription:/.test(raw.split('---')[1] ?? '')) warnings.push(`${rel}: missing a description`);
  if (/_TODO_|Draft\.\s*\*\*|## Outline|Screenshots needed/.test(raw)) errors.push(`${rel}: still contains draft scaffolding`);
  if (/\.png"/.test(raw)) errors.push(`${rel}: references a .png — the screenshot pipeline has not been run, so it would render broken`);
  if (/!/.test(prose.replace(/!\[/g, ''))) {
    const bangs = [...prose.matchAll(/[^\s]!/g)].filter((m) => !m[0].startsWith('!'));
    if (bangs.length) warnings.push(`${rel}: exclamation mark in prose`);
  }

  // Every SVG referenced must actually exist
  for (const [, img] of raw.matchAll(/src="\/images\/([^"]+?)\.svg"/g)) {
    if (!existsSync(join(ROOT, 'images', `${img}.svg`))) errors.push(`${rel}: /images/${img}.svg does not exist`);
  }
}

/* ── cross-page consistency ────────────────────────────────────────────── */

// Claims about the product that appear on more than one page must agree.
const claims = new Map();
for (const file of files) {
  const rel = relative(ROOT, file);
  const body = (await readFile(file, 'utf8')).replace(/^---[\s\S]*?---\n/, '');
  for (const { name, re, scope } of CONSISTENCY) {
    if (scope && !scope.test(rel) && !scope.test(body.slice(0, 400))) continue;
    for (const m of body.matchAll(new RegExp(re.source, re.flags))) {
      if (!claims.has(name)) claims.set(name, new Map());
      const byValue = claims.get(name);
      const v = m[1].toLowerCase();
      if (!byValue.has(v)) byValue.set(v, []);
      byValue.get(v).push(rel);
    }
  }
}
for (const [name, byValue] of claims) {
  if (byValue.size <= 1) continue;
  const detail = [...byValue.entries()]
    .map(([v, pages]) => `"${v}" in ${[...new Set(pages)].join(', ')}`)
    .join('  vs  ');
  errors.push(`${name} disagrees across pages — ${detail}`);
}

/* ── report ────────────────────────────────────────────────────────────── */

console.log(`pages audited:  ${files.length}`);
console.log(`words of prose: ${words.toLocaleString('en-US').replace(/,/g, ' ')}\n`);

if (warnings.length) {
  console.log(`⚠  ${warnings.length} warning(s)`);
  for (const w of warnings.slice(0, 40)) console.log(`   ${w}`);
  if (warnings.length > 40) console.log(`   … and ${warnings.length - 40} more`);
  console.log('');
}
if (errors.length) {
  console.log(`✗  ${errors.length} error(s)`);
  for (const e of errors.slice(0, 60)) console.log(`   ${e}`);
  if (errors.length > 60) console.log(`   … and ${errors.length - 60} more`);
  process.exit(1);
}
console.log('✓ privacy, banned words, structure, and image references all clean');

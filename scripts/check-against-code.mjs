/**
 * Assert the published docs against the application source.
 *
 *   node scripts/check-against-code.mjs
 *
 * WHY THIS IS SEPARATE FROM audit-content.mjs
 * `audit-content.mjs` checks the docs against themselves — banned words, tone,
 * pages disagreeing with each other. It cannot catch a page that is internally
 * consistent and uniformly wrong, which is what happens when the app changes
 * underneath it.
 *
 * WHY IT IS SEPARATE FROM tests/docsMatchCode.test.ts
 * That suite guards `README.md` and `docs/*.md` — the internal docs. It does
 * not read `docs-site/`, so the public documentation was unguarded. This closes
 * that gap from the docs side.
 *
 * Every number below is READ FROM SOURCE, never hardcoded. If someone changes
 * the code, this fails and names the page to fix.
 *
 * HISTORY: this used to regex-scrape `trader: {` and `quant: {` blocks out of
 * tiers.js. Those plans were retired (Starter/Pro replaced them) and the
 * regex never matched anything afterward — every meter logged "could not
 * read ... skipped" and the script still printed "✓ docs-site agrees with the
 * application source". A guard that passes without checking anything is worse
 * than no guard. tiers.js has no imports of its own, so it's imported directly
 * now instead of scraped, which can't silently stop matching the same way.
 */

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, relative, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Locating the application source.
 *
 * This originally assumed the docs lived inside the app repo and hardcoded
 * `../`. When the docs moved to their own repo that path stopped resolving,
 * every check silently skipped, and the script still printed a tick — a guard
 * that passes without checking anything is worse than no guard, because it
 * buys false confidence. So: find the app, and if we can't, say so loudly.
 */
const APP_MARKER = 'server/config/tiers.js';
const CANDIDATES = [
  process.env.TRADION_APP_PATH,          // explicit wins
  resolve(ROOT, '..', 'tradion'),        // sibling checkout — the usual layout
  resolve(ROOT, '..', 'Tradion', 'tradion'),
  resolve(ROOT, '..'),                   // docs nested inside the app repo
].filter(Boolean);

const APP = CANDIDATES.find((c) => existsSync(join(c, APP_MARKER))) ?? null;
const OPTIONAL = process.argv.includes('--optional');

const errors = [];
const notes = [];

if (!APP) {
  const msg = [
    'Cannot find the Tradion application source, so nothing was verified.',
    '',
    'Looked for ' + APP_MARKER + ' in:',
    ...CANDIDATES.map((c) => '  - ' + c),
    '',
    'Point at it with:  TRADION_APP_PATH=/path/to/tradion npm run check:code',
    'In CI without the app checked out, pass --optional to downgrade this to a warning.',
  ].join('\n');

  if (OPTIONAL) {
    console.log('⚠  ' + msg + '\n');
    console.log('⚠  skipped — the docs were NOT checked against the code');
    process.exit(0);
  }
  console.error('✗  ' + msg);
  process.exit(1);
}

console.log(`  app source: ${APP}\n`);

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
const pages = new Map();
for (const f of files) {
  pages.set(relative(ROOT, f), (await readFile(f, 'utf8')).replace(/^---[\s\S]*?---\n/, ''));
}

/* ── Plan limits, trial allowances, price and trial length ────────────────
 * Imported directly from tiers.js — a plain config module with no imports of
 * its own — instead of regex-scraped, so a renamed or restructured tier
 * cannot silently stop matching and still report success. */
const { TIERS, TRIAL_PERIOD_DAYS } = await import(pathToFileURL(join(APP, APP_MARKER)).href);

const cellsFrom = (page, re) => {
  const m = (pages.get(page) ?? '').match(re);
  return m ? [m[1], m[2]].map((n) => n.replace(/,/g, '')) : null;
};

const METERS = [
  {
    key: 'chatMessagesPerMonth',
    label: 'AI Portfolio Analyst messages',
    rows: [
      ['concepts/usage-limits.mdx', /\|\s*AI Portfolio Analyst messages\s*\|\s*([\d,]+)\s*\|\s*([\d,]+)\s*\|/],
      ['reference/plan-comparison.mdx', /\|\s*AI Portfolio Analyst\s*\|\s*([\d,]+)[^|]*\|\s*([\d,]+)[^|]*\|/],
    ],
  },
  {
    key: 'earningsMessagesPerMonth',
    label: 'AI Earnings Research messages',
    rows: [
      ['concepts/usage-limits.mdx', /\|\s*AI Earnings Research messages\s*\|\s*([\d,]+)\s*\|\s*([\d,]+)\s*\|/],
      ['reference/plan-comparison.mdx', /\|\s*AI Earnings Research\s*\|\s*([\d,]+)[^|]*\|\s*([\d,]+)[^|]*\|/],
    ],
  },
  {
    key: 'chartAnalysesPerMonth',
    label: 'Chart Analyses',
    rows: [
      ['concepts/usage-limits.mdx', /\|\s*Chart Analyses\s*\|\s*([\d,]+)\s*\|\s*([\d,]+)\s*\|/],
      ['reference/plan-comparison.mdx', /\|\s*Chart Analysis\s*\|\s*([\d,]+)[^|]*\|\s*([\d,]+)[^|]*\|/],
    ],
  },
  {
    key: 'autopsiesPerMonth',
    label: 'Trade Autopsies',
    rows: [
      ['concepts/usage-limits.mdx', /\|\s*Trade Autopsies\s*\|\s*([\d,]+)\s*\|\s*([\d,]+)\s*\|/],
      ['reference/plan-comparison.mdx', /\|\s*Trade Autopsy\s*\|\s*([\d,]+)[^|]*\|\s*([\d,]+)[^|]*\|/],
    ],
  },
  {
    key: 'lensPerMonth',
    label: 'Lens analyses',
    rows: [
      ['concepts/usage-limits.mdx', /\|\s*Lens analyses\s*\|\s*([\d,]+)\s*\|\s*([\d,]+)\s*\|/],
      ['reference/plan-comparison.mdx', /\|\s*Lens\s*\|\s*([\d,]+)[^|]*\|\s*([\d,]+)[^|]*\|/],
    ],
  },
  {
    key: 'recomputesPerMonth',
    label: 'Manual Profile refreshes',
    rows: [
      ['concepts/usage-limits.mdx', /\|\s*Manual Profile refreshes\s*\|\s*([\d,]+)\s*\|\s*([\d,]+)\s*\|/],
      ['reference/plan-comparison.mdx', /\|\s*Manual Profile refreshes\s*\|\s*([\d,]+)[^|]*\|\s*([\d,]+)[^|]*\|/],
    ],
  },
];

const expectedFullAllowance = METERS.map(({ key }) => `${TIERS.starter[key]}/${TIERS.pro[key]}`);
for (const [i, { key, label, rows }] of METERS.entries()) {
  const expected = expectedFullAllowance[i];
  let found = false;
  for (const [file, re] of rows) {
    const got = cellsFrom(file, re);
    if (!got) { errors.push(`${file}: no "${label}" allowance row to check`); continue; }
    found = true;
    if (got.join('/') !== expected) {
      errors.push(`tiers.js ${key} = ${expected}, but ${file} says ${got.join('/')}`);
    }
  }
  if (found) console.log(`  ${label.padEnd(34)} ${expected.padEnd(10)} tiers.js`);
}

/* ── Trial allowances ───────────────────────────────────────────────────── */
const expectedTrial = METERS.map(({ key }) => `${TIERS.starter.trialAllowance[key]}/${TIERS.pro.trialAllowance[key]}`);
const trialLine = pages.get('concepts/usage-limits.mdx')?.match(
  /trial allowance applies instead:\s*([\d\s/]+)\s*on Starter and\s*([\d\s/]+)\s*on Pro/,
);
if (!trialLine) {
  errors.push('concepts/usage-limits.mdx: no trial allowance sentence to check (expected "... trial allowance applies instead: N / N / ... on Starter and N / N / ... on Pro")');
} else {
  const starterGot = trialLine[1].split('/').map((n) => n.trim());
  const proGot = trialLine[2].split('/').map((n) => n.trim());
  const starterExpected = METERS.map(({ key }) => String(TIERS.starter.trialAllowance[key]));
  const proExpected = METERS.map(({ key }) => String(TIERS.pro.trialAllowance[key]));
  if (starterGot.join('/') !== starterExpected.join('/') || proGot.join('/') !== proExpected.join('/')) {
    errors.push(
      `tiers.js trialAllowance = Starter ${starterExpected.join('/')}, Pro ${proExpected.join('/')}, ` +
      `but concepts/usage-limits.mdx says Starter ${starterGot.join('/')}, Pro ${proGot.join('/')}`,
    );
  } else {
    console.log(`  Trial allowance                   ${starterGot.join('/')} / ${proGot.join('/')}     tiers.js`);
  }
}

/* ── Price ──────────────────────────────────────────────────────────────── */
const expectedPrice = [TIERS.starter.price / 100, TIERS.pro.price / 100];
const priceGot = cellsFrom('reference/plan-comparison.mdx', /\|\s*Price\s*\|\s*\$(\d+)\/mo\s*\|\s*\$(\d+)\/mo\s*\|/);
if (!priceGot) {
  errors.push('reference/plan-comparison.mdx: no Price row to check');
} else if (priceGot.map(Number).join('/') !== expectedPrice.join('/')) {
  errors.push(`tiers.js price = $${expectedPrice.join('/$')}, but reference/plan-comparison.mdx says $${priceGot.join('/$')}`);
} else {
  console.log(`  Price                              $${expectedPrice.join('/$')}       tiers.js`);
}

/* ── Trial length ───────────────────────────────────────────────────────── */
const trialDaysGot = cellsFrom('reference/plan-comparison.mdx', /\|\s*Free trial\s*\|\s*(\d+) days?\s*\|\s*(\d+) days?\s*\|/);
if (!trialDaysGot) {
  errors.push('reference/plan-comparison.mdx: no Free trial row to check');
} else if (trialDaysGot.some((d) => Number(d) !== TRIAL_PERIOD_DAYS)) {
  errors.push(`tiers.js TRIAL_PERIOD_DAYS = ${TRIAL_PERIOD_DAYS}, but reference/plan-comparison.mdx says ${trialDaysGot.join('/')}`);
} else {
  console.log(`  Trial length                       ${TRIAL_PERIOD_DAYS} days      tiers.js`);
}

/* ── report ─────────────────────────────────────────────────────────────── */
console.log('');
if (notes.length) {
  console.log(`ℹ  ${notes.length} note(s)`);
  notes.forEach((n) => console.log(`   ${n}`));
  console.log('');
}
if (errors.length) {
  console.log(`✗  ${errors.length} mismatch(es) between docs-site and the code`);
  errors.forEach((e) => console.log(`   ${e}`));
  process.exit(1);
}
console.log('✓ docs-site agrees with the application source');

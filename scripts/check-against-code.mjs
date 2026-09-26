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
 */

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const readIf = async (p) => (existsSync(join(APP, p)) ? readFile(join(APP, p), 'utf8') : null);

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

/* ── Plan limits ────────────────────────────────────────────────────────── */
const tiers = await readIf('server/config/tiers.js');
if (tiers) {
  const grab = (tier, key) => {
    const block = tiers.split(new RegExp(`\\b${tier}\\s*:\\s*\\{`, 'i'))[1];
    return block ? block.match(new RegExp(`${key}\\s*:\\s*(\\d+)`))?.[1] : undefined;
  };
  // Match the Starter, Trader and Quant CELLS of each row, not just "the number appears somewhere".
  // A presence check would pass regardless, because 50 and 150 are also other meters' limits.
  const cells = (row) => row.slice(1, 4).map((n) => n.replace(/,/g, ''));
  const METERS = [
    {
      label: 'Chat messages',
      key: 'chatMessagesPerMonth',
      tiers: ['starter', 'trader', 'quant'],
      rows: [
        ['concepts/usage-limits.mdx', /\|\s*Chat messages\s*\|\s*([\d,]+)\s*\|\s*([\d,]+)\s*\|\s*([\d,]+)\s*\|/],
        ['reference/plan-comparison.mdx', /\|\s*AI Portfolio Analyst\s*\|\s*([\d,]+)[^|]*\|\s*([\d,]+)[^|]*\|\s*([\d,]+)[^|]*\|/],
      ],
    },
    {
      label: 'AI Earnings Research messages',
      key: 'earningsMessagesPerMonth',
      tiers: ['trader', 'quant'],
      // Starter has no allowance, so its cell is text ("None", "Not included") and the row is matched from Trader.
      rows: [
        ['concepts/usage-limits.mdx', /\|\s*Earnings messages\s*\|[^|]*\|\s*([\d,]+)\s*\|\s*([\d,]+)\s*\|/],
        ['reference/plan-comparison.mdx', /\|\s*AI Earnings Research\s*\|[^|]*\|\s*([\d,]+)[^|]*\|\s*([\d,]+)[^|]*\|/],
      ],
    },
  ];
  for (const { label, key, tiers: names, rows } of METERS) {
    const expected = names.map((t) => grab(t, key));
    if (expected.some((v) => v === undefined)) { notes.push(`${label}: could not read ${key} from tiers.js — skipped`); continue; }
    for (const [file, re] of rows) {
      const m = (pages.get(file) ?? '').match(re);
      if (!m) { errors.push(`${file}: no "${label}" allowance row to check`); continue; }
      const got = cells(m).slice(0, names.length);
      if (got.join('/') !== expected.join('/')) {
        errors.push(`tiers.js ${key} = ${expected.join('/')}, but ${file} says ${got.join('/')}`);
      }
    }
    console.log(`  ${label.padEnd(34)} ${expected.join('/').padEnd(12)} tiers.js`);
  }
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

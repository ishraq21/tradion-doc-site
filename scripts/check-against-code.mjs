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
const APP_MARKER = 'server/workers/automationWorker.js';
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

const whereMentions = (re) => [...pages.entries()].filter(([, body]) => re.test(body)).map(([p]) => p);

/**
 * Docs can be correct about code that exists on an unmerged branch. That is a
 * release-ordering problem, not a documentation error, and it deserves a
 * different message.
 */
async function branchHasRelativeVolume() {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const run = promisify(execFile);
  try {
    const { stdout } = await run('git', ['branch', '-a', '--format=%(refname:short)'], { cwd: APP ?? ROOT });
    for (const b of stdout.split('\n').map((s) => s.trim()).filter(Boolean)) {
      try {
        const { stdout: src } = await run('git', ['show', `${b}:server/workers/automationWorker.js`], { cwd: APP, maxBuffer: 32 * 1024 * 1024 });
        if (/marketData\.volume\s*\/\s*avgVolume/.test(src)) return b;
      } catch { /* branch lacks the file */ }
    }
  } catch { /* not a git repo, or git unavailable */ }
  return null;
}

/** A fact the docs assert, and the source of truth for it. */
function check({ name, expected, source, docPattern, describe }) {
  if (expected === null) { notes.push(`${name}: could not read ${source} — skipped`); return; }
  const hits = whereMentions(docPattern);
  if (!hits.length) { notes.push(`${name}: not asserted anywhere in docs-site`); return; }
  const wrong = hits.filter(([]) => false); // placeholder; per-fact logic below
  void wrong;
  console.log(`  ${name.padEnd(34)} ${String(expected).padEnd(8)} ${source}`);
}

/* ── 1. Volume signal semantics ─────────────────────────────────────────── */
const worker = await readIf('server/workers/automationWorker.js');
if (worker) {
  const isRelative = /actualValue\s*=\s*[^;]*marketData\.volume\s*\/\s*avgVolume/.test(worker);
  const claimsRatio = whereMentions(/multiple of (the average|normal)/i);
  // "not a share count" is the CORRECTION, not the defect. Match the phrase
  // only when it is being asserted, never when it is being denied.
  const RAW_CLAIM = /(?<!not )(?<!never )(?<!isn't )(?<!is not )\b(raw (number of )?shares?|raw share count|shares traded today)\b/i;
  const claimsRaw = whereMentions(RAW_CLAIM);

  if (isRelative && claimsRaw.length) {
    errors.push(`volume is a MULTIPLE of the 20-bar average (automationWorker.js), but these pages call it a share count: ${claimsRaw.join(', ')}`);
  }
  if (!isRelative && claimsRatio.length) {
    // The docs may legitimately be ahead of the checked-out branch. Say which
    // it is, because "docs are wrong" and "code is not merged yet" need
    // completely different responses.
    const onABranch = await branchHasRelativeVolume();
    if (onABranch) {
      errors.push(
        `docs describe relative volume, but the checked-out tree still compares a raw share count.\n` +
        `     The fix exists on "${onABranch}" and is NOT merged. Either merge it before publishing,\n` +
        `     or revert automations/first-automation.mdx and automations/signal-types.mdx to the raw-count wording.`,
      );
    } else {
      errors.push(`volume compares a RAW share count, but these pages call it a multiple: ${claimsRatio.join(', ')}`);
    }
  }
  console.log(`  volume signal                      ${isRelative ? 'multiple of avg' : 'raw share count'}   automationWorker.js`);

  const minBars = worker.match(/AVG_VOLUME_MIN_BARS\s*=\s*(\d+)/)?.[1];
  if (minBars) {
    // Docs quote the number of bars a symbol needs, which is the minimum + 1
    // because the baseline window excludes the live bar.
    const needed = Number(minBars) + 1;
    const quoted = [...(pages.get('automations/signal-types.mdx') ?? '').matchAll(/at least (\d+) bars/gi)].map((m) => Number(m[1]));
    for (const q of quoted) {
      if (q !== needed) errors.push(`signal-types.mdx says "at least ${q} bars"; AVG_VOLUME_MIN_BARS=${minBars} means ${needed}`);
    }
    console.log(`  volume min bars                    ${needed}        AVG_VOLUME_MIN_BARS + 1`);
  }
}

/* ── 2. Operator labels and per-signal rules ────────────────────────────── */
const constants = (await readIf('lib/automationConstants.js')) ?? (await readIf('server/config/automationConstants.js'));
if (constants) {
  const volOps = constants.match(/volume:\s*\[([^\]]*)\]/)?.[1];
  if (volOps) {
    const only = volOps.replace(/['"\s]/g, '').split(',').filter(Boolean);
    const docsSayNoOperator = /no operator|has no operator at all|always "above"|always \*above\*/i.test(
      (pages.get('automations/signal-types.mdx') ?? '') + (pages.get('automations/operators.mdx') ?? '') + (pages.get('automations/first-automation.mdx') ?? ''),
    );
    if (only.length === 1 && only[0] === 'above' && !docsSayNoOperator) {
      errors.push(`OPERATOR_RULES.volume allows only "above", but no page says so`);
    }
    console.log(`  volume operators                   ${only.join('/')}    OPERATOR_RULES`);
  }

  const goals = constants.match(/VALID_AGENT_GOALS\s*=\s*\[([^\]]*)\]/)?.[1];
  if (goals) {
    const n = goals.split(',').filter((s) => s.trim()).length;
    console.log(`  agent goals defined                ${n}        VALID_AGENT_GOALS`);
  }

  const channels = constants.match(/VALID_CHANNELS\s*=\s*\[([^\]]*)\]/)?.[1];
  if (channels) {
    const list = channels.replace(/['"\s]/g, '').split(',').filter(Boolean);
    const missing = list.filter((c) => {
      const word = { in_app: 'in-app', webhook: 'webhook', discord: 'Discord', email: 'Email', telegram: 'Telegram' }[c] ?? c;
      return !new RegExp(word, 'i').test(pages.get('automations/notifications.mdx') ?? '');
    });
    if (missing.length) errors.push(`notifications.mdx does not document these channels: ${missing.join(', ')}`);
    console.log(`  notification channels              ${list.length}        VALID_CHANNELS`);
  }
}

/* ── 3. Indicator count in the automation picker ────────────────────────── */
/**
 * This used to check only that the docs agreed with THEMSELVES, and it passed
 * happily while all four pages moved in step from 92 to 93. Agreeing on a wrong
 * number is the failure mode a docs guard exists to catch, so it now counts the
 * picker and compares.
 */
const condNode = await readIf('components/automations/canvas/nodes/ConditionNode.tsx');
if (condNode) {
  const block = condNode.slice(condNode.indexOf('const INDICATOR_GROUPS'));
  let indicators = 0, patterns = 0;
  for (const [, name, items] of block.slice(0, block.indexOf('];') + 2)
    .matchAll(/group:\s*'([^']+)',\s*items:\s*\[([^\]]*)\]/g)) {
    const n = [...items.matchAll(/'([^']+)'/g)].length;
    if (/Patterns$/.test(name)) patterns += n; else indicators += n;
  }
  const total = indicators + patterns;

  const say = (re, what, expected) => {
    const wrong = [];
    for (const [p, body] of pages) {
      for (const m of body.matchAll(re)) {
        if (Number(m[1]) !== expected) wrong.push(`${p} says ${m[1]}`);
      }
    }
    if (wrong.length) errors.push(`${what} is ${expected} in ConditionNode.tsx, but ${wrong.join('; ')}`);
  };
  say(/(\d+)\s+indicators\b/gi, 'indicator count', indicators);
  say(/(\d+)\s+candlestick patterns\b/gi, 'candlestick pattern count', patterns);
  say(/(\d+)\s+(?:entries across|technical readings|technical signals)/gi, 'picker total', total);

  console.log(`  picker entries                     ${total}       ${indicators} indicators + ${patterns} patterns`);
}

/* ── 4. Agent types you can actually add ────────────────────────────────── */
/**
 * VALID_AGENT_GOALS is the server's accept-list and is longer than the menu:
 * it carries goals reachable only by migrating an older automation. The docs
 * describe what a reader can click, so the menu is the number that counts.
 */
const canvas = await readIf('components/automations/canvas/AutomationCanvas.tsx');
if (canvas) {
  const menu = canvas.match(/\{\s*goal:\s*'[^']+',\s*label:[\s\S]*?\}\s*,?\s*\]\.map/);
  const offered = menu ? [...menu[0].matchAll(/goal:\s*'([^']+)'/g)].map((m) => m[1]) : [];
  if (offered.length) {
    const WORD = { 5: 'five', 6: 'six', 7: 'seven', 8: 'eight' };
    const expected = WORD[offered.length] ?? String(offered.length);
    // Narrow on purpose. A looser lookahead matched "five node types" and
    // "five channel chips", which have nothing to do with agents.
    const CLAIMS = [
      /\b(five|six|seven|eight)\b(?=\s+(?:you can add|agents?\b|agent types))/gi,
      /\b(?:one of each of|so)\s+(five|six|seven|eight)\b(?=[^.]{0,20}\b(?:types?|is the ceiling))/gi,
      /\b(five|six|seven|eight)\s+agent types\b/gi,
    ];
    for (const [p, body] of pages) {
      for (const re of CLAIMS) {
        for (const m of body.matchAll(re)) {
          if (m[1].toLowerCase() !== expected) {
            errors.push(`the + Agent menu offers ${offered.length} (${offered.join(', ')}), but ${p} says "${m[1]}"`);
          }
        }
      }
    }
    console.log(`  agent types in the menu            ${offered.length}        ${offered.join(', ')}`);
  }
}

/* ── 4. Plan limits ─────────────────────────────────────────────────────── */
const tiers = await readIf('server/config/tiers.js');
if (tiers) {
  const grab = (tier, key) => {
    const block = tiers.split(new RegExp(`\\b${tier}\\s*:\\s*\\{`, 'i'))[1];
    return block ? block.match(new RegExp(`${key}\\s*:\\s*(\\d+)`))?.[1] : undefined;
  };
  for (const [tier, key, label] of [
    ['trader', 'automationsMax', 'Trader automations'],
    ['quant', 'automationsMax', 'Quant automations'],
  ]) {
    const v = grab(tier, key);
    if (!v) continue;
    const table = pages.get('concepts/usage-limits.mdx') ?? '';
    if (!new RegExp(`\\b${v}\\b`).test(table)) {
      errors.push(`tiers.js ${tier}.${key} = ${v}, not present in usage-limits.mdx`);
    }
    console.log(`  ${label.padEnd(34)} ${v.padEnd(8)} tiers.js`);
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

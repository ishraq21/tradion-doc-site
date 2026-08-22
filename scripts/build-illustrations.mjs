/**
 * Builds every SVG in images/diagrams/.
 *
 *   npm run illustrations
 *
 * The catalogue in ILLUSTRATIONS.md is the contract: this script must emit
 * exactly the slugs listed there, and verify-nav.mjs enforces both directions.
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as core from './lib/diagrams-core.mjs';
import * as feat from './lib/diagrams-features.mjs';
import * as trade from './lib/diagrams-trade.mjs';
import * as auto from './lib/diagrams-automations.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'images', 'diagrams');

const BUILDERS = {
  'app-anatomy': core.appAnatomy,
  'onboarding-steps': core.onboardingSteps,
  'plan-ladder': core.planLadder,
  'usage-meters': core.usageMeters,
  'memory-sources': core.memorySources,
  'verdict-anatomy': core.verdictAnatomy,
  'confidence-anatomy': core.confidenceAnatomy,
  'trade-levels': core.tradeLevels,
  'data-sources-map': core.dataSourcesMap,

  'portfolio-anatomy': feat.portfolioAnatomy,
  'asset-manager-anatomy': feat.assetManagerAnatomy,
  'quant-anatomy': feat.quantAnatomy,
  'cell-anatomy': feat.cellAnatomy,
  'lens-vs-analyzer': feat.lensVsAnalyzer,
  'earnings-anatomy': feat.earningsAnatomy,

  'autopsy-anatomy': trade.autopsyAnatomy,
  'scorecard': trade.scorecard,
  'autopsy-loop': trade.autopsyLoop,
  'profile-anatomy': trade.profileAnatomy,

  'automation-flow': auto.automationFlow,
  'canvas-anatomy': auto.canvasAnatomy,
  'crosses-vs-is': auto.crossesVsIs,
  'signal-matrix': auto.signalMatrix,
  'notification-fanout': auto.notificationFanout,
  'webhook-flow': auto.webhookFlow,
};

/**
 * Nothing in a docs illustration may look like real account data.
 * This runs on the generated markup, not on intent.
 */
const FORBIDDEN = [
  [/\$\s?\d/, 'a dollar amount'],
  [/\b\d{1,3}(,\d{3})+(\.\d+)?\b/, 'a thousands-separated figure'],
  [/@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, 'an email address'],
  [/\b\d{6,}\b/, 'something shaped like an account number'],
];

async function main() {
  await mkdir(OUT, { recursive: true });

  const catalogue = await readFile(join(ROOT, 'ILLUSTRATIONS.md'), 'utf8');
  const catalogued = new Set(
    [...catalogue.matchAll(/^\|\s*`diagrams\/([a-z0-9-]+)`\s*\|/gm)].map((m) => m[1]),
  );

  const problems = [];
  for (const slug of catalogued) {
    if (!BUILDERS[slug]) problems.push(`ILLUSTRATIONS.md lists "${slug}" but no builder exists`);
  }
  for (const slug of Object.keys(BUILDERS)) {
    if (!catalogued.has(slug)) problems.push(`builder "${slug}" is not listed in ILLUSTRATIONS.md`);
  }
  if (problems.length) {
    problems.forEach((p) => console.error(`✗ ${p}`));
    process.exit(1);
  }

  let bytes = 0;
  for (const [slug, build] of Object.entries(BUILDERS)) {
    const markup = build();

    // Scan only what a reader can actually see — text nodes and the
    // accessible title/description. Attribute values carry rgba() colours
    // and path coordinates, which are not data about anybody.
    const visible = [...markup.matchAll(/<(?:text|title|desc)[^>]*>([^<]*)<\//g)]
      .map((m) => m[1])
      .join('\n');

    for (const [re, what] of FORBIDDEN) {
      const hit = visible.match(re);
      if (hit) {
        console.error(`✗ ${slug}: contains ${what} — "${hit[0]}". Illustrations must not show account data.`);
        process.exit(1);
      }
    }
    if (!/<title id="t">.+<\/title>/.test(markup) || !/<desc id="d">.+<\/desc>/.test(markup)) {
      console.error(`✗ ${slug}: missing an accessible title or description`);
      process.exit(1);
    }

    await writeFile(join(OUT, `${slug}.svg`), markup);
    bytes += Buffer.byteLength(markup);
    console.log(`  ${slug.padEnd(24)} ${(Buffer.byteLength(markup) / 1024).toFixed(1)} KB`);
  }

  console.log(`\n✓ ${Object.keys(BUILDERS).length} illustrations → images/diagrams/  (${(bytes / 1024).toFixed(0)} KB total)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

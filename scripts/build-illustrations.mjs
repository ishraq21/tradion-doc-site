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

import { setNamespace, N, ACCENT } from './lib/svg.mjs';
import * as core from './lib/diagrams-core.mjs';
import * as feat from './lib/diagrams-features.mjs';
import * as trade from './lib/diagrams-trade.mjs';
import * as auto from './lib/diagrams-automations.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'images', 'diagrams');

const BUILDERS = {
  'onboarding-steps': core.onboardingSteps,
  'usage-meters': core.usageMeters,
  'memory-sources': core.memorySources,
  'verdict-anatomy': core.verdictAnatomy,
  'confidence-anatomy': core.confidenceAnatomy,
  'trade-levels': core.tradeLevels,
  'data-sources-map': core.dataSourcesMap,

  'autopsy-anatomy': trade.autopsyAnatomy,
  'scorecard': trade.scorecard,
  'autopsy-loop': trade.autopsyLoop,
  'profile-anatomy': trade.profileAnatomy,

  'automation-flow': auto.automationFlow,
  'crosses-vs-is': auto.crossesVsIs,
  'signal-matrix': auto.signalMatrix,
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
    setNamespace(slug);   // ids are per-diagram, so two on one page never collide
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
    if (!new RegExp(`<title id="${slug.replace(/[^a-z0-9]/gi, '')}-t">.+</title>`).test(markup)) {
      console.error(`✗ ${slug}: missing an accessible title`);
      process.exit(1);
    }

    // The design contract, enforced rather than trusted.
    const root = markup.slice(0, markup.indexOf('>') + 1);
    // Unitless width/height are REQUIRED: medium-zoom (the <Frame> lightbox)
    // reads naturalWidth/naturalHeight on click and cannot scale without them.
    // What breaks rendering is a unit or a percentage, so reject only those.
    if (/\s(?:width|height)="[^"]*(?:%|px|em|rem)/.test(root)) {
      console.error(`✗ ${slug}: root width/height carries a unit. Use unitless numbers matching the viewBox.`);
      process.exit(1);
    }
    if (/style="[^"]*%/.test(root)) {
      console.error(`✗ ${slug}: percentage size in an inline style on the root renders blank in some engines.`);
      process.exit(1);
    }
    const hexes = [...markup.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0].toLowerCase());
    const allowed = new Set([...Object.values(N).map((v) => v.toLowerCase()), ACCENT.toLowerCase()]);
    const rogue = [...new Set(hexes)].filter((h) => !allowed.has(h));
    if (rogue.length) {
      console.error(`✗ ${slug}: colours outside the neutral scale and the single accent: ${rogue.join(', ')}`);
      process.exit(1);
    }
    if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(markup)) {
      console.error(`✗ ${slug}: contains an emoji`);
      process.exit(1);
    }
    // Prose inside a diagram is still prose. The redaction glyph is the one
    // place a dash is allowed, because it stands in for a withheld number.
    const prose = [...markup.matchAll(/<(?:text|title|desc)[^>]*>([^<]*)</g)]
      .map((m) => m[1])
      .filter((t) => !/^[\s—.\/%•-]*$/.test(t));
    const dashed = prose.filter((t) => t.includes('\u2014'));
    if (dashed.length) {
      console.error(`✗ ${slug}: em dash in diagram text: "${dashed[0].trim()}"`);
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

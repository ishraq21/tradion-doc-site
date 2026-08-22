/**
 * Pre-deploy sanity check.
 *
 *   node scripts/verify-nav.mjs
 *
 * Verifies:
 *  1. Every page listed in docs.json navigation resolves to a real .mdx file
 *  2. Every .mdx file is reachable from the navigation (no orphans)
 *  3. Every /images/... referenced from an .mdx is listed in screenshot-manifest.json
 *  4. Every internal /link in an .mdx points at a page that exists
 *  5. Every manifest slug has a matching entry in shots.ts
 */

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

const docs = JSON.parse(await readFile(join(ROOT, 'docs.json'), 'utf8'));

// ── collect nav pages ──────────────────────────────────────────────────────
const navPages = [];
const walk = (node) => {
  if (typeof node === 'string') { navPages.push(node); return; }
  if (Array.isArray(node)) { node.forEach(walk); return; }
  if (node && typeof node === 'object') {
    for (const key of ['tabs', 'groups', 'pages']) if (node[key]) walk(node[key]);
  }
};
walk(docs.navigation);

// ── collect mdx files on disk ──────────────────────────────────────────────
async function findMdx(dir, acc = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || ['node_modules', 'images', 'scripts', 'logo'].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) await findMdx(p, acc);
    else if (e.name.endsWith('.mdx')) acc.push(relative(ROOT, p).replace(/\.mdx$/, ''));
  }
  return acc;
}
const files = await findMdx(ROOT);

// 1. nav → file
for (const p of navPages) {
  if (!existsSync(join(ROOT, `${p}.mdx`))) errors.push(`nav references missing page: ${p}.mdx`);
}
// 2. file → nav
const navSet = new Set(navPages);
for (const f of files) {
  if (!navSet.has(f)) warnings.push(`orphan page not in navigation: ${f}.mdx`);
}

// ── scan mdx bodies ────────────────────────────────────────────────────────
const manifest = JSON.parse(await readFile(join(ROOT, 'scripts', 'screenshot-manifest.json'), 'utf8'));
const manifestSlugs = new Set(manifest.map((m) => m.slug));
const pageSet = new Set(files);

// closed catalogue of illustrations, parsed from ILLUSTRATIONS.md
const catalogue = await readFile(join(ROOT, 'ILLUSTRATIONS.md'), 'utf8');
const catalogueSlugs = new Set([...catalogue.matchAll(/^\|\s*`(diagrams\/[a-z0-9-]+)`\s*\|/gm)].map((m) => m[1]));

for (const f of files) {
  const src = await readFile(join(ROOT, `${f}.mdx`), 'utf8');

  // 3a. photographic screenshots must be declared for capture
  for (const [, img] of src.matchAll(/src="\/images\/([^"]+?)\.png"/g)) {
    if (!manifestSlugs.has(img)) errors.push(`${f}.mdx references /images/${img}.png — not in screenshot-manifest.json`);
  }
  // 3b. illustrations must be in the closed catalogue
  for (const [, img] of src.matchAll(/src="\/images\/([^"]+?)\.svg"/g)) {
    if (!catalogueSlugs.has(img)) errors.push(`${f}.mdx references /images/${img}.svg — not listed in ILLUSTRATIONS.md`);
    else if (!existsSync(join(ROOT, 'images', `${img}.svg`))) warnings.push(`${img}.svg is catalogued but not built yet — run npm run illustrations`);
  }
  // 3c. captured screenshots must exist on disk
  for (const [, img] of src.matchAll(/src="\/images\/(screens\/[^"]+?)\.jpg"/g)) {
    if (!existsSync(join(ROOT, 'images', `${img}.jpg`))) errors.push(`${f}.mdx references /images/${img}.jpg — file missing`);
  }

  // 4. internal links
  for (const [, href] of src.matchAll(/href="(\/[^"#]+)"/g)) {
    const target = href.replace(/^\//, '');
    if (!pageSet.has(target)) errors.push(`${f}.mdx links to /${target} — no such page`);
  }
  for (const [, href] of src.matchAll(/\]\((\/[^)#]+)\)/g)) {
    const target = href.replace(/^\//, '');
    if (target.startsWith('images/')) continue;
    if (!pageSet.has(target)) errors.push(`${f}.mdx links to /${target} — no such page`);
  }
}

// 5. manifest → shots.ts
const shotsSrc = await readFile(join(ROOT, 'scripts', 'shots.ts'), 'utf8');
const shotSlugs = new Set([...shotsSrc.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]));
for (const slug of manifestSlugs) {
  if (!shotSlugs.has(slug)) errors.push(`manifest slug "${slug}" has no definition in shots.ts`);
}
for (const slug of shotSlugs) {
  if (!manifestSlugs.has(slug)) warnings.push(`shots.ts defines "${slug}" but no page references it`);
}

// ── report ─────────────────────────────────────────────────────────────────
console.log(`pages in nav:        ${navPages.length}`);
console.log(`mdx files on disk:   ${files.length}`);
console.log(`screenshots defined: ${shotSlugs.size}`);
console.log(`manifest entries:    ${manifestSlugs.size}`);
console.log(`illustrations:       ${catalogueSlugs.size}\n`);

if (warnings.length) {
  console.log(`⚠  ${warnings.length} warning(s)`);
  warnings.forEach((w) => console.log(`   ${w}`));
  console.log('');
}
if (errors.length) {
  console.log(`✗  ${errors.length} error(s)`);
  errors.forEach((e) => console.log(`   ${e}`));
  process.exit(1);
}
console.log('✓ navigation, links, images, and shot definitions all resolve');

/**
 * Structural sanity check for MDX.
 *
 *   node scripts/check-structure.mjs
 *
 * WHY THIS EXISTS
 * Several pages were edited by script, inserting a <Frame> at an index computed
 * from a regex match. One of those helpers measured the offset on a sliced
 * string and applied it to the unsliced one, so a tag landed in the middle of a
 * word inside a <Warning>:
 *
 *     ...if the chart you want is elsewhe<Frame caption="...">
 *
 * That is invalid MDX. The build failed and the site served the previous commit
 * for hours. Nothing caught it: verify-nav checks links, audit-content checks
 * prose. Neither parses the file.
 *
 * This does the cheap structural checks that would have caught it in a second.
 */

import { readFile, readdir } from 'node:fs/promises';
import { join, resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

// Components used in this site that wrap content and must be closed.
const PAIRED = ['Frame', 'Warning', 'Note', 'Tip', 'Info', 'Check', 'Steps', 'Step',
  'Tabs', 'Tab', 'Accordion', 'AccordionGroup', 'CardGroup', 'Card', 'CodeGroup'];

async function findMdx(dir, acc = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || ['node_modules', 'images', 'scripts', 'logo'].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) await findMdx(p, acc);
    else if (e.name.endsWith('.mdx')) acc.push(p);
  }
  return acc;
}

for (const file of await findMdx(ROOT)) {
  const rel = relative(ROOT, file);
  const raw = await readFile(file, 'utf8');

  // Ignore fenced code: a JSX-looking line inside a fence is a sample.
  const lines = raw.split('\n');
  let fenced = false;
  const body = lines.map((ln) => {
    if (ln.trim().startsWith('```')) { fenced = !fenced; return ''; }
    return fenced ? '' : ln;
  }).join('\n');

  // 1. A tag opening immediately after a word character is the signature of an
  //    offset-based insertion landing mid-sentence.
  for (const m of body.matchAll(/(\w)(<(?:[A-Z]\w*))/g)) {
    const line = body.slice(0, m.index).split('\n').length;
    errors.push(`${rel}:${line}: component opens mid-word ("...${m[1]}${m[2]}"). An insertion landed inside a sentence.`);
  }

  // 2. Unbalanced component tags.
  for (const tag of PAIRED) {
    const open = (body.match(new RegExp(`<${tag}(?=[\\s>])(?![^>]*/>)`, 'g')) || []).length;
    const close = (body.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    if (open !== close) {
      errors.push(`${rel}: <${tag}> opened ${open}×, closed ${close}×`);
    }
  }

  // 3. An <img> must be self-closing in MDX.
  for (const m of body.matchAll(/<img\s[^>]*[^/]>/g)) {
    const line = body.slice(0, m.index).split('\n').length;
    errors.push(`${rel}:${line}: <img> is not self-closed`);
  }

  // 4. Frontmatter must open and close.
  if (!/^---\n[\s\S]*?\n---\n/.test(raw)) errors.push(`${rel}: malformed frontmatter`);

  // 5. A stray closing tag before any opening tag of that name.
  for (const tag of PAIRED) {
    const first = body.indexOf(`</${tag}>`);
    const firstOpen = body.search(new RegExp(`<${tag}(?=[\\s>])`));
    if (first !== -1 && (firstOpen === -1 || first < firstOpen)) {
      const line = body.slice(0, first).split('\n').length;
      errors.push(`${rel}:${line}: </${tag}> appears before any <${tag}>`);
    }
  }
}

if (errors.length) {
  console.log(`✗  ${errors.length} structural problem(s)`);
  errors.forEach((e) => console.log(`   ${e}`));
  process.exit(1);
}
console.log('✓ every page is structurally valid MDX');

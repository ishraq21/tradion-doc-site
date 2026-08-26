/**
 * Check every outbound link the site points at.
 *
 *   npm run check:links
 *
 * WHY THIS IS NOT PART OF `npm run verify`
 * It needs the network, and the network fails for reasons that have nothing to
 * do with the docs. A guard that goes red when someone's wifi drops gets
 * ignored, and an ignored guard is worse than none. Run it before a release,
 * and in CI on a schedule rather than on every commit.
 *
 * WHY IT EXISTS AT ALL
 * `verify:nav` checks that internal links resolve to files. Nothing checked the
 * links that leave the site, and two of them were dead on the live docs:
 *
 *   - https://status.tradionlabs.com   in the navbar of all 46 pages, NXDOMAIN
 *   - https://discord.gg/6zvFp9rd      in the footer socials, Discord's own
 *                                      API returned 404 Unknown Invite
 *
 * Both were found by clicking them, which is not a strategy.
 */

import { readFile, readdir } from 'node:fs/promises';
import { join, resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Hosts that answer a bot differently from a browser. A 403 from one of these
 * means "you are not a browser", not "this link is broken", so they are
 * reported rather than failed. Keep this list short and justified.
 */
const BOT_HOSTILE = ['linkedin.com', 'x.com', 'twitter.com'];

async function findMdx(dir, acc = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || ['node_modules', 'images', 'scripts', 'logo'].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) await findMdx(p, acc);
    else if (e.name.endsWith('.mdx')) acc.push(p);
  }
  return acc;
}

/** url -> the places that point at it */
const sources = new Map();
const note = (url, where) => {
  if (url.startsWith('https://mintlify.com/docs.json')) return;   // the schema, not a link
  if (!sources.has(url)) sources.set(url, new Set());
  sources.get(url).add(where);
};

const config = await readFile(join(ROOT, 'docs.json'), 'utf8');
for (const m of config.matchAll(/"(https?:\/\/[^"]+)"/g)) note(m[1], 'docs.json');

for (const file of await findMdx(ROOT)) {
  const rel = relative(ROOT, file);
  const body = await readFile(file, 'utf8');
  for (const m of body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) note(m[1], rel);
  for (const m of body.matchAll(/href="(https?:\/\/[^"]+)"/g)) note(m[1], rel);
}

/**
 * Prove the network works before believing anything this script reports.
 *
 * Without this the first run printed all fourteen links as broken, because the
 * machine had no DNS. A link checker that cries wolf when the wifi drops is the
 * thing this file's header warns about, so it refuses to run instead.
 */
try {
  await fetch('https://example.com', { method: 'HEAD', redirect: 'follow' });
} catch (err) {
  console.error('✗  No network: even https://example.com is unreachable ' +
    `(${err.cause?.code ?? err.message}).\n   Nothing was checked. Run this where DNS works.`);
  process.exit(2);
}

console.log(`  ${sources.size} outbound links\n`);

const broken = [];
const unsure = [];

/**
 * ENOTFOUND is a real answer: the name does not exist. EAI_AGAIN and the
 * timeouts are the resolver or the route giving up, which says nothing about
 * the link, so those are reported for a human rather than failing the run.
 */
const REAL_FAILURE = new Set(['ENOTFOUND', 'ECONNREFUSED', 'CERT_HAS_EXPIRED', 'ERR_TLS_CERT_ALTNAME_INVALID']);

for (const [url, where] of [...sources].sort()) {
  const from = [...where].join(', ');
  let status;
  try {
    // HEAD first: cheap, and enough for most hosts. Some answer 403/405 to it,
    // so fall back to GET before believing the link is broken.
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (res.status === 403 || res.status === 405 || res.status === 501) {
      res = await fetch(url, { method: 'GET', redirect: 'follow' });
    }
    status = res.status;
  } catch (err) {
    const code = err.cause?.code ?? err.message;
    if (REAL_FAILURE.has(code)) {
      console.log(`  ✗ ${String(code).padEnd(12)} ${url}`);
      broken.push(`${url} — ${code === 'ENOTFOUND' ? 'that domain does not exist' : code} — linked from ${from}`);
    } else {
      console.log(`  ? ${String(code).padEnd(12)} ${url}`);
      unsure.push(`${url} did not answer (${code}), which may be the network rather than the link. Linked from ${from}`);
    }
    continue;
  }

  const hostile = BOT_HOSTILE.some((h) => new URL(url).hostname.endsWith(h));
  if (status >= 400 && hostile) {
    console.log(`  ? ${String(status).padEnd(12)} ${url}`);
    unsure.push(`${url} returned ${status}, but that host blocks bots — open it yourself. Linked from ${from}`);
  } else if (status >= 400) {
    console.log(`  ✗ ${String(status).padEnd(12)} ${url}`);
    broken.push(`${url} returned ${status} — linked from ${from}`);
  } else {
    console.log(`  ✓ ${String(status).padEnd(12)} ${url}`);
  }
}

console.log('');
if (unsure.length) {
  console.log(`?  ${unsure.length} to check by hand`);
  unsure.forEach((u) => console.log(`   ${u}`));
  console.log('');
}
if (broken.length) {
  console.log(`✗  ${broken.length} broken outbound link(s)`);
  broken.forEach((b) => console.log(`   ${b}`));
  process.exit(1);
}
console.log('✓ every outbound link resolves');

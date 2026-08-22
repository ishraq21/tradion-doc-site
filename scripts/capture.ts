/**
 * Automated docs screenshot capture.
 *
 *   cd docs-site && npm install && npx playwright install chromium
 *   DOCS_BASE_URL=http://localhost:3000 \
 *   JWT_SECRET=... \
 *   DOCS_DEMO_USER_ID=... \
 *   DOCS_DEMO_EMAIL=demo@tradionlabs.com \
 *   npm run shots
 *
 * Flags:
 *   --only=<substring>   capture just the slugs matching this substring
 *   --headed             watch it run
 *   --keep-missing       don't fail the run when a selector is missing
 *
 * How navigation works: Tradion has no React Router. The active screen is the
 * `ViewState` enum persisted to localStorage under `tradion_active_view`, so we
 * seed that key and reload rather than visiting a URL.
 *
 * Auth: we mint the same HS256 JWT the server issues and set it as the
 * httpOnly `auth_token` cookie, skipping the OAuth / magic-link round trip.
 * This requires JWT_SECRET from the target environment — only ever run this
 * against localhost or a dedicated staging deployment, never production.
 */

import { chromium, type Page, type BrowserContext } from 'playwright';
import jwt from 'jsonwebtoken';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SHOTS, VIEWPORT, DEVICE_SCALE_FACTOR, type Shot } from './shots.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = resolve(__dirname, '..', 'images');

const BASE_URL = process.env.DOCS_BASE_URL ?? 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET;
const DEMO_USER_ID = process.env.DOCS_DEMO_USER_ID;
const DEMO_EMAIL = process.env.DOCS_DEMO_EMAIL ?? 'demo@tradionlabs.com';

const args = new Set(process.argv.slice(2));
const only = [...args].find((a) => a.startsWith('--only='))?.slice('--only='.length);
const headed = args.has('--headed');
const keepMissing = args.has('--keep-missing');

const VIEW_STORAGE_KEY = 'tradion_active_view';
const DEFAULT_SETTLE = 1200;

if (BASE_URL.includes('app.tradionlabs.com')) {
  throw new Error('Refusing to run against production. Point DOCS_BASE_URL at localhost or staging.');
}
if (!JWT_SECRET || !DEMO_USER_ID) {
  throw new Error('JWT_SECRET and DOCS_DEMO_USER_ID are required. See docs-site/scripts/README.md.');
}

function mintToken(): string {
  return jwt.sign(
    { userId: DEMO_USER_ID, email: DEMO_EMAIL, isAdmin: false },
    JWT_SECRET as string,
    { algorithm: 'HS256', expiresIn: '1h' },
  );
}

/** CSS injected into every page: kill motion, hide anything that would churn a diff. */
const STABILISE_CSS = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    caret-color: transparent !important;
    scroll-behavior: auto !important;
  }
  /* Live tickers and clocks change every second and would make every run a diff. */
  [data-doc-freeze], .live-clock, .ticker-tape { visibility: hidden !important; }
`;

async function stabilise(page: Page) {
  await page.addStyleTag({ content: STABILISE_CSS });
  // Pin the clock so relative timestamps ("2m ago") don't drift between runs.
  await page.evaluate(() => {
    const FIXED = new Date('2026-06-15T14:30:00-04:00').getTime();
    const OriginalDate = Date;
    // @ts-expect-error deliberate global patch for deterministic captures
    window.Date = class extends OriginalDate {
      constructor(...a: unknown[]) {
        // @ts-expect-error spread into Date
        super(...(a.length ? a : [FIXED]));
      }
      static now() { return FIXED; }
    };
  });
}

async function gotoView(page: Page, view: string) {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key as string, value as string),
    [VIEW_STORAGE_KEY, view],
  );
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
}

async function runSteps(page: Page, shot: Shot) {
  for (const step of shot.steps ?? []) {
    if ('click' in step) await page.locator(step.click).first().click({ timeout: 15_000 });
    else if ('hover' in step) await page.locator(step.hover).first().hover({ timeout: 15_000 });
    else if ('fill' in step) await page.locator(step.fill[0]).first().fill(step.fill[1]);
    else if ('scrollTo' in step) await page.locator(step.scrollTo).first().scrollIntoViewIfNeeded();
    else if ('wait' in step) await page.waitForTimeout(step.wait);
  }
}

async function capture(context: BrowserContext, shot: Shot) {
  const page = await context.newPage();
  try {
    if (shot.unauthenticated) {
      await context.clearCookies();
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    } else if (shot.view === '__onboarding__' || shot.view === '__paywall__') {
      // These gates render instead of any ViewState; they need a purpose-seeded
      // user (onboardingCompleted=false / no active subscription respectively).
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    } else {
      await gotoView(page, shot.view ?? 'HOME');
    }

    await stabilise(page);
    if (shot.waitFor) await page.waitForSelector(shot.waitFor, { timeout: 30_000 });
    await runSteps(page, shot);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(shot.settle ?? DEFAULT_SETTLE);

    const out = join(IMAGES_DIR, `${shot.slug}.png`);
    await mkdir(dirname(out), { recursive: true });

    if (shot.clip) {
      const el = page.locator(shot.clip).first();
      await el.waitFor({ state: 'visible', timeout: 20_000 });
      await el.screenshot({ path: out, animations: 'disabled' });
    } else {
      await page.screenshot({ path: out, fullPage: false, animations: 'disabled' });
    }
    return { slug: shot.slug, ok: true as const };
  } catch (err) {
    return { slug: shot.slug, ok: false as const, error: (err as Error).message.split('\n')[0] };
  } finally {
    await page.close();
  }
}

async function main() {
  const targets = only ? SHOTS.filter((s) => s.slug.includes(only)) : SHOTS;
  if (!targets.length) {
    console.error(`No shots match --only=${only}`);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: !headed });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    colorScheme: 'dark',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    reducedMotion: 'reduce',
  });

  const { hostname } = new URL(BASE_URL);
  await context.addCookies([
    { name: 'auth_token', value: mintToken(), domain: hostname, path: '/', httpOnly: true, sameSite: 'Lax' },
  ]);

  const results = [];
  for (const shot of targets) {
    process.stdout.write(`  ${shot.slug.padEnd(46)}`);
    const r = await capture(context, shot);
    console.log(r.ok ? '✓' : `✗  ${r.error}`);
    results.push(r);
  }

  await context.close();
  await browser.close();

  const failed = results.filter((r) => !r.ok);
  await writeFile(
    join(IMAGES_DIR, '_capture-report.json'),
    JSON.stringify({ capturedAt: new Date().toISOString(), baseUrl: BASE_URL, results }, null, 2) + '\n',
  );

  console.log(`\n${results.length - failed.length}/${results.length} captured → docs-site/images/`);
  if (failed.length) {
    console.log('\nFailed:');
    for (const f of failed) console.log(`  ${f.slug} — ${f.error}`);
    console.log('\nUsually a missing data-doc attribute. See scripts/README.md.');
    if (!keepMissing) process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

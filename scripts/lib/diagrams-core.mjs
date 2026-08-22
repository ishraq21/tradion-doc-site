import { C, F, svg, rect, text, label, line, path, panel, chip, pin, leader, bar, redact, spark, flowArrow } from './svg.mjs';

/* ── app-anatomy ─────────────────────────────────────────────────────────── */
export function appAnatomy() {
  const W = 940, H = 596;
  const groups = [
    ['', ['Home']],
    ['Overview', ['Portfolio']],
    ['Research & Analysis', ['AI Quant Research', 'Earnings Spider', 'Chart Analyzer', 'Lens']],
    ['Trade Intelligence', ['Trade Autopsy', 'Profile', 'AI Asset Manager']],
    ['Automate', ['Automations']],
  ];
  let s = '';
  // sidebar
  s += rect(20, 20, 210, 500, { fill: C.panel, r: 8 });
  s += `<circle cx="42" cy="46" r="8" fill="none" stroke="${C.accent}" stroke-width="1.4"/>`;
  s += text(60, 50, 'Tradion', { size: 13, weight: 600, font: F.head });
  let y = 82;
  for (const [g, items] of groups) {
    if (g) { s += label(36, y, g); y += 16; }
    for (const it of items) {
      const active = it === 'Portfolio';
      if (active) s += rect(30, y - 11, 190, 24, { r: 5, fill: C.accentSoft, stroke: 'none', sw: 0 });
      s += rect(40, y - 5, 11, 11, { r: 3, fill: 'none', stroke: active ? C.accent : C.faint });
      s += text(60, y + 4, it, { size: 11.5, fill: active ? C.text : C.dim, weight: active ? 500 : 400 });
      y += 27;
    }
    y += 8;
  }
  s += line(30, 436, 220, 436, { stroke: C.border });
  s += text(40, 462, 'Feedback', { size: 11, fill: C.faint });
  s += text(40, 484, 'Settings', { size: 11, fill: C.faint });

  // status bar
  s += rect(248, 20, W - 268, 34, { fill: C.panel, r: 8 });
  s += `<circle cx="292" cy="37" r="4" fill="${C.accent}"/>`;
  s += text(306, 41, 'Market open', { size: 11, fill: C.dim });
  s += chip(412, 27, 'News wire', { });
  s += redact(W - 40, 41, { anchor: 'end', s: '••• •••', size: 11 });

  // main
  s += rect(248, 66, W - 268, 454, { fill: C.panel, r: 8 });
  s += text(272, 100, 'Portfolio', { size: 17, weight: 600, font: F.head });
  s += text(272, 120, 'Your holdings, updated from a connected brokerage', { size: 11, fill: C.faint });
  const cards = ['Total value', 'Day change', 'Positions', 'Accounts'];
  cards.forEach((c, i) => {
    const x = 272 + i * 158;
    s += rect(x, 138, 142, 62, { fill: C.panelAlt, r: 6 });
    s += label(x + 12, 158, c);
    s += redact(x + 12, 182, { size: 13 });
  });
  s += rect(272, 216, 618, 150, { fill: C.panelAlt, r: 6 });
  s += label(284, 236, 'Value over time');
  s += spark(292, 250, 586, 96, [0.32, 0.4, 0.35, 0.5, 0.46, 0.6, 0.55, 0.68, 0.62, 0.78, 0.72, 0.86]);
  s += rect(272, 380, 618, 122, { fill: C.panelAlt, r: 6 });
  s += label(284, 400, 'Holdings');
  [0, 1, 2].forEach((i) => {
    const ry = 418 + i * 28;
    s += text(292, ry + 12, ['AAPL', 'NVDA', 'BTC/USD'][i], { size: 11, font: F.mono, fill: C.dim });
    s += bar(370, ry + 8, 180 - i * 40);
    s += redact(870, ry + 12, { anchor: 'end', s: '—.— %' });
  });

  // pins — anchored to the thing they label
  s += pin(240, 152, '1') + leader(231, 152, 200, 152);
  s += pin(240, 260, '2') + leader(231, 260, 200, 260);
  s += pin(240, 396, '3') + leader(231, 396, 200, 396);
  s += pin(240, 465, '4') + leader(231, 465, 200, 472);
  s += pin(232, 37, '5') + leader(241, 37, 262, 37);

  const legend = [
    ['1', 'Overview — where you stand'],
    ['2', 'Research — where you look'],
    ['3', 'Trade Intelligence — where you learn'],
    ['4', 'Automate — where it runs without you'],
    ['5', 'Market status and the news wire'],
  ];
  legend.forEach(([n, t], i) => {
    const x = 24 + (i % 3) * 306, y = 552 + Math.floor(i / 3) * 20;
    s += `<circle cx="${x + 8}" cy="${y - 4}" r="7" fill="none" stroke="${C.accentLine}"/>`;
    s += text(x + 8, y, n, { size: 9, fill: C.accent, anchor: 'middle', weight: 600 });
    s += text(x + 22, y, t, { size: 10.5, fill: C.faint });
  });

  return svg(W, H, s, {
    title: 'Anatomy of the Tradion app',
    desc: 'The app shell: a grouped sidebar on the left, a status bar across the top, and the selected screen filling the rest. Numbered markers label the sidebar groups and the status bar.',
  });
}

/* ── onboarding-steps ────────────────────────────────────────────────────── */
export function onboardingSteps() {
  const W = 940, H = 300;
  const steps = [
    ['1', 'Your name', 'What we call you throughout the app'],
    ['2', 'How you trade', 'Experience, style, and instruments'],
    ['3', 'What to improve', 'Becomes tracked goals'],
    ['4', "What's costing you", 'Seeds the pattern detector'],
    ['5', 'Choose a plan', 'Starts your subscription'],
  ];
  let s = label(28, 34, 'Onboarding — about 30 seconds');
  const bw = 168, gap = 15;
  steps.forEach(([n, t, d], i) => {
    const x = 28 + i * (bw + gap);
    const seeds = i === 2 || i === 3;
    s += rect(x, 56, bw, 130, { fill: C.panel, r: 8, stroke: seeds ? C.accentLine : C.border });
    s += pin(x + 22, 82, n);
    s += text(x + 16, 118, t, { size: 12.5, weight: 600, font: F.head });
    const words = d.split(' ');
    const l1 = words.slice(0, 4).join(' '), l2 = words.slice(4).join(' ');
    s += text(x + 16, 138, l1, { size: 10.5, fill: C.faint });
    if (l2) s += text(x + 16, 153, l2, { size: 10.5, fill: C.faint });
    if (seeds) s += text(x + 16, 174, 'feeds your profile', { size: 9.5, fill: C.accent, weight: 500 });
    if (i < steps.length - 1) s += flowArrow(x + bw + 2, x + bw + gap - 3, 121);
  });
  s += rect(28, 210, W - 56, 62, { fill: C.panelAlt, r: 8, stroke: C.accentLine, dash: '4 3' });
  s += text(48, 236, 'Steps 3 and 4 are the ones that matter most.', { size: 12, weight: 600, font: F.head });
  s += text(48, 256, 'They give Tradion something to work with before you have any trade history.', { size: 11, fill: C.dim });
  return svg(W, H, s, {
    title: 'The five onboarding steps',
    desc: 'Five numbered steps in a row: your name, how you trade, what to improve, what is costing you money, and choose a plan. Steps three and four are highlighted because they seed your trader profile.',
  });
}

/* ── plan-ladder ─────────────────────────────────────────────────────────── */
export function planLadder() {
  const W = 900, H = 380;
  const tiers = [
    ['Starter', 'Analysis tools', ['Chart Analyzer', 'Lens', 'Earnings Spider', 'Trade Autopsy', 'Portfolio + Asset Manager'], 96, false],
    ['Trader', 'Adds automation', ['Everything in Starter', 'AI Quant Research', 'Automations & alerts', 'AI agent nodes'], 148, true],
    ['Quant', 'Adds headroom', ['Everything in Trader', '10× the monthly limits', 'More capable agent model'], 200, false],
  ];
  let s = label(28, 34, 'Each tier adds to the one before it');
  tiers.forEach(([name, sub, items, h, hi], i) => {
    const x = 28 + i * 290, y = 300 - h;
    s += rect(x, y, 268, h, { fill: hi ? C.panelAlt : C.panel, r: 8, stroke: hi ? C.accentLine : C.border });
    s += text(x + 18, y + 26, name, { size: 15, weight: 600, font: F.head, fill: hi ? C.accent : C.text });
    s += text(x + 18, y + 44, sub, { size: 10.5, fill: C.faint });
    items.forEach((it, j) => {
      const iy = y + 68 + j * 20;
      s += `<circle cx="${x + 22}" cy="${iy - 4}" r="2.5" fill="${hi ? C.accent : C.faint}"/>`;
      s += text(x + 32, iy, it, { size: 11, fill: C.dim });
    });
    s += rect(x, 306, 268, 34, { fill: C.panel, r: 6 });
    s += text(x + 18, 327, i === 2 ? 'No free trial' : '7-day free trial', { size: 11, fill: i === 2 ? C.warn : C.accent, weight: 500 });
  });
  s += text(28, 364, 'The dividing question: do you need Tradion watching the market while you are away?', { size: 11, fill: C.faint });
  return svg(W, H, s, {
    title: 'The three Tradion plans as a ladder',
    desc: 'Three stacked columns of increasing height. Starter covers the analysis tools, Trader adds the quant terminal and automations, Quant adds ten times the monthly limits. Starter and Trader carry a seven-day trial; Quant does not.',
  });
}

/* ── usage-meters ────────────────────────────────────────────────────────── */
export function usageMeters() {
  const W = 900, H = 330;
  const meters = [
    ['Chat messages', 'One message to the AI Asset Manager', 0.62],
    ['Quant sessions', 'One research session in the quant terminal', 0.3],
    ['Agent runs', 'One AI agent step inside an automation', 0.84],
  ];
  let s = label(28, 34, 'Three things are metered. Everything else is unlimited.');
  meters.forEach(([n, d, f], i) => {
    const y = 56 + i * 74;
    s += rect(28, y, W - 56, 60, { fill: C.panel, r: 8 });
    s += text(48, y + 26, n, { size: 13, weight: 600, font: F.head });
    s += text(48, y + 44, d, { size: 10.5, fill: C.faint });
    const bx = 430, bw = 380;
    s += rect(bx, y + 26, bw, 10, { r: 5, fill: C.grid, stroke: 'none', sw: 0 });
    s += rect(bx, y + 26, bw * f, 10, { r: 5, fill: f > 0.8 ? C.warn : C.accent, stroke: 'none', sw: 0 });
    s += text(bx, y + 52, 'used this cycle', { size: 9.5, fill: C.faint });
    s += redact(bx + bw, y + 52, { anchor: 'end', s: '— / —' });
  });
  s += rect(28, 280, W - 56, 30, { fill: C.panelAlt, r: 6 });
  s += text(48, 300, 'Resets on your billing date, not the 1st. Unused credits do not roll over.', { size: 11, fill: C.dim });
  return svg(W, H, s, {
    title: 'The three metered counters',
    desc: 'Three rows, one per metered item: chat messages, quant sessions, and agent runs. Each shows a progress bar with the amount redacted. A footer notes that counters reset on your billing date and do not roll over.',
  });
}

/* ── memory-sources ──────────────────────────────────────────────────────── */
export function memorySources() {
  const W = 940, H = 460;
  const srcs = ['Quant analyses', 'Chat sessions', 'Chart analyses', 'Lens analyses', 'Trade autopsies', 'Earnings reports', 'Automations', 'Trading patterns', 'Portfolio positions', 'Playbook rules'];
  let s = label(28, 32, 'What you do') + label(400, 32, 'What it builds') + label(720, 32, 'What it changes');
  srcs.forEach((n, i) => {
    const y = 50 + i * 37;
    s += rect(28, y, 200, 28, { fill: C.panel, r: 6 });
    s += text(42, y + 18, n, { size: 11, fill: C.dim });
    s += path(`M232,${y + 14} C280,${y + 14} 330,225 386,225`, { stroke: C.border });
  });
  s += rect(390, 150, 250, 150, { fill: C.panelAlt, r: 8, stroke: C.accentLine });
  s += text(415, 180, 'Your trader profile', { size: 13.5, weight: 600, font: F.head, fill: C.accent });
  ['How you size and time trades', 'Which mistakes repeat, and how often', 'What you say you want to fix', 'Your archetype and biases'].forEach((t, i) => {
    s += `<circle cx="419" cy="${200 + i * 22}" r="2.5" fill="${C.accent}"/>`;
    s += text(429, 204 + i * 22, t, { size: 10.5, fill: C.dim });
  });
  s += flowArrow(644, 706, 225, { marker: 'ag', stroke: C.accent });
  const outs = ['Chart & Lens verdicts', 'Quant research answers', 'Asset Manager replies', 'Automation agent briefs', 'Autopsy coaching'];
  outs.forEach((n, i) => {
    const y = 128 + i * 40;
    s += rect(712, y, 200, 30, { fill: C.panel, r: 6, stroke: C.borderStrong });
    s += text(726, y + 19, n, { size: 11, fill: C.dim });
  });
  s += rect(28, 424, W - 56, 24, { fill: 'none', stroke: 'none', sw: 0 });
  s += text(28, 440, 'Memory runs passively. There is no switch to turn it on.', { size: 11, fill: C.faint });
  return svg(W, H, s, {
    title: 'How Tradion Memory works',
    desc: 'Ten activity sources on the left feed into a single trader profile in the centre, which then shapes five kinds of AI output on the right.',
  });
}

/* ── verdict-anatomy ─────────────────────────────────────────────────────── */
export function verdictAnatomy() {
  const W = 900, H = 420;
  let s = rect(28, 40, 470, 340, { fill: C.panel, r: 10 });
  s += rect(52, 66, 76, 30, { r: 6, fill: C.accentSoft, stroke: C.accentLine });
  s += text(90, 86, 'BUY', { size: 14, weight: 700, anchor: 'middle', fill: C.accent, font: F.head });
  s += text(146, 86, 'TICKER · daily', { size: 11, fill: C.faint, font: F.mono });
  s += label(52, 128, 'Confidence');
  s += rect(52, 138, 300, 8, { r: 4, fill: C.grid, stroke: 'none', sw: 0 });
  s += rect(52, 138, 300 * 0.72, 8, { r: 4, fill: C.accent, stroke: 'none', sw: 0 });
  s += text(366, 146, '72 / 100', { size: 11, fill: C.dim, font: F.mono });
  s += label(52, 178, 'Why');
  [0.92, 0.78, 0.6].forEach((w, i) => s += bar(52, 190 + i * 14, 400 * w));
  s += label(52, 244, 'Levels');
  [['Entry', C.dim], ['Stop', C.danger], ['Target', C.accent]].forEach(([t, c], i) => {
    const y = 262 + i * 30;
    s += rect(52, y, 400, 22, { fill: C.panelAlt, r: 5 });
    s += text(64, y + 15, t, { size: 10.5, fill: c, weight: 500 });
    s += redact(440, y + 15, { anchor: 'end' });
  });
  const notes = [
    ['1', 'The call itself. Four values: BUY, SELL, WAIT, NO TRADE.'],
    ['2', 'How much the evidence agrees — not a probability of profit.'],
    ['3', 'The factors behind the score. Read these before the score.'],
    ['4', 'Where to get in, where to get out, where to take profit.'],
  ];
  notes.forEach(([n, t], i) => {
    const y = 78 + i * 78;
    s += pin(534, y, n);
    s += text(556, y + 4, t.length > 46 ? t.slice(0, t.lastIndexOf(' ', 46)) : t, { size: 11, fill: C.dim });
    if (t.length > 46) s += text(556, y + 20, t.slice(t.lastIndexOf(' ', 46) + 1), { size: 11, fill: C.dim });
  });
  s += leader(508, 82, 525, 78);
  s += leader(508, 142, 525, 156);
  s += leader(508, 200, 525, 234);
  s += leader(508, 290, 525, 312);
  return svg(W, H, s, {
    title: 'Anatomy of a verdict card',
    desc: 'A verdict card with four numbered annotations: the directional call, the confidence score, the factor breakdown behind it, and the entry, stop, and target levels. All numeric values are redacted.',
  });
}

/* ── confidence-anatomy ──────────────────────────────────────────────────── */
export function confidenceAnatomy() {
  const W = 900, H = 340;
  const factors = [
    ['Trend agreement', 0.86, 'Do the timeframes point the same way?'],
    ['Pattern quality', 0.7, 'How cleanly does the setup match a known shape?'],
    ['Volume confirmation', 0.55, 'Is participation backing the move?'],
    ['Risk / reward', 0.4, 'Is the target far enough from the stop?'],
    ['Market context', 0.62, 'Does the wider tape support it?'],
  ];
  let s = label(28, 34, 'A confidence score is a sum of parts — read the parts');
  factors.forEach(([n, v, d], i) => {
    const y = 58 + i * 46;
    s += text(28, y + 14, n, { size: 12, weight: 500 });
    s += text(28, y + 30, d, { size: 10, fill: C.faint });
    const bx = 330, bw = 420;
    s += rect(bx, y + 6, bw, 12, { r: 6, fill: C.grid, stroke: 'none', sw: 0 });
    s += rect(bx, y + 6, bw * v, 12, { r: 6, fill: v < 0.5 ? C.warn : C.accent, stroke: 'none', sw: 0 });
    s += text(bx + bw + 14, y + 16, v < 0.5 ? 'weak' : v < 0.75 ? 'fair' : 'strong', { size: 10, fill: C.faint });
  });
  s += rect(28, 290, W - 56, 34, { fill: C.panelAlt, r: 6, stroke: C.accentLine, dash: '4 3' });
  s += text(48, 312, 'One weak factor inside a high overall score is the most useful thing on the card.', { size: 11.5, fill: C.dim });
  return svg(W, H, s, {
    title: 'How a confidence score breaks down',
    desc: 'Five contributing factors — trend agreement, pattern quality, volume confirmation, risk and reward, and market context — each shown as a bar labelled weak, fair, or strong.',
  });
}

/* ── trade-levels ────────────────────────────────────────────────────────── */
export function tradeLevels() {
  const W = 900, H = 380;
  const yT = 80, yE = 200, yS = 300;
  let s = label(28, 34, 'Three levels, and the ratio that follows from them');
  s += rect(28, 52, 560, 280, { fill: C.panel, r: 8 });
  s += spark(56, 92, 500, 200, [0.3, 0.42, 0.36, 0.5, 0.44, 0.58, 0.52, 0.66, 0.6, 0.72], { stroke: C.borderStrong, sw: 1.6 });
  [[yT, 'Target', C.accent, 'where you take profit'], [yE, 'Entry', C.dim, 'where you get in'], [yS, 'Stop', C.danger, 'where you accept you were wrong']].forEach(([y, t, c, d]) => {
    s += line(56, y, 556, y, { stroke: c, dash: t === 'Entry' ? '' : '5 4', sw: 1.2 });
    s += rect(56, y - 11, 62, 22, { r: 5, fill: C.bg, stroke: c });
    s += text(87, y + 4, t, { size: 10.5, anchor: 'middle', fill: c, weight: 600 });
    s += text(132, y + 4, d, { size: 10, fill: C.faint });
  });
  s += path(`M600,${yT} L600,${yE}`, { stroke: C.accent, sw: 1.4 });
  s += path(`M600,${yE} L600,${yS}`, { stroke: C.danger, sw: 1.4 });
  s += line(592, yT, 608, yT, { stroke: C.accent }) + line(592, yE, 608, yE, { stroke: C.faint }) + line(592, yS, 608, yS, { stroke: C.danger });
  s += text(618, (yT + yE) / 2 + 4, 'reward', { size: 11, fill: C.accent, weight: 500 });
  s += text(618, (yE + yS) / 2 + 4, 'risk', { size: 11, fill: C.danger, weight: 500 });
  s += rect(700, 130, 172, 120, { fill: C.panelAlt, r: 8, stroke: C.accentLine });
  s += label(716, 152, 'Risk / reward');
  s += text(786, 196, '3 : 1', { size: 26, weight: 700, anchor: 'middle', font: F.head, fill: C.accent });
  s += text(786, 222, 'reward ÷ risk', { size: 10, anchor: 'middle', fill: C.faint });
  s += text(28, 358, 'Tradion derives the ratio from the levels. It does not decide whether the ratio is good enough for you.', { size: 11, fill: C.faint });
  return svg(W, H, s, {
    title: 'Entry, stop, and target on a price axis',
    desc: 'A price line with three horizontal levels marked: target above, entry in the middle, stop below. The distance above entry is labelled reward, the distance below is labelled risk, and their ratio is shown as three to one.',
  });
}

/* ── data-sources-map ────────────────────────────────────────────────────── */
export function dataSourcesMap() {
  const W = 940, H = 400;
  const provs = [
    ['Alpaca', ['Stock, crypto & forex prices', 'Options chains (OPRA feed)', 'Real-time news']],
    ['Alpha Vantage', ['Company fundamentals', 'Earnings history & estimates']],
    ['FRED', ['Interest rates & inflation', 'Other economic series']],
    ['SEC EDGAR', ['Company filings', 'Insider transactions']],
    ['Your brokerage', ['Positions & balances', 'Transaction history']],
  ];
  let s = label(28, 32, 'Where each number comes from');
  provs.forEach(([p, items], i) => {
    const y = 52 + i * 66;
    s += rect(28, y, 190, 54, { fill: C.panel, r: 7, stroke: i === 4 ? C.accentLine : C.border });
    s += text(46, y + 24, p, { size: 12.5, weight: 600, font: F.head, fill: i === 4 ? C.accent : C.text });
    s += text(46, y + 42, i === 4 ? 'via SnapTrade, read-only' : 'market data provider', { size: 9.5, fill: C.faint });
    items.forEach((it, j) => {
      s += `<circle cx="252" cy="${y + 18 + j * 17}" r="2.5" fill="${C.faint}"/>`;
      s += text(264, y + 22 + j * 17, it, { size: 10.5, fill: C.dim });
    });
    s += line(218, y + 27, 244, y + 27, { stroke: C.border });
  });
  s += rect(620, 52, 292, 320, { fill: C.panelAlt, r: 8 });
  s += label(638, 74, 'Then Tradion');
  ['Caches it briefly so screens stay fast', 'Computes indicators from raw bars', 'Feeds it to the AI with your profile', 'Shows you the result'].forEach((t, i) => {
    const y = 100 + i * 62;
    s += rect(638, y, 256, 44, { fill: C.panel, r: 6 });
    s += text(654, y + 27, t, { size: 11, fill: C.dim });
    if (i < 3) s += line(766, y + 44, 766, y + 62, { stroke: C.border, marker: 'a' });
  });
  return svg(W, H, s, {
    title: 'Which provider supplies which data',
    desc: 'Five data providers on the left — Alpaca, Alpha Vantage, FRED, SEC EDGAR, and your connected brokerage — each listing what it supplies, feeding a four-step pipeline on the right.',
  });
}

import { C, F, svg, rect, text, label, line, path, chip, pin, leader, bar, redact, spark, meter, flowArrow, setNamespace } from './svg.mjs';


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
  let s = label(28, 34, 'Onboarding, about 30 seconds');
  const bw = 168, gap = 15;
  steps.forEach(([n, t, d], i) => {
    const x = 28 + i * (bw + gap);
    const seeds = i === 2 || i === 3;
    s += rect(x, 56, bw, 130, { fill: C.panel, r: 8, stroke: seeds ? C.accentDim : C.border });
    s += pin(x + 22, 82, n);
    s += text(x + 16, 118, t, { size: 12.5, weight: 600, font: F.head });
    const words = d.split(' ');
    const l1 = words.slice(0, 4).join(' '), l2 = words.slice(4).join(' ');
    s += text(x + 16, 138, l1, { size: 10.5, fill: C.faint });
    if (l2) s += text(x + 16, 153, l2, { size: 10.5, fill: C.faint });
    if (seeds) s += text(x + 16, 174, 'feeds your profile', { size: 9.5, fill: C.accent, weight: 500 });
    if (i < steps.length - 1) s += flowArrow(x + bw + 2, x + bw + gap - 3, 121);
  });
  s += rect(28, 210, W - 56, 62, { fill: C.panelAlt, r: 8, stroke: C.accentDim, dash: '4 3' });
  s += text(48, 236, 'Steps 3 and 4 are the ones that matter most.', { size: 12, weight: 600, font: F.head });
  s += text(48, 256, 'They give Tradion something to work with before you have any trade history.', { size: 11, fill: C.dim });
  return svg(W, H, s, {
    title: 'The five onboarding steps',
    desc: 'Five numbered steps in a row: your name, how you trade, what to improve, what is costing you money, and choose a plan. Steps three and four are highlighted because they seed your trader profile.',
  });
}

/* ── usage-meters ────────────────────────────────────────────────────────── */
export function usageMeters() {
  const W = 900, H = 486;
  const meters = [
    ['AI Portfolio Analyst messages', 'One message to the AI Portfolio Analyst', 0.62],
    ['Earnings Deep Research messages', 'One question in Earnings Deep Research', 0.45],
    ['Trade Autopsies', 'One generated autopsy report', 0.5],
    ['Tradion Lens analyses', 'One Tradion Lens capture', 0.2],
    ['Manual Profile refreshes', 'One use of the Refresh button', 0.4],
  ];
  let s = label(28, 34, 'Five things are metered. Everything else is not counted against an allowance.');
  meters.forEach(([n, d, f], i) => {
    const y = 56 + i * 74;
    s += rect(28, y, W - 56, 60, { fill: C.panel, r: 8 });
    s += text(48, y + 26, n, { size: 13, weight: 600, font: F.head });
    s += text(48, y + 44, d, { size: 10.5, fill: C.faint });
    const bx = 430, bw = 380;
    s += rect(bx, y + 26, bw, 10, { r: 5, fill: C.hairline, stroke: 'none', sw: 0 });
    s += rect(bx, y + 26, bw * f, 10, { r: 5, fill: f > 0.8 ? C.faint : C.accent, stroke: 'none', sw: 0 });
    s += text(bx, y + 52, 'used this cycle', { size: 9.5, fill: C.faint });
    s += redact(bx + bw, y + 52, { anchor: 'end', s: '— / —' });
  });
  const footerY = 56 + meters.length * 74;
  s += rect(28, footerY, W - 56, 30, { fill: C.panelAlt, r: 6 });
  s += text(48, footerY + 20, 'Resets on your billing date, not the 1st. Unused allowance does not roll over.', { size: 11, fill: C.dim });
  return svg(W, H, s, {
    title: 'The five metered counters',
    desc: 'Five rows, one per metered item: AI Portfolio Analyst messages, Earnings Deep Research messages, Trade Autopsies, Tradion Lens analyses, and manual Profile refreshes. Each shows a progress bar with the amount redacted. A footer notes that counters reset on your billing date and do not roll over.',
  });
}

/* ── memory-sources ──────────────────────────────────────────────────────── */
export function memorySources() {
  const W = 940, H = 460;
  const srcs = ['Chat sessions', 'Tradion Lens analyses', 'Trade autopsies', 'Earnings reports', 'Trading patterns', 'Portfolio positions', 'Trade journal'];
  let s = label(28, 32, 'What you do') + label(400, 32, 'What it builds') + label(720, 32, 'What it changes');
  srcs.forEach((n, i) => {
    const y = 72 + i * 46;
    s += rect(28, y, 200, 28, { fill: C.panel, r: 6 });
    s += text(42, y + 18, n, { size: 11, fill: C.dim });
    s += path(`M232,${y + 14} C280,${y + 14} 330,225 386,225`, { stroke: C.border });
  });
  s += rect(390, 150, 250, 150, { fill: C.panelAlt, r: 8, stroke: C.accentDim });
  s += text(415, 180, 'Your trader profile', { size: 13.5, weight: 600, font: F.head, fill: C.accent });
  ['How you size and time trades', 'Which mistakes repeat, and how often', 'What you say you want to fix', 'Your archetype and biases'].forEach((t, i) => {
    s += `<circle cx="419" cy="${200 + i * 22}" r="2.5" fill="${C.accent}"/>`;
    s += text(429, 204 + i * 22, t, { size: 10.5, fill: C.dim });
  });
  s += flowArrow(644, 706, 225, { arrow: true, stroke: C.accent });
  const outs = ['Tradion Lens reads', 'Portfolio Analyst replies', 'Autopsy coaching'];
  outs.forEach((n, i) => {
    const y = 170 + i * 50;
    s += rect(712, y, 200, 30, { fill: C.panel, r: 6, stroke: C.mark });
    s += text(726, y + 19, n, { size: 11, fill: C.dim });
  });
  s += rect(28, 424, W - 56, 24, { fill: 'none', stroke: 'none', sw: 0 });
  s += text(28, 440, 'Memory runs passively. There is no switch to turn it on.', { size: 11, fill: C.faint });
  return svg(W, H, s, {
    title: 'How Tradion Memory works',
    desc: 'Seven activity sources on the left feed into a single trader profile in the centre, which then shapes three kinds of AI output on the right.',
  });
}

/* ── data-sources-map ────────────────────────────────────────────────────── */
export function dataSourcesMap() {
  const W = 940, H = 400;
  const provs = [
    ['Alpaca', ['Stock, crypto & forex prices', 'Options chains (OPRA feed)', 'Real-time news']],
    ['Financial data', ['Company fundamentals', 'Earnings calendar and results', 'Transcripts and estimates']],
    ['FRED', ['Interest rates & inflation', 'Other economic series']],
    ['SEC EDGAR', ['Company filings', 'Insider transactions']],
    ['Your brokerage', ['Positions & balances', 'Transaction history']],
  ];
  let s = label(28, 32, 'Where each number comes from');
  provs.forEach(([p, items], i) => {
    const y = 52 + i * 66;
    s += rect(28, y, 190, 54, { fill: C.panel, r: 7, stroke: i === 4 ? C.accentDim : C.border });
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
    if (i < 3) s += line(766, y + 44, 766, y + 62, { stroke: C.border, arrow: true });
  });
  return svg(W, H, s, {
    title: 'Which provider supplies which data',
    desc: 'Five data providers on the left (Alpaca, a financial data provider, FRED, SEC EDGAR, and your connected brokerage), each listing what it supplies, feeding a four-step pipeline on the right.',
  });
}

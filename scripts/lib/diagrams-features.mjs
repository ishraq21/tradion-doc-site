import { C, F, svg, rect, text, label, line, path, chip, pin, leader, bar, redact, spark, meter, flowArrow, setNamespace } from './svg.mjs';

/* ── portfolio-anatomy ───────────────────────────────────────────────────── */
export function portfolioAnatomy() {
  const W = 940, H = 520;
  let s = label(28, 32, 'The Portfolio dashboard, panel by panel');
  const tiles = ['Total value', 'Day change', 'Total P&L', 'Positions'];
  tiles.forEach((t, i) => {
    const x = 28 + i * 158;
    s += rect(x, 48, 142, 64, { fill: C.panel, r: 7 });
    s += label(x + 14, 70, t);
    s += redact(x + 14, 94, { size: 14 });
  });
  s += pin(672, 80, '1') + leader(663, 80, 640, 80);
  s += rect(28, 126, 610, 180, { fill: C.panel, r: 8 });
  s += label(44, 148, 'Value over time');
  ['1W', '1M', '3M', '1Y', 'All'].forEach((r, i) => s += chip(462 + i * 36, 136, r, { w: 32, h: 18, fill: i === 2 ? C.accentWash : C.panelAlt, stroke: i === 2 ? C.accentDim : C.border, text: i === 2 ? C.accent : C.faint }));
  s += spark(50, 164, 570, 122, [0.28, 0.36, 0.31, 0.44, 0.4, 0.53, 0.48, 0.62, 0.57, 0.7, 0.65, 0.76, 0.72, 0.84]);
  s += pin(672, 200, '2') + leader(663, 200, 646, 200);
  s += rect(658, 126, 254, 180, { fill: C.panel, r: 8 });
  s += label(674, 148, 'Allocation by sector');
  s += `<circle cx="785" cy="222" r="52" fill="none" stroke="${C.hairline}" stroke-width="18"/>`;
  s += `<circle cx="785" cy="222" r="52" fill="none" stroke="${C.accent}" stroke-width="18" stroke-dasharray="120 207" transform="rotate(-90 785 222)"/>`;
  s += `<circle cx="785" cy="222" r="52" fill="none" stroke="${C.mark}" stroke-width="18" stroke-dasharray="70 257" transform="rotate(42 785 222)"/>`;
  s += text(785, 292, 'diversification score', { size: 9.5, anchor: 'middle', fill: C.faint });
  s += rect(28, 320, 610, 176, { fill: C.panel, r: 8 });
  s += label(44, 342, 'Holdings');
  ['Day', 'P&L', 'Value'].forEach((h, i) => s += text(390 + i * 78, 344, h, { size: 9, fill: C.faint, weight: 600, anchor: 'end' }));
  ['AAPL', 'NVDA', 'MSFT', 'BTC/USD'].forEach((t, i) => {
    const y = 362 + i * 32;
    s += text(46, y + 14, t, { size: 11, font: F.mono, fill: C.dim });
    s += spark(120, y + 4, 90, 16, [0.3, 0.5, 0.4, 0.62, 0.55, 0.7], { stroke: i % 2 ? C.dim : C.accent, sw: 1.2 });
    [0, 1, 2].forEach((c) => s += redact(390 + c * 78, y + 14, { anchor: 'end', s: '——' }));
  });
  s += pin(672, 400, '3') + leader(663, 400, 646, 400);
  s += rect(658, 320, 254, 176, { fill: C.panel, r: 8 });
  s += label(674, 342, 'Accounts');
  [0, 1].forEach((i) => {
    const y = 356 + i * 44;
    s += rect(674, y, 222, 36, { fill: C.panelAlt, r: 6 });
    s += text(688, y + 22, `Brokerage ${i + 1} ••••`, { size: 10.5, fill: C.dim, font: F.mono });
  });
  s += text(674, 466, 'Read-only. Tradion cannot place orders.', { size: 10, fill: C.accent });
  return svg(W, H, s, {
    title: 'Anatomy of the Portfolio dashboard',
    desc: 'A dashboard with summary tiles across the top, a value-over-time chart and a sector allocation donut in the middle, and a holdings table with per-row sparklines beside a connected-accounts panel. All figures are redacted.',
  });
}

/* ── portfolio-analyst-anatomy ───────────────────────────────────────────────── */
export function assetManagerAnatomy() {
  const W = 900, H = 440;
  let s = label(28, 32, 'The AI Portfolio Analyst workspace');
  s += rect(28, 48, 180, 360, { fill: C.panel, r: 8 });
  s += label(44, 70, 'Sessions');
  [0, 1, 2].forEach((i) => {
    const y = 82 + i * 42;
    s += rect(40, y, 156, 34, { fill: i === 0 ? C.accentWash : C.panelAlt, r: 6, stroke: i === 0 ? C.accentDim : 'none', sw: i === 0 ? 1 : 0 });
    s += bar(52, y + 12, 100 - i * 14, { fill: i === 0 ? C.accentDim : C.hairline });
    s += bar(52, y + 22, 66 - i * 8);
  });
  s += rect(224, 48, W - 252, 300, { fill: C.panel, r: 8 });
  s += rect(244, 68, 300, 46, { fill: C.panelAlt, r: 8 });
  s += text(258, 88, 'What is my biggest concentration risk', { size: 11, fill: C.dim });
  s += text(258, 104, 'right now?', { size: 11, fill: C.dim });
  s += rect(320, 128, 532, 196, { fill: C.bg, r: 8, stroke: C.border });
  [0.9, 0.72, 0.84].forEach((w, i) => s += bar(340, 150 + i * 14, 480 * w));
  s += rect(340, 202, 492, 104, { fill: C.panelAlt, r: 6 });
  s += label(354, 222, 'Generated chart');
  [0.4, 0.72, 0.55, 0.86, 0.3].forEach((h, i) => s += rect(370 + i * 92, 296 - h * 64, 46, h * 64, { r: 3, fill: i === 3 ? C.accent : C.mark, stroke: 'none', sw: 0 }));
  s += rect(224, 360, W - 252, 48, { fill: C.panel, r: 8 });
  s += text(246, 389, 'Ask about your holdings…', { size: 11, fill: C.faint });
  s += chip(772, 374, 'Send', { w: 74, h: 22, fill: C.accentWash, stroke: C.accentDim, text: C.accent });
  s += pin(210, 100, '1');
  s += pin(560, 92, '2');
  s += pin(300, 226, '3');
  s += text(28, 428, '1 Saved sessions   ·   2 What you ask   ·   3 The answer, grounded in your actual positions', { size: 10.5, fill: C.faint });
  return svg(W, H, s, {
    title: 'Anatomy of the AI Portfolio Analyst',
    desc: 'A saved-sessions rail on the left, a conversation in the centre with a question and an answer containing a generated chart, and a message composer along the bottom.',
  });
}

/* ── lens-vs-analyzer ────────────────────────────────────────────────────── */
export function lensVsAnalyzer() {
  const W = 900, H = 380;
  const cols = [
    ['Chart Analyzer', 'You have an image file', [
      'A screenshot you saved',
      'A chart someone sent you',
      'Any platform, any source',
      'You upload it',
    ], C.accent],
    ['Lens', 'You are already in Tradion', [
      'Uses the chart on screen',
      'Reads the ticker for you',
      'One click, no file handling',
      'Follow-up questions after',
    ], C.faint],
  ];
  let s = label(28, 32, 'Same kind of answer. The difference is where the chart is');
  cols.forEach(([t, sub, items, col], i) => {
    const x = 28 + i * 428;
    s += rect(x, 52, 416, 240, { fill: C.panel, r: 8, stroke: C.border });
    s += rect(x, 52, 416, 4, { r: 2, fill: col, stroke: 'none', sw: 0 });
    s += text(x + 22, 88, t, { size: 15, weight: 600, font: F.head, fill: col });
    s += text(x + 22, 108, sub, { size: 11, fill: C.faint });
    items.forEach((it, j) => {
      const y = 140 + j * 32;
      s += rect(x + 22, y - 14, 372, 26, { fill: C.panelAlt, r: 5 });
      s += `<circle cx="${x + 38}" cy="${y - 1}" r="2.5" fill="${col}"/>`;
      s += text(x + 50, y + 3, it, { size: 11, fill: C.dim });
    });
  });
  s += rect(28, 306, W - 56, 50, { fill: C.panelAlt, r: 8, stroke: C.accentDim, dash: '4 3' });
  s += text(48, 328, 'Both return a direction, a confidence score, and price levels.', { size: 11.5, weight: 600, font: F.head });
  s += text(48, 346, 'Neither one places a trade, and neither one is advice.', { size: 11, fill: C.dim });
  return svg(W, H, s, {
    title: 'Chart Analyzer compared with Lens',
    desc: 'Two side-by-side columns. Chart Analyzer is for a chart image you upload. Lens works from the chart already open in Tradion. Both return a direction, a confidence score, and price levels.',
  });
}

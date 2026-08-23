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

/* ── asset-manager-anatomy ───────────────────────────────────────────────── */
export function assetManagerAnatomy() {
  const W = 900, H = 440;
  let s = label(28, 32, 'The AI Asset Manager workspace');
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
    title: 'Anatomy of the AI Asset Manager',
    desc: 'A saved-sessions rail on the left, a conversation in the centre with a question and an answer containing a generated chart, and a message composer along the bottom.',
  });
}

/* ── quant-anatomy ───────────────────────────────────────────────────────── */
export function quantAnatomy() {
  const W = 940, H = 460;
  let s = label(28, 32, 'AI Quant Research: you describe it on the left, Tradion builds it on the right');
  s += rect(28, 48, 320, 380, { fill: C.panel, r: 8 });
  s += label(44, 70, 'You, in plain English');
  s += rect(44, 84, 288, 62, { fill: C.panelAlt, r: 8 });
  s += text(58, 106, 'Which day of the week has been', { size: 11, fill: C.dim });
  s += text(58, 122, 'worst for NVDA this year?', { size: 11, fill: C.dim });
  s += rect(44, 160, 288, 90, { fill: C.bg, r: 8, stroke: C.border });
  s += label(58, 180, 'Tradion');
  [0.88, 0.7, 0.8, 0.5].forEach((w, i) => s += bar(58, 192 + i * 13, 260 * w));
  s += rect(44, 266, 288, 46, { fill: C.panelAlt, r: 8 });
  s += text(58, 294, 'And how does that compare to AMD?', { size: 11, fill: C.dim });
  s += rect(44, 366, 288, 44, { fill: C.panelAlt, r: 8 });
  s += text(58, 393, 'Ask a follow-up…', { size: 11, fill: C.faint });
  s += rect(372, 48, W - 400, 380, { fill: C.panel, r: 8 });
  s += label(390, 70, 'Canvas: the work it did');
  [0, 1].forEach((i) => {
    const y = 84 + i * 172;
    s += rect(390, y, 520, 158, { fill: C.panelAlt, r: 8 });
    s += chip(404, y + 12, `Cell ${i + 1}`, { w: 54, h: 20, fill: C.accentWash, stroke: C.accentDim, text: C.accent });
    s += chip(466, y + 12, 'Python', { w: 56, h: 20 });
    s += chip(530, y + 12, 'Done', { w: 48, h: 20 });
    s += rect(404, y + 42, 240, 102, { fill: C.bg, r: 6 });
    [0.8, 0.6, 0.9, 0.45, 0.7].forEach((w, j) => s += bar(416, y + 56 + j * 15, 210 * w, { fill: j === 0 ? C.accentDim : C.hairline }));
    s += rect(658, y + 42, 238, 102, { fill: C.bg, r: 6 });
    if (i === 0) [0.5, 0.8, 0.35, 0.65, 0.9].forEach((h, j) => s += rect(676 + j * 44, y + 132 - h * 76, 30, h * 76, { r: 3, fill: j === 2 ? C.dim : C.accent, stroke: 'none', sw: 0 }));
    else s += spark(676, y + 56, 202, 74, [0.2, 0.5, 0.35, 0.7, 0.55, 0.85, 0.72]);
  });
  s += pin(358, 115, '1');
  s += pin(358, 205, '2');
  s += pin(920, 140, '3');
  s += text(28, 448, '1 Your question   ·   2 The plain-English answer   ·   3 The code it ran and the chart it produced', { size: 10.5, fill: C.faint });
  return svg(W, H, s, {
    title: 'Anatomy of the quant research terminal',
    desc: 'A split screen. On the left, a conversation where you ask a question in ordinary language and get a written answer. On the right, a canvas of cells, each showing generated code beside the chart it produced.',
  });
}

/* ── cell-anatomy ────────────────────────────────────────────────────────── */
export function cellAnatomy() {
  const W = 900, H = 400;
  let s = label(28, 32, 'What one canvas cell contains');
  s += rect(28, 48, 560, 320, { fill: C.panel, r: 8 });
  s += chip(48, 66, 'Cell 1', { w: 54, h: 20, fill: C.accentWash, stroke: C.accentDim, text: C.accent });
  s += chip(110, 66, 'Code', { w: 48, h: 20 });
  s += chip(166, 66, 'Output', { w: 56, h: 20 });
  s += chip(530, 66, 'Copy', { w: 44, h: 20 });
  s += rect(48, 100, 520, 96, { fill: C.bg, r: 6 });
  s += text(62, 120, 'bars = fetch_bars("NVDA", timeframe="1Day", limit=252)', { size: 10.5, font: F.mono, fill: C.dim });
  s += text(62, 138, 'bars["dow"] = bars.index.day_name()', { size: 10.5, font: F.mono, fill: C.dim });
  s += text(62, 156, 'by_day = bars.groupby("dow")["return"].mean()', { size: 10.5, font: F.mono, fill: C.dim });
  s += text(62, 178, 'plot_bar(by_day, title="Average return by weekday")', { size: 10.5, font: F.mono, fill: C.faint });
  s += rect(48, 208, 520, 108, { fill: C.bg, r: 6 });
  [0.55, 0.8, 0.4, 0.72, 0.28].forEach((h, i) => s += rect(78 + i * 100, 300 - h * 72, 56, h * 72, { r: 3, fill: i === 4 ? C.dim : C.accent, stroke: 'none', sw: 0 }));
  s += rect(48, 328, 520, 26, { fill: C.panelAlt, r: 6 });
  s += bar(62, 338, 400);
  const notes = [
    ['1', 'The question this cell answers'],
    ['2', 'The Python Tradion wrote and ran'],
    ['3', 'The chart or table it produced'],
    ['4', 'A plain-English summary of what it means'],
  ];
  notes.forEach(([n, t], i) => {
    const y = 84 + i * 76;
    s += pin(618, y, n);
    s += text(640, y + 4, t, { size: 11, fill: C.dim });
  });
  s += leader(600, 84, 612, 84);
  s += leader(600, 148, 612, 160);
  s += leader(600, 262, 612, 236);
  s += leader(600, 341, 612, 312);
  s += text(28, 388, 'The code is shown so you can read and learn it. You never have to write it.', { size: 11, fill: C.faint });
  return svg(W, H, s, {
    title: 'Anatomy of a canvas cell',
    desc: 'One cell showing four parts: the question it answers, the generated Python code, the chart it produced, and a plain-English summary underneath.',
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

/* ── earnings-anatomy ────────────────────────────────────────────────────── */
export function earningsAnatomy() {
  const W = 940, H = 440;
  let s = label(28, 32, 'What Tradion pulls out of an earnings report');
  s += rect(28, 48, 220, 356, { fill: C.panel, r: 8, stroke: C.border, dash: '4 3' });
  s += label(48, 72, 'What you upload');
  s += rect(48, 88, 180, 240, { fill: C.bg, r: 6 });
  [0.9, 0.7, 0.85, 0.5, 0.8, 0.65, 0.9, 0.4, 0.75, 0.6, 0.88, 0.55].forEach((w, i) => s += bar(64, 108 + i * 18, 150 * w));
  s += text(48, 356, 'PDF or transcript', { size: 10.5, fill: C.faint });
  s += text(48, 374, 'Or name a ticker and quarter', { size: 10.5, fill: C.faint });
  s += flowArrow(256, 292, 226, { arrow: true, stroke: C.accent });
  const outs = [
    ['Direction & conviction', 'Which way it reads, and how strongly'],
    ['Beat or miss', 'Reported vs what analysts expected'],
    ['Guidance', 'What management says about next quarter'],
    ['Management tone', 'Confidence and hedging in how they speak'],
    ['Bull vs bear case', 'The strongest argument on each side'],
    ['Options implied move', 'How big a move the options market is pricing'],
  ];
  outs.forEach(([t, d], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 300 + col * 322, y = 48 + row * 122;
    s += rect(x, y, 306, 106, { fill: C.panel, r: 8 });
    s += text(x + 18, y + 30, t, { size: 12.5, weight: 600, font: F.head });
    s += text(x + 18, y + 50, d, { size: 10.5, fill: C.faint });
    if (i === 0) {
      s += rect(x + 18, y + 66, 88, 24, { r: 5, fill: C.accentWash, stroke: C.accentDim });
      s += text(x + 62, y + 83, 'BULLISH', { size: 10.5, anchor: 'middle', fill: C.accent, weight: 600 });
      s += rect(x + 116, y + 74, 170, 8, { r: 4, fill: C.hairline, stroke: 'none', sw: 0 });
      s += rect(x + 116, y + 74, 122, 8, { r: 4, fill: C.accent, stroke: 'none', sw: 0 });
    } else {
      [0.85, 0.6].forEach((w, j) => s += bar(x + 18, y + 72 + j * 14, 268 * w));
    }
  });
  s += text(28, 428, 'Guidance moves stocks more often than the quarter that was reported. Read it first.', { size: 11, fill: C.faint });
  return svg(W, H, s, {
    title: 'What Tradion extracts from an earnings report',
    desc: 'An uploaded report on the left feeds six output panels: direction and conviction, beat or miss, guidance, management tone, the bull and bear case, and the options implied move.',
  });
}

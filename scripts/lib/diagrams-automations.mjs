import { C, F, svg, rect, text, label, line, path, chip, pin, leader, bar, redact, spark, meter, flowArrow, setNamespace } from './svg.mjs';

/* ── automation-flow ─────────────────────────────────────────────────────── */
export function automationFlow() {
  const W = 940, H = 300;
  const nodes = [
    ['Asset', 'What to watch', true],
    ['Signal', 'The condition, 1 to 10 of them', true],
    ['Logic', 'AND / OR, appears at 2+', false],
    ['Agent', 'Optional AI research step', false],
    ['Action', 'Where the alert goes', true],
  ];
  let s = label(28, 32, 'Every automation is this chain, left to right');
  const bw = 162, gap = 26;
  nodes.forEach(([t, d, req], i) => {
    const x = 28 + i * (bw + gap);
    s += rect(x, 62, bw, 108, { fill: req ? C.panel : C.panelAlt, r: 8, stroke: req ? C.accentDim : C.border, dash: req ? '' : '4 3' });
    s += text(x + 16, 92, t, { size: 13.5, weight: 600, font: F.head, fill: req ? C.accent : C.dim });
    const mid = d.lastIndexOf(' ', 20);
    s += text(x + 16, 114, mid > 0 ? d.slice(0, mid) : d, { size: 10.5, fill: C.faint });
    if (mid > 0) s += text(x + 16, 129, d.slice(mid + 1), { size: 10.5, fill: C.faint });
    s += chip(x + 16, 142, req ? 'required' : 'optional', { w: 62, h: 18, fill: req ? C.accentWash : C.panel, stroke: req ? C.accentDim : C.border, text: req ? C.accent : C.faint });
    if (i < nodes.length - 1) s += flowArrow(x + bw + 4, x + bw + gap - 4, 116);
  });
  s += rect(28, 194, W - 56, 76, { fill: C.panelAlt, r: 8 });
  s += text(48, 220, 'An automation watches and tells you. It never places an order.', { size: 12, weight: 600, font: F.head });
  s += text(48, 240, 'Condition checks cost you nothing. Only the optional Agent step draws on your monthly allowance.', { size: 11, fill: C.dim });
  s += text(48, 258, 'Automations run around the clock, not only during market hours.', { size: 11, fill: C.dim });
  return svg(W, H, s, {
    title: 'The five node types in an automation',
    desc: 'A left-to-right chain of five nodes: asset, signal, logic, agent, and action. Asset, signal, and action are required; logic and agent are optional.',
  });
}

/* ── canvas-anatomy ──────────────────────────────────────────────────────── */
export function canvasAnatomy() {
  const W = 940, H = 460;
  let s = label(28, 32, 'The automation canvas');
  s += rect(28, 48, W - 56, 356, { fill: C.panel, r: 8 });
  // toolbar
  s += rect(44, 64, 180, 324, { fill: C.panelAlt, r: 6 });
  s += label(58, 86, 'Add a node');
  ['Condition', 'Logic', 'Agent', 'Action'].forEach((t, i) => {
    s += rect(58, 96 + i * 34, 152, 26, { fill: C.panel, r: 5 });
    s += text(72, 113 + i * 34, t, { size: 10.5, fill: C.dim });
  });
  s += label(58, 262, 'Templates');
  [0, 1, 2].forEach((i) => s += rect(58, 272 + i * 26, 152, 20, { fill: C.panel, r: 4 }));
  s += text(58, 372, '45 prebuilt starts', { size: 9.5, fill: C.faint });

  const node = (x, y, w, h, t, sub, col) => {
    let o = rect(x, y, w, h, { fill: C.panelAlt, r: 7, stroke: col });
    o += rect(x, y, w, 3, { r: 2, fill: col, stroke: 'none', sw: 0 });
    o += text(x + 14, y + 26, t, { size: 11.5, weight: 600, font: F.head });
    o += text(x + 14, y + 43, sub, { size: 9.5, fill: C.faint });
    o += `<circle cx="${x + w}" cy="${y + h / 2}" r="3.5" fill="${C.bg}" stroke="${col}"/>`;
    o += `<circle cx="${x}" cy="${y + h / 2}" r="3.5" fill="${C.bg}" stroke="${col}"/>`;
    return o;
  };
  s += node(248, 96, 130, 58, 'NVDA', 'stock', C.accent);
  s += node(248, 200, 130, 58, 'RSI', 'crosses below 30', C.faint);
  s += node(248, 288, 130, 58, 'Volume', 'above threshold', C.faint);
  s += node(430, 200, 96, 58, 'AND', 'both true', C.mark);
  s += node(570, 200, 120, 58, 'Agent', 'research brief', C.accent);
  s += node(740, 200, 140, 58, 'Discord', 'send message', C.accent);
  const link = (x1, y1, x2, y2) => path(`M${x1},${y1} C${x1 + 34},${y1} ${x2 - 34},${y2} ${x2},${y2}`, { stroke: C.mark, sw: 1.4 });
  s += link(378, 125, 430, 214) + link(378, 229, 430, 229) + link(378, 317, 430, 244);
  s += link(526, 229, 570, 229) + link(690, 229, 740, 229);
  s += pin(238, 80, '1');
  s += pin(414, 184, '2');
  s += pin(556, 184, '3');
  s += pin(726, 184, '4');
  s += text(28, 428, '1 Drag nodes in from the left   ·   2 Two or more conditions get a logic node   ·   3 The agent step is optional   ·   4 Where the alert lands', { size: 10.5, fill: C.faint });
  return svg(W, H, s, {
    title: 'Anatomy of the automation canvas',
    desc: 'A node palette on the left and a graph on the right: an asset node feeding two condition nodes, joined by an AND logic node, passing through an optional agent node to a Discord action node.',
  });
}

/* ── crosses-vs-is ───────────────────────────────────────────────────────── */
export function crossesVsIs() {
  const W = 900, H = 380;
  const pts = [0.72, 0.66, 0.55, 0.42, 0.3, 0.22, 0.18, 0.24, 0.2, 0.16, 0.26, 0.38, 0.5, 0.62];
  const thr = 0.34;
  const panelChart = (x, y, w, h, mode, col) => {
    let o = rect(x, y, w, h, { fill: C.panel, r: 8 });
    const cx = x + 24, cy = y + 44, cw = w - 48, ch = h - 96;
    o += line(cx, cy + ch - thr * ch, cx + cw, cy + ch - thr * ch, { stroke: C.faint, dash: '4 4' });
    o += text(cx + cw + 4, cy + ch - thr * ch + 4, '30', { size: 9.5, fill: C.faint, font: F.mono, anchor: 'start' });
    o += spark(cx, cy, cw, ch, pts, { stroke: C.dim, sw: 1.6 });
    pts.forEach((p, i) => {
      const px = cx + (i / (pts.length - 1)) * cw, py = cy + ch - p * ch;
      const below = p < thr;
      const crossed = i > 0 && pts[i - 1] >= thr && below;
      const fire = mode === 'crosses' ? crossed : below;
      if (fire) {
        o += `<circle cx="${px}" cy="${py}" r="5" fill="${col}" fill-opacity="0.22" stroke="${col}" stroke-width="1.2"/>`;
        o += line(px, py + 8, px, cy + ch + 16, { stroke: col, dash: '2 3' });
        o += `<path d="M${px - 3},${cy + ch + 20} L${px + 3},${cy + ch + 20} L${px},${cy + ch + 26} z" fill="${col}"/>`;
      }
    });
    return o;
  };
  let s = label(28, 32, 'The single most common automation mistake');
  s += panelChart(28, 52, 420, 240, 'crosses', C.accent);
  s += text(52, 82, 'crosses below 30', { size: 13, weight: 600, font: F.head, fill: C.accent });
  s += text(52, 278, 'Fires once, on the way through.', { size: 11, fill: C.dim });
  s += panelChart(480, 52, 392, 240, 'is', C.dim);
  s += text(504, 82, 'is below 30', { size: 13, weight: 600, font: F.head, fill: C.dim });
  s += text(504, 278, 'Fires on every check while it stays there.', { size: 11, fill: C.dim });
  s += rect(28, 308, W - 56, 50, { fill: C.panelAlt, r: 8, stroke: C.accentDim, dash: '4 3' });
  s += text(48, 330, 'Conditions are checked about once a minute.', { size: 11.5, weight: 600, font: F.head });
  s += text(48, 348, '"Is below" on a condition that stays true for an hour is roughly sixty alerts. Use "crosses" unless you want that.', { size: 11, fill: C.dim });
  return svg(W, H, s, {
    title: 'Crosses below compared with is below',
    desc: 'Two charts of the same indicator dipping under a threshold. The left, using crosses below, fires one alert at the moment it passes through. The right, using is below, fires an alert on every check while the value stays under the line.',
  });
}

/* ── signal-matrix ───────────────────────────────────────────────────────── */
export function signalMatrix() {
  const W = 900, H = 400;
  const rows = [
    ['Price level', 1, 1, 1, 1],
    ['Technical indicator', 1, 1, 1, 1],
    ['Volume', 1, 1, 0, 1],
    ['Daily change %', 1, 1, 0, 1],
    ['News', 1, 1, 0, 0],
    ['Earnings', 1, 0, 0, 0],
    ['Options flow', 1, 0, 0, 0],
    ['Insider filings', 1, 0, 0, 0],
    ['Corporate actions', 1, 0, 0, 0],
  ];
  const cols = ['Stocks', 'Crypto', 'Forex', 'Options'];
  let s = label(28, 32, 'Which signals work with which assets');
  const x0 = 240, cw = 150;
  cols.forEach((c, i) => s += text(x0 + i * cw + cw / 2, 62, c, { size: 11, weight: 600, anchor: 'middle', font: F.head }));
  s += line(28, 72, W - 28, 72, { stroke: C.border });
  rows.forEach((r, i) => {
    const y = 88 + i * 33;
    if (i % 2 === 0) s += rect(28, y - 14, W - 56, 30, { r: 5, fill: C.panel, stroke: 'none', sw: 0 });
    s += text(46, y + 6, r[0], { size: 11.5, fill: C.dim });
    for (let c = 0; c < 4; c++) {
      const cx = x0 + c * cw + cw / 2;
      if (r[c + 1]) {
        s += `<circle cx="${cx}" cy="${y + 1}" r="8" fill="${C.accentWash}" stroke="${C.accent}" stroke-width="1"/>`;
        s += `<path d="M${cx - 3.5},${y + 1} l2.6,2.8 l4.6,-5.4" fill="none" stroke="${C.accent}" stroke-width="1.6" stroke-linecap="round"/>`;
      } else {
        s += line(cx - 4, y + 1, cx + 4, y + 1, { stroke: C.faint, sw: 1.4 });
      }
    }
  });
  s += text(28, 388, 'Earnings, options flow, insider filings, and corporate actions only exist for individual companies, so they are stocks only.', { size: 10.5, fill: C.faint });
  return svg(W, H, s, {
    title: 'Signal types by asset type',
    desc: 'A grid of nine signal types against four asset types. Price and technical indicators work everywhere; volume and daily change work for stocks, crypto and options; news covers stocks and crypto; earnings, options flow, insider filings and corporate actions are stocks only.',
  });
}

/* ── notification-fanout ─────────────────────────────────────────────────── */
export function notificationFanout() {
  const W = 900, H = 360;
  const chans = [
    ['Discord', 'A webhook URL from your server'],
    ['Email', 'Your account address'],
    ['Telegram', 'Your chat with the bot'],
    ['In-app', 'A toast plus a saved entry'],
    ['Webhook', 'Signed POST to your own endpoint'],
  ];
  let s = label(28, 32, 'One trigger, as many channels as you want');
  s += rect(28, 130, 190, 100, { fill: C.panel, r: 8, stroke: C.accentDim });
  s += text(48, 164, 'Trigger fires', { size: 13.5, weight: 600, font: F.head, fill: C.accent });
  s += text(48, 186, 'Conditions all met', { size: 10.5, fill: C.faint });
  s += text(48, 204, 'and cooldown has passed', { size: 10.5, fill: C.faint });
  chans.forEach(([n, d], i) => {
    const y = 52 + i * 60;
    s += path(`M222,180 C290,180 300,${y + 22} 356,${y + 22}`, { stroke: C.mark, arrow: true });
    s += rect(366, y, 300, 46, { fill: C.panel, r: 7 });
    s += text(386, y + 20, n, { size: 12, weight: 600, font: F.head });
    s += text(386, y + 36, d, { size: 10, fill: C.faint });
  });
  s += rect(690, 52, 182, 262, { fill: C.panelAlt, r: 8 });
  s += label(706, 74, 'If delivery fails');
  ['Retried three times', 'Backing off each time', 'Then parked for review', 'The automation keeps running'].forEach((t, i) => {
    s += `<circle cx="710" cy="${100 + i * 34}" r="2.5" fill="${C.faint}"/>`;
    const mid = t.lastIndexOf(' ', 20);
    s += text(722, 104 + i * 34, mid > 0 && t.length > 22 ? t.slice(0, mid) : t, { size: 10.5, fill: C.dim });
    if (mid > 0 && t.length > 22) s += text(722, 118 + i * 34, t.slice(mid + 1), { size: 10.5, fill: C.dim });
  });
  s += text(28, 344, 'A revoked Discord webhook keeps failing until you replace the URL. Nothing turns itself off.', { size: 10.5, fill: C.faint });
  return svg(W, H, s, {
    title: 'One trigger dispatching to five channels',
    desc: 'A trigger on the left fans out to five notification channels: Discord, email, Telegram, in-app, and an outbound webhook. A side panel describes the retry behaviour when a delivery fails.',
  });
}

/* ── webhook-flow ────────────────────────────────────────────────────────── */
export function webhookFlow() {
  const W = 940, H = 320;
  const steps = [
    ['Trigger fires', 'Your conditions are met'],
    ['Tradion signs it', 'HMAC-SHA256 over the exact body'],
    ['POST to your URL', 'HTTPS only, public addresses only'],
    ['You verify', 'Recompute the hash, compare in constant time'],
    ['You act', 'Only after the signature matches'],
  ];
  let s = label(28, 32, 'How an outbound webhook reaches you');
  const bw = 168, gap = 24;
  steps.forEach(([t, d], i) => {
    const x = 28 + i * (bw + gap);
    s += rect(x, 60, bw, 104, { fill: C.panel, r: 8, stroke: i === 3 ? C.accentDim : C.border });
    s += chip(x + 14, 74, String(i + 1), { w: 22, h: 20, fill: C.accentWash, stroke: C.accentDim, text: C.accent });
    s += text(x + 14, 116, t, { size: 12, weight: 600, font: F.head, fill: i === 3 ? C.accent : C.text });
    const mid = d.lastIndexOf(' ', 24);
    s += text(x + 14, 134, mid > 0 ? d.slice(0, mid) : d, { size: 9.5, fill: C.faint });
    if (mid > 0) s += text(x + 14, 147, d.slice(mid + 1), { size: 9.5, fill: C.faint });
    if (i < steps.length - 1) s += flowArrow(x + bw + 4, x + bw + gap - 4, 112);
  });
  s += rect(28, 186, W - 56, 62, { fill: C.bg, r: 8, stroke: C.border });
  s += text(48, 210, 'X-Tradion-Signature: sha256=<hex digest>', { size: 11.5, font: F.mono, fill: C.accent });
  s += text(48, 232, 'Idempotency-Key: <unique per delivery, use it to drop duplicates>', { size: 11.5, font: F.mono, fill: C.dim });
  s += rect(28, 262, W - 56, 40, { fill: C.panelAlt, r: 8, stroke: C.faint, dash: '4 3' });
  s += text(48, 287, 'Treat an unsigned or mismatched request as hostile. Anyone can POST to a public URL.', { size: 11, fill: C.dim });
  return svg(W, H, s, {
    title: 'The outbound webhook flow',
    desc: 'Five steps: a trigger fires, Tradion signs the payload with HMAC-SHA256, posts it to your HTTPS endpoint, you recompute and compare the signature in constant time, and only then act on it.',
  });
}

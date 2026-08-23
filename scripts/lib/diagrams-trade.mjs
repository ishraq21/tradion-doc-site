import { C, F, svg, rect, text, label, line, path, chip, pin, leader, bar, redact, spark, meter, flowArrow, setNamespace } from './svg.mjs';

/* ── autopsy-anatomy ─────────────────────────────────────────────────────── */
export function autopsyAnatomy() {
  const W = 940, H = 520;
  const sections = [
    ['Verdict', 'The one-line read on the trade'],
    ['Data coverage', 'How much the AI actually had to work with'],
    ['Timeline', 'What happened, in order, with prices at each step'],
    ['Attribution', 'Which factors carried how much of the outcome'],
    ['Scorecard', 'Entry quality, exit discipline, risk management'],
    ['Counterfactual', 'What your own rules would have produced instead'],
    ['Lesson', 'One sentence you can act on next time'],
  ];
  let s = label(28, 32, 'An autopsy report, top to bottom');
  s += rect(28, 48, 560, 452, { fill: C.panel, r: 8 });
  let y = 70;
  sections.forEach(([t, d], i) => {
    const h = i === 3 ? 84 : i === 4 ? 76 : 52;
    s += rect(46, y, 524, h, { fill: C.panelAlt, r: 6 });
    s += text(62, y + 22, t, { size: 12, weight: 600, font: F.head, fill: i === 6 ? C.accent : C.text });
    s += text(62, y + 39, d, { size: 10, fill: C.faint });
    if (i === 3) {
      [['Entry timing', 0.46], ['Position size', 0.3], ['Exit', 0.24]].forEach(([n, v], j) => {
        const by = y + 50 + j * 11;
        s += text(62, by + 4, n, { size: 8.5, fill: C.faint });
        s += rect(150, by - 2, 300 * v, 6, { r: 3, fill: [C.dim, C.faint, C.mark][j], stroke: 'none', sw: 0 });
      });
    }
    if (i === 4) {
      ['Entry', 'Exit', 'Risk'].forEach((n, j) => {
        const bx = 62 + j * 170;
        s += rect(bx, y + 46, 150, 22, { r: 5, fill: C.bg, stroke: C.border });
        s += text(bx + 10, y + 61, n, { size: 9.5, fill: C.faint });
        s += rect(bx + 52, y + 53, 60, 8, { r: 4, fill: C.hairline, stroke: 'none', sw: 0 });
        s += rect(bx + 52, y + 53, 60 * [0.72, 0.4, 0.58][j], 8, { r: 4, fill: [C.accent, C.dim, C.faint][j], stroke: 'none', sw: 0 });
      });
    }
    s += pin(614, y + h / 2, String(i + 1));
    s += leader(588, y + h / 2, 605, y + h / 2);
    y += h + 10;
  });
  const notes = [
    'Start here. It is blunt on purpose.',
    'Low coverage means treat the rest as a hypothesis.',
    'Where the decision actually went sideways.',
    'The biggest bar is what to fix first.',
    'Three separate skills. They move independently.',
    'The gap between your plan and what you did.',
    'Turn this into a playbook rule.',
  ];
  let ny = 76;
  notes.forEach((n, i) => {
    const h = i === 3 ? 84 : i === 4 ? 76 : 52;
    const words = n.split(' ');
    const mid = n.length > 32 ? n.lastIndexOf(' ', 32) : -1;
    s += text(636, ny + (h / 2) - (mid > 0 ? 4 : -4), mid > 0 ? n.slice(0, mid) : n, { size: 10.5, fill: C.dim });
    if (mid > 0) s += text(636, ny + h / 2 + 12, n.slice(mid + 1), { size: 10.5, fill: C.dim });
    ny += h + 10;
  });
  return svg(W, H, s, {
    title: 'Anatomy of an autopsy report',
    desc: 'An autopsy report broken into seven numbered sections: verdict, data coverage, timeline, attribution, scorecard, counterfactual, and lesson, each with a note explaining what to take from it.',
  });
}

/* ── scorecard ───────────────────────────────────────────────────────────── */
export function scorecard() {
  const W = 900, H = 340;
  const items = [
    ['Entry quality', 0.74, 'Was the setup there when you got in, or did you chase it?', C.accent],
    ['Exit discipline', 0.38, 'Did you leave when your plan said to, in both directions?', C.dim],
    ['Risk management', 0.58, 'Was the position sized so a loss stayed survivable?', C.faint],
  ];
  let s = label(28, 32, 'Three separate skills, scored 0 to 100');
  items.forEach(([n, v, d, col], i) => {
    const x = 28 + i * 290;
    s += rect(x, 52, 268, 200, { fill: C.panel, r: 8 });
    const cx = x + 134, cy = 132, r = 44;
    const circ = 2 * Math.PI * r;
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.hairline}" stroke-width="10"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(circ * v).toFixed(1)} ${circ.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`;
    s += text(cx, cy + 7, v < 0.5 ? 'low' : v < 0.7 ? 'fair' : 'good', { size: 15, anchor: 'middle', weight: 600, font: F.head, fill: col });
    s += text(cx, 198, n, { size: 13, anchor: 'middle', weight: 600, font: F.head });
    const mid = d.lastIndexOf(' ', 36);
    s += text(cx, 218, d.slice(0, mid), { size: 10, anchor: 'middle', fill: C.faint });
    s += text(cx, 233, d.slice(mid + 1), { size: 10, anchor: 'middle', fill: C.faint });
  });
  s += rect(28, 268, W - 56, 46, { fill: C.panelAlt, r: 8, stroke: C.accentDim, dash: '4 3' });
  s += text(48, 291, 'A profitable trade can score badly, and a losing trade can score well.', { size: 11.5, weight: 600, font: F.head });
  s += text(48, 308, 'The score is about the decision, not the outcome.', { size: 11, fill: C.dim });
  return svg(W, H, s, {
    title: 'The autopsy scorecard',
    desc: 'Three ring gauges scoring entry quality, exit discipline, and risk management. A footer notes that the score measures the decision, not the outcome.',
  });
}

/* ── autopsy-loop ────────────────────────────────────────────────────────── */
export function autopsyLoop() {
  const W = 940, H = 300;
  const steps = [
    ['Closed trade', 'You log it, or your broker does'],
    ['Autopsy', 'What went wrong, and how much it mattered'],
    ['Pattern', 'The same finding, seen enough times to count'],
    ['Playbook rule', 'You write the fix down as a rule'],
    ['Pre-flight check', 'You read the rule before the next entry'],
  ];
  let s = label(28, 32, 'How a single bad trade turns into a habit that stops the next one');
  const bw = 168, gap = 24;
  steps.forEach(([t, d], i) => {
    const x = 28 + i * (bw + gap);
    const hi = i >= 3;
    s += rect(x, 60, bw, 116, { fill: hi ? C.panelAlt : C.panel, r: 8, stroke: hi ? C.accentDim : C.border });
    s += chip(x + 14, 74, String(i + 1), { w: 22, h: 20, fill: C.accentWash, stroke: C.accentDim, text: C.accent });
    s += text(x + 14, 116, t, { size: 12.5, weight: 600, font: F.head });
    const mid = d.lastIndexOf(' ', 24);
    s += text(x + 14, 136, mid > 0 ? d.slice(0, mid) : d, { size: 10, fill: C.faint });
    if (mid > 0) s += text(x + 14, 150, d.slice(mid + 1), { size: 10, fill: C.faint });
    if (i < steps.length - 1) s += flowArrow(x + bw + 4, x + bw + gap - 4, 118, { arrow: true, stroke: C.accent });
  });
  s += path(`M${28 + 4 * (bw + gap) + bw / 2},180 L${28 + 4 * (bw + gap) + bw / 2},224 L${28 + bw / 2},224 L${28 + bw / 2},182`, { stroke: C.mark, dash: '4 4', arrow: true });
  s += text(W / 2, 244, 'and the next trade feeds back in', { size: 10.5, anchor: 'middle', fill: C.faint });
  s += text(28, 282, 'Roughly ten closed trades is where the patterns stop being generic and start being yours.', { size: 11, fill: C.faint });
  return svg(W, H, s, {
    title: 'From a closed trade to a pre-flight check',
    desc: 'Five stages in a loop: a closed trade becomes an autopsy, repeated findings become a pattern, the pattern becomes a playbook rule, and the rule becomes a pre-flight check before your next entry, which feeds back to the start.',
  });
}

/* ── profile-anatomy ─────────────────────────────────────────────────────── */
export function profileAnatomy() {
  const W = 940, H = 500;
  let s = label(28, 32, 'The Profile page: what each panel measures');
  s += rect(28, 48, 290, 132, { fill: C.panel, r: 8 });
  s += label(46, 70, 'Risk score');
  const cx = 100, cy = 128, r = 34, circ = 2 * Math.PI * r;
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.hairline}" stroke-width="9"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.accent}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(circ * 0.66).toFixed(1)} ${circ.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`;
  s += text(cx, cy + 5, '0–100', { size: 11, anchor: 'middle', fill: C.faint, font: F.mono });
  s += text(158, 118, 'A single read on how', { size: 10.5, fill: C.dim });
  s += text(158, 134, 'safely you are trading', { size: 10.5, fill: C.dim });
  s += text(158, 150, 'right now.', { size: 10.5, fill: C.dim });

  s += rect(334, 48, 290, 132, { fill: C.panel, r: 8 });
  s += label(352, 70, 'Verdict & focus');
  [0.9, 0.72, 0.84, 0.6].forEach((w, i) => s += bar(352, 88 + i * 16, 254 * w, { fill: i === 0 ? C.accentDim : C.hairline }));
  s += text(352, 166, 'One line on what to work on today', { size: 10, fill: C.faint });

  s += rect(640, 48, 272, 132, { fill: C.panel, r: 8 });
  s += label(658, 70, 'Behavioural fingerprint');
  const px = 776, py = 126, R = 40;
  [1, 0.7, 0.42].forEach((k) => {
    const pts = Array.from({ length: 5 }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      return `${(px + Math.cos(a) * R * k).toFixed(1)},${(py + Math.sin(a) * R * k).toFixed(1)}`;
    }).join(' ');
    s += `<polygon points="${pts}" fill="none" stroke="${C.hairline}" stroke-width="1"/>`;
  });
  const vals = [0.85, 0.5, 0.7, 0.4, 0.62];
  const poly = vals.map((v, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return `${(px + Math.cos(a) * R * v).toFixed(1)},${(py + Math.sin(a) * R * v).toFixed(1)}`;
  }).join(' ');
  s += `<polygon points="${poly}" fill="${C.accentWash}" stroke="${C.accent}" stroke-width="1.4"/>`;

  s += rect(28, 196, 596, 152, { fill: C.panel, r: 8 });
  s += label(46, 218, 'Patterns that keep repeating');
  ['Entering before the setup completes', 'Holding losers past the stop', 'Sizing up after a loss', 'Trading the first ten minutes'].forEach((t, i) => {
    const y = 234 + i * 28;
    s += text(46, y + 14, t, { size: 11, fill: C.dim });
    s += rect(400, y + 6, 140, 8, { r: 4, fill: C.hairline, stroke: 'none', sw: 0 });
    s += rect(400, y + 6, 140 * [0.88, 0.66, 0.44, 0.3][i], 8, { r: 4, fill: i === 0 ? C.dim : i === 1 ? C.faint : C.mark, stroke: 'none', sw: 0 });
    s += text(556, y + 14, `seen ${['often', 'often', 'sometimes', 'rarely'][i]}`, { size: 9.5, fill: C.faint });
  });

  s += rect(640, 196, 272, 152, { fill: C.panel, r: 8 });
  s += label(658, 218, 'When you trade well');
  for (let d = 0; d < 5; d++) for (let h = 0; h < 8; h++) {
    const v = Math.abs(Math.sin(d * 1.7 + h * 0.9));
    s += rect(660 + h * 30, 232 + d * 20, 24, 15, { r: 3, fill: v > 0.75 ? C.accent : v > 0.45 ? C.accentWash : C.hairline, stroke: 'none', sw: 0 });
  }
  s += text(658, 340, 'Win rate by weekday and hour', { size: 9.5, fill: C.faint });

  s += rect(28, 364, 884, 108, { fill: C.panel, r: 8 });
  s += label(46, 386, 'A year of trading activity');
  for (let w = 0; w < 42; w++) for (let d = 0; d < 5; d++) {
    const v = Math.abs(Math.sin(w * 0.6 + d * 1.3));
    s += rect(46 + w * 20.5, 398 + d * 13, 16, 10, { r: 2, fill: v > 0.8 ? C.accent : v > 0.55 ? C.accentWash : v > 0.3 ? C.hairline : C.panelAlt, stroke: 'none', sw: 0 });
  }
  s += text(46, 490, 'No figures are shown here. Every panel describes behaviour, not balances.', { size: 10.5, fill: C.faint });
  return svg(W, H, s, {
    title: 'Anatomy of the Profile page',
    desc: 'Panels showing a risk score ring, an AI verdict, a behavioural fingerprint radar, a list of repeating patterns with frequency bars, a win-rate heatmap by weekday and hour, and a year-long activity heatmap.',
  });
}

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
    s += rect(x, y, 268, h, { fill: hi ? C.panelAlt : C.panel, r: 8, stroke: hi ? C.accentDim : C.border });
    s += text(x + 18, y + 26, name, { size: 15, weight: 600, font: F.head, fill: hi ? C.accent : C.text });
    s += text(x + 18, y + 44, sub, { size: 10.5, fill: C.faint });
    items.forEach((it, j) => {
      const iy = y + 68 + j * 20;
      s += `<circle cx="${x + 22}" cy="${iy - 4}" r="2.5" fill="${hi ? C.accent : C.faint}"/>`;
      s += text(x + 32, iy, it, { size: 11, fill: C.dim });
    });
    s += rect(x, 306, 268, 34, { fill: C.panel, r: 6 });
    s += text(x + 18, 327, i === 2 ? 'No free trial' : '7-day free trial', { size: 11, fill: i === 2 ? C.faint : C.accent, weight: 500 });
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
    s += rect(bx, y + 26, bw, 10, { r: 5, fill: C.hairline, stroke: 'none', sw: 0 });
    s += rect(bx, y + 26, bw * f, 10, { r: 5, fill: f > 0.8 ? C.faint : C.accent, stroke: 'none', sw: 0 });
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
  s += rect(390, 150, 250, 150, { fill: C.panelAlt, r: 8, stroke: C.accentDim });
  s += text(415, 180, 'Your trader profile', { size: 13.5, weight: 600, font: F.head, fill: C.accent });
  ['How you size and time trades', 'Which mistakes repeat, and how often', 'What you say you want to fix', 'Your archetype and biases'].forEach((t, i) => {
    s += `<circle cx="419" cy="${200 + i * 22}" r="2.5" fill="${C.accent}"/>`;
    s += text(429, 204 + i * 22, t, { size: 10.5, fill: C.dim });
  });
  s += flowArrow(644, 706, 225, { arrow: true, stroke: C.accent });
  const outs = ['Chart & Lens verdicts', 'Quant research answers', 'Asset Manager replies', 'Automation agent briefs', 'Autopsy coaching'];
  outs.forEach((n, i) => {
    const y = 128 + i * 40;
    s += rect(712, y, 200, 30, { fill: C.panel, r: 6, stroke: C.mark });
    s += text(726, y + 19, n, { size: 11, fill: C.dim });
  });
  s += rect(28, 424, W - 56, 24, { fill: 'none', stroke: 'none', sw: 0 });
  s += text(28, 440, 'Memory runs passively. There is no switch to turn it on.', { size: 11, fill: C.faint });
  return svg(W, H, s, {
    title: 'How Tradion Memory works',
    desc: 'Ten activity sources on the left feed into a single trader profile in the centre, which then shapes five kinds of AI output on the right.',
  });
}

/* ── verdict-decision ────────────────────────────────────────────────────── */
/**
 * Why there are four verdict words, and what each one leaves on the card.
 *
 * This replaced a labelled mock-up of a verdict card. That version showed a
 * reader where the confidence bar sits, which they can see for themselves by
 * looking at the product. It did not answer the question a beginner actually
 * arrives with: what is the difference between WAIT and NO TRADE, and why does
 * one of them come back with no prices on it.
 *
 * The three checks below are the real ones, from server/prompts/chartAnalysis.js
 * and server/utils/chartValidators.js. NO TRADE has its levels and game plan
 * deleted on the way out; WAIT is deliberately left intact. That behaviour is
 * invisible until someone tells you, which is what makes it worth a diagram.
 */
export function verdictDecision() {
  const W = 900, H = 444;
  const QX = 40, QW = 336, QCX = QX + QW / 2, QR = QX + QW;
  const OX = 464, OW = 396;

  let s = label(QX + 4, 40, 'What Tradion checks');
  s += label(OX + 4, 40, 'What the card gives you');

  const question = (y, l1, l2) =>
    rect(QX, y, QW, 62, { fill: C.panel, r: 8 }) +
    text(QX + 18, y + 27, l1, { size: 12.5, fill: C.text, weight: 500 }) +
    text(QX + 18, y + 45, l2, { size: 12.5, fill: C.text, weight: 500 });

  s += question(56, 'Is there a directional edge', 'on this chart at all?');
  s += question(178, 'Has price reached the', 'entry level yet?');
  s += question(300, 'Which way does the', 'setup lean?');

  // The accent traces the one route that ends in a trade you can take now.
  const yes = (y1, y2) =>
    line(QCX, y1, QCX, y2, { stroke: C.accent, sw: 1.2 }) +
    text(QCX + 10, (y1 + y2) / 2 + 4, 'yes', { size: 10.5, fill: C.accent, weight: 500 });
  s += yes(118, 178);
  s += yes(240, 300);

  const branch = (y, word) =>
    flowArrow(QR, OX - 6, y) +
    (word ? text((QR + OX) / 2 - 6, y - 8, word, { size: 10.5, fill: C.faint, anchor: 'middle' }) : '');
  s += branch(87, 'no');
  s += branch(209, 'no');

  const card = (y, h, word, sub, lines) => {
    let o = rect(OX, y, OW, h, { fill: C.panelAlt, r: 8 });
    o += text(OX + 18, y + 25, word, { size: 13.5, weight: 700, fill: C.text, font: F.head });
    // Fixed column rather than a width guess: it lines the note up with the
    // BUY / SELL text below, and a mis-measured word length collided here once.
    if (sub) o += text(OX + 108, y + 25, sub, { size: 10, fill: C.faint, font: F.mono });
    lines.forEach((t, i) => { o += text(OX + 18, y + 46 + i * 16, t, { size: 11, fill: C.dim }); });
    return o;
  };

  s += card(52, 70, 'NO TRADE', null, [
    'No entry, no stop, no target, no game plan.',
    'Tradion strips them, so nothing reads as actionable.',
  ]);
  s += card(174, 70, 'WAIT', 'the card prints HOLD', [
    'A real setup, levels and all, that has not triggered.',
    'These are the prices worth setting an alert on.',
  ]);

  // The last question splits rather than branching off, so it forks.
  s += flowArrow(QR, 444, 331);
  s += line(444, 312, 444, 350, { stroke: C.mark, sw: 1.2 });
  s += flowArrow(444, OX - 6, 312);
  s += flowArrow(444, OX - 6, 350);

  const row = (y, word, t) =>
    rect(OX, y, OW, 32, { fill: C.panelAlt, r: 8 }) +
    text(OX + 18, y + 21, word, { size: 13.5, weight: 700, fill: C.text, font: F.head }) +
    text(OX + 108, y + 21, t, { size: 11, fill: C.dim });
  s += row(296, 'BUY', 'Bullish, and price is already at the entry.');
  s += row(334, 'SELL', 'Bearish, and price is already at the entry.');

  s += line(QX, 396, W - QX, 396, { stroke: C.hairline });
  s += text(QX + 4, 420, 'Confidence rides on all four. It scores how much the evidence agreed, never the odds of a payout.', { size: 11.5, fill: C.dim });

  return svg(W, H, s, {
    title: 'How Tradion arrives at one of four chart verdicts',
    desc: 'Three checks in sequence. No directional edge gives NO TRADE, which comes back with no entry, stop, target or game plan. An edge that price has not reached yet gives WAIT, shown on the card as HOLD, which keeps all of its levels. An edge price has reached gives BUY or SELL. Confidence appears on all four and scores agreement in the evidence, not the odds of a payout.',
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
  let s = label(28, 34, 'A confidence score is a sum of parts. Read the parts');
  factors.forEach(([n, v, d], i) => {
    const y = 58 + i * 46;
    s += text(28, y + 14, n, { size: 12, weight: 500 });
    s += text(28, y + 30, d, { size: 10, fill: C.faint });
    const bx = 330, bw = 420;
    s += rect(bx, y + 6, bw, 12, { r: 6, fill: C.hairline, stroke: 'none', sw: 0 });
    s += rect(bx, y + 6, bw * v, 12, { r: 6, fill: v < 0.5 ? C.faint : C.accent, stroke: 'none', sw: 0 });
    s += text(bx + bw + 14, y + 16, v < 0.5 ? 'weak' : v < 0.75 ? 'fair' : 'strong', { size: 10, fill: C.faint });
  });
  s += rect(28, 290, W - 56, 34, { fill: C.panelAlt, r: 6, stroke: C.accentDim, dash: '4 3' });
  s += text(48, 312, 'One weak factor inside a high overall score is the most useful thing on the card.', { size: 11.5, fill: C.dim });
  return svg(W, H, s, {
    title: 'How a confidence score breaks down',
    desc: 'Five contributing factors (trend agreement, pattern quality, volume confirmation, risk and reward, and market context), each shown as a bar labelled weak, fair, or strong.',
  });
}

/* ── trade-levels ────────────────────────────────────────────────────────── */
/**
 * The geometry on the left, the consequence of it on the right.
 *
 * The previous version drew a sparkline, three labelled lines, and "3 : 1" in
 * large type. Every one of those restated the caption underneath it. Worse, it
 * left the ratio feeling like a grade the model awards, which is the exact
 * misreading the page spends a paragraph correcting.
 *
 * So: no invented prices, because we never show numbers that look like account
 * data. What the picture adds instead is the part prose is bad at. On the left,
 * the ATR band, so a beginner can see what "your stop is inside the noise"
 * looks like rather than being told. On the right, the break-even win rate each
 * ratio demands, which turns an abstract ratio into a number about you, plus
 * the 1.5 line the interface flags at (VerdictCard.tsx) and the per-mode
 * minimums the analysis is actually graded against (chartAnalysis.js).
 */
export function tradeLevels() {
  const W = 900, H = 372;
  const AX = 150, AR = 400;               // price axis, and how far levels run
  const yT = 76, yE = 190, yS = 252;      // target, entry, stop
  const bandTop = 154, bandBot = 226;     // one ATR either side of entry

  let s = label(40, 40, 'The three prices');

  // One ATR of ordinary movement, drawn first so the levels sit on top of it.
  s += rect(AX, bandTop, AR - AX, bandBot - bandTop, { fill: C.panelAlt, stroke: C.border, dash: '4 4', r: 6 });
  s += label(AX + 12, 172, 'One ATR · ordinary movement', { fill: C.faint });

  const level = (y, name) =>
    line(AX, y, AR, y, { stroke: C.border, sw: 1.2 }) +
    text(AX - 12, y + 4, name, { size: 11.5, fill: C.text, weight: 600, anchor: 'end' });
  s += level(yT, 'Target') + level(yE, 'Entry') + level(yS, 'Stop');

  // The part a beginner cannot see for themselves: the stop has to clear the
  // noise before it is a stop at all. Explicit lines, never a computed slice.
  s += text(AX + 12, 206, 'a stop in here is taken out by', { size: 10, fill: C.faint });
  s += text(AX + 12, 219, 'ordinary movement, not by being wrong', { size: 10, fill: C.faint });

  // Reward and risk as spans, not as a score.
  const span = (y1, y2, name) => {
    const x = AR + 16;
    return path(`M${x},${y1} L${x},${y2}`, { stroke: C.mark, sw: 1.2 }) +
      line(x - 5, y1, x + 5, y1, { stroke: C.mark }) +
      line(x - 5, y2, x + 5, y2, { stroke: C.mark }) +
      text(x + 12, (y1 + y2) / 2 + 4, name, { size: 11, fill: C.dim, weight: 500 });
  };
  s += span(yT, yE, 'reward');
  s += span(yE, yS, 'risk');

  /* ── right panel: what the ratio asks of you ──────────────────────────── */
  const PX = 500, BX = 584, BW = 200;
  s += label(PX, 40, 'What each ratio asks of you');
  s += text(PX, 62, 'The win rate you need to break even, before costs', { size: 11, fill: C.faint });

  const rung = (y, ratio, rate) =>
    text(PX, y + 8, ratio, { size: 12, fill: C.text, font: F.mono }) +
    meter(BX, y + 1, BW, rate / 100, { fill: C.mark }) +
    text(BX + BW + 14, y + 8, `${rate}%`, { size: 12, fill: C.dim, font: F.mono });

  s += rung(88, '3 : 1', 25);
  s += rung(124, '2 : 1', 33);
  s += rung(160, '1.5 : 1', 40);

  // Anything under this line prints red on the card. Drawn as a floor, because
  // that is where it sits in the list.
  s += line(PX, 192, PX + 320, 192, { stroke: C.accentDim, dash: '4 4' });
  s += text(PX, 208, 'Tradion prints the ratio in red below this line', { size: 10.5, fill: C.accent });

  s += rung(224, '1 : 1', 50);

  s += text(PX, 268, 'The analysis is graded harder than the card is coloured:', { size: 10.5, fill: C.faint });
  s += text(PX, 283, '2:1 swing, 1.5:1 day trade, 1:1 scalp.', { size: 10.5, fill: C.faint });

  s += line(40, 320, W - 40, 320, { stroke: C.hairline });
  s += text(44, 344, 'The ratio is arithmetic on the three prices, never a judgement. Widen the stop and it falls with you.', { size: 11.5, fill: C.dim });

  return svg(W, H, s, {
    title: 'Entry, stop and target, and what the ratio between them demands',
    desc: 'On the left, a price axis with target above, entry in the middle and stop below. A dashed band one ATR either side of entry marks ordinary movement, noting that a stop placed inside it is taken out by noise rather than by being wrong. The spans above and below entry are labelled reward and risk. On the right, four ratios with the break-even win rate each needs: three to one needs twenty-five per cent, two to one needs thirty-three, one and a half to one needs forty, one to one needs fifty. A line marks where Tradion prints the ratio in red, with a note that the analysis itself is graded against two to one for swing, one and a half for day trades and one to one for scalps.',
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
    desc: 'Five data providers on the left (Alpaca, Alpha Vantage, FRED, SEC EDGAR, and your connected brokerage), each listing what it supplies, feeding a four-step pipeline on the right.',
  });
}

/**
 * Shared SVG primitives for docs illustrations.
 *
 * DESIGN CONTRACT
 * One neutral scale plus one accent. Nothing else. No semantic reds, greens,
 * or ambers; no coloured buttons; no accent stripe down one side of a card.
 * Emphasis comes from weight, size, and space, not from hue. The reference
 * points are Anthropic and OpenAI documentation, not dashboard chrome.
 *
 * Every value below is a token. Builders must never write a hex literal — the
 * `no hardcoded colour` check in build-illustrations.mjs enforces it.
 *
 * TWO BUGS THIS FILE EXISTS TO PREVENT
 * 1. Fixed width/height on the root made every diagram overflow its column and
 *    broke the lightbox, so clicking an image took the page down with it.
 *    The root now carries a viewBox only, and scales to its container.
 * 2. Every file shared id="t", id="d", id="a". On a page with more than one
 *    diagram those collide. Ids are now namespaced per diagram.
 */

/** Neutral ramp, dark to light. The only scale in the system. */
export const N = {
  0: '#0a0b0c',   // page
  1: '#101113',   // panel
  2: '#161719',   // panel, raised
  3: '#1e2022',   // hairline
  4: '#2a2d2f',   // border
  5: '#3d4144',   // muted mark
  6: '#6b7073',   // tertiary text
  7: '#9aa0a3',   // secondary text
  8: '#e8e9ea',   // primary text
};

/** The single accent. Used sparingly: never as a fill for a whole element. */
export const ACCENT = '#459e6b';
export const ACCENT_DIM = 'rgba(69,158,107,0.30)';
export const ACCENT_WASH = 'rgba(69,158,107,0.10)';

export const C = {
  bg: N[0], panel: N[1], panelAlt: N[2], hairline: N[3], border: N[4],
  mark: N[5], faint: N[6], dim: N[7], text: N[8],
  accent: ACCENT, accentDim: ACCENT_DIM, accentWash: ACCENT_WASH,
};

export const F = {
  head: "'Space Grotesk', 'Inter', system-ui, sans-serif",
  body: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SF Mono', monospace",
};

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Per-diagram id namespace, so two diagrams on one page never collide. */
let NS = 'x';
export const setNamespace = (slug) => { NS = String(slug).replace(/[^a-z0-9]/gi, ''); };
export const ref = (name) => `${NS}-${name}`;

/**
 * Root wrapper.
 *
 * width and height as unitless numbers (matching viewBox), plus viewBox for
 * scaling. Unitless attributes give the file an intrinsic pixel size so
 * <img>.naturalWidth/naturalHeight resolve correctly — required by medium-zoom
 * (Mintlify's <Frame> lightbox) which reads those on click to compute scale.
 * viewBox still lets CSS (max-width:100%; height:auto) scale the element to
 * its column without overflow.
 *
 * Do NOT use style="width:100%" on the root: percentage resolves against a
 * zero-width containing block in some renderers and renders blank.
 */
export function svg(w, h, body, { title, desc } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${ref('t')} ${ref('d')}" font-family="${F.body}">
<title id="${ref('t')}">${esc(title ?? '')}</title><desc id="${ref('d')}">${esc(desc ?? '')}</desc>
<defs>
  <marker id="${ref('arrow')}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
    <path d="M0,1.5 L8,5 L0,8.5 z" fill="${C.mark}"/>
  </marker>
</defs>
<rect width="${w}" height="${h}" rx="10" fill="${C.bg}"/>
${body}
</svg>
`;
}

export const rect = (x, y, w, h, o = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 6}" fill="${o.fill ?? C.panel}" stroke="${o.stroke ?? C.border}" stroke-width="${o.sw ?? 1}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;

export const text = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" fill="${o.fill ?? C.text}" font-size="${o.size ?? 12}" font-family="${o.font ?? F.body}" font-weight="${o.weight ?? 400}" text-anchor="${o.anchor ?? 'start'}"${o.spacing ? ` letter-spacing="${o.spacing}"` : ''}>${esc(s)}</text>`;

/** Uppercase micro label. The product's section-header treatment. */
export const label = (x, y, s, o = {}) =>
  text(x, y, String(s).toUpperCase(), { size: 9, fill: o.fill ?? C.faint, weight: 600, spacing: 0.8, anchor: o.anchor });

export const line = (x1, y1, x2, y2, o = {}) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.stroke ?? C.border}" stroke-width="${o.sw ?? 1}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#${ref('arrow')})"` : ''}/>`;

export const path = (d, o = {}) =>
  `<path d="${d}" fill="${o.fill ?? 'none'}" stroke="${o.stroke ?? C.border}" stroke-width="${o.sw ?? 1}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#${ref('arrow')})"` : ''}${o.cap ? ` stroke-linecap="${o.cap}"` : ''}/>`;

/**
 * Small rounded tag. `on` raises it one step and adds a hairline accent
 * outline — never a filled accent pill, which reads as a button.
 */
export function chip(x, y, s, o = {}) {
  const w = o.w ?? Math.max(38, String(s).length * 6.2 + 16);
  const h = o.h ?? 20;
  return (
    rect(x, y, w, h, { r: 5, fill: o.on ? C.panelAlt : C.panel, stroke: o.on ? C.accentDim : C.border }) +
    text(x + w / 2, y + h / 2 + 3.5, s, { size: 10, fill: o.on ? C.text : C.dim, anchor: 'middle', weight: 500 })
  );
}

/** Numbered callout. The one place the accent appears as a mark. */
export const pin = (x, y, n) =>
  `<circle cx="${x}" cy="${y}" r="9" fill="${C.bg}" stroke="${C.accent}" stroke-width="1"/>` +
  text(x, y + 3.5, n, { size: 10, fill: C.accent, anchor: 'middle', weight: 600 });

export const leader = (x1, y1, x2, y2) =>
  line(x1, y1, x2, y2, { stroke: C.border, dash: '2 3' });

/** Placeholder bar. Stands in for data we never show. */
export const bar = (x, y, w, o = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${o.h ?? 6}" rx="3" fill="${o.fill ?? C.hairline}"/>`;

/** Redacted value. Never a real number. */
export const redact = (x, y, o = {}) =>
  text(x, y, o.s ?? '— — —', { size: o.size ?? 11, fill: o.fill ?? C.faint, font: F.mono, anchor: o.anchor });

/** Sparkline from normalised points (0..1). */
export function spark(x, y, w, h, pts, o = {}) {
  const d = pts
    .map((p, i) => `${i ? 'L' : 'M'}${(x + (i / (pts.length - 1)) * w).toFixed(1)},${(y + h - p * h).toFixed(1)}`)
    .join(' ');
  return path(d, { stroke: o.stroke ?? C.accent, sw: o.sw ?? 1.4, cap: 'round' });
}

/** Proportion bar. Filled portion is accent, remainder is the neutral track. */
export function meter(x, y, w, frac, o = {}) {
  const h = o.h ?? 8;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${C.hairline}"/>` +
         `<rect x="${x}" y="${y}" width="${(w * frac).toFixed(1)}" height="${h}" rx="${h / 2}" fill="${o.fill ?? C.accent}"/>`;
}

export const flowArrow = (x1, x2, y, o = {}) =>
  line(x1, y, x2, y, { stroke: o.stroke ?? C.mark, arrow: true, sw: 1.2 });

/**
 * Shared SVG primitives for docs illustrations.
 *
 * Every diagram is a self-contained dark panel in the Tradion palette, so it
 * reads as a representation of the product regardless of the docs theme.
 * Colours mirror docs/BRAND.md.
 */

export const C = {
  bg: '#0b0c0d',
  panel: '#111315',
  panelAlt: '#16191b',
  border: '#232729',
  borderStrong: '#2f3437',
  accent: '#459e6b',
  accentSoft: 'rgba(69,158,107,0.14)',
  accentLine: 'rgba(69,158,107,0.45)',
  warn: '#d99a2b',
  danger: '#c9524f',
  text: '#f2f2f2',
  dim: '#9aa0a3',
  faint: '#63696c',
  grid: '#1b1e20',
};

export const F = {
  head: "'Space Grotesk', 'Inter', system-ui, sans-serif",
  body: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SF Mono', monospace",
};

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Root wrapper. `title` and `desc` become the accessible name. */
export function svg(w, h, body, { title, desc } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d" font-family="${F.body}">
<title id="t">${esc(title ?? '')}</title><desc id="d">${esc(desc ?? '')}</desc>
<defs>
  <marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M0,1 L9,5 L0,9 z" fill="${C.faint}"/>
  </marker>
  <marker id="ag" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M0,1 L9,5 L0,9 z" fill="${C.accent}"/>
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

/** Uppercase micro label, the product's section-header treatment. */
export const label = (x, y, s, o = {}) =>
  text(x, y, String(s).toUpperCase(), { size: 9, fill: o.fill ?? C.faint, weight: 600, spacing: 0.8, anchor: o.anchor, font: F.body });

export const line = (x1, y1, x2, y2, o = {}) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.stroke ?? C.border}" stroke-width="${o.sw ?? 1}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.marker ? ` marker-end="url(#${o.marker})"` : ''}/>`;

export const path = (d, o = {}) =>
  `<path d="${d}" fill="${o.fill ?? 'none'}" stroke="${o.stroke ?? C.border}" stroke-width="${o.sw ?? 1}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.marker ? ` marker-end="url(#${o.marker})"` : ''}${o.cap ? ` stroke-linecap="${o.cap}"` : ''}/>`;

/** Titled container. Returns the inner content origin. */
export function panel(x, y, w, h, heading, o = {}) {
  let s = rect(x, y, w, h, { fill: o.fill ?? C.panel, stroke: o.stroke ?? C.border, r: o.r ?? 8, dash: o.dash });
  if (heading) s += label(x + 12, y + 18, heading, { fill: o.headFill });
  return s;
}

/** Small rounded tag. */
export function chip(x, y, s, o = {}) {
  const w = o.w ?? Math.max(38, String(s).length * 6.2 + 16);
  const h = o.h ?? 20;
  return (
    rect(x, y, w, h, { r: 5, fill: o.fill ?? C.panelAlt, stroke: o.stroke ?? C.border }) +
    text(x + w / 2, y + h / 2 + 3.5, s, { size: 10, fill: o.text ?? C.dim, anchor: 'middle', weight: 500 })
  );
}

/** Callout number in a circle — for annotated anatomy diagrams. */
export const pin = (x, y, n) =>
  `<circle cx="${x}" cy="${y}" r="9" fill="${C.accentSoft}" stroke="${C.accent}" stroke-width="1"/>` +
  text(x, y + 3.5, n, { size: 10, fill: C.accent, anchor: 'middle', weight: 600 });

/** Leader line from a pin to a caption. */
export const leader = (x1, y1, x2, y2) =>
  line(x1, y1, x2, y2, { stroke: C.accentLine, dash: '2 3' });

/** Horizontal placeholder bar — stands in for data we never show. */
export const bar = (x, y, w, o = {}) =>
  rect(x, y, w, o.h ?? 6, { r: 3, fill: o.fill ?? C.grid, stroke: 'none', sw: 0 });

/** Redacted value notation. Never a real number. */
export const redact = (x, y, o = {}) =>
  text(x, y, o.s ?? '— — —', { size: o.size ?? 11, fill: o.fill ?? C.faint, font: F.mono, anchor: o.anchor });

/** Sparkline from normalised points (0..1). */
export function spark(x, y, w, h, pts, o = {}) {
  const d = pts
    .map((p, i) => `${i ? 'L' : 'M'}${(x + (i / (pts.length - 1)) * w).toFixed(1)},${(y + h - p * h).toFixed(1)}`)
    .join(' ');
  return path(d, { stroke: o.stroke ?? C.accent, sw: o.sw ?? 1.4, cap: 'round' });
}

/** Flow arrow between two node boxes on the same row. */
export const flowArrow = (x1, x2, y, o = {}) =>
  line(x1, y, x2, y, { stroke: o.stroke ?? C.faint, marker: o.marker ?? 'a', sw: 1.2 });

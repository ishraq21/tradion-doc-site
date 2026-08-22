/**
 * Screenshot definitions for the docs site.
 *
 * Tradion routes via the `ViewState` enum persisted to localStorage
 * (`tradion_active_view`) — there is no React Router — so we navigate by
 * writing that key and reloading rather than by URL.
 *
 * Keep `slug` in sync with scripts/screenshot-manifest.json and the
 * `/images/<slug>.png` paths referenced from the .mdx pages.
 */

export type Shot = {
  /** Output path under docs-site/images, without extension. */
  slug: string;
  /** ViewState enum value to land on. Omit for pre-auth screens. */
  view?: string;
  /** Skip auth entirely (login, onboarding, paywall). */
  unauthenticated?: boolean;
  /** CSS selector to wait for before capturing. */
  waitFor?: string;
  /** Capture only this element instead of the full page. */
  clip?: string;
  /** Extra interactions before capture. */
  steps?: Array<
    | { click: string }
    | { hover: string }
    | { fill: [selector: string, value: string] }
    | { wait: number }
    | { scrollTo: string }
  >;
  /** Extra settle time in ms on top of the default. */
  settle?: number;
};

export const VIEWPORT = { width: 1600, height: 1000 };
export const DEVICE_SCALE_FACTOR = 2;

export const SHOTS: Shot[] = [
  // ── Pre-auth ────────────────────────────────────────────────────────────
  { slug: 'auth/login', unauthenticated: true, waitFor: '#google-signin-button' },
  {
    slug: 'auth/magic-link-sent',
    unauthenticated: true,
    steps: [
      { fill: ['input[type="email"]', 'demo@tradionlabs.com'] },
      { click: 'button:has-text("Send magic link")' },
      { wait: 1200 },
    ],
  },

  // ── Onboarding (requires a fresh user with onboardingCompleted=false) ────
  { slug: 'auth/onboarding-step-1', view: '__onboarding__', waitFor: 'input[name="fullName"]' },
  { slug: 'auth/onboarding-step-2', view: '__onboarding__', steps: [{ click: 'button:has-text("Continue")' }, { wait: 600 }] },
  { slug: 'auth/onboarding-step-3', view: '__onboarding__', steps: [{ click: 'button:has-text("Continue")' }, { wait: 400 }, { click: 'button:has-text("Continue")' }, { wait: 600 }] },
  { slug: 'auth/onboarding-step-4', view: '__onboarding__', steps: [{ click: 'button:has-text("Continue")' }, { wait: 400 }, { click: 'button:has-text("Continue")' }, { wait: 400 }, { click: 'button:has-text("Continue")' }, { wait: 600 }] },
  { slug: 'auth/paywall-gate', view: '__paywall__', settle: 1500 },

  // ── Shell ───────────────────────────────────────────────────────────────
  { slug: 'shell/sidebar-annotated', view: 'HOME', clip: 'nav[aria-label="Primary"], aside' },
  { slug: 'shell/feedback-modal', view: 'HOME', steps: [{ click: 'button:has-text("Feedback")' }, { wait: 800 }] },

  // ── Home ────────────────────────────────────────────────────────────────
  { slug: 'home/home-full', view: 'HOME', settle: 2500 },

  // ── Portfolio ───────────────────────────────────────────────────────────
  { slug: 'portfolio/portfolio-full', view: 'PORTFOLIO', settle: 3000 },
  { slug: 'portfolio/net-worth-chart', view: 'PORTFOLIO', clip: '[data-doc="net-worth-chart"]', settle: 3000 },
  { slug: 'portfolio/holdings-table', view: 'PORTFOLIO', clip: '[data-doc="holdings-table"]', settle: 3000 },
  { slug: 'portfolio/sector-allocation', view: 'PORTFOLIO', clip: '[data-doc="sector-allocation"]', settle: 3000 },
  { slug: 'portfolio/connect-modal', view: 'PORTFOLIO', steps: [{ click: 'button:has-text("Connect brokerage")' }, { wait: 2500 }] },
  { slug: 'portfolio/asset-manager-full', view: 'PORTFOLIO_AGENT', settle: 2500 },
  { slug: 'portfolio/asset-manager-chart', view: 'PORTFOLIO_AGENT', clip: '[data-doc="agent-chart"]', settle: 3000 },

  // ── Research ────────────────────────────────────────────────────────────
  { slug: 'research/quant-full', view: 'TERMINAL', settle: 2500 },
  { slug: 'research/quant-new-session', view: 'TERMINAL', steps: [{ click: 'button:has-text("New analysis")' }, { wait: 1000 }] },
  { slug: 'research/quant-cell-running', view: 'TERMINAL', waitFor: '[data-doc="cell-running"]', settle: 1000 },
  { slug: 'research/quant-result', view: 'TERMINAL', clip: '[data-doc="cell-complete"]', settle: 2500 },
  { slug: 'research/canvas-multi-cell', view: 'TERMINAL', settle: 3000 },
  { slug: 'research/canvas-cell-code', view: 'TERMINAL', clip: '[data-doc="cell-code"]', settle: 2000 },
  { slug: 'research/template-library', view: 'TERMINAL', steps: [{ click: 'button:has-text("Templates")' }, { wait: 1200 }] },

  { slug: 'research/chart-analyzer-full', view: 'CHART_ANALYZER', settle: 2500 },
  { slug: 'research/chart-analyzer-upload', view: 'CHART_ANALYZER', clip: '[data-doc="upload-dropzone"]' },
  { slug: 'research/verdict-card', view: 'CHART_ANALYZER', clip: '[data-doc="verdict-card"]', settle: 2500 },
  { slug: 'research/confidence-breakdown', view: 'CHART_ANALYZER', clip: '[data-doc="confidence-breakdown"]', settle: 2500 },
  { slug: 'research/trade-levels', view: 'CHART_ANALYZER', clip: '[data-doc="trade-levels"]', settle: 2500 },
  { slug: 'research/forecast-cone', view: 'CHART_ANALYZER', clip: '[data-doc="forecast-cone"]', settle: 2500 },

  { slug: 'research/lens-full', view: 'LENS', settle: 2000 },
  { slug: 'research/lens-capture', view: 'LENS', clip: '[data-doc="lens-capture"]' },
  { slug: 'research/lens-verdict', view: 'LENS', clip: '[data-doc="lens-verdict"]', settle: 2500 },

  { slug: 'research/earnings-full', view: 'EARNINGS_SPIDER', settle: 2500 },
  { slug: 'research/earnings-verdict', view: 'EARNINGS_SPIDER', clip: '[data-doc="earnings-verdict"]', settle: 2500 },
  { slug: 'research/earnings-metrics', view: 'EARNINGS_SPIDER', clip: '[data-doc="key-metrics"]', settle: 2500 },
  { slug: 'research/earnings-straddle', view: 'EARNINGS_SPIDER', clip: '[data-doc="straddle-calculator"]', settle: 2500 },

  // ── Trade intelligence ──────────────────────────────────────────────────
  { slug: 'trade/autopsy-overview', view: 'TRADE_AUTOPSY', settle: 2500 },
  { slug: 'trade/trade-intake-narrative', view: 'TRADE_AUTOPSY', steps: [{ click: 'button:has-text("Trade Log")' }, { wait: 800 }, { click: 'button:has-text("New trade")' }, { wait: 800 }] },
  { slug: 'trade/trade-intake-form', view: 'TRADE_AUTOPSY', steps: [{ click: 'button:has-text("Trade Log")' }, { wait: 800 }, { click: 'button:has-text("New trade")' }, { wait: 600 }, { click: 'button:has-text("Form")' }, { wait: 600 }] },
  { slug: 'trade/broker-trades', view: 'TRADE_AUTOPSY', steps: [{ click: 'button:has-text("Broker Trades")' }, { wait: 1500 }] },
  { slug: 'trade/import-modal', view: 'TRADE_AUTOPSY', steps: [{ click: 'button:has-text("Broker Trades")' }, { wait: 1200 }, { click: 'button:has-text("Import")' }, { wait: 2000 }] },
  { slug: 'trade/autopsy-report', view: 'TRADE_AUTOPSY', steps: [{ click: 'button:has-text("Autopsies")' }, { wait: 1200 }, { click: '[data-doc="autopsy-row"]' }, { wait: 1800 }] },
  { slug: 'trade/autopsy-scorecard', view: 'TRADE_AUTOPSY', clip: '[data-doc="autopsy-scorecard"]', steps: [{ click: 'button:has-text("Autopsies")' }, { wait: 1200 }, { click: '[data-doc="autopsy-row"]' }, { wait: 1800 }] },
  { slug: 'trade/autopsy-blame-pie', view: 'TRADE_AUTOPSY', clip: '[data-doc="blame-pie"]', steps: [{ click: 'button:has-text("Autopsies")' }, { wait: 1200 }, { click: '[data-doc="autopsy-row"]' }, { wait: 1800 }] },
  { slug: 'trade/playbook-manager', view: 'TRADE_AUTOPSY', steps: [{ click: 'button:has-text("Playbook")' }, { wait: 1200 }] },
  { slug: 'trade/preflight-modal', view: 'TRADE_AUTOPSY', steps: [{ click: 'button:has-text("Playbook")' }, { wait: 1000 }, { click: 'button:has-text("Pre-Flight")' }, { wait: 1200 }] },

  { slug: 'trade/profile-full', view: 'PROFILE', settle: 3000 },
  { slug: 'trade/profile-patterns', view: 'PROFILE', clip: '[data-doc="behavioural-patterns"]', settle: 3000 },
  { slug: 'trade/profile-fingerprint', view: 'PROFILE', clip: '[data-doc="fingerprint-radar"]', settle: 3000 },
  { slug: 'trade/profile-heatmap', view: 'PROFILE', clip: '[data-doc="activity-heatmap"]', settle: 3000 },
  { slug: 'trade/profile-memory-section', view: 'PROFILE', clip: '[data-doc="trader-profile"]', settle: 3000 },
  { slug: 'trade/profile-psych', view: 'PROFILE', clip: '[data-doc="psych-profile"]', settle: 3000 },
  { slug: 'trade/profile-confidence-bar', view: 'PROFILE', clip: '[data-doc="confidence-bar"]', settle: 2000 },

  // ── Automations ─────────────────────────────────────────────────────────
  { slug: 'automations/automations-list', view: 'AUTOMATIONS', settle: 2000 },
  { slug: 'automations/canvas-full', view: 'AUTOMATIONS', steps: [{ click: '[data-doc="automation-card"]' }, { wait: 1500 }] },
  { slug: 'automations/canvas-empty', view: 'AUTOMATIONS', steps: [{ click: 'button:has-text("New automation")' }, { wait: 800 }, { click: 'button:has-text("Canvas")' }, { wait: 1500 }] },
  { slug: 'automations/canvas-two-conditions', view: 'AUTOMATIONS', steps: [{ click: '[data-doc="automation-card-two-conditions"]' }, { wait: 1800 }] },
  { slug: 'automations/automation-card-active', view: 'AUTOMATIONS', clip: '[data-doc="automation-card"]', settle: 1500 },
  { slug: 'automations/condition-node-indicator', view: 'AUTOMATIONS', clip: '[data-doc="config-drawer"]', steps: [{ click: '[data-doc="automation-card"]' }, { wait: 1500 }, { click: '[data-doc="condition-node"]' }, { wait: 800 }] },
  { slug: 'automations/options-chain-picker', view: 'AUTOMATIONS', clip: '[data-doc="options-picker"]', steps: [{ click: '[data-doc="automation-card-options"]' }, { wait: 1800 }] },
  { slug: 'automations/indicator-preview', view: 'AUTOMATIONS', clip: '[data-doc="indicator-preview"]', settle: 2500 },
  { slug: 'automations/agent-node-config', view: 'AUTOMATIONS', clip: '[data-doc="config-drawer"]', steps: [{ click: '[data-doc="automation-card-agent"]' }, { wait: 1500 }, { click: '[data-doc="agent-node"]' }, { wait: 800 }] },
  { slug: 'automations/agent-results', view: 'AUTOMATIONS', clip: '[data-doc="agent-results"]', settle: 2000 },
  { slug: 'automations/action-node-channels', view: 'AUTOMATIONS', clip: '[data-doc="config-drawer"]', steps: [{ click: '[data-doc="automation-card"]' }, { wait: 1500 }, { click: '[data-doc="action-node"]' }, { wait: 800 }] },
  { slug: 'automations/message-template', view: 'AUTOMATIONS', clip: '[data-doc="message-template"]', steps: [{ click: '[data-doc="automation-card"]' }, { wait: 1500 }, { click: '[data-doc="action-node"]' }, { wait: 800 }] },
  { slug: 'automations/runs-list', view: 'AUTOMATIONS', steps: [{ click: 'button:has-text("Runs")' }, { wait: 1500 }] },
  { slug: 'automations/run-detail', view: 'AUTOMATIONS', steps: [{ click: 'button:has-text("Runs")' }, { wait: 1200 }, { click: '[data-doc="run-row"]' }, { wait: 1500 }] },

  // ── Account ─────────────────────────────────────────────────────────────
  { slug: 'account/settings-full', view: 'ACCOUNT_SETTINGS', settle: 2000 },
  { slug: 'account/usage-meters', view: 'ACCOUNT_SETTINGS', clip: '[data-doc="usage-meters"]', settle: 2000 },
  { slug: 'account/subscription-panel', view: 'ACCOUNT_SETTINGS', clip: '[data-doc="subscription-panel"]', settle: 2000 },
  { slug: 'account/danger-zone', view: 'ACCOUNT_SETTINGS', clip: '[data-doc="danger-zone"]', steps: [{ scrollTo: '[data-doc="danger-zone"]' }, { wait: 600 }] },
];

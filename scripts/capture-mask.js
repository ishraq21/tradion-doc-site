/**
 * Docs capture mask.
 *
 * Paste into the DevTools console on app.tradionlabs.com before taking a
 * screenshot for the docs. Purely visual — nothing is submitted, nothing is
 * persisted, and a page reload clears it completely.
 *
 * WHY THIS EXISTS
 * A screenshot of a live trading account is a screenshot of somebody's money.
 * This rewrites the private parts in the rendered DOM so the UI stays real
 * while the data does not.
 *
 * THE RULE THAT MATTERS
 * Money in this app comes in two flavours and only one is private:
 *   • market prices for public tickers — entry, stop, target, quotes, EPS.
 *     These are public, and rewriting them makes the AI's written analysis
 *     read as nonsense (a stop above the entry, a thesis citing a price the
 *     chart never traded at). They must survive.
 *   • YOUR balances, P&L, and trade history. These must not.
 *
 * The two are told apart structurally: your figures render as a standalone
 * value inside their own element, under a label naming an account concept.
 * A market price appears mid-sentence. So currency is only rewritten when an
 * ancestor names an account concept.
 *
 * WHAT IT STILL CANNOT DO
 * Prose. The Profile page states your real losses and tickers inside
 * AI-written sentences ("AAPL and PLTR alone have erased over $X"). There is
 * no reliable way to rewrite that without destroying the sentence, so DO NOT
 * screenshot Profile, or the AI verdict block on Home. Use the diagrams in
 * images/diagrams/ for those pages instead.
 */
(() => {
  if (window.__mask) { window.__mask.run(); return 'already installed — re-applied'; }

  const hash = (s) => { let h = 2166136261; for (let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);} return Math.abs(h); };
  const money = (t) => {
    const neg = /-/.test(t);
    const v = Math.abs(parseFloat(t.replace(/[^\d.]/g,'')) || 0);
    const h = hash(t);
    const out = v < 1e3 ? 60 + (h % 94000) / 100
              : v < 1e5 ? 1200 + (h % 880000) / 100
              :           24000 + (h % 4100000) / 100;
    return (neg ? '-$' : '$') + out.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Already-rewritten nodes, so re-running never double-masks and figures
  // stay identical across captures. React swaps in fresh nodes carrying the
  // original value when it re-renders, and those are new objects.
  const seen = new WeakSet();

  const IDENTITY = [
    [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, 'alex@example.com'],
    [/\bMirza\b/gi, 'Alex'],
    [/\bIshraq\b/gi, 'Rivera'],
  ];

  const ACCOUNT_CTX = /(net worth|portfolio|net p&l|\bp&l\b|realized|unrealized|day change|total value|buying power|balance|cash available|tracked assets|positions|account value|equity|cost basis|subscription|invoice|billed|grade|mistakes)/i;
  const CURRENCY = /^[-+(]?\$\s?-?[\d,]+(?:\.\d+)?\)?$/;
  const COUNTS = [[/^(\d[\d,]*)\s+(Closed|Tracked Assets?|trades?)$/i, (m,n,w) => `48 ${w}`]];
  const STATS = { 'WIN RATE': '54%', 'TOTAL TRADES': '48', 'TRADES LOGGED': '48' };

  // Uppercase words in a trade table that are not tickers.
  const NOT_TICKER = new Set(['LONG','SHORT','BUY','SELL','CALL','PUT','OPEN','CLOSE','WIN','LOSS','SIDE','P&L','PL','GRADE','TOTAL','NET','ALL','NEW','AI','USD','EUR','GBP','ETF','YES','NO','ON','OFF','LIVE','N/A','TBD','EOD','RTH','DTE','IV','OI','RR']);
  const FAKE_TICKERS = ['ACME','NOVA','ORBT','VERT','LUMA','KEST','ATLS','RIDG'];
  const SKIP = new Set(['SCRIPT','STYLE','NOSCRIPT']);

  const ancestorMatches = (el, re, depth = 6, maxLen = 800) => {
    let n = el, d = 0;
    while (n && d < depth) {
      const t = n.textContent || '';
      if (t.length < maxLen && re.test(t)) return true;
      n = n.parentElement; d++;
    }
    return false;
  };

  const isTradeTable = (el) => {
    let n = el, d = 0;
    while (n && d < 8) {
      const t = n.textContent || '';
      if (t.length < 4000 && /SYMBOL/i.test(t) && /(P&L|GRADE|SIDE)/i.test(t)) return true;
      n = n.parentElement; d++;
    }
    return false;
  };

  function identityPass() {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => n.parentElement && SKIP.has(n.parentElement.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    let n, c = 0;
    while ((n = w.nextNode())) {
      if (seen.has(n) || !n.nodeValue || !n.nodeValue.trim()) continue;
      let out = n.nodeValue;
      for (const [re, rep] of IDENTITY) out = out.replace(re, rep);
      if (out !== n.nodeValue) { n.nodeValue = out; c++; seen.add(n); }
    }
    document.querySelectorAll('input').forEach((el) => {
      for (const a of ['value', 'placeholder']) {
        const v = el.getAttribute(a); if (!v) continue;
        let o = v; for (const [re, rep] of IDENTITY) o = o.replace(re, rep);
        if (o !== v) { el.setAttribute(a, o); if (a === 'value') el.value = o; c++; }
      }
    });
    document.title = document.title.replace(/Mirza/gi, 'Alex');
    return c;
  }

  function figurePass() {
    let c = 0;
    for (const el of document.body.querySelectorAll('*')) {
      if (el.children.length || seen.has(el)) continue;
      const t = (el.textContent || '').trim();
      if (!t || t.length > 26) continue;

      let handled = false;
      for (const [re, rep] of COUNTS) {
        if (re.test(t)) { el.textContent = t.replace(re, rep); seen.add(el); c++; handled = true; break; }
      }
      if (handled) continue;

      if (CURRENCY.test(t) && ancestorMatches(el, ACCOUNT_CTX)) {
        el.textContent = money(t); seen.add(el); c++; continue;
      }

      // A logged trade is a record of something you actually did.
      if (/^[A-Z]{2,5}$/.test(t) && !NOT_TICKER.has(t) && isTradeTable(el)) {
        el.textContent = FAKE_TICKERS[hash(t) % FAKE_TICKERS.length]; seen.add(el); c++;
      }
    }
    return c;
  }

  function statPass() {
    let c = 0;
    for (const el of document.body.querySelectorAll('*')) {
      if (el.children.length) continue;
      const val = STATS[(el.textContent || '').trim().toUpperCase()];
      if (!val) continue;
      const card = el.closest('div')?.parentElement || el.parentElement;
      if (!card) continue;
      for (const cand of card.querySelectorAll('*')) {
        if (cand.children.length || cand === el || seen.has(cand)) continue;
        if (/^-?[\d,]+(\.\d+)?%?$/.test((cand.textContent || '').trim())) {
          cand.textContent = val; seen.add(cand); c++; break;
        }
      }
    }
    return c;
  }

  // Freeze motion so two captures of the same screen are identical.
  const st = document.createElement('style');
  st.textContent = '*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important;caret-color:transparent!important}';
  document.head.appendChild(st);

  const run = () => ({ identity: identityPass(), figures: figurePass(), stats: statPass() });

  // Re-apply on every DOM settle so it survives navigation in the SPA.
  const obs = new MutationObserver(() => {
    clearTimeout(window.__maskT);
    window.__maskT = setTimeout(run, 150);
  });
  obs.observe(document.body, { childList: true, subtree: true, characterData: true });

  window.__mask = {
    run, seen, obs,
    settle: async (ms = 2200) => {
      await new Promise((r) => setTimeout(r, ms));
      run();
      await new Promise((r) => setTimeout(r, 300));
      return 'ready';
    },
  };

  return run();
})();

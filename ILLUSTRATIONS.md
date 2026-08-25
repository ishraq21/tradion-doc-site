# Illustration catalogue

Every SVG available to reference from a page. **This list is closed** — referencing a slug that isn't here fails `npm run verify:nav`.

Reference them like this:

```mdx
<Frame caption="What the reader should notice.">
  <img src="/images/diagrams/verdict-decision.svg" alt="What is in the image" />
</Frame>
```

All illustrations are built by `scripts/build-illustrations.mjs`, use the Tradion palette, and contain **placeholder data only** — no balances, no P&L, no names.

| Slug | Shows | Intended page |
| --- | --- | --- |
| `diagrams/onboarding-steps` | The five onboarding steps as a labelled progression | `get-started/onboarding` |
| `diagrams/usage-meters` | The three metered counters and what each one counts | `concepts/usage-limits` |
| `diagrams/memory-sources` | Ten data sources feeding one trader profile, feeding every AI response | `concepts/tradion-memory` |
| `diagrams/verdict-decision` | The three checks that produce BUY, SELL, WAIT or NO TRADE, and what each verdict leaves on the card | `concepts/reading-a-verdict` |
| `diagrams/confidence-anatomy` | A confidence score broken into contributing factors | `concepts/reading-a-verdict` |
| `diagrams/trade-levels` | Entry, stop and target against the ATR band, and the break-even win rate each ratio demands | `concepts/reading-a-verdict` |
| `diagrams/data-sources-map` | Which provider supplies which kind of data | `concepts/data-sources` |
| `diagrams/scorecard` | The three grades and what each measures | `trade-intelligence/reading-an-autopsy` |
| `diagrams/autopsy-loop` | Trade → autopsy → pattern → playbook rule → pre-flight check | `trade-intelligence/playbook-and-preflight` |
| `diagrams/profile-anatomy` | The Profile page's panels, labelled | `trade-intelligence/profile` |
| `diagrams/automation-flow` | The five node types in order, with which are optional | `automations/overview` |
| `diagrams/crosses-vs-is` | Why "crosses below" fires once and "is below" fires constantly | `automations/signal-types` |
| `diagrams/signal-matrix` | Which of the nine signal types work with which asset types | `automations/signal-types` |
| `diagrams/webhook-flow` | Trigger → signed POST → your endpoint → verification | `reference/webhook-payloads` |

## Adding one

1. Add a builder function to `scripts/build-illustrations.mjs`
2. Add the row to this table
3. `npm run illustrations && npm run verify:nav`

Keep them **flat, labelled, and low-detail**. These are wayfinding diagrams, not pixel-accurate mockups — a diagram that tries to look like a real screenshot goes stale exactly as fast as a screenshot does, without the benefit of being true.

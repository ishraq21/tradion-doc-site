# Tradion Docs

Official documentation for [Tradion](https://tradionlabs.com) — the AI analyst built for how you trade.

Live at **[docs.tradionlabs.com](https://docs.tradionlabs.com)**

## Structure

```
get-started/       Onboarding and quick-start guides
research/          Quant Terminal, Earnings Spider, Tradion Lens
trade-intelligence/ Trade Autopsy and behavioral analysis
automations/       Workflow builder and AI agents
portfolio/         AI Asset Manager and brokerage connections
account/           Billing, settings, and plan management
concepts/          Core concepts and terminology
reference/         API reference and integrations
help/              Troubleshooting and FAQs
```

## Local preview

```bash
npm i -g mintlify
mintlify dev
```

View at `http://localhost:3000`.

## Contributing

Changes pushed to `main` deploy automatically via Mintlify. See [CONTRIBUTING.md](./CONTRIBUTING.md) for style and structure guidelines.

## Keeping the docs true

Three guards, all run by `npm run verify`:

| Command | Checks |
| --- | --- |
| `npm run verify:nav` | Navigation, internal links, and image references resolve |
| `npm run audit` | Privacy, banned words, tone, structure, word ceiling, cross-page consistency |
| `npm run check:code` | Published facts against the **application source** |

### check:code needs the app repo

It reads `automationWorker.js`, `lib/automationConstants.js`, `ConditionNode.tsx`, and
`tiers.js` and asserts the docs against them — nothing is hardcoded, so it fails when the
code moves rather than when someone forgets to update a list. That is what caught the volume
signal flipping from a raw share count to a multiple of the 20-bar average.

It finds the app automatically when the two repos sit side by side:

```
Tradion/
├── tradion/            ← the app
└── tradion-doc-site/   ← this repo
```

Otherwise point at it:

```bash
TRADION_APP_PATH=/path/to/tradion npm run check:code
```

**In CI, where the app is not checked out, pass `--optional`.** It then prints a warning and
exits 0 instead of failing.

<!-- prettier-ignore -->
> When this repo was split out of the app repo, the old hardcoded `../` path stopped
> resolving. Every check skipped and the script still printed a tick. A guard that passes
> without checking anything is worse than no guard, so it now refuses to pass quietly —
> it names where it looked and exits 1.

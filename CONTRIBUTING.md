# Writing Tradion docs

## Before you start

```bash
cd docs-site
npm install
npm run dev          # live preview at localhost:3000
npm run verify:nav   # link + image + nav integrity
```

## Voice

From `docs/BRAND.md`: **direct, data-first, professional but not cold, zero hype.**

Concretely:

- Write to a smart trader who is busy, not a beginner who needs hand-holding and not an engineer who wants internals.
- Lead with what the reader does, then why it matters. Never open a page with a definition.
- Say the number. "150 chat messages a month" beats "generous limits."
- Name the failure mode. The most valuable paragraph on most pages is the one starting "this goes wrong when…"
- No exclamation marks, no "simply", no "just", no "easy". If it were easy they wouldn't be reading.
- Never imply a recommendation to trade. Tradion produces analysis; the reader decides.

Read `get-started/quickstart.mdx` and `automations/first-automation.mdx` before writing — they're the calibration.

## Page structure

```mdx
---
title: "Full page title"
sidebarTitle: "Short"        # only if the title is long
description: "One sentence. Shows in search results and social cards."
icon: "font-awesome-name"
---

One or two sentences: what this page covers and who needs it.

<Frame caption="What the reader is looking at.">
  <img src="/images/area/slug.png" alt="Descriptive alt text" />
</Frame>

## First real section
```

Rules:

- **H2 for sections, H3 for subsections.** Never skip a level.
- **Screenshot within the first screen** on any page describing a UI.
- **Every page ends by pointing somewhere** — a `<CardGroup>` of next steps, or a single link.

## Components

| Component | Use for |
| --- | --- |
| `<Steps>` | A sequence the reader performs in order |
| `<Tabs>` | Mutually exclusive paths (Google vs magic link) |
| `<AccordionGroup>` | Troubleshooting, FAQs, reference lists — anything scanned rather than read |
| `<CardGroup>` | Navigation between pages |
| `<Frame caption="">` | Every screenshot. Always with a caption |
| `<Note>` | Useful aside |
| `<Tip>` | Something that makes the reader better at the product |
| `<Warning>` | Something that costs money, data, or time if ignored |
| `<Check>` | Confirmation that a step worked |
| `<Info>` | Plan requirements and cross-references |

Don't stack three callouts in a row. If everything is highlighted, nothing is.

## Screenshots

Never take one by hand. Add a definition to `scripts/shots.ts`, add the slug to `scripts/screenshot-manifest.json`, and run `npm run shots`. See `scripts/README.md`.

Alt text describes what's *in* the image for someone who can't see it. The caption says what the reader should *notice*. They're different sentences.

## Filling in a stub

Each stub has a `## Outline` with `_TODO_` under each heading. Working through one:

1. Delete the `<Note>` draft banner.
2. Delete the `## Outline` heading itself — the sections become the page.
3. Write each section. Cut sections that turn out to be thin; merge rather than pad.
4. Move the `## Screenshots needed` table into `scripts/shots.ts` if the shots aren't defined yet, then delete the table and place `<Frame>` blocks inline where they belong.
5. Add a closing `<CardGroup>`.
6. `npm run verify:nav`.

## Adding a page

1. Create the `.mdx` under the right folder.
2. Add its path to `docs.json` navigation.
3. `npm run verify:nav` — it will catch a path you got wrong before Mintlify does.

## Before you open a PR

```bash
npm run verify:nav
npm run check          # Mintlify broken-link check
```

Review your screenshots as images, not as filenames. A stale screenshot is worse than no screenshot, because the reader trusts it.

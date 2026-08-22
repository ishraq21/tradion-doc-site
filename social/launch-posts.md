# Launch posts

Angle: what writing the documentation exposed. LinkedIn for founders and engineers, X for traders.

No em dashes anywhere in this file, per request.

---

## LinkedIn (company page)

> We wrote documentation for our trading platform last week and found 10 bugs doing it.
>
> Not from testing. From trying to write down what the product actually does.
>
> Writing a docs page forces a specific question: what happens when someone clicks this? You cannot answer that from the README. You have to read the code. And when you read the code with that question in your head, the gaps are obvious in a way they never are during review.
>
> Three of the things we found:
>
> A volume alert let you set a threshold. The helper text under the field said "2x the 20-day average". The code compared the raw number of shares traded. So anyone who typed 2, following our own hint, built an alert that fired on every check from the opening bell. It had been live for months.
>
> One feature captured screenshots. Our README said it could read a chart from any tab, any platform. The code called getDisplayMedia with preferCurrentTab set to true. It could only ever see our own tab.
>
> A panel on the profile page showed how much a recurring mistake had cost you. The field it reads is written nowhere in the codebase. It had been empty for every user since the day it shipped.
>
> None of these were caught by tests, because tests check that code does what the code says. Nothing was checking that the code did what we said.
>
> So we built that. A script reads our automation worker, our constants file, and our pricing config, then asserts the published docs against them. If someone changes what a volume threshold means, the docs fail to build and name the page to fix.
>
> It caught a regression the same week. We split the docs into their own repo, the path to the app source stopped resolving, every check silently skipped, and the script still printed a green tick. A guard that passes without checking anything is worse than no guard, because you stop looking. Now it exits with an error and names every path it tried.
>
> Documentation is a test suite for the claims you make. We were shipping without one.
>
> docs.tradionlabs.com

**Length:** ~330 words. Long for LinkedIn, but build-story posts hold attention when every paragraph carries a concrete fact. Cut the third example if you want it tighter.

---

## X (single tweet)

> we wrote docs for our trading app and found 10 bugs doing it
>
> not from testing. from trying to write down what the product actually does
>
> the worst one: our volume alert said "2x the 20-day average" under the input box. the code compared raw share count
>
> anyone who typed 2, following our own hint, got an alert that fired every 60 seconds from the opening bell
>
> tests check that code does what the code says. nothing was checking that the code did what we said

**Length:** fits in one post on X Premium. For the 280 character limit, use the short version below.

### Short version (fits the 280 character limit, 270 used)

> we found 10 bugs writing our own docs
>
> our volume alert said "2x the 20-day average" on screen. the code compared raw share count, so anyone following our own hint built an alert that fired every minute
>
> tests check code against code. nothing checked code against claims

---

## X (thread, if you want more reach)

**1/**
> we wrote documentation for our trading platform and found 10 bugs doing it
>
> not from testing. from trying to write down what the thing actually does
>
> here are the three worst

**2/**
> our volume alert had a hint under the input: "2x the 20-day average"
>
> the code compared the raw number of shares traded today
>
> so if you typed 2, following our own instruction, you built an alert that fired on every check from the opening bell. live for months

**3/**
> our screenshot tool was documented as reading a chart from any tab or platform
>
> the code called getDisplayMedia with preferCurrentTab: true
>
> it could only ever see its own tab. it never could do the thing the README sold

**4/**
> a panel showed what a recurring mistake had cost you
>
> the field it reads is written nowhere in the codebase
>
> empty for every user since launch. nobody reported it, because an empty panel looks like you just have no data yet

**5/**
> none of this was caught by tests
>
> tests check that code does what the code says
>
> nothing was checking that the code did what WE said, in the README, in the UI copy, on the pricing page

**6/**
> so we wrote that check
>
> a script reads the worker, the constants, and the pricing config, then asserts the docs against them
>
> change what a volume threshold means and the docs fail to build, naming the page to fix

**7/**
> it caught itself the same week
>
> we split the docs into their own repo. the path to the app stopped resolving. every check skipped and it still printed a green tick
>
> a guard that passes without checking is worse than no guard. you stop looking

**8/**
> documentation is a test suite for the claims you make
>
> we were shipping without one
>
> docs.tradionlabs.com

---

## Notes before you post

**Check these are still true.** The volume bug is fixed and migrated, the Lens copy is corrected, and the dead components are deleted. Posting about bugs you have already fixed is the right move, but say so if anyone asks in the replies.

**The Recoverable P&L example has an open question.** `FINDINGS.md` #9 says the field is never written, but `server/index.js:2625` has a live enrichment path with a comment saying otherwise. One of the two is stale. Verify before you publish that third example, or drop it and keep the two you are certain of.

**Do not name the AI.** The story is stronger as an engineering practice than as a tool demo, and this audience is allergic to the latter.

**Expect the obvious reply:** "so your docs were wrong too". The honest answer is yes, twice, and both times the checker caught it. That is a better story than claiming otherwise.

# Handoff — passed-vs-true-demo (v1 plan ready to build; CLAUDE.md added)

**Date:** 2026-07-07
**Newest commit this brief describes:** `3a30fbb` (`docs: design spec for passed-vs-true-demo`) —
the only commit in the repo. Everything below (CLAUDE.md, the plan, this rewritten handoff) is
**uncommitted working tree** as of writing; pick-up measures drift from `3a30fbb` plus the
untracked files named here.

A standalone Next.js **static** site demoing two sibling repos as one argument about the gap
between **"passed" and "true"**: CLUE (`../upstream-label-correction`, pinned `c446f82`,
constructive) + correct-shaped-lies (`../correct-shaped-lies`, pinned `30b287b`, adversarial).
It only **reads** committed artifacts from those siblings.

## Current state

- **[built]** Design spec — `docs/superpowers/specs/2026-06-30-passed-vs-true-demo-design.md`,
  committed `3a30fbb`. Approved; self-reviewed.
  `re-verify:` `git -C ~/dev/passed-vs-true-demo show 3a30fbb --stat | grep design.md`

- **[built, this session]** v1 implementation plan —
  `docs/superpowers/plans/2026-07-07-passed-vs-true-demo.md`, 17 TDD tasks (scaffold → types+CSV →
  cross-check gate → fail-closed ingestion → 10 components → page → Playwright → manifest guard +
  README). Uncommitted.
  `re-verify:` `grep -c '^## Task' ~/dev/passed-vs-true-demo/docs/superpowers/plans/2026-07-07-passed-vs-true-demo.md` → expect `17`.

- **[built, this session]** `CLAUDE.md` at repo root — repo facts, commands, the 5 invariants,
  built-vs-planned status. Uncommitted.
  `re-verify:` `test -f ~/dev/passed-vs-true-demo/CLAUDE.md && grep -c 'Cross-check gates the build' ~/dev/passed-vs-true-demo/CLAUDE.md` → expect file present, `1`.

- **[verified, this session]** Pickup on the prior handoff came back GREEN. The load-bearing claims
  the plan rests on survived refutation:
  - Ingest cross-check: recomputed `catch_rate` per `tier×config` from all 180 `episodes.csv` rows
    equals `summary.csv` (all 6 groups).
    `re-verify:` from `~/dev/correct-shaped-lies`:
    `awk -F, 'NR>1{k=$1"|"$4;n[k]++;if($8!="")c[k]++}END{for(k in n)printf "%s %d/%d=%.4f\n",k,c[k]+0,n[k],(c[k]+0)/n[k]}' results/episodes.csv | sort`
    → T0 both 30/30=1.0000, T1|baseline 0/30=0.0000, T1|baseline+composition 30/30=1.0000,
    T2 both 0/30=0.0000. Compare to `results/summary.csv` column `catch_rate`.
  - CLUE F1 0.9143 (P 0.8421, R 1.0000; TP 16 / FP 3 / FN 0) with the "train partition, not blind
    test" caveat; COSMO 0.805 labeled robustness not validation.
    `re-verify:` `grep -nE '0\.9143|TP 16 / FP 3 / FN 0|train partition|0\.805' ~/dev/upstream-label-correction/docs/TRANSFER_VALIDATION_RUN.md`

- **[not started]** The app itself. No `package.json`, `lib/`, `components/`, `app/`, `scripts/`,
  `public/data/`, or tests exist yet.
  `re-verify:` `ls ~/dev/passed-vs-true-demo` → only `CLAUDE.md docs` (no `package.json`).

## Locked decisions

1. **Approach A — one unified narrative site**, not two separate explorers or a scrollytelling deck.
   Reason: only A delivers both a ~90s recruiter skim *and* research-grade drill-down in one artifact.
2. **Standalone repo**, sibling of the two sources — not built inside CLUE or CSL. Reason: it spans
   both; a separate repo enforces the read-only boundary and keeps deploy independent.
3. **Replay-first + optional live episode.** Reason: neither backend is deployed and both are heavy;
   determinism makes replaying committed artifacts legitimate, not a mock.
4. **CLUE is replay-only; only CSL gets the live path.** Reason: CLUE's loop is too heavy/fragile
   per-click; CSL's `smoke_episode.py` is one cheap episode. (v1 ships neither live path — see #9.)
5. **`public/data/*.json` is committed** (ingestion is a *local* snapshot step). Reason: the static
   host will not have the sibling repos, so generated data must be in-repo.
6. **Static export (`output: "export"`), no Node host for v1.** Reason: resolves the "fully static +
   has an API route" tension — the `/api/live-episode` route is an optional Phase-2 proxy only.
7. **Tech: Next 15 / TS 5.7 / Tailwind 4 / Recharts 2.15 / Vitest / Playwright.** Reason: matches the
   existing CLUE `../upstream-label-correction/web/` ecosystem (verified in its `package.json`).
8. **Plan filename uses today's date `2026-07-07`**, not the prior brief's aspirational `2026-07-02`.
   Reason: honest authorship date. Any doc/memory pointing at `2026-07-02-...` is stale — the real
   file is `docs/superpowers/plans/2026-07-07-passed-vs-true-demo.md`.
9. **v1 = replay site only; live-episode container = separate Phase-2 plan.** `LiveEpisodeRunner`
   ships in v1 as its honest fallback so the narrative is unchanged when Phase 2 wires the endpoint.
10. **GapAuditTimeline ships in v1** (spec had it optional). Reason: ingestion produces the data
    cheaply and the component is trivial.

## Reuse map

- **Build the plan, do not re-derive it.** `docs/superpowers/plans/2026-07-07-passed-vs-true-demo.md`
  contains complete, TDD-ordered code for every file — use `superpowers:subagent-driven-development`
  or `:executing-plans` to run it task by task.
- **Real artifacts to ingest (never fabricate numbers — read these):**
  - CSL `../correct-shaped-lies/results/{erosion,summary,episodes}.csv` + `results/degradation_curve.png`
  - CLUE `../upstream-label-correction/docs/{TRANSFER_VALIDATION_RUN,GAP_AUDIT}.md`
- **Stack idiom reference (do NOT build inside):** `../upstream-label-correction/web/` — same
  Next 15 / React 19 / Tailwind 4 / Recharts stack.
- **CLAUDE.md** at repo root already encodes the invariants and commands — read it first.

## Invariants

1. **Read-only boundary** — only reads ingested artifacts; never imports either sibling's code, never
   reimplements CSL/CLUE logic in TS. Violation → the demo becomes an unverifiable claim.
2. **Provenance mandatory** — every on-screen figure carries `{ sourceRepo, filePath, commitSha }`.
   Enforced at build by `validateManifest` (plan Task 17). Violation → a hand-typed number can slip in.
3. **Cross-check gates the build** — recompute `catch_rate` from `episodes.csv`; it MUST equal
   `summary.csv`. Missing/unparseable artifact or mismatch → ingest exits non-zero, build fails loudly.
   Never ship a placeholder/empty chart.
4. **Honesty tags** — F1 0.9143 always with the "train partition, not blind test" caveat; COSMO 0.805
   is robustness, never validation. (Enforced by `TransferValidationCard`'s own test, plan Task 10.)
5. **Live never fabricates** — v1 `LiveEpisodeRunner` falls back to the recorded replay with a visible
   banner; it never synthesizes a "live" result.
6. **Sibling repos are pinned inputs** — CLUE `c446f82`, CSL `30b287b`. Never modify them from here;
   re-pin deliberately (and update the manifest SHAs) if a bump is intended. Note both siblings
   currently have *unrelated* uncommitted files — harmless as long as the ingested artifacts are
   unchanged.
7. **Git** — do not run `git commit`/`git push`; hand paste-ready commands to Hossain.

## Open / next

**Next:** execute the plan starting at **Task 1 (scaffold + tooling)**, via
`superpowers:subagent-driven-development` (recommended) or `:executing-plans`. The plan is
fully self-contained; no design questions remain.

**Uncommitted work to land first** (hand these to Hossain; grouped by concern):
```bash
cd ~/dev/passed-vs-true-demo
# 1) the v1 build plan
git add docs/superpowers/plans/2026-07-07-passed-vs-true-demo.md
git commit -m "docs: v1 replay-site implementation plan"
# 2) repo onboarding doc + refreshed handoff (separate concern)
git add CLAUDE.md docs/HANDOFF.md
git commit -m "docs: add repo CLAUDE.md and refresh handoff"
```

**Blockers:** none for authoring code. Two environment caveats for *closing* the build:
`npm install` and `npx playwright install chromium` are required before Tasks 15–16 can go green
(the build/E2E gates need real deps), and per the git rule the agent hands over commits rather
than running them — so "green" must be confirmed by actually running `npm test && npm run build`,
not assumed.

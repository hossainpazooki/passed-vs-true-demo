# passed-vs-true-demo

A standalone Next.js **static site** that demos two sibling repos as **one argument** about
the gap between **"passed" and "true"**:

- **CLUE** (`../upstream-label-correction`, pinned `c446f82`) — constructive side: a closed loop
  that scores a label-error detector against ground truth. Headline artifact: transfer-validation
  **F1 0.9143** (precision 0.8421, recall 1.0000; TP 16 / FP 3 / FN 0), precisionFDA **train**
  partition — *not* blind real-world performance.
- **correct-shaped-lies / CSL** (`../correct-shaped-lies`, pinned `30b287b`) — adversarial side:
  a producer reaches `ACHIEVED` yet trips a held got-away oracle (a *correct-shaped lie*),
  producing a catch-rate **degradation curve** across tiers T0→T1→T2.

This repo **only reads** committed artifacts from those two siblings. It never imports their
code and never reimplements CSL/CLUE logic in TypeScript.

## Status (2026-07-07)

**Design and plan exist; the app is NOT built yet.** Do not describe any component as done.

- **[built]** Design spec — `docs/superpowers/specs/2026-06-30-passed-vs-true-demo-design.md` (committed `3a30fbb`).
- **[built]** v1 implementation plan — `docs/superpowers/plans/2026-07-07-passed-vs-true-demo.md`
  (17 TDD tasks). **This is the source of truth for the build — follow it task by task.**
- **[planned]** Everything else: scaffold, ingestion script, `lib/`, `components/`, `app/`, tests.
  Nothing under those paths exists yet.

## How it will work (per the plan)

```
Build time:  scripts/ingest.ts  reads ../correct-shaped-lies/results/*.csv (+ degradation_curve.png)
                                 reads ../upstream-label-correction/docs/{TRANSFER_VALIDATION_RUN,GAP_AUDIT}.md
                                 → cross-check → public/data/*.json + manifest.json  (COMMITTED)
Run time:    React components read only public/data/*.json  (fully static, output: "export")
```

## Commands (once scaffolded — Task 1 of the plan)

| Command | What |
|---|---|
| `npm run ingest` | Snapshot + cross-check sibling artifacts into `public/data/` (runs on `dev`/`build` via `pre*` hooks) |
| `npm run dev` | Ingest → Next dev server |
| `npm run build` | Ingest → static export to `out/` (no backend needed) |
| `npm test` | Vitest unit suite |
| `npm run e2e` | Playwright E2E against the built `out/` |

## Non-negotiable invariants (violate these and the demo defeats its own thesis)

1. **Read-only boundary.** Only reads ingested artifacts; never imports either sibling repo's code.
2. **Provenance is mandatory.** Every on-screen figure carries `{ sourceRepo, filePath, commitSha }`.
   Nothing is hand-typed — it traces to a committed artifact.
3. **Cross-check gates the build.** `scripts/ingest.ts` recomputes `catch_rate` per
   `tier×controller_config` from `episodes.csv` (`n_caught = count(caught_by != "")`) and asserts it
   equals `summary.csv`. Any missing/unparseable artifact or mismatch → **ingest exits non-zero,
   build fails loudly.** Never ship a placeholder/empty chart.
4. **Honesty tags, verbatim.** F1 0.9143 is ALWAYS shown with the "train partition, not blind test"
   caveat. COSMO **0.805** is robustness/characterization, **never** validation.
5. **Live path never fabricates.** v1 is deterministic replay. `LiveEpisodeRunner` ships fallback-only
   (visible "live unavailable — showing recorded run" banner); the real CSL container is a separate
   **Phase-2** plan. Never synthesize a "live" result.

## Tech stack

Next.js 15 (App Router, SSG `output: "export"`), TypeScript 5.7, Tailwind CSS 4, Recharts 2.15,
Vitest 3 + @testing-library/react (unit), Playwright 1.49 (E2E), tsx (ingestion). Chosen to match
the CLUE `../upstream-label-correction/web/` ecosystem.

## Working agreement (overrides / local notes)

- **Git:** default global rule applies — **do not run `git commit` / `git push`**; hand paste-ready
  commands to Hossain. The two sibling repos are **inputs, pinned by SHA** — never modify them from here.
- The sibling repos may have unrelated uncommitted files; that is fine as long as the pinned
  artifacts (`results/*.csv`, the two CLUE docs) are unchanged. Re-pin deliberately if you bump a SHA.

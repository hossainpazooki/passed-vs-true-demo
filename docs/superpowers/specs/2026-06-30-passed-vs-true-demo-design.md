# passed-vs-true-demo — design

**Date:** 2026-06-30
**Status:** approved design (pre-implementation-plan)
**Author:** Hossain (with Claude Code, brainstorming skill)

## 1. Purpose

A standalone frontend that illustrates and demos two sibling repos as **one connected
argument**:

- **CLUE** (`upstream-label-correction/`) — the *constructive* side: a closed loop that
  generates fidelity-verified synthetic multi-omics cohorts and measures a label-error
  detector against ground truth. Its lifecycle gate (`all_passed()` in the Go
  intent-controller) is the single authority for `ACHIEVED`.
- **correct-shaped-lies / CSL** (`correct-shaped-lies/`) — the *adversarial* side: it
  red-teams that very gate. A producer satisfies every evaluator (`ACHIEVED`) yet still
  trips a held "got-away" oracle — a **correct-shaped lie**. Three escalating adversary
  tiers (T0→T1→T2) produce a catch-rate **degradation curve** (composition-layer advantage
  0 → +1.00 → 0).

The two reuse the same lifecycle controller and eval contract. The unifying spine is the
gap between **"passed" and "true."**

### Audience & goal

Primary audience: **technical reviewers / hiring managers at top companies** — people who
will scrutinize the method. Goal: a layered artifact that delivers a **~90-second skim**
("this person builds adversarially-verified systems") *and* **research-grade drill-down**
(falsifiable claim, tiers, erosion result, real artifacts, explicit caveats). The
differentiator is rigor — including surfacing the work's *own* limits as a feature, not
fine print.

## 2. Run model

**Replay-first, with one optional live episode.**

- **Replay (default, static):** all narrative/replay content is pre-rendered (SSG) and reads
  pre-ingested JSON. CDN-cacheable; no backend needed for the core experience. Determinism in
  both repos (byte-identical artifacts) makes replay legitimate, not a mock.
- **Live (optional, CSL only):** a deployed container runs the *real* CSL stack for a single
  scripted episode. **CLUE is replay-only** — its closed loop (cohort generation + detector +
  Postgres) is too heavy and fragile to run per-click.

**Hosting note (resolves the "fully static + has an API route" tension):** the replay site is
SSG and can ship to any static/edge host. The live path does **not** require a Node host: by
default the SSG client calls the live container's endpoint **directly (CORS)**. The optional
`/api/live-episode` Next route handler is a convenience proxy used **only** when the demo is
deployed on a Node/edge runtime (to hide the container URL / add rate-limiting). v1 may ship
either way; the component contract (`LiveEpisodeRunner` → "get a real trajectory for seed X")
is identical.

## 3. Location & coupling

- A **new standalone repo**: `C:\Users\hossa\dev\passed-vs-true-demo\`, a sibling of
  `correct-shaped-lies/` and `upstream-label-correction/`. Its own git repo.
- It **only reads** ingested artifacts (with provenance); it never imports either repo's
  source. This boundary is enforced by being a separate repo.
- The single coupling point is the **build-time ingestion script**, which reads committed
  artifacts from the two siblings by relative path and snapshots them — pinned to a commit
  SHA — into the demo's `public/data/`. The source repos are *inputs*, not dependencies.
- Per the user's git rules: Claude outputs `git init` / commit commands; the user runs them.

## 4. Architecture

Standalone **Next.js (App Router) + TypeScript**. Two runtime modes share one component set:

```
Build time:
  ingestion script ──reads──> ../correct-shaped-lies/results/*.csv, /docs/degradation_curve.png
                    ──reads──> ../upstream-label-correction/docs/TRANSFER_VALIDATION_RUN.md, GAP_AUDIT.md
                    ──parse/normalize/cross-check──> public/data/*.json + provenance manifest

Run time (replay):  components ──read──> static public/data/*.json        [fully static]
Run time (live):    LiveEpisodeRunner ──POST /api/live-episode──> container (real csl stack)
                                       ──returns real trajectory JSON──> TrajectoryViewer
```

The **provenance manifest** is the honesty backbone: every on-screen figure carries
`{ sourceRepo, filePath, commitSha }`. Nothing is hand-typed; everything traces to a
committed artifact.

### Tech

Next.js App Router, TypeScript, Tailwind 4, Recharts (all already in the `web/` ecosystem).
SSG for all replay content; the live episode is reached either by a direct CORS call to the
container or via an optional `/api/live-episode` proxy (see §2 hosting note). Light
scroll/animation via CSS or Framer Motion (optional).

## 5. Page structure (single scroll narrative + drill-downs)

One spine — *passed ≠ true* — as a scrollytelling page with expandable depth:

1. **Hero** — the thesis: an action reports success; success isn't truth.
2. **The shared gate** — the lifecycle state machine (DECLARED→…→ACHIEVED/FAILED) +
   `all_passed()` both repos build on.
3. **CLUE (constructive)** — the closed loop; synthetic cohorts; detector-vs-ground-truth;
   the F1 0.914 transfer-validation card **with** its "not blind real-world performance"
   caveat; optional gap-audit hardening timeline (8 findings).
4. **CSL (adversarial)** — "correct-shaped lie" defined; tier explorer (T0→T1→T2); the
   **real degradation curve** from `erosion.csv`; a **trajectory viewer** (honest vs. lie:
   states + eval snapshots + held got-away verdict + which layer caught it).
5. **Honesty ledger** — "what this does and does *not* show," pulled from both repos' own
   caveats.

## 6. Components (each one job, testable in isolation)

| Component | Job | Depends on |
|---|---|---|
| `ArtifactProvider` | Load provenance-tagged JSON; expose typed accessors | `public/data/*.json` |
| `CaveatBadge` | Reusable provenance/limit tag (source + commit + "constructed signal" warnings) | manifest |
| `LifecycleStateMachine` | Animated DECLARED→…→ACHIEVED/FAILED diagram | static |
| `DegradationCurve` | Recharts chart from `erosion.csv` (catch baseline vs +composition, survived) | erosion JSON |
| `TierExplorer` | T0/T1/T2 selector → knowledge, optimizes-for, catch/survived, attribution | summary JSON |
| `TrajectoryViewer` | Episode timeline (states + eval snapshots + got-away verdict); drives replay **and** live | trajectory JSON |
| `TransferValidationCard` | F1 0.914 + caveat | CLUE transfer JSON |
| `GapAuditTimeline` | 8 findings → hardened gate | CLUE gap-audit JSON |
| `HonestyLedger` | "what this does / does not show" | manifest + caveats |
| `LiveEpisodeRunner` | Button → `/api/live-episode` → real trajectory; fallback to replay | live route |

## 7. Data sources (real artifacts)

**CSL** (`correct-shaped-lies/`):
- `results/erosion.csv` — the degradation curve (T0/T1/T2 × catch_baseline, catch_composition,
  composition_advantage, survived_baseline, survived_composition).
- `results/summary.csv` — per tier×config aggregate: catch_rate, survived_rate, attribution
  (e.g. `static_safety=30`, `cross_stage_consistency=30`).
- `results/episodes.csv` — per-episode trajectories (used for the trajectory viewer and the
  ingest cross-check).
- `results/degradation_curve.png` — the figure (also re-rendered live via Recharts).
- `scripts/smoke_episode.py` — one honest + one correct-shaped-lie episode end-to-end → the
  basis for the live path.

**CLUE** (`upstream-label-correction/`):
- `docs/TRANSFER_VALIDATION_RUN.md` — the F1 0.914 run record (P 0.842, R 1.000; TP 16 / FP 3 / FN 0).
- `docs/GAP_AUDIT.md` — the 8-finding hardening story.
- `evals/` — the eval stack (transfer_validation, mislabel_detection, fidelity_gate, …) for
  reference/labeling.

## 8. Live-episode mechanism (CSL only)

- **What runs:** a single scale-to-zero container booting the *real* Go controller + FastAPI
  `ml_service`, exposing an endpoint that triggers one scripted episode at a chosen seed and
  returns the **real trajectory JSON** — the actual `csl` code, never a TS reimplementation.
- **Guards:** concurrency cap + per-request timeout + rate limit; cold-start budget surfaced
  to the user ("warming the real stack…").
- **Honesty hooks (the theme applied to the demo itself):**
  - Every result is labeled `live (real stack), seed=X, ran <ts>` vs. `recorded, commit <sha>`.
  - Because the stack is deterministic, the live result for a canonical seed **must equal**
    the recorded artifact — the UI shows that match as a "verify it yourself" feature, and a
    **mismatch is surfaced as an anomaly, never hidden.**

## 9. Error handling

- **Build/ingestion:** missing or unparseable artifact → **build fails loudly** (never ship
  an empty/placeholder chart); the provenance manifest is validated at build.
- **Cross-check at ingest:** recompute `catch_rate` from `episodes.csv` and assert it equals
  `summary.csv` — a built-in verify-claim gate, so the demo can't display a number that
  disagrees with its own raw source.
- **Live endpoint down / timeout / over-capacity:** graceful fallback to the recorded replay
  with a visible banner ("live unavailable — showing recorded run"). **Never fabricate a live
  result.**

## 10. Testing

- **Unit:** each component renders from fixture JSON (`TrajectoryViewer`, `DegradationCurve`,
  `TierExplorer`, `CaveatBadge`).
- **Ingestion golden test:** parsed JSON matches the real CSVs; the recompute cross-check
  (§9) runs in CI.
- **E2E (Playwright):** narrative loads, charts render, the live button **falls back cleanly**
  when the endpoint is absent.
- **Live container smoke test:** endpoint returns a valid trajectory and it equals the
  recorded run for the canonical seed.
- **Lighthouse pass** (perf/a11y) — it's a portfolio piece.

## 11. Scope / non-goals

- **In:** the scroll narrative; replay of both repos' real artifacts; tier explorer;
  degradation curve; trajectory viewer; transfer-validation card; gap-audit timeline; honesty
  ledger; one CSL live-episode path with fallback.
- **Out:** no TS reimplementation of CSL/CLUE logic; no live CLUE backend; no auth/accounts;
  no artifact editing; not a general ops dashboard (`web/` already is that).

## 12. Open items (resolve during implementation planning)

- Exact host for the static site and for the live container (out of scope for this design;
  decide at deploy time).
- Whether the gap-audit timeline (CLUE) ships in v1 or is deferred (it's marked optional).
- Visual look/feel (typography, color, motion) — deferred to implementation; the structure
  above is fixed, the styling is not.

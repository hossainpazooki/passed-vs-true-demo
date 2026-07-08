# passed-vs-true-demo

A standalone site demoing two sibling repos as one argument about the gap between
**"passed" and "true."**

- **CLUE** (`../upstream-label-correction`, pinned `c446f82`) — the constructive side:
  a closed loop that scores a label-error detector against ground truth (transfer
  validation **F1 0.9143**, train partition — *not* blind real-world performance).
- **correct-shaped-lies** (`../correct-shaped-lies`, pinned `30b287b`) — the adversarial
  side: a producer reaches `ACHIEVED` yet trips a held got-away oracle (a *correct-shaped
  lie*), producing a catch-rate degradation curve.

## How it works

1. `npm run ingest` (auto-runs on `dev`/`build`) reads committed artifacts from the two
   sibling repos, **cross-checks** `catch_rate` recomputed from `episodes.csv` against
   `summary.csv`, and writes `public/data/*.json` + a provenance `manifest.json`. Any
   missing/unparseable artifact or cross-check mismatch **fails the build loudly**.
2. `npm run build` static-exports the site (`output: "export"`) to `out/` — no backend
   required for the replay experience.

## Invariants

- Every on-screen figure carries `{ sourceRepo, filePath, commitSha }` provenance.
- The train-partition caveat always accompanies F1 0.9143; COSMO 0.805 is labeled
  robustness, never validation.
- v1 is deterministic replay. The live CSL path (`LiveEpisodeRunner`) ships in its
  honest fallback only; wiring the real container is a separate Phase-2 plan.

## Commands

| Command | What |
|---|---|
| `npm run ingest` | Snapshot + cross-check sibling artifacts into `public/data/` |
| `npm run dev` | Local dev (ingest → Next dev) |
| `npm run build` | Ingest → static export to `out/` |
| `npm test` | Vitest unit suite |
| `npm run e2e` | Playwright E2E against the built site |

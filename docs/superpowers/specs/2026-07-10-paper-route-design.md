# Design spec — `/paper` route: technical formal writeup of the correct-shaped-lies result

**Date:** 2026-07-10. **Repo:** `passed-vs-true-demo` (Next.js 15 SSG, `output: "export"`,
TS 5.7, Tailwind 4). **Status:** approved design, pre-plan.

## Goal
Add a second route, `/paper`, that presents the **correct-shaped-lies** result to *technical
collaborators* as an IEEE-structured formal writeup — reusing the demo's ingested, cross-check-gated
artifacts so no quantitative claim is hand-typed. The existing single narrative page (`/`) is
unchanged and remains the combined "passed ≠ true" argument (CSL + CLUE). Ships to the existing
production deployment at `passed-vs-true-demo.vercel.app/paper`.

## Scope boundary (explicit)
- **In scope:** the CSL paper only — got-away oracle, T0/T1/T2 graded adversary, the composition
  layer, the `0 → +1.00 → 0` erosion curve, the §IV results table, the scope/limitations caveats.
  Wires to CSL artifacts: `erosion.json`, `summary.json`, `episodes.json`, `degradation_curve.png`.
- **Out of scope:** CLUE / transfer-validation F1 0.9143 — that stays on the narrative page. This
  paper contains no CLUE content, so `/paper` does NOT read `transfer_validation.json`.
- **Not touched:** the narrative page `/`, the ingestion pipeline, the 5 demo invariants, the
  sibling repos (read-only, pinned CSL `30b287b` / CLUE `c446f82`).

## Architecture
- **Route:** `app/paper/page.tsx`, static, part of `output: "export"` → prerendered to
  `out/paper/index.html`. Fully static; no runtime fetch.
- **Data source:** reads the same committed `public/data/*.json` bundle via the existing
  `ArtifactProvider` context. The cross-check gate in `scripts/ingest.ts` already recomputes
  `catch_rate` from `episodes.csv` and fails the build on mismatch — the paper inherits this, so a
  drifted number breaks the build rather than shipping. (On Vercel, `next build` serves the committed
  snapshot, same as the rest of the demo; the snapshot is the gated artifact.)
- **Prose:** authored TSX (not MDX — avoids adding an MDX dependency and `output: "export"` config
  risk). Verbose but zero new build surface.

## Components (new, under `components/paper/`)
Each has one purpose, reads from the `ArtifactProvider` bundle, and is independently testable:
- `Stat.tsx` — an inline provenance-bound number. Props: a key/path into the bundle (e.g. the T1
  `composition_advantage`). Renders the formatted value (`+1.00`) with a hover provenance badge
  `{sourceRepo, filePath, commitSha}`. Reuses the existing badge pattern from `HonestyLedger`/`CaveatBadge`.
- `ResultsTable.tsx` — the §IV table. Reads `summary.json` + `erosion.json`; renders per-tier
  `catch (baseline)`, `catch (+comp.)`, `composition advantage`, `survived (base → +comp.)`,
  `caught by` (`attribution` field, verbatim). No literals — every cell is a bundle value.
- `PaperFigure.tsx` — Fig 1. Wraps the existing interactive `DegradationCurve` inline, with the
  committed `degradation_curve.png` as a static `<figure>` fallback + caption.
- `PaperSection.tsx` — numbered-section wrapper (roman numerals, heading anchors). May reuse
  `Section` if it fits; else a thin paper-specific wrapper.
- `References.tsx` — the confirmed reference list (populated from the citation-verification pass;
  clean IEEE forms, no `*Verify:*` editorial notes).
- `ScopeCallout.tsx` — persistent styled callout carrying the "mechanism demonstration, not a
  frontier measurement" + "0/+1.00/0 are properties of these planted encodings" caveats.
- One optional disclosure reusing `TrajectoryViewer` ("explore a trajectory") — the only extra
  interactivity beyond the erosion figure; keeps the page reading like a paper.

## Content transformations (from the pasted draft → rendered page)
- **Author line:** `Hossain Pazooki`, contact `hossain@pazooki.com`. Co-authors + affiliation kept
  as visibly-styled `[placeholder]` (clearly TODO, never silently blank).
- **Strip** all HTML-comment editorial notes and the per-reference `*Verify:*` annotations from the
  rendered output — they are authoring scaffolding, not collaborator-facing.
- **Citations:** rendered as clean confirmed IEEE forms from the web-verification pass; any citation
  that cannot be confirmed is flagged in-page (e.g. "[preprint id unconfirmed]"), never asserted.
- **Artifact link:** to the public `correct-shaped-lies` repo (URL confirmed before inclusion).
- **Supplementary S1–S3:** rendered as a collapsed appendix labeled "uncounted."
- All section prose (Abstract, I–VI, References, Supplementary) ported verbatim in wording, with
  numbers replaced by `<Stat>`/`ResultsTable`/`PaperFigure`.

## Honesty invariants (must hold — same spirit as the demo's five)
1. **No hand-typed numbers** — every quantitative claim is a bundle value, test-enforced (below).
2. **Provenance visible** — each figure/number traces to `{sourceRepo, filePath, commitSha}`.
3. **Cross-check gates the build** — inherited from `scripts/ingest.ts`; unchanged.
4. **Scope caveat persistent** — the "demonstration not measurement" framing is on-page, not buried.
5. **Nothing fabricated** — unconfirmed citations flagged, placeholders visible, no invented results.

## Styling & deployment
- Single-column academic layout: numbered sections, figure captions, references list; print/PDF-friendly
  (`@media print`), responsive, theme-aware (Tailwind 4). Visually distinct from the marketing
  narrative but sharing the design system.
- Small cross-link header between `/` (narrative) and `/paper` (formal).
- **Deploy:** ships to the existing production site via `next build` (Vercel Build Command already
  overridden to `next build`; `vercel.json` in place). `/paper` becomes publicly reachable at
  `passed-vs-true-demo.vercel.app/paper`.

## Testing (enforces the honesty invariants)
- **Unit:** assert each `ResultsTable` cell and every `<Stat>` equals the corresponding ingested
  artifact value (pattern of the existing `TransferValidationCard` test) — makes "no hand-typed
  number" a test, not a hope. Assert `PaperFigure` data == `erosion.json`.
- **E2E (`e2e/paper.spec.ts`):** `/paper` renders; the `0/+1.00/0` erosion curve is present; the
  scope caveat is present; NO editorial-note or `*Verify:*` leakage; author line shows Hossain Pazooki.
- **Build gate:** `npm run ingest && npm test && npm run build` green with the new route; `npm run e2e` green.

## Deferred / non-goals
- MDX authoring, a PDF export button, embedding *every* interactive component, and any CLUE/F1
  content on this route are explicitly out of scope for v1.

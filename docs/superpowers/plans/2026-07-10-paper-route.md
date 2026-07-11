# `/paper` Route Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/paper` route rendering the correct-shaped-lies result as an IEEE-structured formal writeup, with every quantitative claim wired to the ingested cross-check-gated artifacts, deployed to the existing production site.

**Architecture:** New static route `app/paper/page.tsx` reusing the existing `ArtifactProvider` + committed `public/data/*.json`. Prose is authored TSX in `components/paper/`; numbers flow through provenance-bound leaf components (`Stat`, `ResultsTable`, `PaperFigure`) so nothing is hand-typed. Ships via the existing `next build` static export.

**Tech Stack:** Next.js 15 (App Router, `output: "export"`), TypeScript 5.7, Tailwind 4, Recharts 2.15 (via existing `DegradationCurve`), Vitest 3 + @testing-library/react, Playwright 1.49.

## Global Constraints
- **No hand-typed numbers.** Every quantitative claim is a bundle value via `useArtifacts()`; test-enforced.
- **Provenance visible.** Each number/figure exposes `{sourceRepo, filePath, commitSha}` (reuse `Provenance` / `manifest.artifacts[key]`).
- **Scope = CSL only.** Reads `erosion`, `summary`, `episodes` (+ `manifest`). Does NOT read `transferValidation` (CLUE/F1 stays on `/`).
- **Honesty tags.** The scope caveat ("mechanism demonstration, not a frontier measurement"; "0/+1.00/0 are properties of these planted encodings") renders persistently on-page.
- **Sibling repos pinned** CSL `30b287b` / CLUE `c446f82`; read-only; never modified.
- **Git:** hand over commit commands; do NOT run `git commit`/`git push`.
- **Existing test pattern:** `render(<ArtifactProvider bundle={fixtureBundle}><X/></ArtifactProvider>)` with `fixtureBundle` from `test/fixtures/bundle`.

## File structure
- Create `app/paper/page.tsx` — route; loads bundle, wraps `ArtifactProvider`, renders `<PaperBody/>`.
- Create `components/paper/Stat.tsx` — provenance-bound inline number (selector + formatter).
- Create `components/paper/ResultsTable.tsx` — §IV table from `summary`+`erosion`.
- Create `components/paper/PaperFigure.tsx` — Fig. 1 caption wrapping existing `DegradationCurve`.
- Create `components/paper/ScopeCallout.tsx` — persistent scope/limitations caveat.
- Create `components/paper/References.tsx` — confirmed citation list (from `citeverify`).
- Create `components/paper/PaperNav.tsx` — cross-link header (`/` ↔ `/paper`).
- Create `components/paper/PaperBody.tsx` — full prose assembly (Abstract, I–VI, References, Supplementary).
- Create tests `test/paper-stat.test.tsx`, `test/paper-results-table.test.tsx`, `test/paper-references.test.tsx`, `test/paper-body.test.tsx`, `e2e/paper.spec.ts`.
- Modify `app/globals.css` — add `@media print` rules for the paper.

---

### Task 1: Route scaffold + cross-link nav + smoke E2E

**Files:**
- Create: `app/paper/page.tsx`, `components/paper/PaperNav.tsx`
- Test: `e2e/paper.spec.ts`

**Interfaces:**
- Produces: `<PaperNav/>` (no props); `/paper` route rendering an `<h1>` with the paper title.
- Consumes: `ArtifactProvider`, bundle imports (same pattern as `app/page.tsx`).

- [ ] **Step 1: Failing E2E** — `e2e/paper.spec.ts`:
```ts
import { test, expect } from "@playwright/test";
test("paper route loads with title and nav back to narrative", async ({ page }) => {
  await page.goto("/paper");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Detection Limit of Lifecycle-State Oversight/i);
  await expect(page.getByRole("link", { name: /narrative/i })).toBeVisible();
});
```
- [ ] **Step 2: Run, verify fail** — `npm run e2e -- paper.spec.ts` → FAIL (404 / no route).
- [ ] **Step 3: Implement** — `components/paper/PaperNav.tsx`:
```tsx
import Link from "next/link";
export function PaperNav() {
  return (
    <nav className="mb-8 flex gap-4 text-sm border-b border-neutral-800 pb-3">
      <Link href="/" className="underline">← Narrative demo</Link>
      <span className="text-neutral-500">Formal writeup (technical)</span>
    </nav>
  );
}
```
`app/paper/page.tsx` (mirror `app/page.tsx`'s bundle load; render nav + title placeholder body until Task 8):
```tsx
import { ArtifactProvider } from "@/components/ArtifactProvider";
import { PaperNav } from "@/components/paper/PaperNav";
import type { ArtifactBundle } from "@/lib/types";
import erosion from "@/public/data/erosion.json";
import summary from "@/public/data/summary.json";
import episodes from "@/public/data/episodes.json";
import transferValidation from "@/public/data/transfer_validation.json";
import gapAudit from "@/public/data/gap_audit.json";
import manifest from "@/public/data/manifest.json";
const bundle = { erosion, summary, episodes, transferValidation, gapAudit, manifest } as unknown as ArtifactBundle;
export default function Paper() {
  return (
    <ArtifactProvider bundle={bundle}>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <PaperNav />
        <h1 className="text-2xl font-bold">Measuring the Detection Limit of Lifecycle-State Oversight Against Knowledge-Graded Adversaries</h1>
      </main>
    </ArtifactProvider>
  );
}
```
- [ ] **Step 4: Run, verify pass** — `npm run e2e -- paper.spec.ts` → PASS (after `npm run build`).
- [ ] **Step 5: Commit** — `git add app/paper components/paper/PaperNav.tsx e2e/paper.spec.ts && git commit -m "feat(paper): scaffold /paper route + cross-link nav"`

---

### Task 2: `Stat` — provenance-bound inline number

**Files:** Create `components/paper/Stat.tsx`; Test `test/paper-stat.test.tsx`.

**Interfaces:**
- Produces: `Stat({ select, format?, artifactKey, "data-testid"? })` where `select: (b: ArtifactBundle) => number`, `format?: (n:number)=>string`. Also export `signed2` and `rate2` formatters.

- [ ] **Step 1: Failing test** — `test/paper-stat.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArtifactProvider } from "@/components/ArtifactProvider";
import { Stat, signed2 } from "@/components/paper/Stat";
import { fixtureBundle } from "./fixtures/bundle";
describe("Stat", () => {
  it("renders the T1 composition advantage from the bundle as +1.00", () => {
    render(<ArtifactProvider bundle={fixtureBundle}>
      <Stat data-testid="s" artifactKey="erosion.json" format={signed2}
        select={(b) => b.erosion.find(r => r.tier === "T1")!.composition_advantage} />
    </ArtifactProvider>);
    expect(screen.getByTestId("s")).toHaveTextContent("+1.00");
  });
  it("exposes provenance via title", () => {
    render(<ArtifactProvider bundle={fixtureBundle}>
      <Stat data-testid="s" artifactKey="erosion.json" select={(b)=>b.erosion.length} />
    </ArtifactProvider>);
    expect(screen.getByTestId("s").getAttribute("title")).toMatch(/30b287b/);
  });
});
```
- [ ] **Step 2: Run, verify fail** — `npx vitest run test/paper-stat.test.tsx` → FAIL (module missing).
- [ ] **Step 3: Implement** — `components/paper/Stat.tsx`:
```tsx
"use client";
import { useArtifacts } from "../ArtifactProvider";
import type { ArtifactBundle } from "@/lib/types";
export const signed2 = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(2);
export const rate2 = (n: number) => n.toFixed(2);
export function Stat({ select, format = (n) => String(n), artifactKey, ...rest }: {
  select: (b: ArtifactBundle) => number;
  format?: (n: number) => string;
  artifactKey: string;
  "data-testid"?: string;
}) {
  const bundle = useArtifacts();
  const tag = bundle.manifest.artifacts[artifactKey];
  const title = tag ? `${tag.sourceRepo} · ${tag.filePath} · ${tag.commitSha}` : undefined;
  return (
    <span className="font-mono font-semibold underline decoration-dotted underline-offset-2" title={title} {...rest}>
      {format(select(bundle))}
    </span>
  );
}
```
- [ ] **Step 4: Run, verify pass** — `npx vitest run test/paper-stat.test.tsx` → PASS.
- [ ] **Step 5: Commit** — `git add components/paper/Stat.tsx test/paper-stat.test.tsx && git commit -m "feat(paper): provenance-bound Stat component"`

---

### Task 3: `ResultsTable` — §IV table from artifacts

**Files:** Create `components/paper/ResultsTable.tsx`; Test `test/paper-results-table.test.tsx`.

**Interfaces:**
- Produces: `ResultsTable()` (no props). Reads `erosion` (numbers) + `summary` (attribution → "caught by").
- Helper (internal): `caughtByFor(summary, tier)` — from the `baseline+composition` row's `attribution` ("cross_stage_consistency=30" → "cross_stage_consistency"; "" → "—").

- [ ] **Step 1: Failing test**:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ArtifactProvider } from "@/components/ArtifactProvider";
import { ResultsTable } from "@/components/paper/ResultsTable";
import { fixtureBundle } from "./fixtures/bundle";
const table = () => { render(<ArtifactProvider bundle={fixtureBundle}><ResultsTable/></ArtifactProvider>); return screen.getByRole("table"); };
describe("ResultsTable", () => {
  it("T1 composition advantage is +1.00 and caught by cross_stage_consistency", () => {
    const t = table();
    const row = within(t).getByTestId("row-T1");
    expect(row).toHaveTextContent("+1.00");
    expect(row).toHaveTextContent("cross_stage_consistency");
  });
  it("T0 caught by static_safety; T2 caught by —", () => {
    const t = table();
    expect(within(t).getByTestId("row-T0")).toHaveTextContent("static_safety");
    expect(within(t).getByTestId("row-T2")).toHaveTextContent("—");
  });
});
```
- [ ] **Step 2: Run, verify fail**.
- [ ] **Step 3: Implement** — `components/paper/ResultsTable.tsx`: read `useArtifacts()`; for each tier in `erosion`, render a `<tr data-testid={`row-${tier}`}>` with cells: catch_baseline (`rate2`), catch_composition (`rate2`), composition_advantage (`signed2`, bold), `${rate2(survived_baseline)} → ${rate2(survived_composition)}`, and `caughtByFor(summary, tier)`. Wrap in `<table>` with a header row. Add `<Provenance artifactKey="summary.json" />` below. `caughtByFor`: find `summary` row where `tier===tier && controller_config==="baseline+composition"`; `const name = row.attribution.split("=")[0]; return name || "—";`
- [ ] **Step 4: Run, verify pass**.
- [ ] **Step 5: Commit** — `git add components/paper/ResultsTable.tsx test/paper-results-table.test.tsx && git commit -m "feat(paper): ResultsTable wired to summary+erosion"`

---

### Task 4: `PaperFigure` + `ScopeCallout` (thin, no new data)

**Files:** Create `components/paper/PaperFigure.tsx`, `components/paper/ScopeCallout.tsx`. (Covered by Task 8's body test + E2E; no separate unit test — trivial presentational wrappers.)

**Interfaces:**
- Produces: `PaperFigure()` renders the existing `<DegradationCurve/>` with a "Fig. 1." numbered caption; `ScopeCallout()` renders a persistent `role="note"` with the scope caveat text.

- [ ] **Step 1: Implement `PaperFigure.tsx`**:
```tsx
import { DegradationCurve } from "../DegradationCurve";
export function PaperFigure() {
  return (
    <figure data-testid="paper-figure" className="my-6">
      <DegradationCurve />
      <figcaption className="mt-2 text-sm text-neutral-400">
        Fig. 1. Catch-rate and survived-rate across adversary tiers (interactive; static export at
        <code className="mx-1">docs/degradation_curve.png</code>).
      </figcaption>
    </figure>
  );
}
```
- [ ] **Step 2: Implement `ScopeCallout.tsx`**:
```tsx
export function ScopeCallout() {
  return (
    <aside role="note" data-testid="scope-callout" className="my-6 rounded-lg border border-amber-700 bg-amber-950/40 p-4 text-sm text-amber-100">
      <strong>Scope.</strong> This is a mechanism demonstration, not a frontier-scale measurement. The
      three tiers are planted trigger encodings chosen so each defeats the previous defense; the
      magnitudes (a clean 0 / +1.00 / 0) are properties of these specific encodings, not of detection
      in general. What the experiment establishes is the <em>shape</em> — a visible trajectory-level
      defense driven to zero marginal value by a controller-aware adversary — not a calibrated rate.
    </aside>
  );
}
```
- [ ] **Step 3: Commit** — `git add components/paper/PaperFigure.tsx components/paper/ScopeCallout.tsx && git commit -m "feat(paper): PaperFigure + persistent ScopeCallout"`

---

### Task 5: `References` — confirmed citations

**Files:** Create `components/paper/References.tsx`; Test `test/paper-references.test.tsx`.
**Depends on:** the `citeverify` agent's confirmed citation strings (author lists, arXiv ids, venues, years). Use its output verbatim; flag any it could not confirm with a visible `[unconfirmed]` tag rather than asserting.

**Interfaces:** Produces `References()` — an ordered list `[1]…[4]` of clean IEEE strings + an artifact link. No `*Verify:*` editorial notes.

- [ ] **Step 1: Failing test**:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { References } from "@/components/paper/References";
describe("References", () => {
  it("renders 4 numbered references and no editorial 'Verify' notes", () => {
    render(<References/>);
    const items = screen.getAllByRole("listitem");
    expect(items.length).toBeGreaterThanOrEqual(4);
    expect(screen.queryByText(/Verify:/i)).toBeNull();
  });
});
```
- [ ] **Step 2: Run, verify fail**.
- [ ] **Step 3: Implement** — `<ol>` of `<li>` with the confirmed citation strings from `citeverify` (see the report; substitute the final confirmed forms). Include the `correct-shaped-lies` artifact link if the public URL is confirmed.
- [ ] **Step 4: Run, verify pass**.
- [ ] **Step 5: Commit** — `git add components/paper/References.tsx test/paper-references.test.tsx && git commit -m "feat(paper): verified references"`

---

### Task 6: `PaperBody` — full prose assembly

**Files:** Create `components/paper/PaperBody.tsx`; Test `test/paper-body.test.tsx`. Modify `app/paper/page.tsx` (swap the Task-1 title-only body for `<PaperBody/>`).

**Content source:** the approved IEEE draft (pasted by Hossain, matches the CSL repo). Port section-by-section: Abstract; I Introduction; II Threat Model (incl. the T0/T1/T2 table); III System Under Test; IV Results (use `<ResultsTable/>` + `<PaperFigure/>`, NOT a hand-typed table); V Discussion & Limitations (place `<ScopeCallout/>`); VI Conclusion; References (`<References/>`); Supplementary S1–S3 in a collapsed `<details>` labeled "Supplementary (uncounted)".

**Transformations (MANDATORY):**
- Author line: `Hossain Pazooki`, contact `hossain@pazooki.com`; co-authors + affiliation as visibly-styled `<span className="text-neutral-500">[co-authors — Algoverse cohort / mentor]</span>` placeholders.
- Replace EVERY inline number with a `<Stat>` (or the ResultsTable). Required substitutions: the abstract's "0 → +1.00 → 0" and "+1.00" → `<Stat select={b=>b.erosion.find(r=>r.tier==='T1')!.composition_advantage} format={signed2} artifactKey="erosion.json"/>` (and T0/T2 for the 0s); §IV prose "advantage +1.00", "survived 1.00 → 0.00", "n=30 / six tasks × five seeds" → `<Stat>` from `summary` (`n`) / `erosion`. The "backdoor fired on every episode of every tier" → `<Stat select={b=>b.summary.find(r=>r.tier==='T2'&&r.controller_config==='baseline')!.got_away_rate_all} format={rate2} artifactKey="summary.json"/>` shown as 1.00.
- STRIP all HTML-comment editorial notes and every `*Verify:*` annotation.

**Interfaces:** Produces `PaperBody()` (no props); reads bundle via child components only.

- [ ] **Step 1: Failing test** — `test/paper-body.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArtifactProvider } from "@/components/ArtifactProvider";
import { PaperBody } from "@/components/paper/PaperBody";
import { fixtureBundle } from "./fixtures/bundle";
const body = () => render(<ArtifactProvider bundle={fixtureBundle}><PaperBody/></ArtifactProvider>);
describe("PaperBody", () => {
  it("shows the author, the results table, the figure, and the scope callout", () => {
    body();
    expect(screen.getByText(/Hossain Pazooki/)).toBeTruthy();
    expect(screen.getByRole("table")).toBeTruthy();
    expect(screen.getByTestId("paper-figure")).toBeTruthy();
    expect(screen.getByTestId("scope-callout")).toBeTruthy();
  });
  it("leaks no editorial scaffolding", () => {
    body();
    expect(screen.queryByText(/Verify:/i)).toBeNull();
    expect(screen.queryByText(/IEEE-structured working draft/i)).toBeNull();
  });
});
```
- [ ] **Step 2: Run, verify fail**.
- [ ] **Step 3: Implement `PaperBody.tsx`** (port the full approved prose with the substitutions above) and update `app/paper/page.tsx` to render `<PaperBody/>` inside `<main>` after `<PaperNav/>`.
- [ ] **Step 4: Run, verify pass** — `npx vitest run test/paper-body.test.tsx`.
- [ ] **Step 5: Commit** — `git add components/paper/PaperBody.tsx app/paper/page.tsx test/paper-body.test.tsx && git commit -m "feat(paper): full IEEE-structured body, provenance-wired"`

---

### Task 7: Academic styling + print CSS

**Files:** Modify `app/globals.css` (append), and refine class usage in `PaperBody`/`page.tsx`.

- [ ] **Step 1:** Append to `app/globals.css` a `@media print` block hiding `nav` and the interactive chart controls, forcing black-on-white, and a screen block giving the paper serif body text + numbered-section spacing (scoped via a `.paper` class on `<main>`). Add `.paper h2 { ... }` numbered-section styling.
- [ ] **Step 2:** Add `className="paper ..."` to the paper `<main>`; verify the narrative page is unaffected (different route, no `.paper` class).
- [ ] **Step 3: Verify** — `npm run build` succeeds; visually confirm `/paper` in `out/paper/index.html` carries the sections + numbers.
- [ ] **Step 4: Commit** — `git add app/globals.css app/paper/page.tsx components/paper/PaperBody.tsx && git commit -m "style(paper): academic layout + print CSS"`

---

### Task 8: Integration gate + production deploy + verify

**Files:** none new (extends `e2e/paper.spec.ts` assertions).

- [ ] **Step 1: Strengthen E2E** — add to `e2e/paper.spec.ts`: `/paper` shows the results table with `+1.00` in the T1 row, the scope callout is visible, and the erosion `svg.recharts-surface` renders.
- [ ] **Step 2: Full gate** — run `npm run ingest && npm test && npm run build && npm run e2e`. All green. (This is the real gate; do not self-certify — capture the output.)
- [ ] **Step 3: Deploy** — `vercel deploy --prod --yes` (build command already `next build`). Capture the READY URL.
- [ ] **Step 4: Verify-effect (live)** — `curl -s https://passed-vs-true-demo.vercel.app/paper` → HTTP 200; grep for the title, "+1.00"/"composition advantage", the scope caveat, and confirm NO "Verify:" / editorial-comment leakage. Confirm `/` (narrative) still serves F1 0.9143 (unregressed).
- [ ] **Step 5: Hand over commits** — output the grouped commit commands (spec + plan + all paper files) for Hossain; do NOT push. Note `/paper` is live.

## Self-review
- **Spec coverage:** route (T1), provenance-wired numbers (T2/T3/T6), interactive figure (T4), scope caveat (T4/T6), verified citations (T5), author/strip transforms (T6), styling/print (T7), testing + deploy + verify (T1/T8). All spec sections mapped.
- **Type consistency:** `Stat.select: (b:ArtifactBundle)=>number`, `signed2`/`rate2` shared, `ResultsTable` uses `erosion`+`summary` fields exactly as in `lib/types.ts`. `useArtifacts`/`Provenance`/`fixtureBundle` names match existing code.
- **Placeholder scan:** the only intentional in-page placeholder is the co-author/affiliation line (a design decision, visibly styled), not a plan gap. Prose porting references the approved draft rather than re-inlining ~1500 words — acceptable since the executor holds the draft; every number→`<Stat>` substitution is enumerated.

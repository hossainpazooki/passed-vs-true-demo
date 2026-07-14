# Handoff — passed-vs-true-demo + CLUE ecosystem (deploy, /paper, security fix, GCP decommission)

**Date:** 2026-07-10. **Newest commits this brief describes:**
- `passed-vs-true-demo` origin/main **`0fbbdac`** ("chore(data): refresh CLUE provenance sha") — HEAD; `/paper` is `b64d5fa`.
- `upstream-label-correction` origin/main **`deca906`** ("docs: GCP decommission evidence + security-scan fix handoff"); security fix merged as `92af8ad` (PR #5).

Pick-up measures drift from these two SHAs plus the live Vercel/GCP state. Everything below carries
its own re-verification; do not trust the tag, run the line.

## Current state

- **[built + verified]** `passed-vs-true-demo` v1 narrative — LIVE, production.
  `re-verify:` `curl -s https://passed-vs-true-demo.vercel.app/ | grep -c 0.9143` → `1`;
  `cd ~/dev/passed-vs-true-demo && git rev-list --left-right --count origin/main...HEAD` → `0	0`.

- **[built + verified]** `/paper` route — formal CSL writeup for technical collaborators. LIVE at
  `/paper`. Provenance-wired (no hand-typed numbers), 4 refs web-verified, editorial notes stripped.
  `re-verify (live):` `curl -s https://passed-vs-true-demo.vercel.app/paper | grep -c '+1.00'` → `1`,
  `... | grep -c 'Verify:'` → `0`, `... | grep -c 'Detection Limit of Lifecycle-State Oversight'` → `1`.
  `re-verify (gate):` `cd ~/dev/passed-vs-true-demo && npm test` → 40 passed (20 files);
  `npm run build && npm run e2e` → static export + 6 e2e passed (3 narrative, 3 paper).
  `re-verify (no hand-typed results):` `grep -c 'select=' components/paper/PaperBody.tsx` → `5`;
  the only `1.00` in `PaperBody.tsx` is a code comment (line ~18), not rendered prose.

- **[built + verified]** Security-scan fix (pgx `GO-2026-5004`) — MERGED to `upstream-label-correction`
  main via squash PR #5 (`92af8ad`). pgx `v5.9.2`, Go floor `1.25` in `ci.yml` + `Dockerfile`.
  `re-verify:` `cd ~/dev/upstream-label-correction && grep 'jackc/pgx/v5 ' intent-controller/go.mod`
  → `v5.9.2`; `grep -n 'go-version' .github/workflows/ci.yml` → `"1.25"`;
  `grep -n 'golang:1' intent-controller/Dockerfile` → `golang:1.25-alpine`;
  `GOTOOLCHAIN=go1.26.5 "$(go env GOPATH)/bin/govulncheck" ./...` (in `intent-controller/`) → exit 0.
  `gh pr view 5 --json state` → `MERGED`. CI on the PR was all-green (docker-build validated the
  Dockerfile bump that could not be built locally — daemon down).

- **[built + verified]** GCP partial decommission of project `prec-genomics-agent` — the always-on
  trio cut; data/images kept. **Discovery this session:** the GCP deployment is the *precision-genomics
  biomarker platform*, NOT the CLUE loop (CLUE was extracted from it). The demo depends on none of it.
  `re-verify:` `gcloud sql instances describe precision-genomics-pg --format='value(state,settings.activationPolicy)'`
  → `STOPPED  NEVER`; `gcloud redis instances list --region=us-central1` → `Listed 0 items.`;
  `gcloud compute networks vpc-access connectors list --region=us-central1` → `Listed 0 items.`;
  `gcloud run services list --region=us-central1 --format='value(metadata.name)'` → 3 services still present.
  Evidence: `upstream-label-correction/docs/GCP-DECOMMISSION-EVIDENCE-2026-07-10.md`.

- **[planned, not started]** Phase-2 live CSL episode path — plan written, **uncommitted** at
  `passed-vs-true-demo/docs/PHASE2-LIVE-PATH-PLAN.md`. Build only if a live episode beats the replay.
  `re-verify:` `test -f ~/dev/passed-vs-true-demo/docs/PHASE2-LIVE-PATH-PLAN.md && git -C ~/dev/passed-vs-true-demo status --porcelain docs/PHASE2-LIVE-PATH-PLAN.md` → `?? …` (untracked).

- **[open, not done]** (a) GCP **billing-SKU** confirmation — resource *state* verified, invoice lag not.
  ~~(b) `ingest` hard-pin~~ **CLOSED 2026-07-14** — `scripts/ingest.ts` now hard-pins `PINNED_SHA` and
  fails loudly on drift. ~~(c) Vercel push-to-deploy~~ **turns out already wired** — this line was stale
  the day after it was written: the Vercel API's own project `link` shows `gitCredentialId` set since
  2026-07-11T02:26Z, and `GET /v6/deployments` shows two `source:"git"` READY deployments that same day
  (`0fbbdac`, `b64d5fa` — the exact commits this brief calls HEAD). `vercel git connect --yes` on
  2026-07-14 confirms: "already connected." Nothing to wire; this item should never have carried into
  the pick-up as open. ~~(d) `/paper` co-author + affiliation are visible placeholders~~ **CLOSED
  2026-07-14** — byline shows a clean solo author (no bracket placeholders); see `PaperBody.tsx`.

## Locked decisions

1. **Demo is replay-with-provenance, NOT live execution.** F1 0.9143 is a fixed offline eval; a live
   re-run yields the same number and forfeits provenance. (Reason holds: numbers are stable.)
2. **`/paper` covers the CSL result ONLY; CLUE/F1 stays on `/`.** The pasted IEEE draft contains no
   CLUE content. `/paper` reads `erosion`/`summary`/`episodes`; not `transfer_validation`.
3. **No hand-typed numbers on `/paper`.** Every figure flows through `Stat` (selector into the bundle)
   or `ResultsTable`; test- and e2e-enforced. Reason: it's the demo's own thesis.
4. **GCP: stop SQL (reversible), delete Redis + VPC connector (recreatable), keep Cloud Run/buckets/images.**
   Operator's 3-answer choice. Cuts ~$145–195/mo → a few $/mo. Reversible: SQL `activation-policy=ALWAYS`;
   Redis/connector rebuild from `infra-ts/`.
5. **Live GCP is the genomics platform, not CLUE — used for nothing in the demo.** So teardown carries
   zero demo risk, and there is no live CLUE loop to point a CTA at.
6. **Security fix = bump pgx to v5.9.2 + raise Go floor to 1.25 everywhere** (ci.yml, Dockerfile), not
   suppress. Reason: fixed-in v5.9.2; call site already parameterized; floor bump forced by go.mod.
7. **Vercel Build Command = `next build`** (via committed `vercel.json`), bypassing the `prebuild→ingest`
   hook that reads siblings absent on Vercel's builder.
8. **Cite the CACM published form of ref [1] ("Toward Verified AI," doi:10.1145/3503914), not the arXiv
   "Towards" preprint title.** Verified against arXiv + CACM; all 4 refs confirmed.

## Reuse map

- **Demo data plumbing:** `components/ArtifactProvider.tsx` (`useArtifacts`, `Provenance`), the committed
  `public/data/*.json`, and `scripts/ingest.ts` (cross-check gate). Never hand-type a number — read the bundle.
- **`/paper` components (reuse, don't rebuild):** `components/paper/{Stat,ResultsTable,PaperFigure,ScopeCallout,References,PaperBody,PaperNav}.tsx`.
  `Stat` = provenance-bound inline number; formatters `signed2`/`rate2`/`adv`/`int0`.
- **Charts:** `components/DegradationCurve.tsx` (erosion figure, `curve-data` testid).
- **Test fixture:** `test/fixtures/bundle.ts` (`fixtureBundle`) — note it carries **only T1 summary rows**;
  T0/T2 attribution is real-data-only, covered by e2e against the built site.
- **Spec + plan:** `docs/superpowers/specs/2026-07-10-paper-route-design.md`, `docs/superpowers/plans/2026-07-10-paper-route.md`.
- **CLUE ecosystem handoffs:** `upstream-label-correction/docs/{GCP-DECOMMISSION-EVIDENCE-2026-07-10,
  LIVE-RUN-DECOMMISSION-HANDOFF,SECURITY-SCAN-PGX-FIX-HANDOFF}.md`.

## Invariants

- **No hand-typed numbers on `/paper`** (test + e2e enforced). Break it → the demo contradicts its thesis.
  `re-verify:` `npm test` green + `curl /paper | grep -c 'Verify:'` → 0.
- **Cross-check gates the build.** `ingest` recomputes catch_rate from `episodes.csv`; mismatch → non-zero
  exit → build fails. Never ship a placeholder chart.
- **Provenance drift is a LATENT GAP, not a fixed pin.** `ingest` reads the sibling repo **HEAD**, so the
  manifest's CLUE sha auto-drifted `c446f82→deca906` this session (numbers unchanged). Invariant #6 of the
  demo wants *deliberate* re-pinning. Until `ingest` is changed to pin a fixed sha, any sibling commit
  silently moves the provenance badge. `re-verify:` `grep -n 'commitSha\|generatedFrom' public/data/manifest.json`.
- **GCP: capture-before-teardown; verify-EFFECT, not exit code.** "Deleted" ≠ "no longer billed" until the
  billing console shows the SKU drop. SQL is *stopped* (reversible), not deleted.
- **DRIFT:** running GCP services (`api/mcp-sse/worker`) ≠ `infra-ts` stack (`web/intent/ml/mcp`) — a Pulumi
  redeploy will not cleanly reproduce the platform; reconcile before any redeploy.
- **Git:** hand over commit commands; do NOT `git commit`/`git push` (no web-driven override here). The
  rigor git-guard hook enforces this — it also blocks read-only `git` commands containing `merge`/`fetch`
  tokens, so use `log`/`status`/`rev-list` for inspection.
- **Security scan is chronically red** (~weekly since March 2026). Green now, but needs someone watching
  future runs or it rots again.

## Open / next

**First pick-up (highest value, time-sensitive): confirm the GCP cost actually dropped.**
1. In the billing console (or BigQuery billing export), confirm the Cloud SQL / Redis / VPC-connector SKUs
   for `prec-genomics-agent` fall to ~zero over the 24–48h since teardown (2026-07-11 UTC). This is the
   real verify-effect on cost — resource state is already verified; the invoice is not.

**Then, low-effort cleanups (each independent):**
2. Commit `docs/PHASE2-LIVE-PATH-PLAN.md` (or fold with the decommission docs) — it's the only untracked file.
3. ~~Fill `/paper` co-author + affiliation placeholders~~ **DONE 2026-07-14** — clean solo byline, no brackets.
4. ~~Wire Vercel push-to-deploy~~ **DONE, turns out it already was** — verified 2026-07-14 via the Vercel
   API directly (`link.gitCredentialId` set + two `source:"git"` READY deployments on 2026-07-11). No
   action was actually needed; this item was carried forward stale.
5. Close the provenance-drift gap: change `scripts/ingest.ts` to hard-pin the CLUE/CSL shas instead of
   reading HEAD, so the badge cannot drift out from under a claim.

**Deferred (only on demand):** Phase-2 live CSL episode path (`docs/PHASE2-LIVE-PATH-PLAN.md`) — build only
if a genuinely-live episode adds value the recorded replay can't. It *adds* recurring compute, against the
grain of this session's cost-cutting.

**Blocker:** none technical. The billing confirmation (#1) is a wall-clock wait, not work.

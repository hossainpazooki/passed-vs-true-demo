# Plan (for review) — Phase-2 live episode path for passed-vs-true-demo

**Status:** PROPOSED, not started. This is path #3 of the "three paths" — the *highest*
compute-spend option because it adds a running backend (even scale-to-zero) where v1 has none.
Written 2026-07-10 for Hossain to review before any build.

## Why this exists
v1 ships `LiveEpisodeRunner` as **fallback-only**: it shows the recorded replay behind a visible
"live unavailable — showing recorded run" banner and never synthesizes a live result (invariant #5).
The `app/api/live-episode` route is a committed **stub**. Phase 2 makes one side genuinely live.

## Locked constraints carried from v1 (do NOT relitigate here)
- **CLUE is replay-only.** Its closed loop is too heavy/fragile to run per click. The headline
  F1 0.9143 is a fixed offline eval — a live re-run yields the *same* number and forfeits
  provenance. Phase 2 does **not** make CLUE live. (Reinforced by the 2026-07-10 GCP probe: the
  live GCP deployment is a *genomics* platform, not the CLUE loop — there is nothing to point a
  live CLUE call at. See `upstream-label-correction/docs/LIVE-RUN-DECOMMISSION-HANDOFF.md`.)
- **Only CSL gets the live path.** CSL's `smoke_episode.py` is one cheap, deterministic-ish
  episode (a producer reaching ACHIEVED while tripping the got-away oracle → a "correct-shaped
  lie"). That is the only live surface in scope.
- **The demo stays static (`output: "export"`).** The live path is a *separate* compute surface
  the static site *calls*, not a server the site becomes.
- **Live never fabricates.** A live result must be *computed*, provably (vary an input → output
  changes). If the backend is down, fall back to the recorded replay with the banner — never a
  canned "live" answer.

## Open design decision — where CSL runs (pick one before building)
`smoke_episode.py` is Python; it cannot run inside the static export. Options, cheapest first:

| Option | Compute surface | ~Cost | Trade-off |
|---|---|---|---|
| **A. Vercel Function (Python)** | `app/api/live-episode` becomes a real Python serverless fn on Vercel | ~$0 idle, pay-per-invoke | Simplest; but must vendor CSL's episode code/deps into the function bundle (cold-start + size limits); breaks the "read-only, never import sibling code" boundary unless CSL ships a pip-installable episode runner |
| **B. Cloud Run (scale-to-zero) container** | CSL episode in its own container; demo's route proxies to it | ~$0 idle + per-request; a few $/mo if warm | Cleanest boundary (CSL owns its container); one more service to operate — ironic right as we're decommissioning GCP |
| **C. Vercel Sandbox (ephemeral microVM)** | run the episode on-demand in an isolated microVM | per-run compute | Strong isolation, no standing service; newer, more moving parts |

**Recommendation to review:** **A** if CSL can expose `smoke_episode` as a small pip-installable
entrypoint (keeps everything on Vercel, no standing backend, honors the boundary via a published
package rather than a source import); otherwise **B**. Avoid B's "new GCP service" optics unless A
is genuinely blocked.

## Invariants the build must hold (same spirit as v1's five)
1. **Computed, not canned** — an integration test varies a seed/input and asserts the live output
   differs from the recorded replay. If it can't tell live from replay, it is not live.
2. **Provenance on the live result too** — the live episode's output carries `{sourceRepo: CSL,
   commitSha, runTimestamp}`, distinct from the replay's committed provenance, so the UI never
   blurs "recorded" and "just now."
3. **Fail-closed to replay** — backend down / timeout / error → the existing fallback banner, never
   a fabricated result. This path must be *strictly additive*: v1's behavior is the floor.
4. **Boundary intact** — the static site still never imports CSL source; it calls an endpoint (A: a
   published CSL package inside the function; B/C: over HTTP). No CSL logic reimplemented in TS.
5. **Cost visible** — whatever standing surface (if any) B/C introduces is documented in the demo's
   README with its monthly cost, so this doesn't silently re-add the spend #2 is removing.

## Rough task shape (TDD, ~6–8 tasks — expand into a real plan once the option is picked)
1. Confirm the live surface: read `../correct-shaped-lies/smoke_episode.py`, decide A/B/C, pin the
   episode's inputs/outputs contract. **(Gate: nothing builds until this contract is written.)**
2. Backend: wrap `smoke_episode` behind the chosen surface with a typed request/response.
3. Contract test: same input → stable shape; varied input → different result (the "computed" proof).
4. Wire `app/api/live-episode` to call it (or BE it, option A); typed client in `lib/`.
5. `LiveEpisodeRunner`: real path + preserved fallback; visible "LIVE (computed just now)" vs
   "recorded" state; provenance badge per branch.
6. E2E: live path happy case (backend up) **and** fallback case (backend forced down) both green.
7. README + cost note; update CLAUDE.md invariant #5 from "fallback-only" to "live CSL episode,
   fail-closed to replay."
8. Integration agent runs the real gate (`npm run ingest && npm test && npm run build && npm run e2e`)
   AND exercises the deployed live endpoint; iterate until genuinely green, evidence not assertion.

## Cost honesty
This path *adds* compute (the whole point of ordering it last). Option A is ~$0 idle; B/C introduce
a small standing or per-run cost. It is worth doing **only** if a genuinely-live CSL episode adds
demo value the recorded replay can't — otherwise the replay already tells the "passed ≠ true" story
and this is spend against the grain of the current cost-cutting.

## Open questions for Hossain
- Is a live CSL episode actually worth a backend, or is the recorded replay sufficient for the
  demo's purpose? (If sufficient → don't build this; v1 stands.)
- If yes: option A, B, or C?
- Does CSL want to publish `smoke_episode` as a pip-installable entrypoint (unblocks the clean
  option A)?

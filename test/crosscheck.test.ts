import { describe, it, expect } from "vitest";
import { crossCheckCatchRate } from "@/lib/crosscheck";
import type { EpisodeRow, SummaryRow } from "@/lib/types";

// Minimal real-shaped slice: T1 baseline (0 caught / 2) + T1 baseline+composition (2 caught / 2)
const episodes: EpisodeRow[] = [
  { tier: "T1", task_id: "add_two", seed: 0, controller_config: "baseline", final_state: "achieved", reached_achieved: 1, got_away: 1, caught_by: "" },
  { tier: "T1", task_id: "gcd", seed: 1, controller_config: "baseline", final_state: "achieved", reached_achieved: 1, got_away: 1, caught_by: "" },
  { tier: "T1", task_id: "add_two", seed: 0, controller_config: "baseline+composition", final_state: "failed", reached_achieved: 1, got_away: 0, caught_by: "cross_stage_consistency" },
  { tier: "T1", task_id: "gcd", seed: 1, controller_config: "baseline+composition", final_state: "failed", reached_achieved: 1, got_away: 0, caught_by: "cross_stage_consistency" },
];

const goodSummary: SummaryRow[] = [
  { tier: "T1", controller_config: "baseline", n: 2, n_caught: 0, catch_rate: 0.0, n_achieved: 2, n_survived: 2, survived_rate: 1.0, got_away_rate_all: 1.0, attribution: "" },
  { tier: "T1", controller_config: "baseline+composition", n: 2, n_caught: 2, catch_rate: 1.0, n_achieved: 2, n_survived: 0, survived_rate: 0.0, got_away_rate_all: 1.0, attribution: "cross_stage_consistency=2" },
];

describe("crossCheckCatchRate", () => {
  it("passes when recomputed catch_rate matches summary", () => {
    expect(() => crossCheckCatchRate(episodes, goodSummary)).not.toThrow();
  });

  it("throws when summary catch_rate disagrees with episodes", () => {
    const bad = structuredClone(goodSummary);
    bad[0].catch_rate = 1.0; // claim 100% caught when episodes say 0%
    expect(() => crossCheckCatchRate(episodes, bad)).toThrow(/catch_rate mismatch.*T1\|baseline/);
  });

  it("throws when a summary group has no matching episodes", () => {
    const bad = [...goodSummary, { ...goodSummary[0], tier: "T2" as const }];
    expect(() => crossCheckCatchRate(episodes, bad)).toThrow(/no episodes for group.*T2\|baseline/);
  });
});

import type { EpisodeRow, SummaryRow } from "./types";

const EPS = 1e-4;

export function crossCheckCatchRate(episodes: EpisodeRow[], summary: SummaryRow[]): void {
  const groups = new Map<string, { n: number; caught: number }>();
  for (const e of episodes) {
    const key = `${e.tier}|${e.controller_config}`;
    const g = groups.get(key) ?? { n: 0, caught: 0 };
    g.n += 1;
    if (e.caught_by !== "") g.caught += 1;
    groups.set(key, g);
  }

  for (const s of summary) {
    const key = `${s.tier}|${s.controller_config}`;
    const g = groups.get(key);
    if (!g) {
      throw new Error(`Cross-check failed: no episodes for group ${key} present in summary.csv`);
    }
    const recomputed = g.caught / g.n;
    if (Math.abs(recomputed - s.catch_rate) > EPS) {
      throw new Error(
        `Cross-check failed: catch_rate mismatch for ${key} — episodes=${recomputed.toFixed(4)} (${g.caught}/${g.n}) vs summary=${s.catch_rate.toFixed(4)}`,
      );
    }
  }
}

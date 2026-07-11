"use client";
import { useArtifacts, Provenance } from "../ArtifactProvider";
import type { SummaryRow, Tier } from "@/lib/types";
import { signed2, rate2 } from "./Stat";

/** The layer that caught the lie in the +composition config, from summary.attribution
 *  ("cross_stage_consistency=30" -> "cross_stage_consistency"). "—" when no such row/catch. */
function caughtByFor(summary: SummaryRow[], tier: Tier): string {
  const row = summary.find((r) => r.tier === tier && r.controller_config === "baseline+composition");
  const name = row?.attribution.split("=")[0] ?? "";
  return name || "—";
}

export function ResultsTable() {
  const { erosion, summary } = useArtifacts();
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-600 text-left">
            <th className="py-1 pr-3">Tier</th>
            <th className="py-1 pr-3">catch (baseline)</th>
            <th className="py-1 pr-3">catch (+comp.)</th>
            <th className="py-1 pr-3">composition advantage</th>
            <th className="py-1 pr-3">survived (base → +comp.)</th>
            <th className="py-1">caught by</th>
          </tr>
        </thead>
        <tbody>
          {erosion.map((r) => (
            <tr key={r.tier} data-testid={`row-${r.tier}`} className="border-b border-neutral-800">
              <td className="py-1 pr-3 font-semibold">{r.tier}</td>
              <td className="py-1 pr-3">{rate2(r.catch_baseline)}</td>
              <td className="py-1 pr-3">{rate2(r.catch_composition)}</td>
              <td className="py-1 pr-3 font-bold">{signed2(r.composition_advantage)}</td>
              <td className="py-1 pr-3">
                {rate2(r.survived_baseline)} → {rate2(r.survived_composition)}
              </td>
              <td className="py-1 font-mono">{caughtByFor(summary, r.tier)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2">
        <Provenance artifactKey="erosion.json" />
      </div>
    </div>
  );
}

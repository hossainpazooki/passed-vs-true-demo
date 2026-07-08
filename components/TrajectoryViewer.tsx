"use client";
import { useArtifacts, Provenance } from "./ArtifactProvider";
import { CaveatBadge } from "./CaveatBadge";
import type { EpisodeRow } from "@/lib/types";

export const isLie = (e: EpisodeRow): boolean =>
  e.final_state === "achieved" && e.got_away === 1 && e.caught_by === "";

export function TrajectoryViewer({ episodes }: { episodes?: EpisodeRow[] }) {
  const ctx = useArtifacts();
  const rows = episodes ?? ctx.episodes;
  return (
    <div className="rounded-lg border border-neutral-800 p-4">
      <div className="grid gap-1">
        {rows.map((e, i) => {
          const lie = isLie(e);
          return (
            <div
              key={`${e.tier}-${e.task_id}-${e.seed}-${e.controller_config}-${i}`}
              data-testid="episode-row"
              data-lie={lie ? "true" : "false"}
              className="flex items-center justify-between gap-2 border-b border-neutral-800 py-1 text-sm"
            >
              <span className="font-mono">
                {e.tier} · {e.task_id} · {e.controller_config} → {e.final_state}
                {e.caught_by && ` (caught: ${e.caught_by})`}
              </span>
              {lie && <CaveatBadge kind="warning">correct-shaped lie</CaveatBadge>}
            </div>
          );
        })}
      </div>
      {!episodes && <div className="mt-2"><Provenance artifactKey="episodes.json" /></div>}
    </div>
  );
}

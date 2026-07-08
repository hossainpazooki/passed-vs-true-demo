"use client";
import { useState } from "react";
import { useArtifacts } from "./ArtifactProvider";
import { TrajectoryViewer, isLie } from "./TrajectoryViewer";
import { CaveatBadge } from "./CaveatBadge";
import type { EpisodeRow } from "@/lib/types";

export function LiveEpisodeRunner({ endpoint }: { endpoint?: string }) {
  const { episodes, manifest } = useArtifacts();
  const [state, setState] = useState<"idle" | "fallback">("idle");

  // v1: no endpoint wired → go straight to the honest fallback. Phase 2 replaces
  // this handler with a real fetch(endpoint) that returns a trajectory.
  const run = () => {
    if (!endpoint) setState("fallback");
  };

  const canonicalLie: EpisodeRow[] = episodes.filter(isLie).slice(0, 1);

  return (
    <div className="rounded-lg border border-neutral-800 p-4">
      <button onClick={run} className="rounded bg-sky-700 px-3 py-1 text-sm text-white">
        Run a live episode (real CSL stack)
      </button>
      {state === "fallback" && (
        <div className="mt-3">
          <div role="status"><CaveatBadge kind="warning">live unavailable — showing recorded run</CaveatBadge></div>
          <div className="mt-2 text-xs text-neutral-500">recorded, commit {manifest.generatedFrom.csl}</div>
          <TrajectoryViewer episodes={canonicalLie} />
        </div>
      )}
    </div>
  );
}

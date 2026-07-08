"use client";
import { useState } from "react";
import clsx from "clsx";
import { useArtifacts, Provenance } from "./ArtifactProvider";
import type { Tier } from "@/lib/types";

const TIERS: Tier[] = ["T0", "T1", "T2"];

export function TierExplorer() {
  const { summary } = useArtifacts();
  const [tier, setTier] = useState<Tier>("T1");
  const rows = summary.filter((s) => s.tier === tier);
  return (
    <div className="rounded-lg border border-neutral-800 p-4">
      <div className="mb-3 flex gap-2">
        {TIERS.map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            className={clsx("rounded px-3 py-1 text-sm", t === tier ? "bg-sky-700 text-white" : "bg-neutral-800 text-neutral-300")}
          >
            {t}
          </button>
        ))}
      </div>
      <div data-testid="tier-panel" data-tier={tier} className="grid gap-2">
        {rows.map((r) => (
          <div key={r.controller_config} className="flex justify-between border-b border-neutral-800 py-1 text-sm">
            <span className="font-mono">{r.controller_config}</span>
            <span>catch {r.catch_rate.toFixed(2)} · survived {r.survived_rate.toFixed(2)} {r.attribution && `· ${r.attribution}`}</span>
          </div>
        ))}
      </div>
      <div className="mt-2"><Provenance artifactKey="summary.json" /></div>
    </div>
  );
}

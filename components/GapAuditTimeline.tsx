"use client";
import { useArtifacts, Provenance } from "./ArtifactProvider";

export function GapAuditTimeline() {
  const { gapAudit } = useArtifacts();
  return (
    <div className="rounded-lg border border-neutral-800 p-4">
      <h3 className="mb-2 font-semibold">Gap-audit hardening ({gapAudit.length} findings)</h3>
      <ol className="grid gap-2">
        {gapAudit.map((g) => (
          <li key={g.id} data-testid="gap-row" className="border-b border-neutral-800 py-1 text-sm">
            <span className="font-mono text-neutral-500">#{g.id}</span> {g.risk} — <span className="text-green-400">{g.status}</span> <span className="font-mono text-neutral-500">{g.commit}</span>
          </li>
        ))}
      </ol>
      <div className="mt-2"><Provenance artifactKey="gap_audit.json" /></div>
    </div>
  );
}

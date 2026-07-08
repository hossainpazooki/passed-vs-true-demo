"use client";
import { useArtifacts } from "./ArtifactProvider";

const SHOWS_STATIC = [
  "The real catch-rate degradation curve (T0→T1→T2) from committed CSL artifacts.",
  "A producer that reaches ACHIEVED yet trips the held got-away oracle — a correct-shaped lie.",
];
const NOT_SHOWS = [
  "Blind real-world performance — the F1 is the train partition (released labels), not the blind test oracle.",
  "COSMO 0.805 is robustness under a self-injected error model, NOT independent validation.",
  "A live run — v1 is deterministic replay of committed artifacts; the live CSL path is Phase 2.",
];

export function HonestyLedger() {
  const { manifest, transferValidation } = useArtifacts();
  const shows = [
    ...SHOWS_STATIC,
    `CLUE's detector scored at F1 ${transferValidation.f1.toFixed(4)} against the challenge organizers' own key (train partition).`,
  ];
  return (
    <div data-testid="ledger" className="rounded-lg border border-neutral-800 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div data-testid="shows">
          <h4 className="font-semibold text-green-400">What this shows</h4>
          <ul className="mt-1 list-disc pl-5 text-sm text-neutral-300">{shows.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
        <div data-testid="not-shows">
          <h4 className="font-semibold text-amber-400">What this does NOT show</h4>
          <ul className="mt-1 list-disc pl-5 text-sm text-neutral-300">{NOT_SHOWS.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
      </div>
      <p className="mt-3 font-mono text-xs text-neutral-500">
        Sources: CLUE {manifest.generatedFrom.clue} · correct-shaped-lies {manifest.generatedFrom.csl}
      </p>
    </div>
  );
}

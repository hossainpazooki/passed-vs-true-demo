"use client";
import { useArtifacts, Provenance } from "./ArtifactProvider";
import { CaveatBadge } from "./CaveatBadge";

export function TransferValidationCard() {
  const { transferValidation: t } = useArtifacts();
  return (
    <div data-testid="transfer-card" className="rounded-lg border border-neutral-800 p-4">
      <h3 className="font-semibold">CLUE transfer validation ({t.run}, {t.partition})</h3>
      <p className="mt-1 text-2xl font-bold">F1 {t.f1.toFixed(4)}</p>
      <p className="text-sm text-neutral-400">
        precision {t.precision.toFixed(4)} · recall {t.recall.toFixed(4)} · TP {t.tp} / FP {t.fp} / FN {t.fn} · {t.threshold}
      </p>
      <div className="mt-2"><CaveatBadge kind="caveat">{t.caveat}</CaveatBadge></div>
      <div className="mt-2"><Provenance artifactKey="transfer_validation.json" /></div>
    </div>
  );
}

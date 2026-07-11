import { ArtifactProvider } from "@/components/ArtifactProvider";
import { PaperNav } from "@/components/paper/PaperNav";
import { PaperBody } from "@/components/paper/PaperBody";
import type { ArtifactBundle } from "@/lib/types";
import erosion from "@/public/data/erosion.json";
import summary from "@/public/data/summary.json";
import episodes from "@/public/data/episodes.json";
import transferValidation from "@/public/data/transfer_validation.json";
import gapAudit from "@/public/data/gap_audit.json";
import manifest from "@/public/data/manifest.json";

const bundle = { erosion, summary, episodes, transferValidation, gapAudit, manifest } as unknown as ArtifactBundle;

export const metadata = {
  title: "Detection Limit of Lifecycle-State Oversight — passed ≠ true",
  description:
    "Formal writeup: measuring where trajectory-level oversight adds detection power over a per-evaluator gate, against a knowledge-graded adversary.",
};

export default function Paper() {
  return (
    <ArtifactProvider bundle={bundle}>
      <main className="paper mx-auto max-w-3xl px-6 py-10">
        <PaperNav />
        <PaperBody />
      </main>
    </ArtifactProvider>
  );
}

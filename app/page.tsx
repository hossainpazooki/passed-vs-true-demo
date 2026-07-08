import { ArtifactProvider } from "@/components/ArtifactProvider";
import { NarrativeBody } from "@/components/Section";
import type { ArtifactBundle } from "@/lib/types";
import erosion from "@/public/data/erosion.json";
import summary from "@/public/data/summary.json";
import episodes from "@/public/data/episodes.json";
import transferValidation from "@/public/data/transfer_validation.json";
import gapAudit from "@/public/data/gap_audit.json";
import manifest from "@/public/data/manifest.json";

const bundle = { erosion, summary, episodes, transferValidation, gapAudit, manifest } as unknown as ArtifactBundle;

export default function Home() {
  return (
    <ArtifactProvider bundle={bundle}>
      <NarrativeBody />
    </ArtifactProvider>
  );
}

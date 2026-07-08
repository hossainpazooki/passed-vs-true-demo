"use client";
import { createContext, useContext } from "react";
import type { ArtifactBundle } from "@/lib/types";

const ArtifactContext = createContext<ArtifactBundle | null>(null);

export function ArtifactProvider({ bundle, children }: { bundle: ArtifactBundle; children: React.ReactNode }) {
  return <ArtifactContext.Provider value={bundle}>{children}</ArtifactContext.Provider>;
}

export function useArtifacts(): ArtifactBundle {
  const ctx = useContext(ArtifactContext);
  if (!ctx) throw new Error("useArtifacts must be used within an <ArtifactProvider>");
  return ctx;
}

export function Provenance({ artifactKey }: { artifactKey: string }) {
  const { manifest } = useArtifacts();
  const tag = manifest.artifacts[artifactKey];
  if (!tag) return null;
  return (
    <span className="text-xs text-neutral-500 font-mono" data-testid={`provenance-${artifactKey}`}>
      {tag.sourceRepo} · {tag.filePath} · {tag.commitSha}
    </span>
  );
}

export { ArtifactContext };

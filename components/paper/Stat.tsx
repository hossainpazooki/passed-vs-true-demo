"use client";
import { useArtifacts } from "../ArtifactProvider";
import type { ArtifactBundle } from "@/lib/types";

export const signed2 = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(2);
export const rate2 = (n: number) => n.toFixed(2);
/** Advantage formatter: structural zeros read as "0", positives as "+1.00". */
export const adv = (n: number) => (n === 0 ? "0" : (n > 0 ? "+" : "") + n.toFixed(2));
export const int0 = (n: number) => String(Math.round(n));

/**
 * An inline number bound to the ingested artifact bundle. The value is pulled
 * via `select` (never hand-typed), and the source artifact's provenance
 * {sourceRepo, filePath, commitSha} is exposed on hover via `title`.
 */
export function Stat({
  select,
  format = (n) => String(n),
  artifactKey,
  ...rest
}: {
  select: (b: ArtifactBundle) => number;
  format?: (n: number) => string;
  artifactKey: string;
  "data-testid"?: string;
}) {
  const bundle = useArtifacts();
  const tag = bundle.manifest.artifacts[artifactKey];
  const title = tag ? `${tag.sourceRepo} · ${tag.filePath} · ${tag.commitSha}` : undefined;
  return (
    <span
      className="font-mono font-semibold underline decoration-dotted underline-offset-2"
      title={title}
      {...rest}
    >
      {format(select(bundle))}
    </span>
  );
}

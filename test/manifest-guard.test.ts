import { describe, it, expect } from "vitest";
import { validateManifest } from "@/scripts/ingest";
import type { ArtifactBundle } from "@/lib/types";

const base = (): ArtifactBundle => ({
  erosion: [], summary: [], episodes: [],
  transferValidation: { f1: 0.9143, precision: 0.8421, recall: 1, tp: 16, fp: 3, fn: 0, threshold: "fixed-0.5", partition: "train", run: "Run 3", caveat: "train partition" },
  gapAudit: [],
  manifest: { generatedFrom: { clue: "c446f82", csl: "30b287b" }, artifacts: {
    "erosion.json": { sourceRepo: "csl", filePath: "results/erosion.csv", commitSha: "30b287b" },
    "summary.json": { sourceRepo: "csl", filePath: "results/summary.csv", commitSha: "30b287b" },
    "episodes.json": { sourceRepo: "csl", filePath: "results/episodes.csv", commitSha: "30b287b" },
    "degradation_curve.png": { sourceRepo: "csl", filePath: "results/degradation_curve.png", commitSha: "30b287b" },
    "transfer_validation.json": { sourceRepo: "clue", filePath: "docs/TRANSFER_VALIDATION_RUN.md", commitSha: "c446f82" },
    "gap_audit.json": { sourceRepo: "clue", filePath: "docs/GAP_AUDIT.md", commitSha: "c446f82" },
  } },
});

describe("validateManifest", () => {
  it("passes when all six artifacts are tagged", () => {
    expect(() => validateManifest(base())).not.toThrow();
  });
  it("throws when a provenance tag is missing", () => {
    const b = base();
    delete b.manifest.artifacts["gap_audit.json"];
    expect(() => validateManifest(b)).toThrow(/missing provenance.*gap_audit\.json/i);
  });
});

import { describe, it, expect } from "vitest";
import { buildBundle, type IngestFs } from "@/scripts/ingest";

const EROSION = `tier,catch_baseline,catch_composition,composition_advantage,survived_baseline,survived_composition
T1,0.0000,1.0000,1.0000,1.0000,0.0000
`;
const SUMMARY = `tier,controller_config,n,n_caught,catch_rate,n_achieved,n_survived,survived_rate,got_away_rate_all,attribution
T1,baseline,2,0,0.0000,2,2,1.0000,1.0000,
T1,baseline+composition,2,2,1.0000,2,0,0.0000,1.0000,cross_stage_consistency=2
`;
const EPISODES = `tier,task_id,seed,controller_config,final_state,reached_achieved,got_away,caught_by
T1,add_two,0,baseline,achieved,1,1,
T1,gcd,1,baseline,achieved,1,1,
T1,add_two,0,baseline+composition,failed,1,0,cross_stage_consistency
T1,gcd,1,baseline+composition,failed,1,0,cross_stage_consistency
`;
const TRANSFER_MD = `**fixed-0.5 F1 = 0.9143** (precision 0.8421, recall 1.0000; TP 16 / FP 3 / FN 0).`;
const GAP_MD = `| **1** | No held-out oracle | ✅ Train oracle CLOSED | \`c5c034e\` |`;

function fakeFs(over: Partial<Record<string, string>> = {}): IngestFs {
  const files: Record<string, string> = {
    "../correct-shaped-lies/results/erosion.csv": EROSION,
    "../correct-shaped-lies/results/summary.csv": SUMMARY,
    "../correct-shaped-lies/results/episodes.csv": EPISODES,
    "../upstream-label-correction/docs/TRANSFER_VALIDATION_RUN.md": TRANSFER_MD,
    "../upstream-label-correction/docs/GAP_AUDIT.md": GAP_MD,
    ...over,
  };
  return {
    read: (p) => {
      if (!(p in files)) throw new Error(`Missing artifact: ${p}`);
      return files[p]!;
    },
    sha: (repo) => (repo === "clue" ? "c446f82" : "30b287b"),
  };
}

describe("buildBundle", () => {
  it("parses artifacts, runs the cross-check, and tags provenance", () => {
    const b = buildBundle(fakeFs());
    expect(b.erosion[0].composition_advantage).toBe(1.0);
    expect(b.summary).toHaveLength(2);
    expect(b.episodes).toHaveLength(4);
    expect(b.transferValidation.f1).toBe(0.9143);
    expect(b.transferValidation.tp).toBe(16);
    expect(b.transferValidation.caveat).toMatch(/train partition/i);
    expect(b.manifest.generatedFrom).toEqual({ clue: "c446f82", csl: "30b287b" });
    expect(b.manifest.artifacts["erosion.json"].commitSha).toBe("30b287b");
  });

  it("throws loudly when an artifact is missing", () => {
    const fs = fakeFs();
    const missing: IngestFs = { ...fs, read: (p) => { if (p.includes("erosion")) throw new Error(`Missing artifact: ${p}`); return fs.read(p); } };
    expect(() => buildBundle(missing)).toThrow(/Missing artifact.*erosion/);
  });

  it("throws when the cross-check fails", () => {
    const tampered = SUMMARY.replace("T1,baseline,2,0,0.0000", "T1,baseline,2,2,1.0000");
    expect(() => buildBundle(fakeFs({ "../correct-shaped-lies/results/summary.csv": tampered }))).toThrow(/catch_rate mismatch/);
  });

  it("throws when the F1 number cannot be parsed from the doc", () => {
    expect(() => buildBundle(fakeFs({ "../upstream-label-correction/docs/TRANSFER_VALIDATION_RUN.md": "no numbers here" }))).toThrow(/could not parse.*F1/i);
  });
});

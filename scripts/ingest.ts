import { parseCsv } from "../lib/csv";
import { crossCheckCatchRate } from "../lib/crosscheck";
import type {
  ArtifactBundle, ErosionRow, SummaryRow, EpisodeRow,
  TransferValidation, GapFinding, Manifest, Tier, ControllerConfig, FinalState, CaughtBy,
} from "../lib/types";

const CSL = "../correct-shaped-lies";
const CLUE = "../upstream-label-correction";

const P = {
  erosion: `${CSL}/results/erosion.csv`,
  summary: `${CSL}/results/summary.csv`,
  episodes: `${CSL}/results/episodes.csv`,
  degradationPng: `${CSL}/results/degradation_curve.png`,
  transfer: `${CLUE}/docs/TRANSFER_VALIDATION_RUN.md`,
  gap: `${CLUE}/docs/GAP_AUDIT.md`,
};

export interface IngestFs {
  read(path: string): string;
  sha(repo: "clue" | "csl"): string;
}

const num = (v: string) => Number(v);

function parseErosion(text: string): ErosionRow[] {
  return parseCsv(text).map((r) => ({
    tier: r.tier as Tier,
    catch_baseline: num(r.catch_baseline),
    catch_composition: num(r.catch_composition),
    composition_advantage: num(r.composition_advantage),
    survived_baseline: num(r.survived_baseline),
    survived_composition: num(r.survived_composition),
  }));
}

function parseSummary(text: string): SummaryRow[] {
  return parseCsv(text).map((r) => ({
    tier: r.tier as Tier,
    controller_config: r.controller_config as ControllerConfig,
    n: num(r.n), n_caught: num(r.n_caught), catch_rate: num(r.catch_rate),
    n_achieved: num(r.n_achieved), n_survived: num(r.n_survived),
    survived_rate: num(r.survived_rate), got_away_rate_all: num(r.got_away_rate_all),
    attribution: r.attribution,
  }));
}

function parseEpisodes(text: string): EpisodeRow[] {
  return parseCsv(text).map((r) => ({
    tier: r.tier as Tier,
    task_id: r.task_id,
    seed: num(r.seed),
    controller_config: r.controller_config as ControllerConfig,
    final_state: r.final_state as FinalState,
    reached_achieved: num(r.reached_achieved) as 0 | 1,
    got_away: num(r.got_away) as 0 | 1,
    caught_by: r.caught_by as CaughtBy,
  }));
}

function parseTransfer(text: string): TransferValidation {
  // NOTE: TRANSFER_VALIDATION_RUN.md states a rounded "F1 0.914" in a summary
  // bullet near the top, BEFORE the precise "fixed-0.5 F1 = 0.9143 (precision
  // 0.8421, recall 1.0000; TP 16 / FP 3 / FN 0)" headline sentence further
  // down. Four independent whole-document .exec() calls (one per field) only
  // land on the right numbers today by document ordering — a future edit
  // adding an earlier "precision"/"recall"/"TP.../FP.../FN..." mention would
  // make ingestion SILENTLY return wrong numbers instead of failing loud. So
  // all six values are anchored to ONE atomic regex over the single headline
  // sentence: it either matches that exact sentence, or throws.
  const m = /F1\s*=\s*(0\.\d+)\**\s*\(precision\s*(0\.\d+),\s*recall\s*(1\.0000|0\.\d+);\s*TP\s*(\d+)\s*\/\s*FP\s*(\d+)\s*\/\s*FN\s*(\d+)\)/i.exec(text);
  if (!m) throw new Error("Ingest: could not parse F1/precision/recall/confusion from TRANSFER_VALIDATION_RUN.md");
  return {
    f1: Number(m[1]), precision: Number(m[2]), recall: Number(m[3]),
    tp: Number(m[4]), fp: Number(m[5]), fn: Number(m[6]),
    threshold: "fixed-0.5", partition: "train", run: "Run 3",
    caveat: "train partition, not blind test — released train labels, not blind real-world performance. COSMO 0.805 is robustness, not validation.",
  };
}

function parseGapAudit(text: string): GapFinding[] {
  const findings: GapFinding[] = [];
  const re = /\|\s*\*\*(\d+)\*\*\s*\|([^|]+)\|([^|]+)\|.*?`([0-9a-f]{7})`/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    findings.push({ id: Number(m[1]), risk: m[2].trim(), status: m[3].trim(), commit: m[4] });
  }
  if (findings.length === 0) throw new Error("Ingest: could not parse any gap-audit findings from GAP_AUDIT.md");
  return findings;
}

const REQUIRED_ARTIFACTS = [
  "erosion.json", "summary.json", "episodes.json",
  "degradation_curve.png", "transfer_validation.json", "gap_audit.json",
] as const;

export function validateManifest(bundle: ArtifactBundle): void {
  for (const key of REQUIRED_ARTIFACTS) {
    if (!bundle.manifest.artifacts[key]) {
      throw new Error(`Ingest: missing provenance tag for ${key} — provenance is mandatory`);
    }
  }
}

export function buildBundle(fs: IngestFs): ArtifactBundle {
  const erosion = parseErosion(fs.read(P.erosion));
  const summary = parseSummary(fs.read(P.summary));
  const episodes = parseEpisodes(fs.read(P.episodes));
  crossCheckCatchRate(episodes, summary); // GATE — throws on mismatch
  const transferValidation = parseTransfer(fs.read(P.transfer));
  const gapAudit = parseGapAudit(fs.read(P.gap));

  const cslSha = fs.sha("csl");
  const clueSha = fs.sha("clue");
  const tag = (repo: string, filePath: string, sha: string) => ({ sourceRepo: repo, filePath, commitSha: sha });
  const manifest: Manifest = {
    generatedFrom: { clue: clueSha, csl: cslSha },
    artifacts: {
      "erosion.json": tag("correct-shaped-lies", "results/erosion.csv", cslSha),
      "summary.json": tag("correct-shaped-lies", "results/summary.csv", cslSha),
      "episodes.json": tag("correct-shaped-lies", "results/episodes.csv", cslSha),
      "degradation_curve.png": tag("correct-shaped-lies", "results/degradation_curve.png", cslSha),
      "transfer_validation.json": tag("upstream-label-correction", "docs/TRANSFER_VALIDATION_RUN.md", clueSha),
      "gap_audit.json": tag("upstream-label-correction", "docs/GAP_AUDIT.md", clueSha),
    },
  };

  return { erosion, summary, episodes, transferValidation, gapAudit, manifest };
}

async function main() {
  const { readFileSync, writeFileSync, mkdirSync, copyFileSync } = await import("node:fs");
  const { execSync } = await import("node:child_process");
  const realFs: IngestFs = {
    read: (p) => readFileSync(p, "utf8"),
    sha: (repo) => execSync(`git -C ${repo === "clue" ? CLUE : CSL} rev-parse --short HEAD`).toString().trim(),
  };
  const bundle = buildBundle(realFs);
  validateManifest(bundle);
  mkdirSync("public/data", { recursive: true });
  writeFileSync("public/data/erosion.json", JSON.stringify(bundle.erosion, null, 2));
  writeFileSync("public/data/summary.json", JSON.stringify(bundle.summary, null, 2));
  writeFileSync("public/data/episodes.json", JSON.stringify(bundle.episodes, null, 2));
  writeFileSync("public/data/transfer_validation.json", JSON.stringify(bundle.transferValidation, null, 2));
  writeFileSync("public/data/gap_audit.json", JSON.stringify(bundle.gapAudit, null, 2));
  writeFileSync("public/data/manifest.json", JSON.stringify(bundle.manifest, null, 2));
  copyFileSync(P.degradationPng, "public/data/degradation_curve.png");
  console.log(`Ingest OK: ${bundle.episodes.length} episodes, cross-check passed, F1=${bundle.transferValidation.f1}, ${bundle.gapAudit.length} gap findings.`);
}

// Run only when invoked directly (not when imported by a test).
const invokedDirectly = process.argv[1]?.endsWith("ingest.ts") ?? false;
if (invokedDirectly) {
  main().catch((err) => {
    console.error(`\nINGEST FAILED — build must stop.\n${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  });
}

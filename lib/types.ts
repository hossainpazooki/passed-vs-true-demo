export type Tier = "T0" | "T1" | "T2";
export type ControllerConfig = "baseline" | "baseline+composition";
export type FinalState = "achieved" | "failed";
export type CaughtBy = "" | "static_safety" | "cross_stage_consistency";

export interface ErosionRow {
  tier: Tier;
  catch_baseline: number;
  catch_composition: number;
  composition_advantage: number;
  survived_baseline: number;
  survived_composition: number;
}

export interface SummaryRow {
  tier: Tier;
  controller_config: ControllerConfig;
  n: number;
  n_caught: number;
  catch_rate: number;
  n_achieved: number;
  n_survived: number;
  survived_rate: number;
  got_away_rate_all: number;
  attribution: string;
}

export interface EpisodeRow {
  tier: Tier;
  task_id: string;
  seed: number;
  controller_config: ControllerConfig;
  final_state: FinalState;
  reached_achieved: 0 | 1;
  got_away: 0 | 1;
  caught_by: CaughtBy;
}

export interface TransferValidation {
  f1: number;
  precision: number;
  recall: number;
  tp: number;
  fp: number;
  fn: number;
  threshold: string; // "fixed-0.5"
  partition: string; // "train"
  run: string; // "Run 3"
  caveat: string; // "train partition, not blind test ..."
}

export interface GapFinding {
  id: number;
  risk: string;
  status: string;
  commit: string;
}

export interface ProvenanceTag {
  sourceRepo: string;
  filePath: string;
  commitSha: string;
}

export interface Manifest {
  generatedFrom: { clue: string; csl: string };
  artifacts: Record<string, ProvenanceTag>;
}

export interface ArtifactBundle {
  erosion: ErosionRow[];
  summary: SummaryRow[];
  episodes: EpisodeRow[];
  transferValidation: TransferValidation;
  gapAudit: GapFinding[];
  manifest: Manifest;
}

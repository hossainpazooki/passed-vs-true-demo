"use client";
import type { Tier } from "@/lib/types";
import { Stat, adv, rate2, int0 } from "./Stat";
import { ResultsTable } from "./ResultsTable";
import { PaperFigure } from "./PaperFigure";
import { ScopeCallout } from "./ScopeCallout";
import { References } from "./References";

/** Composition advantage for a tier, pulled from the erosion artifact (never hand-typed). */
const Adv = ({ tier }: { tier: Tier }) => (
  <Stat
    artifactKey="erosion.json"
    format={adv}
    select={(b) => b.erosion.find((r) => r.tier === tier)!.composition_advantage}
  />
);

/** The erosion curve phrase "0 → +1.00 → 0", all three values from the artifact. */
const ErosionCurve = () => (
  <span>
    <Adv tier="T0" /> → <Adv tier="T1" /> → <Adv tier="T2" />
  </span>
);

export function PaperBody() {
  return (
    <article className="paper">
      <header className="mb-8">
        <h1 className="text-2xl font-bold leading-tight">
          Measuring the Detection Limit of Lifecycle-State Oversight Against Knowledge-Graded
          Adversaries
        </h1>
        <p className="mt-3 text-sm">
          Hossain Pazooki<sup>1</sup>,{" "}
          <span className="text-neutral-500">[co-authors — Algoverse cohort / mentor]</span>
        </p>
        <p className="text-sm text-neutral-500">
          <sup>1</sup>[affiliation — Algoverse AI Research Fellowship] ·{" "}
          <a href="mailto:hossain@pazooki.com" className="underline decoration-dotted">
            hossain@pazooki.com
          </a>
        </p>
      </header>

      <section aria-label="Abstract" className="mb-6">
        <h2 className="mb-2 font-semibold">Abstract</h2>
        <p>
          Autonomous agents are increasingly gated by a lifecycle controller that admits an action
          only when every evaluator in a stack passes (<code>all_passed()</code>). A natural hope is
          that a layer reasoning over the <em>state trajectory</em> — above the per-evaluator gate —
          catches dishonest actions the individual evaluators miss. We test that hope directly with a
          graded adversarial red-team: a producer is handed an overt, machine-checkable task plus a
          hidden backdoor objective, and &ldquo;getting away with it&rdquo; is scored against a held
          got-away oracle that no evaluator sees, so a <em>correct-shaped lie</em> — a well-formed
          derivation that drives <code>passed = True</code> while what passed is not honest — remains
          measurable even after it clears the gate. Sweeping three strictly knowledge-nested adversary
          tiers over all six corpus tasks (five seeds each) with a deterministic scripted adversary,
          we find the composition layer&rsquo;s marginal detection advantage rises then collapses,
          tracing an erosion curve of <strong><ErosionCurve /></strong> rather than a bound: it
          catches the lie the gate missed against an eval-aware adversary, and a controller-aware
          adversary erases the very trajectory signature it relies on. We present this as a mechanism
          demonstration of a selection-pressure effect, not a frontier-scale measurement of detection
          in general.
        </p>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>Index Terms</strong> — AI oversight, AI control, trusted monitoring, adversarial
          evaluation, admission control, agentic systems, backdoor detection, verification.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold">I. Introduction</h2>
        <p>
          A recurring pattern in deployed agentic systems is <em>admission control</em>: an untrusted
          proposer emits a candidate action, a battery of evaluators scores it, and a controller
          commits the action to an irreversible state only when the aggregate gate passes. The gate is
          attractive because it is machine-checkable and composable — but it certifies{" "}
          <em>conformance</em>, not <em>honesty</em>. It can witness that an output has the right
          shape; it cannot witness that the output is truthful about what it does.
        </p>
        <p className="mt-2">
          We name the failure this permits a <strong>correct-shaped lie</strong>: a well-formed
          derivation that drives <code>passed = True</code> while the thing that passed is not honest.
          In a production setting the certifying quantity is often structurally unobservable, so a
          correct-shaped lie can be suspected but not confirmed. The contribution of this work is an
          instrument that makes it <em>countable</em>, and a measurement of how much a popular defense
          against it actually buys.
        </p>
        <p className="mt-2">
          The specific defense under test is <strong>lifecycle-state oversight</strong>: a layer above
          the per-evaluator gate that reasons about the <em>trajectory</em> an episode takes to{" "}
          <code>ACHIEVED</code>, rather than about any single evaluator&rsquo;s score. The intuition is
          that a lie which slips past every individual check may still leave an anomalous fingerprint
          in the sequence of states and score snapshots. We ask whether that intuition survives contact
          with an adversary who knows the oversight layer exists.
        </p>
        <p className="mt-2">
          <strong>Contributions.</strong> (1) A falsifiable claim and a graded-knowledge red-team
          design in which the same producer is fed strictly nested knowledge of the oversight stack
          (T0 → T1 → T2). (2) A held <strong>got-away oracle</strong> as ground truth that no
          evaluator sees, turning &ldquo;the lie cleared the gate&rdquo; into a measurable event. (3) A
          catch-rate degradation curve with each catch attributed to the layer that made it, cleanly
          decomposing the composition layer&rsquo;s marginal value from the baseline. (4) The{" "}
          <strong>erosion result</strong>: the composition layer&rsquo;s advantage runs{" "}
          <ErosionCurve />, and a structural reading of why an oversight layer the adversary can see
          behaves as a bumper rather than a bound.
        </p>
        <p className="mt-2">
          <strong>Related work.</strong> The framing sits in the verified-AI tradition, which argues
          for external verification agents when the model itself cannot be trusted [1], and in the
          AI-control / trusted-monitoring line, which studies safety protocols that hold against an
          intentionally subversive model rather than an average-case one [2]. The hidden-objective
          construction draws on the backdoor / trojan literature [3], and the &ldquo;does oversight
          scale&rdquo; question connects to work on scalable oversight for capable models [4]. Our
          emphasis is narrower and empirical: not whether oversight can be made to work, but how a
          specific composed oversight layer degrades as the adversary&rsquo;s knowledge of it
          increases.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold">II. Threat Model</h2>
        <p>
          <strong>Object under test.</strong> A producer receives an overt task that is
          machine-checkable and a researcher-specified hidden objective the eval stack does not measure
          — a backdoor that fires only on a secret <strong>trigger input</strong>. A submission is a{" "}
          <em>correct-shaped lie</em> when it reaches <code>ACHIEVED</code> (every evaluator passed){" "}
          <strong>and</strong> trips the got-away oracle.
        </p>
        <p className="mt-2">
          <strong>Held ground truth.</strong> &ldquo;Got away with it&rdquo; is scored against a{" "}
          <strong>got-away oracle</strong> unseen by any evaluator, which checks the submission&rsquo;s
          behavior on the held trigger against a reference. Getting away is a type-strict divergence on
          that trigger; a crash does not count as getting away. Because the oracle is held out of the
          gate, a lie that clears every evaluator is still caught by the truth, which is what makes the
          effect measurable.
        </p>
        <p className="mt-2">
          <strong>Graded adversary.</strong> The three tiers are the <em>same</em> producer fed
          different, strictly nested knowledge of the oversight stack, so they remain directly
          comparable:
        </p>
        <div className="my-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-600 text-left">
                <th className="py-1 pr-3">Tier</th>
                <th className="py-1 pr-3">Knowledge</th>
                <th className="py-1">Optimizes for</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-neutral-800">
                <td className="py-1 pr-3 font-semibold">T0 — naive</td>
                <td className="py-1 pr-3">the hidden objective only; nothing about the eval suite</td>
                <td className="py-1">just getting away</td>
              </tr>
              <tr className="border-b border-neutral-800">
                <td className="py-1 pr-3 font-semibold">T1 — eval-aware</td>
                <td className="py-1 pr-3">+ the full eval suite and thresholds</td>
                <td className="py-1">passing every evaluator while getting away</td>
              </tr>
              <tr className="border-b border-neutral-800">
                <td className="py-1 pr-3 font-semibold">T2 — controller-aware</td>
                <td className="py-1 pr-3">
                  + the controller&rsquo;s transitions and the composition-layer checks
                </td>
                <td className="py-1">a clean <em>state trajectory</em>, not merely passing scores</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          The tiers are instantiated by escalating trigger <em>encodings</em>: T0 plants a raw
          magic-literal trigger that a static AST scan is built to flag; T1 encodes the trigger
          arithmetically to evade that scan but introduces a branch; T2 encodes it{" "}
          <em>branchlessly</em>, matching the honest branch count so no trajectory-level branch anomaly
          remains.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold">III. System Under Test</h2>
        <p>
          <strong>Baseline gate.</strong> The evaluator stack scores each submission on{" "}
          <code>correctness</code>, <code>honesty</code>, <code>static_safety</code>, and{" "}
          <code>complexity_budget</code> under a uniform <code>EvalResult</code> contract; a controller
          advances the episode through the lifecycle{" "}
          <code>DECLARED → RESOLVING → ACTIVE → VERIFYING → {"{ACHIEVED, FAILED}"}</code> and gates the
          final transition on <code>all_passed()</code>. The eval contract and state machine are
          vendored from a CLUE substrate; the controller is a trimmed, deterministic Go service holding
          sole authority for <code>all_passed()</code>, and it calls back into a Python service to run
          each evaluator over HTTP.
        </p>
        <p className="mt-2">
          <strong>The variable under test.</strong> The <strong>composition layer</strong> reads the{" "}
          <em>frozen</em> trajectory after the gate has resolved and emits its own anomaly verdicts as
          a read-only add-on (<code>cross_stage_consistency</code>, <code>passed_too_easily</code>,{" "}
          <code>retry_score_anomaly</code>). Because it never influences the gate and only reads the
          recorded trajectory, its catches are exactly the set difference over the baseline —
          attribution stays decomposable by construction.
        </p>
        <p className="mt-2">
          <strong>Determinism as a hard invariant.</strong> The same seed yields byte-identical
          trajectories and artifacts: all randomness flows through one seeded <code>PCG64</code>{" "}
          stream, the sandbox pins <code>PYTHONHASHSEED</code>, the controller uses a per-intent
          logical clock rather than wallclock, and identifiers derive from the episode seed. This is
          what lets the degradation curve be read as a measurement rather than noise: the only
          randomness in the loop is the chosen seed, and re-running the sweep reproduces the result
          CSVs byte-for-byte.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold">IV. Results</h2>
        <p>
          We sweep all six corpus tasks × five seeds (<Stat
            artifactKey="erosion.json"
            format={int0}
            select={(b) => b.summary.find((r) => r.controller_config === "baseline")?.n ?? 0}
          />{" "}
          episodes per tier × config), scoring each episode under both controller configurations with
          the deterministic scripted adversary. <em>Survived</em> means the backdoor fired{" "}
          <strong>and</strong> no layer caught it. We report per-tier catch rate for the baseline and
          for baseline-plus-composition, the composition layer&rsquo;s marginal advantage, the survived
          rate, and the layer that made the catch.
        </p>
        <ResultsTable />
        <PaperFigure />
        <p>
          The composition layer&rsquo;s advantage runs <strong><ErosionCurve /></strong> across T0 →
          T1 → T2. At T0 the baseline already catches the lie (<code>static_safety</code> flags the raw
          literal), so the trajectory layer adds nothing. At T1 the arithmetic encoding evades the
          static scan — baseline catch drops to 0 — but the added branch leaves a trajectory signature
          that <code>cross_stage_consistency</code> flags, and composition rescues the catch (advantage{" "}
          <Adv tier="T1" />, survived <Stat
            artifactKey="erosion.json"
            format={rate2}
            select={(b) => b.erosion.find((r) => r.tier === "T1")!.survived_baseline}
          />{" "}
          → <Stat
            artifactKey="erosion.json"
            format={rate2}
            select={(b) => b.erosion.find((r) => r.tier === "T1")!.survived_composition}
          />). At T2 the branchless encoding erases that signature; neither layer catches it and the lie
          survives under both configurations.
        </p>
        <p className="mt-2">
          The got-away oracle reports the backdoor fired on <strong>every</strong> episode of{" "}
          <strong>every</strong> tier (got-away rate <Stat
            artifactKey="erosion.json"
            format={rate2}
            select={(b) => b.summary.find((r) => r.controller_config === "baseline")?.got_away_rate_all ?? 1}
          />) — the producer always plants the lie. The only thing that varies across tiers is whether
          some oversight layer caught it. This adjudicates the two hypotheses: <strong>H2</strong>{" "}
          (oversight is a bumper that erodes) holds at T1, where the composition layer catches a lie the
          per-evaluator baseline missed; but the T1 → T2 gap collapses the gain back to{" "}
          <strong>H1</strong> (oversight is bounded), where at the strongest adversary lifecycle
          reasoning adds no catch over the baseline.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold">V. Discussion and Limitations</h2>
        <p>
          <strong>The selection-pressure reading.</strong> A read-only layer over the trajectory can
          only catch a lie that <em>leaves a trajectory signature</em>. So an adversary who knows the
          layer exists is under direct pressure to produce a lie that leaves none — here, by encoding
          the backdoor branchlessly so the anomalous derivation is indistinguishable at the trajectory
          level from an honest one. The independent defense erodes exactly at the point where the
          adversary can see it. This is the general shape of the warning; the composition layer is not
          defeated because it is weak, but because it is <em>visible</em>.
        </p>
        <ScopeCallout />
        <p>
          On this corpus the <code>honesty</code> and <code>complexity_budget</code> evaluators and two
          of the three composition checks (<code>passed_too_easily</code>,{" "}
          <code>retry_score_anomaly</code>) never fire; the whole story runs through{" "}
          <code>static_safety</code> at the baseline and <code>cross_stage_consistency</code> at the
          composition layer. What the experiment establishes is the <em>shape</em> — that a visible
          trajectory-level defense can be driven to zero marginal value by a controller-aware adversary
          — not a calibrated detection rate.
        </p>
        <p className="mt-2">
          <strong>From demonstration to evidence.</strong> Turning this into a measurement rather than
          a demonstration is the role of a model-driven adversary: an LLM (via DSPy/MIPROv2, already
          wired in the harness) discovering its own evasions instead of ones we planted, across a
          scaled-up corpus. That is the next step, and it is where a magnitude — rather than a shape —
          could be claimed.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold">VI. Conclusion</h2>
        <p>
          We built an instrument that makes a correct-shaped lie countable — a held got-away oracle
          behind a lifecycle gate — and used it to measure whether trajectory-level oversight adds
          detection power over the per-evaluator checks it aggregates. Against a graded adversary the
          composition layer&rsquo;s advantage traces <ErosionCurve />: it helps against an eval-aware
          adversary and is erased by a controller-aware one. The finding is not that oversight above
          the gate is useless, but that its value is contingent on the adversary&rsquo;s ignorance of
          it.
        </p>
        <p className="mt-3 italic">
          An oversight layer the adversary can see is a bumper, not a bound.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold">References</h2>
        <References />
      </section>

      <details className="mb-6 text-sm text-neutral-400">
        <summary className="cursor-pointer font-semibold text-neutral-300">
          Supplementary (uncounted)
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>S1. Evaluator specifications</strong> — the <code>EvalResult</code> contract fields
            and the pass/threshold logic for <code>correctness</code>, <code>honesty</code>,{" "}
            <code>static_safety</code>, <code>complexity_budget</code>.
          </li>
          <li>
            <strong>S2. Tier context text</strong> — the exact knowledge string handed to the producer
            at T0, T1, T2, and the three trigger encodings (raw literal / arithmetic-with-branch /
            branchless).
          </li>
          <li>
            <strong>S3. Reproducibility</strong> — the determinism invariants and the byte-identity
            verification (<code>run_sweep.py</code> → <code>results/{"{episodes,summary,erosion}"}.csv</code>;{" "}
            <code>make_figures.py</code> → Fig. 1).
          </li>
        </ul>
      </details>
    </article>
  );
}

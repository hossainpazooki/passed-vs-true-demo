"use client";
import { LifecycleStateMachine } from "./LifecycleStateMachine";
import { TransferValidationCard } from "./TransferValidationCard";
import { GapAuditTimeline } from "./GapAuditTimeline";
import { DegradationCurve } from "./DegradationCurve";
import { TierExplorer } from "./TierExplorer";
import { TrajectoryViewer } from "./TrajectoryViewer";
import { LiveEpisodeRunner } from "./LiveEpisodeRunner";
import { HonestyLedger } from "./HonestyLedger";

function Section({ id, title, children }: { id: string; title?: string; children: React.ReactNode }) {
  return (
    <section data-testid={`section-${id}`} className="mx-auto max-w-4xl px-6 py-16">
      {title && <h2 className="mb-6 text-2xl font-bold">{title}</h2>}
      <div className="grid gap-6">{children}</div>
    </section>
  );
}

export function NarrativeBody() {
  return (
    <main>
      <Section id="hero">
        <h1 className="text-4xl font-bold">passed ≠ true</h1>
        <p className="text-lg text-neutral-300">
          An action reports success. Success isn&apos;t truth. Two sibling systems — one that builds an
          honest verification loop, one that red-teams it — measured against the same gate.
        </p>
      </Section>
      <Section id="shared-gate" title="The shared gate">
        <LifecycleStateMachine />
      </Section>
      <Section id="clue" title="CLUE — the constructive side">
        <TransferValidationCard />
        <GapAuditTimeline />
      </Section>
      <Section id="csl" title="correct-shaped-lies — the adversarial side">
        <DegradationCurve />
        <TierExplorer />
        <TrajectoryViewer />
        <LiveEpisodeRunner />
      </Section>
      <Section id="honesty" title="Honesty ledger">
        <HonestyLedger />
      </Section>
    </main>
  );
}

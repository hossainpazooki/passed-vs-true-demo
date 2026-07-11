import { DegradationCurve } from "../DegradationCurve";

export function PaperFigure() {
  return (
    <figure data-testid="paper-figure" className="my-6">
      <DegradationCurve />
      <figcaption className="mt-2 text-sm text-neutral-400">
        Fig. 1. Catch-rate and survived-rate across adversary tiers (interactive; static export at{" "}
        <code className="mx-1">docs/degradation_curve.png</code>).
      </figcaption>
    </figure>
  );
}

"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useArtifacts, Provenance } from "./ArtifactProvider";

export function DegradationCurve() {
  const { erosion } = useArtifacts();
  const data = erosion.map((r) => ({
    tier: r.tier,
    "catch (baseline)": r.catch_baseline,
    "catch (+composition)": r.catch_composition,
    "composition advantage": r.composition_advantage,
  }));
  return (
    <figure className="rounded-lg border border-neutral-800 p-4">
      <figcaption className="mb-2 font-semibold">Catch-rate degradation across adversary tiers</figcaption>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="tier" stroke="#a3a3a3" />
            <YAxis domain={[0, 1]} stroke="#a3a3a3" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="catch (baseline)" stroke="#ef4444" />
            <Line type="monotone" dataKey="catch (+composition)" stroke="#22c55e" />
            <Line type="monotone" dataKey="composition advantage" stroke="#3b82f6" strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <span data-testid="curve-data" className="sr-only">
        {erosion.map((r) => `${r.tier}:${r.composition_advantage}`).join(" ")}
      </span>
      <div className="mt-2"><Provenance artifactKey="erosion.json" /></div>
    </figure>
  );
}

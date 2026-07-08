import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArtifactProvider } from "@/components/ArtifactProvider";
import { DegradationCurve } from "@/components/DegradationCurve";
import { fixtureBundle } from "./fixtures/bundle";

describe("DegradationCurve", () => {
  it("renders the real composition-advantage series (0 → 1 → 0)", () => {
    render(<ArtifactProvider bundle={fixtureBundle}><DegradationCurve /></ArtifactProvider>);
    const data = screen.getByTestId("curve-data");
    expect(data).toHaveTextContent("T0:0");
    expect(data).toHaveTextContent("T1:1");
    expect(data).toHaveTextContent("T2:0");
  });

  it("shows provenance for the erosion artifact", () => {
    render(<ArtifactProvider bundle={fixtureBundle}><DegradationCurve /></ArtifactProvider>);
    expect(screen.getByTestId("provenance-erosion.json")).toHaveTextContent("30b287b");
  });
});

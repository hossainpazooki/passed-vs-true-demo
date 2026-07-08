import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArtifactProvider } from "@/components/ArtifactProvider";
import { NarrativeBody } from "@/components/Section";
import { fixtureBundle } from "./fixtures/bundle";

describe("NarrativeBody", () => {
  it("renders all five narrative sections", () => {
    render(<ArtifactProvider bundle={fixtureBundle}><NarrativeBody /></ArtifactProvider>);
    for (const id of ["hero", "shared-gate", "clue", "csl", "honesty"]) {
      expect(screen.getByTestId(`section-${id}`)).toBeInTheDocument();
    }
    // key figures are present
    expect(screen.getByTestId("transfer-card")).toBeInTheDocument();
    expect(screen.getByTestId("curve-data")).toBeInTheDocument();
  });
});

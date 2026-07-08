import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArtifactProvider } from "@/components/ArtifactProvider";
import { TrajectoryViewer } from "@/components/TrajectoryViewer";
import { fixtureBundle } from "./fixtures/bundle";

describe("TrajectoryViewer", () => {
  it("flags the correct-shaped lie (achieved + got_away + uncaught)", () => {
    render(<ArtifactProvider bundle={fixtureBundle}><TrajectoryViewer /></ArtifactProvider>);
    const lieRows = screen.getAllByTestId("episode-row").filter((r) => r.getAttribute("data-lie") === "true");
    expect(lieRows).toHaveLength(1); // the T1 baseline achieved/got_away/uncaught row
    expect(lieRows[0]).toHaveTextContent("correct-shaped lie");
  });

  it("does not flag a caught episode as a lie", () => {
    render(<ArtifactProvider bundle={fixtureBundle}><TrajectoryViewer /></ArtifactProvider>);
    const caught = screen.getAllByTestId("episode-row").find((r) => r.textContent?.includes("cross_stage_consistency"));
    expect(caught).toHaveAttribute("data-lie", "false");
  });
});

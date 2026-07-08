import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArtifactProvider } from "@/components/ArtifactProvider";
import { TierExplorer } from "@/components/TierExplorer";
import { fixtureBundle } from "./fixtures/bundle";

describe("TierExplorer", () => {
  it("defaults to T1 and shows both configs' catch rates", () => {
    render(<ArtifactProvider bundle={fixtureBundle}><TierExplorer /></ArtifactProvider>);
    const panel = screen.getByTestId("tier-panel");
    expect(panel).toHaveTextContent("baseline");
    expect(panel).toHaveTextContent("baseline+composition");
    // baseline catch_rate 0.00, baseline+composition catch_rate 1.00
    expect(panel).toHaveTextContent("0.00");
    expect(panel).toHaveTextContent("1.00");
    expect(panel).toHaveTextContent("cross_stage_consistency=30");
  });

  it("switches tier when a tier button is clicked", async () => {
    render(<ArtifactProvider bundle={fixtureBundle}><TierExplorer /></ArtifactProvider>);
    await userEvent.click(screen.getByRole("button", { name: "T1" }));
    expect(screen.getByTestId("tier-panel")).toHaveAttribute("data-tier", "T1");
  });
});

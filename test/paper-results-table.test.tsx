import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ArtifactProvider } from "@/components/ArtifactProvider";
import { ResultsTable } from "@/components/paper/ResultsTable";
import { fixtureBundle } from "./fixtures/bundle";

const table = () => {
  render(
    <ArtifactProvider bundle={fixtureBundle}>
      <ResultsTable />
    </ArtifactProvider>,
  );
  return screen.getByRole("table");
};

describe("ResultsTable", () => {
  it("T1 shows composition advantage +1.00 caught by cross_stage_consistency", () => {
    const row = within(table()).getByTestId("row-T1");
    expect(row).toHaveTextContent("+1.00");
    expect(row).toHaveTextContent("cross_stage_consistency");
  });

  it("renders the survived transition and — where the fixture has no attribution row", () => {
    const t = table();
    expect(within(t).getByTestId("row-T1")).toHaveTextContent("1.00 → 0.00");
    // fixture summary only carries T1 rows, so T0/T2 fall back to —
    expect(within(t).getByTestId("row-T0")).toHaveTextContent("—");
    expect(within(t).getByTestId("row-T2")).toHaveTextContent("—");
  });
});

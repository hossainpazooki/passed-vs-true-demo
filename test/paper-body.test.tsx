import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArtifactProvider } from "@/components/ArtifactProvider";
import { PaperBody } from "@/components/paper/PaperBody";
import { fixtureBundle } from "./fixtures/bundle";

const body = () =>
  render(
    <ArtifactProvider bundle={fixtureBundle}>
      <PaperBody />
    </ArtifactProvider>,
  );

describe("PaperBody", () => {
  it("shows the author, the results table, the figure, and the scope callout", () => {
    body();
    expect(screen.getByText(/Hossain Pazooki/)).toBeTruthy();
    // two tables: the §II tier table and the §IV results table
    expect(screen.getAllByRole("table").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByTestId("paper-figure")).toBeTruthy();
    expect(screen.getByTestId("scope-callout")).toBeTruthy();
  });

  it("renders the erosion curve advantage from artifacts (T1 = +1.00)", () => {
    body();
    // the ResultsTable T1 row carries the provenance-wired +1.00
    expect(screen.getByTestId("row-T1")).toHaveTextContent("+1.00");
  });

  it("leaks no editorial scaffolding", () => {
    body();
    expect(screen.queryByText(/Verify:/i)).toBeNull();
    expect(screen.queryByText(/IEEE-structured working draft/i)).toBeNull();
  });
});

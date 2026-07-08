import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArtifactProvider } from "@/components/ArtifactProvider";
import { HonestyLedger } from "@/components/HonestyLedger";
import { fixtureBundle } from "./fixtures/bundle";

describe("HonestyLedger", () => {
  it("lists both what it shows and what it does not, with source commits", () => {
    render(<ArtifactProvider bundle={fixtureBundle}><HonestyLedger /></ArtifactProvider>);
    expect(screen.getByTestId("shows")).toHaveTextContent(/degradation curve/i);
    const notShows = screen.getByTestId("not-shows");
    expect(notShows).toHaveTextContent(/blind real-world/i);
    expect(notShows).toHaveTextContent(/COSMO 0\.805 is robustness/i);
    expect(screen.getByTestId("ledger")).toHaveTextContent("c446f82");
    expect(screen.getByTestId("ledger")).toHaveTextContent("30b287b");
  });
});

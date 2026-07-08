import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArtifactProvider } from "@/components/ArtifactProvider";
import { GapAuditTimeline } from "@/components/GapAuditTimeline";
import { fixtureBundle } from "./fixtures/bundle";

describe("GapAuditTimeline", () => {
  it("renders one row per finding with its commit", () => {
    render(<ArtifactProvider bundle={fixtureBundle}><GapAuditTimeline /></ArtifactProvider>);
    const rows = screen.getAllByTestId("gap-row");
    expect(rows).toHaveLength(fixtureBundle.gapAudit.length);
    expect(rows[0]).toHaveTextContent("No held-out oracle");
    expect(rows[0]).toHaveTextContent("c5c034e");
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArtifactProvider } from "@/components/ArtifactProvider";
import { Stat, signed2 } from "@/components/paper/Stat";
import { fixtureBundle } from "./fixtures/bundle";

describe("Stat", () => {
  it("renders the T1 composition advantage from the bundle as +1.00 (no hand-typed number)", () => {
    render(
      <ArtifactProvider bundle={fixtureBundle}>
        <Stat
          data-testid="s"
          artifactKey="erosion.json"
          format={signed2}
          select={(b) => b.erosion.find((r) => r.tier === "T1")!.composition_advantage}
        />
      </ArtifactProvider>,
    );
    expect(screen.getByTestId("s")).toHaveTextContent("+1.00");
  });

  it("exposes provenance (commit sha) via the title attribute", () => {
    render(
      <ArtifactProvider bundle={fixtureBundle}>
        <Stat data-testid="s" artifactKey="erosion.json" select={(b) => b.erosion.length} />
      </ArtifactProvider>,
    );
    expect(screen.getByTestId("s").getAttribute("title")).toMatch(/30b287b/);
  });
});

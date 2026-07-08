import { describe, it, expect } from "vitest";
import { render, screen, renderHook } from "@testing-library/react";
import { ArtifactProvider, useArtifacts, Provenance } from "@/components/ArtifactProvider";
import { fixtureBundle } from "./fixtures/bundle";

describe("ArtifactProvider", () => {
  it("exposes the bundle via useArtifacts", () => {
    const { result } = renderHook(() => useArtifacts(), {
      wrapper: ({ children }) => <ArtifactProvider bundle={fixtureBundle}>{children}</ArtifactProvider>,
    });
    expect(result.current.transferValidation.f1).toBe(0.9143);
  });

  it("throws when useArtifacts is used outside a provider", () => {
    expect(() => renderHook(() => useArtifacts())).toThrow(/useArtifacts must be used within/);
  });

  it("Provenance renders source, file, and commit from the manifest", () => {
    render(
      <ArtifactProvider bundle={fixtureBundle}>
        <Provenance artifactKey="transfer_validation.json" />
      </ArtifactProvider>,
    );
    expect(screen.getByText(/upstream-label-correction/)).toBeInTheDocument();
    expect(screen.getByText(/docs\/TRANSFER_VALIDATION_RUN\.md/)).toBeInTheDocument();
    expect(screen.getByText(/c446f82/)).toBeInTheDocument();
  });
});

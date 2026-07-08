import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArtifactProvider } from "@/components/ArtifactProvider";
import { TransferValidationCard } from "@/components/TransferValidationCard";
import { fixtureBundle } from "./fixtures/bundle";

describe("TransferValidationCard", () => {
  it("shows the real F1 and confusion counts", () => {
    render(<ArtifactProvider bundle={fixtureBundle}><TransferValidationCard /></ArtifactProvider>);
    const card = screen.getByTestId("transfer-card");
    expect(card).toHaveTextContent("0.9143");
    expect(card).toHaveTextContent("0.8421");
    expect(card).toHaveTextContent("TP 16");
    expect(card).toHaveTextContent("FP 3");
    expect(card).toHaveTextContent("FN 0");
  });

  it("ALWAYS renders the train-partition caveat (honesty invariant)", () => {
    render(<ArtifactProvider bundle={fixtureBundle}><TransferValidationCard /></ArtifactProvider>);
    expect(screen.getByRole("note")).toHaveTextContent(/train partition, not blind test/i);
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArtifactProvider } from "@/components/ArtifactProvider";
import { LiveEpisodeRunner } from "@/components/LiveEpisodeRunner";
import { fixtureBundle } from "./fixtures/bundle";

describe("LiveEpisodeRunner", () => {
  it("falls back to the recorded run with a visible banner when no endpoint is configured", async () => {
    render(<ArtifactProvider bundle={fixtureBundle}><LiveEpisodeRunner /></ArtifactProvider>);
    await userEvent.click(screen.getByRole("button", { name: /run a live episode/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/live unavailable — showing recorded run/i);
    // recorded correct-shaped lie is shown
    expect(screen.getAllByTestId("episode-row").some((r) => r.getAttribute("data-lie") === "true")).toBe(true);
  });

  it("never shows a 'live (real stack)' label in the fallback state", async () => {
    render(<ArtifactProvider bundle={fixtureBundle}><LiveEpisodeRunner /></ArtifactProvider>);
    await userEvent.click(screen.getByRole("button", { name: /run a live episode/i }));
    expect(screen.queryByText(/live \(real stack\)/i)).toBeNull();
  });
});

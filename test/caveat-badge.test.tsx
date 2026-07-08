import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaveatBadge } from "@/components/CaveatBadge";

describe("CaveatBadge", () => {
  it("renders its text as a note", () => {
    render(<CaveatBadge kind="caveat">train partition, not blind test</CaveatBadge>);
    const note = screen.getByRole("note");
    expect(note).toHaveTextContent("train partition, not blind test");
  });

  it("applies a distinct class per kind", () => {
    const { rerender } = render(<CaveatBadge kind="warning">w</CaveatBadge>);
    expect(screen.getByRole("note").className).toMatch(/amber/);
    rerender(<CaveatBadge kind="provenance">p</CaveatBadge>);
    expect(screen.getByRole("note").className).toMatch(/neutral/);
  });
});

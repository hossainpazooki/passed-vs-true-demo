import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { References } from "@/components/paper/References";

describe("References", () => {
  it("renders at least 4 numbered references", () => {
    render(<References />);
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(4);
  });

  it("leaks no editorial 'Verify:' notes", () => {
    render(<References />);
    expect(screen.queryByText(/Verify:/i)).toBeNull();
  });
});

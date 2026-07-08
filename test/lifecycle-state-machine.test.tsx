import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LifecycleStateMachine } from "@/components/LifecycleStateMachine";

describe("LifecycleStateMachine", () => {
  it("renders all lifecycle states and the gate authority note", () => {
    render(<LifecycleStateMachine />);
    for (const s of ["DECLARED", "PLANNED", "EXECUTING", "VALIDATING", "ACHIEVED", "FAILED"]) {
      expect(screen.getByText(s)).toBeInTheDocument();
    }
    expect(screen.getByText(/all_passed\(\)/)).toBeInTheDocument();
  });
});

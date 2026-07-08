import { describe, it, expect } from "vitest";
import { parseCsv } from "@/lib/csv";

describe("parseCsv", () => {
  it("parses header + rows into keyed objects", () => {
    const rows = parseCsv("a,b,c\n1,2,3\n4,5,6\n");
    expect(rows).toEqual([
      { a: "1", b: "2", c: "3" },
      { a: "4", b: "5", c: "6" },
    ]);
  });

  it("ignores a trailing blank line and preserves empty trailing fields", () => {
    const rows = parseCsv("tier,caught_by\nT1,\n");
    expect(rows).toEqual([{ tier: "T1", caught_by: "" }]);
  });
});

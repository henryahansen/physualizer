import { describe, expect, it } from "vitest";
import { convertBetweenPresets, displayLength } from "./units";

describe("units", () => {
  // The muon template's expected result from the PRD: in the lab the muon
  // travels 10,834.3 ft with c = 1 ft/ns, which is 3,248.0 m in SI.
  it("shows the muon's 10,834.3 ft as 3,248.0 m in SI", () => {
    const lightSeconds = convertBetweenPresets(10_834.3, "ns-ft", "si");
    expect(displayLength(lightSeconds, "si")).toBeCloseTo(3248.0, 1);
  });

  it("shows the muon's 11,055.4 ns lab lifetime as 1.10554e-5 s", () => {
    expect(convertBetweenPresets(11_055.4, "ns-ft", "si")).toBeCloseTo(1.10554e-5, 10);
  });

  it("c = 1 presets show the stored length unchanged", () => {
    expect(displayLength(4, "yr-ly")).toBe(4);
    expect(displayLength(4, "ns-ft")).toBe(4);
  });

  it("one year is 31,557,600 seconds", () => {
    expect(convertBetweenPresets(1, "yr-ly", "s-ls")).toBe(31_557_600);
  });
});

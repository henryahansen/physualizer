/**
 * The checks from the "Correctness" section of the PRD, plus at least one
 * check for every function in lorentz.ts. These fail until M1 is done.
 */
import { describe, expect, it } from "vitest";
import {
  addVelocities,
  betaFromRapidity,
  boost,
  classify,
  contractedLength,
  dopplerFactor,
  gamma,
  interval2,
  inverseBoost,
  properTime,
  rapidity,
  relativeBeta,
  type SpacetimeEvent,
} from "./lorentz";

/**
 * A tiny random number generator with a fixed seed, so the "1,000 random
 * cases" are the same 1,000 every run. With Math.random a failure could
 * vanish when you re-run it.
 */
function seededRandom(seed: number) {
  let state = seed;
  return (min: number, max: number): number => {
    // A linear congruential generator; `>>> 0` keeps state a 32-bit integer.
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return min + (state / 2 ** 32) * (max - min);
  };
}

type Random = ReturnType<typeof seededRandom>;

const randomEvent = (random: Random): SpacetimeEvent => ({
  t: random(-10, 10),
  x: random(-10, 10),
});

const CASES = 1000;

describe("gamma", () => {
  it.each([
    [0.6, 1.25],
    [0.8, 1.666667],
    [0.98, 5.025189],
  ])("gamma(%f) is %f", (beta, expected) => {
    expect(gamma(beta)).toBeCloseTo(expected, 6);
  });

  it("is 1 at rest", () => {
    expect(gamma(0)).toBe(1);
  });
});

describe("rapidity and betaFromRapidity", () => {
  it("rapidity(0.6) is ln 2", () => {
    expect(rapidity(0.6)).toBeCloseTo(Math.log(2), 12);
  });

  it("betaFromRapidity undoes rapidity", () => {
    expect(betaFromRapidity(rapidity(0.6))).toBeCloseTo(0.6, 12);
  });

  it("rapidities add when velocities combine", () => {
    expect(rapidity(addVelocities(0.6, 0.6))).toBeCloseTo(2 * rapidity(0.6), 12);
  });
});

describe("boost", () => {
  // The train-and-platform template: lightning strikes at t = 0, x = -5 and
  // x = +5, seen from a train moving at 0.6.
  it("puts the rear strike at t' = 3.75, x' = -6.25", () => {
    const strike = boost({ t: 0, x: -5 }, 0.6);
    expect(strike.t).toBeCloseTo(3.75, 12);
    expect(strike.x).toBeCloseTo(-6.25, 12);
  });

  it("puts the front strike at t' = -3.75, x' = 6.25", () => {
    const strike = boost({ t: 0, x: 5 }, 0.6);
    expect(strike.t).toBeCloseTo(-3.75, 12);
    expect(strike.x).toBeCloseTo(6.25, 12);
  });

  it("does not change the event it is given", () => {
    const event = { t: 1, x: 2 };
    boost(event, 0.5);
    expect(event).toEqual({ t: 1, x: 2 });
  });

  it("followed by inverseBoost returns the original event to within 1e-12", () => {
    const random = seededRandom(1);
    for (let i = 0; i < CASES; i++) {
      const event = randomEvent(random);
      const beta = random(-0.95, 0.95);
      const roundTrip = inverseBoost(boost(event, beta), beta);
      expect(Math.abs(roundTrip.t - event.t)).toBeLessThan(1e-12);
      expect(Math.abs(roundTrip.x - event.x)).toBeLessThan(1e-12);
    }
  });

  it("by a then by b equals one boost by addVelocities(a, b)", () => {
    const random = seededRandom(2);
    for (let i = 0; i < CASES; i++) {
      const event = randomEvent(random);
      const a = random(-0.95, 0.95);
      const b = random(-0.95, 0.95);
      const twoSteps = boost(boost(event, a), b);
      const oneStep = boost(event, addVelocities(a, b));
      expect(Math.abs(twoSteps.t - oneStep.t)).toBeLessThan(1e-9);
      expect(Math.abs(twoSteps.x - oneStep.x)).toBeLessThan(1e-9);
    }
  });
});

describe("addVelocities", () => {
  it("0.6 plus 0.6 is 0.882353 (15/17), not 1.2", () => {
    expect(addVelocities(0.6, 0.6)).toBeCloseTo(0.882353, 6);
    expect(addVelocities(0.6, 0.6)).toBeCloseTo(15 / 17, 12);
  });
});

describe("relativeBeta", () => {
  it("two ships moving together see each other at rest", () => {
    expect(relativeBeta(0.6, 0.6)).toBeCloseTo(0, 12);
  });

  it("from the base frame, B's velocity is just betaB", () => {
    expect(relativeBeta(0, 0.6)).toBeCloseTo(0.6, 12);
  });

  it("from a ship at 0.6, the base frame moves at -0.6", () => {
    expect(relativeBeta(0.6, 0)).toBeCloseTo(-0.6, 12);
  });

  it("ships at -0.6 and +0.6 see each other at 15/17", () => {
    expect(relativeBeta(-0.6, 0.6)).toBeCloseTo(15 / 17, 12);
  });
});

describe("interval2", () => {
  it("is time squared minus space squared", () => {
    expect(interval2({ t: 0, x: 0 }, { t: 5, x: 3 })).toBeCloseTo(16, 12);
  });

  it("does not depend on which event comes first", () => {
    expect(interval2({ t: 5, x: 3 }, { t: 0, x: 0 })).toBeCloseTo(16, 12);
  });

  it("is unchanged by any boost, to 1e-9 relative, over 1,000 random cases", () => {
    const random = seededRandom(3);
    for (let i = 0; i < CASES; i++) {
      const a = randomEvent(random);
      const b = randomEvent(random);
      const beta = random(-0.95, 0.95);
      const before = interval2(a, b);
      const after = interval2(boost(a, beta), boost(b, beta));
      // Relative tolerance, but never tighter than 1e-9 absolute, so
      // intervals near zero don't demand impossible precision.
      const tolerance = 1e-9 * Math.max(1, Math.abs(before));
      expect(Math.abs(after - before)).toBeLessThan(tolerance);
    }
  });
});

describe("classify", () => {
  const origin = { t: 0, x: 0 };

  it("more time than space is timelike", () => {
    expect(classify(origin, { t: 5, x: 3 })).toBe("timelike");
  });

  it("more space than time is spacelike", () => {
    expect(classify(origin, { t: 3, x: 5 })).toBe("spacelike");
  });

  it("equal time and space is lightlike", () => {
    expect(classify(origin, { t: 4, x: -4 })).toBe("lightlike");
  });

  it("treats a rounding-sized difference as lightlike", () => {
    expect(classify(origin, { t: 4, x: 4 + 1e-13 })).toBe("lightlike");
  });
});

describe("properTime", () => {
  const depart = { t: 0, x: 0 };
  const turnaround = { t: 5, x: 4 };
  const reunion = { t: 10, x: 0 };

  it("the travelling twin ages 6", () => {
    expect(properTime([depart, turnaround, reunion])).toBeCloseTo(6, 12);
  });

  it("the home twin ages 10", () => {
    expect(properTime([depart, reunion])).toBeCloseTo(10, 12);
  });

  it("is 0 for a single event", () => {
    expect(properTime([depart])).toBe(0);
  });
});

describe("contractedLength", () => {
  it("a rod of rest length 10 at 0.8 is 6 long", () => {
    expect(contractedLength(10, 0.8)).toBeCloseTo(6, 12);
  });
});

describe("dopplerFactor", () => {
  it("a source receding at 0.6 has factor 2", () => {
    expect(dopplerFactor(0.6)).toBeCloseTo(2, 12);
  });

  it("a source approaching at 0.6 has factor 1/2", () => {
    expect(dopplerFactor(-0.6)).toBeCloseTo(0.5, 12);
  });
});

describe("guards", () => {
  const impossibleBetas = [1, -1, 1.5, -2];

  it.each(impossibleBetas)("beta = %f throws a RangeError everywhere", (beta) => {
    expect(() => gamma(beta)).toThrow(RangeError);
    expect(() => rapidity(beta)).toThrow(RangeError);
    expect(() => boost({ t: 1, x: 1 }, beta)).toThrow(RangeError);
    expect(() => inverseBoost({ t: 1, x: 1 }, beta)).toThrow(RangeError);
    expect(() => contractedLength(10, beta)).toThrow(RangeError);
    expect(() => dopplerFactor(beta)).toThrow(RangeError);
  });

  it("properTime rejects a spacelike segment", () => {
    expect(() => properTime([{ t: 0, x: 0 }, { t: 1, x: 2 }])).toThrow(RangeError);
  });

  it("properTime rejects a lightlike segment", () => {
    expect(() => properTime([{ t: 0, x: 0 }, { t: 1, x: 1 }])).toThrow(RangeError);
  });
});

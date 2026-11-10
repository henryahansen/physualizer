/**
 * Special relativity in one space dimension: the Lorentz transformation and the
 * formulas built on it.
 *
 * HENRY WRITES EVERY FUNCTION BODY IN THIS FILE (milestone M1).
 * Until then each function throws "not implemented", so lorentz.test.ts fails
 * on purpose. Run `npm test` and work until it is all green.
 *
 * Conventions for everything in src/physics/:
 * - Units have c = 1, so time and distance share one unit
 *   (ns and light-ns, years and light-years, ...).
 * - `beta` is a velocity as a fraction of c. Valid values satisfy -1 < beta < 1.
 * - Positive beta means moving toward +x.
 * - When an input is physically impossible (|beta| >= 1, a clock moving at or
 *   faster than light), throw a RangeError. The tests check for RangeError
 *   specifically, so a plain Error does not count.
 */

// The stubs below don't use their parameters yet. Delete this line in M1.
/* eslint-disable @typescript-eslint/no-unused-vars */

/** A point in spacetime: time t and position x, in the scene's c = 1 units. */
export type SpacetimeEvent = { t: number; x: number };

/** How two events are separated. See interval2. */
export type IntervalKind = "timelike" | "spacelike" | "lightlike";

/**
 * The Lorentz factor, gamma = 1 / sqrt(1 - beta^2).
 * It is 1 at rest and grows without limit as |beta| approaches 1.
 * Throws a RangeError if |beta| >= 1.
 */
export function gamma(beta: number): number {
  throw new Error("gamma is not implemented yet (milestone M1)");
}

/**
 * Rapidity, phi = atanh(beta).
 * Rapidities simply add when you chain boosts, which is why frame-switch
 * animations interpolate in rapidity instead of in beta.
 * Throws a RangeError if |beta| >= 1.
 */
export function rapidity(beta: number): number {
  throw new Error("rapidity is not implemented yet (milestone M1)");
}

/**
 * The inverse of rapidity: beta = tanh(phi).
 * Any finite phi gives a valid beta strictly between -1 and 1.
 */
export function betaFromRapidity(phi: number): number {
  throw new Error("betaFromRapidity is not implemented yet (milestone M1)");
}

/**
 * The same event's coordinates as measured in a frame moving at `beta`
 * relative to the frame the event is currently written in:
 *   t' = gamma * (t - beta * x)
 *   x' = gamma * (x - beta * t)
 * Returns a new object and leaves `event` unchanged.
 * Throws a RangeError if |beta| >= 1.
 */
export function boost(event: SpacetimeEvent, beta: number): SpacetimeEvent {
  throw new Error("boost is not implemented yet (milestone M1)");
}

/**
 * Undoes boost: takes coordinates measured in the frame moving at `beta` and
 * returns them in the original frame, so inverseBoost(boost(e, beta), beta)
 * gives back e.
 * Throws a RangeError if |beta| >= 1.
 */
export function inverseBoost(
  event: SpacetimeEvent,
  beta: number,
): SpacetimeEvent {
  throw new Error("inverseBoost is not implemented yet (milestone M1)");
}

/**
 * Relativistic velocity addition, (u + v) / (1 + u * v).
 * If frame A moves at u, and an object moves at v as measured in A, the
 * object moves at addVelocities(u, v) in the original frame.
 */
export function addVelocities(u: number, v: number): number {
  throw new Error("addVelocities is not implemented yet (milestone M1)");
}

/**
 * The velocity of B as measured by an observer at rest in A, where betaA and
 * betaB are both measured in the base frame.
 * Example: relativeBeta(0.6, 0.6) is 0, because two ships flying side by side
 * see each other at rest.
 */
export function relativeBeta(betaA: number, betaB: number): number {
  throw new Error("relativeBeta is not implemented yet (milestone M1)");
}

/**
 * The squared spacetime interval between events a and b:
 *   (time separation)^2 - (space separation)^2
 * Positive means timelike, negative means spacelike, zero means lightlike.
 * Every inertial frame computes the same value; that is what "invariant" means.
 */
export function interval2(a: SpacetimeEvent, b: SpacetimeEvent): number {
  throw new Error("interval2 is not implemented yet (milestone M1)");
}

/**
 * Classifies the separation between a and b using interval2.
 * An interval within `tolerance` of zero counts as "lightlike", so rounding
 * error cannot turn an exact light signal into a tiny timelike one.
 */
export function classify(
  a: SpacetimeEvent,
  b: SpacetimeEvent,
  tolerance = 1e-9,
): IntervalKind {
  throw new Error("classify is not implemented yet (milestone M1)");
}

/**
 * Total proper time (what a clock carried along the path reads) along
 * straight segments joining `events` in order: the sum, over each segment,
 * of sqrt(interval2(start, end)).
 * Returns 0 for fewer than two events.
 * Throws a RangeError if any segment is not timelike, because no clock can
 * travel at or faster than light.
 */
export function properTime(events: SpacetimeEvent[]): number {
  throw new Error("properTime is not implemented yet (milestone M1)");
}

/**
 * The length of an object whose rest length is `restLength`, measured in a
 * frame where it moves at `beta`: restLength / gamma.
 * Throws a RangeError if |beta| >= 1.
 */
export function contractedLength(restLength: number, beta: number): number {
  throw new Error("contractedLength is not implemented yet (milestone M1)");
}

/**
 * The relativistic Doppler factor for a source moving along the line of
 * sight: sqrt((1 + beta) / (1 - beta)).
 * Positive beta means the source is receding, so the factor is above 1 and
 * stretches the time between signals: received gap = factor * emitted gap.
 * Throws a RangeError if |beta| >= 1.
 */
export function dopplerFactor(beta: number): number {
  throw new Error("dopplerFactor is not implemented yet (milestone M1)");
}

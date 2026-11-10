/**
 * Unit presets. This is bookkeeping, not physics, so Claude Code writes it
 * (Henry writes lorentz.ts).
 *
 * A scene stores every number in a pair of units where c = 1: a length is
 * "how far light travels in that much time". The preset decides what the
 * units are called on screen. SI is the one preset that shows a different
 * number than the one stored: it stores seconds and light-seconds and shows
 * lengths in metres.
 */

/** Exact, because the metre is defined from it. */
export const SPEED_OF_LIGHT_M_PER_S = 299_792_458;

/** A Julian year, the year used in the official definition of a light-year. */
const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60;

export const UNIT_PRESET_IDS = ["ns-ft", "s-ls", "yr-ly", "si"] as const;
export type UnitPresetId = (typeof UNIT_PRESET_IDS)[number];

type UnitPreset = {
  /** Shown in the units menu. */
  label: string;
  /** Shown after time values. */
  timeUnit: string;
  /** Shown after length values. */
  lengthUnit: string;
  /** How many SI seconds one stored time unit is. Used to switch presets. */
  secondsPerTimeUnit: number;
  /** Multiply a stored length by this to get the length shown on screen. */
  displayedLengthPerStoredLength: number;
  /** One line shown under the preset in the units menu, if it needs one. */
  note?: string;
};

export const UNIT_PRESETS: Record<UnitPresetId, UnitPreset> = {
  "ns-ft": {
    label: "ns and ft",
    timeUnit: "ns",
    lengthUnit: "ft",
    secondsPerTimeUnit: 1e-9,
    displayedLengthPerStoredLength: 1,
    note: "Treats c as exactly 1 ft/ns. The true value is 0.9836 ft/ns.",
  },
  "s-ls": {
    label: "s and light-seconds",
    timeUnit: "s",
    lengthUnit: "light-s",
    secondsPerTimeUnit: 1,
    displayedLengthPerStoredLength: 1,
  },
  "yr-ly": {
    label: "yr and ly",
    timeUnit: "yr",
    lengthUnit: "ly",
    secondsPerTimeUnit: SECONDS_PER_YEAR,
    displayedLengthPerStoredLength: 1,
  },
  si: {
    label: "SI",
    timeUnit: "s",
    lengthUnit: "m",
    secondsPerTimeUnit: 1,
    // Stored lengths are light-seconds; one light-second is c metres.
    displayedLengthPerStoredLength: SPEED_OF_LIGHT_M_PER_S,
  },
};

/** The number shown on screen for a stored length. */
export function displayLength(storedLength: number, preset: UnitPresetId): number {
  return storedLength * UNIT_PRESETS[preset].displayedLengthPerStoredLength;
}

/**
 * Rescales a stored time or length when a scene switches presets, so the
 * physics stays the same. Example: 2 ns becomes 2e-9 s.
 * Lengths rescale by the same factor because each stored length unit is
 * "light-<time unit>".
 */
export function convertBetweenPresets(
  storedValue: number,
  from: UnitPresetId,
  to: UnitPresetId,
): number {
  return (
    (storedValue * UNIT_PRESETS[from].secondsPerTimeUnit) /
    UNIT_PRESETS[to].secondsPerTimeUnit
  );
}

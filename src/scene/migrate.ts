/** The scene format version this code reads and writes. */
export const CURRENT_VERSION = 1;

/**
 * Upgrades a scene saved by an older Physualizer to the current format, so
 * old share links keep working after the format changes.
 *
 * Today only version 1 exists, so a version-1 scene passes straight through.
 * When version 2 arrives, bump CURRENT_VERSION, change the schema, and add one
 * step here that turns a version-1 scene into a version-2 scene:
 *
 *   if (scene.version === 1) scene = upgradeFrom1To2(scene);
 *
 * Steps run in order, so a version-1 link would go 1 -> 2 -> 3 and so on.
 *
 * Returns the upgraded data, still unchecked (the schema checks it next).
 * Throws if the data has no version or a version this code doesn't know.
 */
export function migrateScene(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null || !("version" in raw)) {
    throw new Error("This is not a Physualizer scene: it has no version number.");
  }
  if (raw.version === CURRENT_VERSION) {
    return raw;
  }
  throw new Error(
    `This scene says it is version ${String(raw.version)}, which this copy of Physualizer cannot read.`,
  );
}

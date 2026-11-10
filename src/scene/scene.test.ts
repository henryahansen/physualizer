/**
 * The "Scene tests" from the PRD: share links round-trip exactly, and bad
 * scenes produce an error instead of a drawing.
 */
import { compressToEncodedURIComponent } from "lz-string";
import { describe, expect, it } from "vitest";
import { parseScene, type Scene } from "./schema";
import { TEMPLATES } from "./templates";
import twinParadox from "./templates/twin-paradox.json";
import { sceneFromHash, sceneToHash } from "./url";

// These tests poke at raw JSON to break it on purpose, so they need a loose type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawScene = any;

/** A copy of the twin paradox scene with one thing broken by `change`. */
function brokenTwinParadox(change: (scene: RawScene) => void) {
  const copy = structuredClone(twinParadox) as RawScene;
  change(copy);
  return copy;
}

describe("share links", () => {
  it.each(TEMPLATES.map((t) => [t.slug, t.scene] as [string, Scene]))(
    "%s survives encoding and decoding unchanged",
    (_slug, scene) => {
      expect(sceneFromHash(sceneToHash(scene))).toEqual({ ok: true, scene });
    },
  );

  it("accepts the fragment with its leading #", () => {
    const scene = TEMPLATES[0].scene;
    expect(sceneFromHash("#" + sceneToHash(scene))).toEqual({ ok: true, scene });
  });

  it.each([
    ["an empty fragment", ""],
    ["a lone #", "#"],
    ["random text", "#definitely-not-a-scene"],
    ["valid compression of something that isn't JSON", compressToEncodedURIComponent("{oops")],
    ["valid JSON that isn't a scene", compressToEncodedURIComponent('{"hello":"world"}')],
  ])("rejects %s", (_name, hash) => {
    const result = sceneFromHash(hash);
    expect(result.ok).toBe(false);
  });
});

describe("validation", () => {
  it("accepts the twin paradox as written in the PRD", () => {
    expect(parseScene(twinParadox).ok).toBe(true);
  });

  it.each([
    ["a frame at the speed of light", (s: RawScene) => (s.frames[1].beta = 1)],
    ["a frame faster than light", (s: RawScene) => (s.frames[1].beta = 1.5)],
    ["a view boost faster than light", (s: RawScene) => (s.view.beta = -1.2)],
    ["a zoom of zero", (s: RawScene) => (s.view.zoom = 0)],
    ["an unknown version", (s: RawScene) => (s.version = 2)],
    ["a missing version", (s: RawScene) => delete s.version],
    ["an unknown kind", (s: RawScene) => (s.kind = "mechanics-2d")],
    ["an unknown unit preset", (s: RawScene) => (s.units = "furlongs")],
    ["a coordinate that is text", (s: RawScene) => (s.events[0].t = "zero")],
    ["a misspelled key", (s: RawScene) => (s.events[0].lable = "typo")],
    ["a worldline through a missing event", (s: RawScene) => s.worldlines[1].through.push("mars")],
    ["a worldline through one event only", (s: RawScene) => (s.worldlines[0].through = ["depart"])],
    ["a view frame that doesn't exist", (s: RawScene) => (s.view.frame = "mars")],
    ["a duplicate id", (s: RawScene) => (s.events[1].id = "depart")],
    ["no base frame with beta 0", (s: RawScene) => (s.frames[0].beta = 0.1)],
    ["an unknown overlay", (s: RawScene) => s.view.overlays.push("sparkles")],
  ])("rejects %s with a readable error", (_name, change) => {
    const result = parseScene(brokenTwinParadox(change));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.length).toBeGreaterThan(0);
  });
});

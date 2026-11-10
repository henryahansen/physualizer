/**
 * The shape of a scene, written as a Zod schema.
 *
 * A scene is one JSON document that every feature reads and writes. This file
 * is the single source of truth for what a valid scene looks like: Zod checks
 * data against it at runtime, and `Scene` (below) is the matching TypeScript
 * type, derived from the schema so the two can never disagree.
 *
 * Objects are "strict": an unknown key such as a misspelled "restlenght" is an
 * error rather than being silently dropped.
 */
import { z } from "zod";
import { UNIT_PRESET_IDS } from "../physics";
import { migrateScene } from "./migrate";

/** A velocity as a fraction of c. Strictly between -1 and 1. */
const beta = z.number().gt(-1).lt(1);
const id = z.string().min(1);
const label = z.string();

const frame = z.strictObject({ id, label, beta });

const event = z.strictObject({ id, label, t: z.number(), x: z.number() });

// A worldline is either straight segments joining an ordered list of events,
// or an infinite straight line through one event at a given velocity.
const segmentedWorldline = z.strictObject({
  id,
  label,
  through: z.array(id).min(2),
});
const straightWorldline = z.strictObject({ id, label, event: id, beta });
const worldline = z.union([segmentedWorldline, straightWorldline]);

const signal = z.strictObject({
  id,
  label,
  event: id,
  direction: z.enum(["left", "right"]),
});

// The rod's rear (left) end passes through `event`; the front end is
// `restLength` further along, measured in the rod's own rest frame.
const rod = z.strictObject({
  id,
  label,
  event: id,
  beta,
  restLength: z.number().positive(),
});

// `text` may contain inline LaTeX between $ signs.
const annotation = z.strictObject({
  id,
  text: z.string(),
  t: z.number(),
  x: z.number(),
});

export const OVERLAYS = [
  "lightCones",
  "secondFrame",
  "simultaneity",
  "properTimeTicks",
  "hyperbola",
] as const;

const view = z.strictObject({
  frame: id,
  beta,
  center: z.strictObject({ t: z.number(), x: z.number() }),
  zoom: z.number().positive(),
  overlays: z.array(z.enum(OVERLAYS)),
});

export const sceneSchema = z
  .strictObject({
    version: z.literal(1),
    kind: z.literal("sr-1d"),
    title: z.string(),
    units: z.enum(UNIT_PRESET_IDS),
    frames: z.array(frame).min(1),
    events: z.array(event),
    worldlines: z.array(worldline),
    signals: z.array(signal),
    rods: z.array(rod),
    annotations: z.array(annotation),
    view,
  })
  .superRefine((scene, ctx) => {
    // Checks that need the whole scene: ids must be unique, and every id a
    // scene refers to must exist.
    const allIds = [
      ...scene.frames,
      ...scene.events,
      ...scene.worldlines,
      ...scene.signals,
      ...scene.rods,
      ...scene.annotations,
    ].map((object) => object.id);
    const seen = new Set<string>();
    for (const objectId of allIds) {
      if (seen.has(objectId)) {
        ctx.addIssue({
          code: "custom",
          message: `The id "${objectId}" is used more than once.`,
        });
      }
      seen.add(objectId);
    }

    const eventIds = new Set(scene.events.map((e) => e.id));
    const requireEvent = (ref: string, path: (string | number)[]) => {
      if (!eventIds.has(ref)) {
        ctx.addIssue({ code: "custom", message: `No event has the id "${ref}".`, path });
      }
    };
    scene.worldlines.forEach((w, i) => {
      if ("through" in w) {
        w.through.forEach((ref, j) => requireEvent(ref, ["worldlines", i, "through", j]));
      } else {
        requireEvent(w.event, ["worldlines", i, "event"]);
      }
    });
    scene.signals.forEach((s, i) => requireEvent(s.event, ["signals", i, "event"]));
    scene.rods.forEach((r, i) => requireEvent(r.event, ["rods", i, "event"]));

    if (!scene.frames.some((f) => f.id === scene.view.frame)) {
      ctx.addIssue({
        code: "custom",
        message: `The view uses frame "${scene.view.frame}", which the scene does not define.`,
        path: ["view", "frame"],
      });
    }

    // Every coordinate is stored in the base frame, so one must exist.
    if (!scene.frames.some((f) => f.beta === 0)) {
      ctx.addIssue({
        code: "custom",
        message: "One frame must have beta 0. It is the base frame every coordinate is stored in.",
        path: ["frames"],
      });
    }
  });

export type Scene = z.infer<typeof sceneSchema>;

export type SceneResult =
  | { ok: true; scene: Scene }
  | { ok: false; error: string };

/**
 * Checks untrusted data (a share link, an imported file, a template) and
 * returns either a valid scene or a readable error message. Never throws, so
 * callers can't forget to handle a bad scene: they have to look at `ok`.
 */
export function parseScene(raw: unknown): SceneResult {
  let migrated: unknown;
  try {
    migrated = migrateScene(raw);
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }

  const result = sceneSchema.safeParse(migrated);
  if (!result.success) {
    return { ok: false, error: z.prettifyError(result.error) };
  }
  return { ok: true, scene: result.data };
}

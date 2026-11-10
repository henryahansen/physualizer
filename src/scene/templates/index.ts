/**
 * The template gallery. M0 ships the twin paradox (it is the PRD's example
 * scene, and M2 renders it) and the blank diagram. The other six arrive in M6.
 */
import { parseScene, type Scene } from "../schema";
import blank from "./blank.json";
import twinParadox from "./twin-paradox.json";

export type Template = {
  /** The URL piece: /t/<slug>. */
  slug: string;
  /** One sentence for the gallery and for search results. */
  description: string;
  scene: Scene;
};

/**
 * Templates are validated when this file loads, so a typo in a template's
 * JSON breaks the build and the tests instead of reaching a student.
 */
function checked(slug: string, raw: unknown): Scene {
  const result = parseScene(raw);
  if (!result.ok) {
    throw new Error(`Template "${slug}" is not a valid scene:\n${result.error}`);
  }
  return result.scene;
}

export const TEMPLATES: Template[] = [
  {
    slug: "twin-paradox",
    description:
      "One twin flies 4 light-years out at 0.8c and comes back. Who is older at the reunion, and by how much?",
    scene: checked("twin-paradox", twinParadox),
  },
  {
    slug: "blank",
    description: "An empty spacetime diagram for building your own problem.",
    scene: checked("blank", blank),
  },
];

export function findTemplate(slug: string): Template | undefined {
  return TEMPLATES.find((template) => template.slug === slug);
}

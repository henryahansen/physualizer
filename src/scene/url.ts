/**
 * Share links. The whole scene is squeezed into the URL fragment, the part
 * after "#". Browsers never send the fragment to a server, so a shared scene
 * stays between the people who have the link.
 */
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { parseScene, type Scene, type SceneResult } from "./schema";

/**
 * Turns a scene into the text that goes after "#" in a share link.
 * lz-string shrinks the JSON and uses only characters that are safe in a URL.
 */
export function sceneToHash(scene: Scene): string {
  return compressToEncodedURIComponent(JSON.stringify(scene));
}

/**
 * Reads a scene back out of a link's fragment, with or without the leading
 * "#". Never throws: a damaged or invalid link becomes { ok: false, error }.
 */
export function sceneFromHash(hash: string): SceneResult {
  const compressed = hash.startsWith("#") ? hash.slice(1) : hash;
  if (compressed === "") {
    return { ok: false, error: "This link has no scene in it." };
  }

  let raw: unknown;
  try {
    const json = decompressFromEncodedURIComponent(compressed);
    if (!json) throw new Error("nothing to decompress");
    raw = JSON.parse(json);
  } catch {
    return { ok: false, error: "This link is damaged: its scene data could not be read." };
  }
  return parseScene(raw);
}

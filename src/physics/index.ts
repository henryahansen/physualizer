// The only door into src/physics/. Everything outside this folder imports
// from "@/physics" (this file), never from lorentz.ts or units.ts directly,
// so the physics can be reorganised without touching the rest of the app.
// A lint rule in eslint.config.mjs enforces this.
export * from "./lorentz";
export * from "./units";

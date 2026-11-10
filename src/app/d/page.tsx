"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { sceneFromHash } from "@/scene/url";

// The scene lives after "#" in the URL. Browsers never send that part to the
// server, so this page has to read it in the browser. useSyncExternalStore
// reads window.location.hash and re-renders whenever it changes.
function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const readHash = () => window.location.hash;
// While the page is pre-built on the server there is no URL yet.
const readHashOnServer = () => null;

export default function CustomScenePage() {
  const hash = useSyncExternalStore(subscribeToHash, readHash, readHashOnServer);
  if (hash === null) return <p>Loading the scene…</p>;

  const result = sceneFromHash(hash);
  if (!result.ok) {
    return (
      <>
        <h1 className="text-2xl">This link could not be opened</h1>
        <pre className="mt-4 font-serif whitespace-pre-wrap">{result.error}</pre>
        <p className="mt-6">
          <Link href="/">Back to the templates</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl">{result.scene.title}</h1>
      <p className="mt-8">Scene loaded. The diagram arrives in milestone M2.</p>
    </>
  );
}

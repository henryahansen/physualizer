import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

// Placeholder until M7 writes the real page.
export default function AboutPage() {
  return (
    <>
      <h1 className="text-2xl">About</h1>
      <p className="mt-4 max-w-prose">
        Physualizer is a free tool for drawing, animating and sharing spacetime
        diagrams for special relativity problems. There is no sign-in, and
        nothing you make is sent to a server.
      </p>
      <p className="mt-4">
        <a href="https://github.com/henryahansen/physualizer">Source code</a>
      </p>
    </>
  );
}

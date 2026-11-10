import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Physualizer", template: "%s · Physualizer" },
  description:
    "Build, animate and share spacetime diagrams for special relativity problems. Free, no sign-in.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <header className="flex items-baseline justify-between border-b px-6 py-3">
          <Link href="/" className="text-xl no-underline">
            Physualizer
          </Link>
          <nav className="flex gap-6">
            <Link href="/">Templates</Link>
            <Link href="/about">About</Link>
          </nav>
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </body>
    </html>
  );
}

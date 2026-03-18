/**
 * Root Layout
 * 
 * Provides the shared navigation bar and HTML structure
 * for all pages in the app.
 */

import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CodePractice — Learn to Code",
  description:
    "A beginner-friendly coding practice platform. Solve problems, submit code, and track your progress.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} antialiased`}>
        {/* ─── Navigation Bar ─────────────────────────────────── */}
        <nav className="border-b-3 border-brutal-border bg-brutal-blue px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-white"
            >
              ⚡ CodePractice
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="nav-link rounded-md text-white hover:text-brutal-dark"
              >
                Problems
              </Link>
              <Link
                href="/submissions"
                className="nav-link rounded-md text-white hover:text-brutal-dark"
              >
                Submissions
              </Link>
              <Link
                href="/leaderboard"
                className="nav-link rounded-md text-white hover:text-brutal-dark"
              >
                Leaderboard
              </Link>
            </div>
          </div>
        </nav>

        {/* ─── Page Content ───────────────────────────────────── */}
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}

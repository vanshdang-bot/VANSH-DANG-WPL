/**
 * Home Page — Problem List
 * 
 * Displays all coding problems with difficulty filters.
 * Uses Neo-Brutalism card design for each problem.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  expectedOutput: string;
}

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"] as const;

// Map difficulty to badge CSS class
function getBadgeClass(difficulty: string): string {
  switch (difficulty) {
    case "Easy":
      return "badge-easy";
    case "Medium":
      return "badge-medium";
    case "Hard":
      return "badge-hard";
    default:
      return "";
  }
}

// Map difficulty to card accent color
function getCardAccent(difficulty: string): string {
  switch (difficulty) {
    case "Easy":
      return "border-l-[6px] border-l-brutal-green";
    case "Medium":
      return "border-l-[6px] border-l-brutal-yellow";
    case "Hard":
      return "border-l-[6px] border-l-brutal-red";
    default:
      return "";
  }
}

export default function HomePage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  // Fetch problems whenever the filter changes
  useEffect(() => {
    setLoading(true);
    const params = filter !== "All" ? `?difficulty=${filter}` : "";
    fetch(`/api/problems${params}`)
      .then((res) => res.json())
      .then((data) => {
        setProblems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">🧩 Problems</h1>
        <p className="text-lg text-gray-600">
          Pick a challenge and start coding!
        </p>
      </div>

      {/* ─── Filter Buttons ─────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap gap-3">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            className={`brutal-btn rounded-md px-4 py-2 text-sm ${filter === d
                ? "bg-brutal-dark text-white"
                : "bg-white text-brutal-dark"
              }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* ─── Loading State ──────────────────────────────────── */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="brutal-card brutal-pulse h-24 rounded-lg bg-gray-100 p-6"
            />
          ))}
        </div>
      )}

      {/* ─── Problem Cards ──────────────────────────────────── */}
      {!loading && (
        <div className="space-y-4">
          {problems.map((problem, index) => (
            <Link key={problem.id} href={`/problem/${problem.id}`}>
              <div
                className={`brutal-card mb-4 flex cursor-pointer items-center justify-between rounded-lg p-6 ${getCardAccent(
                  problem.difficulty
                )}`}
              >
                <div className="flex items-center gap-4">
                  {/* Problem Number */}
                  <span className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-brutal-border bg-brutal-bg font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold">{problem.title}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Problem #{problem.id}
                    </p>
                  </div>
                </div>

                {/* Difficulty Badge */}
                <span
                  className={`${getBadgeClass(
                    problem.difficulty
                  )} rounded-md px-3 py-1 text-sm uppercase`}
                >
                  {problem.difficulty}
                </span>
              </div>
            </Link>
          ))}

          {/* Empty State */}
          {problems.length === 0 && (
            <div className="brutal-card rounded-lg p-12 text-center">
              <p className="text-xl font-bold">No problems found 🤔</p>
              <p className="mt-2 text-gray-500">
                Try changing the difficulty filter.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

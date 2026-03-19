/**
 * data.ts — Helper functions for reading/writing JSON data files.
 */

import fs from "fs";
import path from "path";

// ─── Types ───────────────────────────────────────────────────────────

export interface TestCase {
  input: string;
  expectedOutput: string;
  hidden: boolean;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  testCases: TestCase[];
  starterCode: {
    python: string;
    cpp: string;
    java: string;
  };
  solution: {
    python: string;
    cpp: string;
    java: string;
  };
}

export interface Submission {
  id: string;
  problemId: string;
  problemTitle: string;
  code: string;
  language: string;
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Pending";
  output: string;
  createdAt: string;
  user: string;
}

// ─── File Paths ──────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");
const PROBLEMS_FILE = path.join(DATA_DIR, "problems.json");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");

// ─── Problem Helpers ─────────────────────────────────────────────────

/** Get all problems, optionally filtered by difficulty */
export function getProblems(difficulty?: string): Problem[] {
  const raw = fs.readFileSync(PROBLEMS_FILE, "utf-8");
  const problems: Problem[] = JSON.parse(raw);

  if (difficulty && difficulty !== "All") {
    return problems.filter(
      (p) => p.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
  }

  return problems;
}

/** Get a single problem by its ID */
export function getProblemById(id: string): Problem | undefined {
  const problems = getProblems();
  return problems.find((p) => p.id === id);
}

// ─── Submission Helpers ──────────────────────────────────────────────

/** Get all submissions, optionally filtered by problemId */
export function getSubmissions(problemId?: string): Submission[] {
  const raw = fs.readFileSync(SUBMISSIONS_FILE, "utf-8");
  const submissions: Submission[] = JSON.parse(raw);

  if (problemId) {
    return submissions.filter((s) => s.problemId === problemId);
  }

  return submissions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Add a new submission and save to disk */
export function addSubmission(submission: Submission): void {
  const submissions = getSubmissions();
  submissions.push(submission);
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
}

// ─── Leaderboard Helper ─────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  user: string;
  solved: number;
}

/** Get leaderboard: count of unique accepted problems per user */
export function getLeaderboard(): LeaderboardEntry[] {
  const submissions = getSubmissions();

  const userSolves: Record<string, Set<string>> = {};

  for (const sub of submissions) {
    if (sub.status === "Accepted") {
      if (!userSolves[sub.user]) {
        userSolves[sub.user] = new Set();
      }
      userSolves[sub.user].add(sub.problemId);
    }
  }

  const entries = Object.entries(userSolves)
    .map(([user, problemSet]) => ({
      rank: 0,
      user,
      solved: problemSet.size,
    }))
    .sort((a, b) => b.solved - a.solved);

  entries.forEach((entry, i) => {
    entry.rank = i + 1;
  });

  return entries;
}

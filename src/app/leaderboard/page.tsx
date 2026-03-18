/**
 * Leaderboard Page
 * 
 * Shows a ranked table of users by the number of
 * unique problems they have solved (Accepted).
 */

"use client";

import { useEffect, useState } from "react";

interface LeaderboardEntry {
    rank: number;
    user: string;
    solved: number;
}

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/leaderboard")
            .then((res) => res.json())
            .then((data) => {
                setEntries(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Trophy / medal icons for top 3
    function getRankDisplay(rank: number) {
        switch (rank) {
            case 1:
                return "🥇";
            case 2:
                return "🥈";
            case 3:
                return "🥉";
            default:
                return `#${rank}`;
        }
    }

    // Row accent for top 3
    function getRowStyle(rank: number) {
        switch (rank) {
            case 1:
                return "bg-brutal-yellow";
            case 2:
                return "bg-gray-100";
            case 3:
                return "bg-brutal-orange/30";
            default:
                return rank % 2 === 0 ? "bg-white" : "bg-gray-50";
        }
    }

    return (
        <div>
            {/* ─── Header ────────────────────────────────────────── */}
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold">🏆 Leaderboard</h1>
                <p className="text-lg text-gray-600">
                    Who has solved the most problems?
                </p>
            </div>

            {/* ─── Loading State ──────────────────────────────────── */}
            {loading && (
                <div className="brutal-card brutal-pulse rounded-lg p-12 text-center">
                    <p className="text-xl font-bold">Loading leaderboard...</p>
                </div>
            )}

            {/* ─── Empty State ───────────────────────────────────── */}
            {!loading && entries.length === 0 && (
                <div className="brutal-card rounded-lg p-12 text-center">
                    <p className="text-4xl mb-4">🏅</p>
                    <p className="text-xl font-bold">No one on the leaderboard yet!</p>
                    <p className="mt-2 text-gray-500">
                        Be the first to solve a problem and claim the top spot.
                    </p>
                </div>
            )}

            {/* ─── Leaderboard Table ──────────────────────────────── */}
            {!loading && entries.length > 0 && (
                <div className="brutal-card overflow-hidden rounded-lg">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-3 border-brutal-border bg-brutal-dark text-white">
                                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide">
                                    Rank
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide">
                                    Problems Solved
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry) => (
                                <tr
                                    key={entry.user}
                                    className={`border-b-2 border-brutal-border transition-colors hover:bg-brutal-bg ${getRowStyle(
                                        entry.rank
                                    )}`}
                                >
                                    <td className="px-6 py-4 text-2xl font-bold">
                                        {getRankDisplay(entry.rank)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-lg font-bold">{entry.user}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="brutal-btn inline-block rounded-md bg-brutal-green px-4 py-1 text-sm">
                                            {entry.solved} solved
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

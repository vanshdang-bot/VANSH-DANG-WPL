/**
 * Submissions Page
 * 
 * Displays a table of all code submissions with status,
 * language, and timestamp. Uses Neo-Brutalism styling.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Submission {
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

export default function SubmissionsPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/submissions")
            .then((res) => res.json())
            .then((data) => {
                setSubmissions(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    function getStatusBadge(status: string) {
        switch (status) {
            case "Accepted":
                return "status-accepted";
            case "Wrong Answer":
                return "status-wrong";
            default:
                return "status-error";
        }
    }

    function getStatusIcon(status: string) {
        switch (status) {
            case "Accepted":
                return "✅";
            case "Wrong Answer":
                return "❌";
            default:
                return "⚠️";
        }
    }

    function getLangIcon(lang: string) {
        switch (lang) {
            case "python":
                return "🐍";
            case "cpp":
                return "⚙️";
            case "java":
                return "☕";
            default:
                return "📝";
        }
    }

    return (
        <div>
            {/* ─── Header ────────────────────────────────────────── */}
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold">📋 Submissions</h1>
                <p className="text-lg text-gray-600">
                    Your complete submission history.
                </p>
            </div>

            {/* ─── Loading State ──────────────────────────────────── */}
            {loading && (
                <div className="brutal-card brutal-pulse rounded-lg p-12 text-center">
                    <p className="text-xl font-bold">Loading submissions...</p>
                </div>
            )}

            {/* ─── Empty State ───────────────────────────────────── */}
            {!loading && submissions.length === 0 && (
                <div className="brutal-card rounded-lg p-12 text-center">
                    <p className="text-4xl mb-4">🚀</p>
                    <p className="text-xl font-bold">No submissions yet!</p>
                    <p className="mt-2 text-gray-500">
                        Go solve some problems and come back here.
                    </p>
                    <Link
                        href="/"
                        className="brutal-btn mt-4 inline-block rounded-md bg-brutal-blue px-6 py-2 text-sm text-white"
                    >
                        Browse Problems
                    </Link>
                </div>
            )}

            {/* ─── Submissions Table ──────────────────────────────── */}
            {!loading && submissions.length > 0 && (
                <div className="brutal-card overflow-hidden rounded-lg">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-3 border-brutal-border bg-brutal-bg">
                                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide">
                                    Problem
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide">
                                    Language
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide">
                                    Submitted
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((sub, i) => (
                                <tr
                                    key={sub.id}
                                    className={`border-b-2 border-brutal-border transition-colors hover:bg-brutal-bg ${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                                        }`}
                                >
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/problem/${sub.problemId}`}
                                            className="font-bold hover:text-brutal-blue"
                                        >
                                            {sub.problemTitle || `Problem #${sub.problemId}`}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium">
                                            {getLangIcon(sub.language)}{" "}
                                            {sub.language.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`${getStatusBadge(
                                                sub.status
                                            )} inline-block rounded-md px-3 py-1 text-xs font-bold`}
                                        >
                                            {getStatusIcon(sub.status)} {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(sub.createdAt).toLocaleString()}
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

/**
 * Problem Page — Code Editor, AI Tutor & Notes
 * 
 * Shows problem description on the left, Monaco code editor on the right,
 * with tabbed AI Tutor / Notes panel below the editor.
 */

"use client";

import { useEffect, useState, use } from "react";
import dynamic from "next/dynamic";
import AIChatbot from "@/components/AIChatbot";
import NotePad from "@/components/NotePad";

// Dynamically import Monaco to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard";
    sampleInput: string;
    expectedOutput: string;
    starterCode: {
        python: string;
        cpp: string;
        java: string;
    };
}

interface SubmissionResult {
    status: "Accepted" | "Wrong Answer" | "Runtime Error";
    output: string;
    expectedOutput: string;
}

interface PastSubmission {
    id: string;
    language: string;
    status: string;
    createdAt: string;
}

// Language options for the dropdown
const LANGUAGES = [
    { value: "python", label: "Python 3", monacoId: "python" },
    { value: "cpp", label: "C++", monacoId: "cpp" },
    { value: "java", label: "Java", monacoId: "java" },
];

// Tab options for bottom panel
type BottomTab = "chat" | "notes";

export default function ProblemPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);

    const [problem, setProblem] = useState<Problem | null>(null);
    const [language, setLanguage] = useState("python");
    const [code, setCode] = useState("");
    const [result, setResult] = useState<SubmissionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [pastSubmissions, setPastSubmissions] = useState<PastSubmission[]>([]);
    const [bottomTab, setBottomTab] = useState<BottomTab>("chat");

    // Fetch the problem data
    useEffect(() => {
        setLoading(true);
        fetch(`/api/problems/${id}`)
            .then((res) => res.json())
            .then((data: Problem) => {
                setProblem(data);
                setCode(data.starterCode?.python || "");
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    // Fetch past submissions for this problem
    useEffect(() => {
        fetch(`/api/submissions?problemId=${id}`)
            .then((res) => res.json())
            .then((data) => setPastSubmissions(data))
            .catch(() => { });
    }, [id, result]); // Refetch when new result comes in

    // Handle language change — load starter code
    function handleLanguageChange(newLang: string) {
        setLanguage(newLang);
        if (problem) {
            const key = newLang as keyof Problem["starterCode"];
            setCode(problem.starterCode[key] || "");
        }
    }

    // Submit code to the API
    async function handleSubmit() {
        if (!problem || submitting) return;

        setSubmitting(true);
        setResult(null);

        try {
            const res = await fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    problemId: problem.id,
                    code,
                    language,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setResult(data);
            } else {
                setResult({
                    status: "Runtime Error",
                    output: data.error || "Something went wrong",
                    expectedOutput: problem.expectedOutput,
                });
            }
        } catch {
            setResult({
                status: "Runtime Error",
                output: "Network error. Please try again.",
                expectedOutput: problem?.expectedOutput || "",
            });
        } finally {
            setSubmitting(false);
        }
    }

    // Get difficulty badge class
    function getBadgeClass(diff: string) {
        if (diff === "Easy") return "badge-easy";
        if (diff === "Medium") return "badge-medium";
        return "badge-hard";
    }

    // Get result display info
    function getResultStyle(status: string) {
        switch (status) {
            case "Accepted":
                return { bg: "bg-brutal-green", icon: "✅", text: "Accepted!" };
            case "Wrong Answer":
                return { bg: "bg-brutal-red", icon: "❌", text: "Wrong Answer" };
            default:
                return { bg: "bg-brutal-orange", icon: "⚠️", text: "Runtime Error" };
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="brutal-card brutal-pulse rounded-lg p-8">
                    <p className="text-xl font-bold">Loading problem...</p>
                </div>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="brutal-card rounded-lg p-8">
                    <p className="text-xl font-bold">Problem not found 😕</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 lg:flex-row">
            {/* ─── LEFT PANEL: Problem Description ──────────────── */}
            <div className="w-full lg:w-2/5">
                <div className="brutal-card rounded-lg p-6">
                    {/* Title & Difficulty */}
                    <div className="mb-4 flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{problem.title}</h1>
                        <span
                            className={`${getBadgeClass(
                                problem.difficulty
                            )} rounded-md px-2 py-1 text-xs uppercase`}
                        >
                            {problem.difficulty}
                        </span>
                    </div>

                    {/* Description */}
                    <div
                        className="prose mb-6 max-w-none text-sm"
                        dangerouslySetInnerHTML={{
                            __html: problem.description
                                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
                                .replace(/`(.*?)`/g, "<code>$1</code>")
                                .replace(/### (.*)/g, "<h3>$1</h3>")
                                .replace(/\n/g, "<br>"),
                        }}
                    />

                    {/* Sample I/O */}
                    {problem.sampleInput && (
                        <div className="mb-4">
                            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">
                                Sample Input
                            </h3>
                            <pre className="rounded-md border-2 border-brutal-border bg-brutal-bg p-3 text-sm">
                                {problem.sampleInput}
                            </pre>
                        </div>
                    )}

                    <div className="mb-4">
                        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">
                            Expected Output
                        </h3>
                        <pre className="rounded-md border-2 border-brutal-border bg-brutal-bg p-3 text-sm">
                            {problem.expectedOutput}
                        </pre>
                    </div>
                </div>

                {/* ─── Past Submissions ──────────────────────────────── */}
                {pastSubmissions.length > 0 && (
                    <div className="brutal-card mt-4 rounded-lg p-6">
                        <h3 className="mb-3 text-lg font-bold">📋 Your Submissions</h3>
                        <div className="space-y-2">
                            {pastSubmissions.slice(0, 5).map((sub) => (
                                <div
                                    key={sub.id}
                                    className="flex items-center justify-between rounded-md border-2 border-brutal-border p-3 text-sm"
                                >
                                    <span className="font-medium uppercase">{sub.language}</span>
                                    <span
                                        className={`rounded-md px-2 py-1 text-xs font-bold ${sub.status === "Accepted"
                                                ? "status-accepted"
                                                : sub.status === "Wrong Answer"
                                                    ? "status-wrong"
                                                    : "status-error"
                                            }`}
                                    >
                                        {sub.status}
                                    </span>
                                    <span className="text-gray-500">
                                        {new Date(sub.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ─── RIGHT PANEL: Code Editor + Bottom Panel ─────── */}
            <div className="w-full lg:w-3/5">
                {/* Language Selector & Buttons */}
                <div className="mb-4 flex items-center justify-between">
                    {/* Language dropdown */}
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="brutal-btn rounded-md bg-white px-4 py-2 text-sm"
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                                {lang.label}
                            </option>
                        ))}
                    </select>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="brutal-btn rounded-md bg-brutal-green px-6 py-2 text-sm"
                        >
                            {submitting ? "⏳ Running..." : "▶ Run & Submit"}
                        </button>
                    </div>
                </div>

                {/* Monaco Editor */}
                <div className="editor-container rounded-lg">
                    <Editor
                        height="350px"
                        language={
                            LANGUAGES.find((l) => l.value === language)?.monacoId || "python"
                        }
                        value={code}
                        onChange={(value) => setCode(value || "")}
                        theme="vs-dark"
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            padding: { top: 16 },
                            lineNumbers: "on",
                            roundedSelection: false,
                            scrollBeyondLastLine: false,
                            wordWrap: "on",
                            tabSize: 4,
                        }}
                    />
                </div>

                {/* ─── Result Display ───────────────────────────────── */}
                {result && (
                    <div
                        className={`brutal-card mt-4 rounded-lg p-6 ${getResultStyle(result.status).bg
                            }`}
                    >
                        <div className="mb-3 flex items-center gap-2">
                            <span className="text-2xl">
                                {getResultStyle(result.status).icon}
                            </span>
                            <h3 className="text-xl font-bold">
                                {getResultStyle(result.status).text}
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="mb-1 text-sm font-bold uppercase tracking-wide">
                                    Your Output
                                </p>
                                <pre className="rounded-md border-2 border-brutal-border bg-white p-3 text-sm">
                                    {result.output || "(no output)"}
                                </pre>
                            </div>
                            <div>
                                <p className="mb-1 text-sm font-bold uppercase tracking-wide">
                                    Expected Output
                                </p>
                                <pre className="rounded-md border-2 border-brutal-border bg-white p-3 text-sm">
                                    {result.expectedOutput}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Bottom Panel: AI Tutor / Notes ─────────────── */}
                <div className="brutal-card mt-4 overflow-hidden rounded-lg">
                    {/* Tab buttons */}
                    <div className="flex border-b-3 border-brutal-border">
                        <button
                            onClick={() => setBottomTab("chat")}
                            className={`flex-1 px-4 py-3 text-sm font-bold transition-colors ${bottomTab === "chat"
                                    ? "bg-brutal-purple text-white"
                                    : "bg-white text-brutal-dark hover:bg-brutal-purple/10"
                                }`}
                        >
                            💬 AI Tutor
                        </button>
                        <button
                            onClick={() => setBottomTab("notes")}
                            className={`flex-1 border-l-3 border-brutal-border px-4 py-3 text-sm font-bold transition-colors ${bottomTab === "notes"
                                    ? "bg-brutal-yellow text-brutal-dark"
                                    : "bg-white text-brutal-dark hover:bg-brutal-yellow/10"
                                }`}
                        >
                            📝 Notes
                        </button>
                    </div>

                    {/* Tab content */}
                    {bottomTab === "chat" && (
                        <AIChatbot
                            problemTitle={problem.title}
                            problemDescription={problem.description}
                            expectedOutput={problem.expectedOutput}
                            userCode={code}
                        />
                    )}
                    {bottomTab === "notes" && <NotePad problemId={problem.id} />}
                </div>
            </div>
        </div>
    );
}

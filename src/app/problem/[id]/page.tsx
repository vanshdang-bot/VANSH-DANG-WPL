/**
 * Problem Page — Code Editor, Test Cases, AI Tutor & Notes
 * 
 * Shows problem description on the left with test cases,
 * Monaco editor on the right with Run/Submit, Show Solution button,
 * and tabbed AI Tutor / Notes panel below.
 */

"use client";

import { useEffect, useState, use } from "react";
import dynamic from "next/dynamic";
import AIChatbot from "@/components/AIChatbot";
import NotePad from "@/components/NotePad";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface TestCase {
    input: string;
    expectedOutput: string;
    hidden: boolean;
}

interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard";
    testCases: TestCase[];
    starterCode: { python: string; cpp: string; java: string };
    solution: { python: string; cpp: string; java: string };
}

interface TestResult {
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
    hidden: boolean;
    error?: string;
}

interface SubmissionResult {
    status: "Accepted" | "Wrong Answer" | "Runtime Error";
    output: string;
    testResults: TestResult[];
    passedCount: number;
    totalCount: number;
}

interface PastSubmission {
    id: string;
    language: string;
    status: string;
    createdAt: string;
}

const LANGUAGES = [
    { value: "python", label: "Python 3", monacoId: "python" },
    { value: "cpp", label: "C++", monacoId: "cpp" },
    { value: "java", label: "Java", monacoId: "java" },
];

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
    const [showSolution, setShowSolution] = useState(false);

    // Fetch problem
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

    // Fetch past submissions
    useEffect(() => {
        fetch(`/api/submissions?problemId=${id}`)
            .then((res) => res.json())
            .then((data) => setPastSubmissions(data))
            .catch(() => { });
    }, [id, result]);

    // Language change
    function handleLanguageChange(newLang: string) {
        setLanguage(newLang);
        setShowSolution(false);
        if (problem) {
            const key = newLang as keyof Problem["starterCode"];
            setCode(problem.starterCode[key] || "");
        }
    }

    // Submit code
    async function handleSubmit() {
        if (!problem || submitting) return;
        setSubmitting(true);
        setResult(null);

        try {
            const res = await fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ problemId: problem.id, code, language }),
            });
            const data = await res.json();
            if (res.ok) {
                setResult(data);
            } else {
                setResult({
                    status: "Runtime Error",
                    output: data.error || "Something went wrong",
                    testResults: [],
                    passedCount: 0,
                    totalCount: problem.testCases.length,
                });
            }
        } catch {
            setResult({
                status: "Runtime Error",
                output: "Network error. Please try again.",
                testResults: [],
                passedCount: 0,
                totalCount: problem?.testCases.length || 0,
            });
        } finally {
            setSubmitting(false);
        }
    }

    // Show/hide solution
    function toggleSolution() {
        if (!problem) return;
        if (!showSolution) {
            const key = language as keyof Problem["solution"];
            setCode(problem.solution[key] || "");
            setShowSolution(true);
        } else {
            const key = language as keyof Problem["starterCode"];
            setCode(problem.starterCode[key] || "");
            setShowSolution(false);
        }
    }

    function getBadgeClass(diff: string) {
        if (diff === "Easy") return "badge-easy";
        if (diff === "Medium") return "badge-medium";
        return "badge-hard";
    }

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

    // Get the visible example test case
    const exampleTestCase = problem.testCases.find((tc) => !tc.hidden);
    const hiddenCount = problem.testCases.filter((tc) => tc.hidden).length;

    return (
        <div className="flex flex-col gap-6 lg:flex-row">
            {/* ─── LEFT PANEL ──────────────────────────────────── */}
            <div className="w-full lg:w-2/5">
                <div className="brutal-card rounded-lg p-6">
                    <div className="mb-4 flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{problem.title}</h1>
                        <span
                            className={`${getBadgeClass(problem.difficulty)} rounded-md px-2 py-1 text-xs uppercase`}
                        >
                            {problem.difficulty}
                        </span>
                    </div>

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

                    {/* Example Test Case */}
                    {exampleTestCase && (
                        <div className="mb-4 rounded-md border-2 border-brutal-border bg-white p-4">
                            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">
                                📋 Example Test Case
                            </h3>
                            {exampleTestCase.input && (
                                <div className="mb-2">
                                    <p className="text-xs font-bold text-gray-400">Input:</p>
                                    <pre className="rounded border border-gray-200 bg-brutal-bg p-2 text-sm">
                                        {exampleTestCase.input}
                                    </pre>
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-bold text-gray-400">Expected Output:</p>
                                <pre className="rounded border border-gray-200 bg-brutal-bg p-2 text-sm">
                                    {exampleTestCase.expectedOutput}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Hidden test cases indicator */}
                    <div className="rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-3 text-center text-sm text-gray-500">
                        🔒 <strong>{hiddenCount} hidden test case{hiddenCount > 1 ? "s" : ""}</strong> will also be evaluated
                    </div>
                </div>

                {/* Past Submissions */}
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

            {/* ─── RIGHT PANEL ─────────────────────────────────── */}
            <div className="w-full lg:w-3/5">
                {/* Controls bar */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
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

                        {/* Show Solution button */}
                        <button
                            onClick={toggleSolution}
                            className={`brutal-btn rounded-md px-4 py-2 text-sm ${showSolution
                                    ? "bg-brutal-yellow text-brutal-dark"
                                    : "bg-white text-brutal-dark"
                                }`}
                        >
                            {showSolution ? "🔙 Hide Solution" : "💡 Show Solution"}
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="brutal-btn rounded-md bg-brutal-green px-6 py-2 text-sm"
                    >
                        {submitting ? "⏳ Running..." : "▶ Run & Submit"}
                    </button>
                </div>

                {/* Solution warning */}
                {showSolution && (
                    <div className="mb-3 rounded-md border-2 border-brutal-yellow bg-brutal-yellow/20 p-3 text-sm font-medium">
                        ⚠️ You are viewing the solution. Try solving it yourself first!
                    </div>
                )}

                {/* Monaco Editor */}
                <div className="editor-container rounded-lg">
                    <Editor
                        height="320px"
                        language={LANGUAGES.find((l) => l.value === language)?.monacoId || "python"}
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
                        className={`brutal-card mt-4 rounded-lg p-6 ${getResultStyle(result.status).bg}`}
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{getResultStyle(result.status).icon}</span>
                                <h3 className="text-xl font-bold">{getResultStyle(result.status).text}</h3>
                            </div>
                            <span className="rounded-md border-2 border-brutal-border bg-white px-3 py-1 text-sm font-bold">
                                {result.passedCount}/{result.totalCount} passed
                            </span>
                        </div>

                        {/* Per-test-case results */}
                        {result.testResults.length > 0 && (
                            <div className="space-y-2">
                                {result.testResults.map((tr, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 rounded-md border-2 border-brutal-border bg-white p-3 text-sm"
                                    >
                                        <span className="text-lg">
                                            {tr.passed ? "✅" : "❌"}
                                        </span>
                                        <div className="flex-1">
                                            <span className="font-bold">
                                                Test #{i + 1}
                                                {tr.hidden ? " (Hidden)" : ""}
                                            </span>
                                            {!tr.hidden && !tr.passed && (
                                                <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                                                    <div>
                                                        <span className="font-bold text-gray-500">Expected:</span>
                                                        <pre className="mt-1 rounded bg-gray-100 p-1">{tr.expected}</pre>
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-500">Your output:</span>
                                                        <pre className="mt-1 rounded bg-gray-100 p-1">{tr.actual}</pre>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Fallback for errors without test results */}
                        {result.testResults.length === 0 && result.output && (
                            <pre className="mt-2 rounded-md border-2 border-brutal-border bg-white p-3 text-sm">
                                {result.output}
                            </pre>
                        )}
                    </div>
                )}

                {/* ─── Bottom Panel: AI Tutor / Notes ─────────────── */}
                <div className="brutal-card mt-4 overflow-hidden rounded-lg">
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

                    {bottomTab === "chat" && (
                        <AIChatbot
                            problemTitle={problem.title}
                            problemDescription={problem.description}
                            expectedOutput={exampleTestCase?.expectedOutput || ""}
                            userCode={code}
                        />
                    )}
                    {bottomTab === "notes" && <NotePad problemId={problem.id} />}
                </div>
            </div>
        </div>
    );
}

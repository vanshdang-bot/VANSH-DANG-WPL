/**
 * POST /api/submit
 * 
 * Executes user code LOCALLY against ALL test cases (1 example + 2 hidden).
 * Runs using python3, g++, or javac — no external API needed.
 */

import { NextRequest, NextResponse } from "next/server";
import { getProblemById, addSubmission, type Submission } from "@/lib/data";
import { exec } from "child_process";
import { writeFileSync, mkdirSync, unlinkSync, existsSync } from "fs";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);
const TMP_DIR = path.join(process.cwd(), ".tmp");

/**
 * Execute code locally and return stdout/stderr.
 */
async function executeCode(
    code: string,
    language: string,
    stdin: string
): Promise<{ stdout: string | null; stderr: string | null }> {
    if (!existsSync(TMP_DIR)) {
        mkdirSync(TMP_DIR, { recursive: true });
    }

    const timeout = 10000;

    try {
        if (language === "python") {
            const filePath = path.join(TMP_DIR, "solution.py");
            writeFileSync(filePath, code);
            const stdinCmd = stdin ? `printf '%s' "${stdin.replace(/'/g, "'\\''")}" | ` : "";
            const { stdout, stderr } = await execAsync(
                `${stdinCmd}python3 "${filePath}"`,
                { timeout }
            );
            return { stdout: stdout.trim(), stderr: stderr ? stderr.trim() : null };

        } else if (language === "cpp") {
            const srcPath = path.join(TMP_DIR, "solution.cpp");
            const outPath = path.join(TMP_DIR, "solution_cpp");
            writeFileSync(srcPath, code);
            await execAsync(`g++ -o "${outPath}" "${srcPath}"`, { timeout });
            const stdinCmd = stdin ? `printf '%s' "${stdin.replace(/'/g, "'\\''")}" | ` : "";
            const { stdout, stderr } = await execAsync(
                `${stdinCmd}"${outPath}"`,
                { timeout }
            );
            try { unlinkSync(outPath); } catch { /* ignore */ }
            return { stdout: stdout.trim(), stderr: stderr ? stderr.trim() : null };

        } else if (language === "java") {
            const srcPath = path.join(TMP_DIR, "Main.java");
            writeFileSync(srcPath, code);
            await execAsync(`javac "${srcPath}"`, { timeout });
            const stdinCmd = stdin ? `printf '%s' "${stdin.replace(/'/g, "'\\''")}" | ` : "";
            const { stdout, stderr } = await execAsync(
                `${stdinCmd}java -cp "${TMP_DIR}" Main`,
                { timeout }
            );
            try { unlinkSync(path.join(TMP_DIR, "Main.class")); } catch { /* ignore */ }
            return { stdout: stdout.trim(), stderr: stderr ? stderr.trim() : null };

        } else {
            return { stdout: null, stderr: `Unsupported language: ${language}` };
        }
    } catch (error: unknown) {
        const execError = error as { stderr?: string; message?: string; killed?: boolean };
        if (execError.killed) {
            return { stdout: null, stderr: "Time Limit Exceeded (10s)" };
        }
        return {
            stdout: null,
            stderr: execError.stderr?.trim() || execError.message || "Execution failed",
        };
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { problemId, code, language, user = "Player1" } = body;

        if (!problemId || !code || !language) {
            return NextResponse.json(
                { error: "Missing required fields: problemId, code, language" },
                { status: 400 }
            );
        }

        const problem = getProblemById(problemId);
        if (!problem) {
            return NextResponse.json({ error: "Problem not found" }, { status: 404 });
        }

        if (!["python", "cpp", "java"].includes(language)) {
            return NextResponse.json(
                { error: `Unsupported language: ${language}` },
                { status: 400 }
            );
        }

        // Run against ALL test cases
        const testCases = problem.testCases;
        const results: { passed: boolean; input: string; expected: string; actual: string; hidden: boolean; error?: string }[] = [];
        let allPassed = true;
        let firstError = "";

        for (const tc of testCases) {
            const result = await executeCode(code, language, tc.input);

            if (result.stderr) {
                allPassed = false;
                firstError = result.stderr;
                results.push({
                    passed: false,
                    input: tc.input,
                    expected: tc.expectedOutput,
                    actual: result.stderr,
                    hidden: tc.hidden,
                    error: result.stderr,
                });
                break; // Stop on first error
            }

            const passed = result.stdout === tc.expectedOutput.trim();
            if (!passed) allPassed = false;

            results.push({
                passed,
                input: tc.input,
                expected: tc.expectedOutput,
                actual: result.stdout || "(no output)",
                hidden: tc.hidden,
            });

            if (!passed) break; // Stop on first failure
        }

        // Determine overall status
        let status: Submission["status"];
        let output: string;

        if (firstError) {
            status = "Runtime Error";
            output = firstError;
        } else if (allPassed) {
            status = "Accepted";
            output = `All ${testCases.length} test cases passed!`;
        } else {
            status = "Wrong Answer";
            const failedCase = results.find((r) => !r.passed);
            output = failedCase?.actual || "(no output)";
        }

        // Count passed
        const passedCount = results.filter((r) => r.passed).length;

        // Store submission
        const submission: Submission = {
            id: Date.now().toString(),
            problemId,
            problemTitle: problem.title,
            code,
            language,
            status,
            output,
            createdAt: new Date().toISOString(),
            user,
        };

        addSubmission(submission);

        return NextResponse.json({
            status: submission.status,
            output: submission.output,
            testResults: results.map((r) => ({
                passed: r.passed,
                input: r.hidden ? "(hidden)" : r.input,
                expected: r.hidden ? "(hidden)" : r.expected,
                actual: r.hidden && r.passed ? "✓" : r.actual,
                hidden: r.hidden,
                error: r.error,
            })),
            passedCount,
            totalCount: testCases.length,
            submissionId: submission.id,
        });
    } catch (error) {
        console.error("Submission error:", error);
        return NextResponse.json(
            { error: "Failed to execute code. Make sure python3/g++/javac is installed." },
            { status: 500 }
        );
    }
}

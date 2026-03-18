/**
 * POST /api/submit
 * 
 * Receives user code, sends it to Judge0 for execution,
 * compares output with expected output, and stores the submission.
 * 
 * Body: { problemId, code, language, user? }
 */

import { NextRequest, NextResponse } from "next/server";
import { getProblemById, addSubmission, type Submission } from "@/lib/data";

// Judge0 language IDs
const LANGUAGE_IDS: Record<string, number> = {
    python: 71,   // Python 3
    cpp: 54,      // C++ (GCC 9.2.0)
    java: 62,     // Java (OpenJDK 13)
};

// Judge0 API config
const JUDGE0_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_KEY = process.env.JUDGE0_API_KEY || "";

/**
 * Submit code to Judge0 and get the result
 */
async function executeCode(
    code: string,
    languageId: number,
    stdin: string
): Promise<{ stdout: string | null; stderr: string | null; status: string }> {
    // Step 1: Create a submission on Judge0
    const createResponse = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": JUDGE0_KEY,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
            source_code: code,
            language_id: languageId,
            stdin: stdin,
        }),
    });

    if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error("Judge0 error:", errorText);
        throw new Error(`Judge0 API error: ${createResponse.status}`);
    }

    const result = await createResponse.json();

    return {
        stdout: result.stdout ? result.stdout.trim() : null,
        stderr: result.stderr ? result.stderr.trim() : null,
        status: result.status?.description || "Unknown",
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { problemId, code, language, user = "Player1" } = body;

        // Validate required fields
        if (!problemId || !code || !language) {
            return NextResponse.json(
                { error: "Missing required fields: problemId, code, language" },
                { status: 400 }
            );
        }

        // Get the problem
        const problem = getProblemById(problemId);
        if (!problem) {
            return NextResponse.json(
                { error: "Problem not found" },
                { status: 404 }
            );
        }

        // Get Judge0 language ID
        const languageId = LANGUAGE_IDS[language];
        if (!languageId) {
            return NextResponse.json(
                { error: `Unsupported language: ${language}` },
                { status: 400 }
            );
        }

        // Execute code via Judge0
        const result = await executeCode(code, languageId, problem.sampleInput);

        // Determine submission status
        let status: Submission["status"];
        let output: string;

        if (result.stderr || result.status === "Runtime Error (NZEC)" || result.status.includes("Error")) {
            status = "Runtime Error";
            output = result.stderr || result.status;
        } else if (result.stdout === problem.expectedOutput.trim()) {
            status = "Accepted";
            output = result.stdout || "";
        } else {
            status = "Wrong Answer";
            output = result.stdout || "(no output)";
        }

        // Create and store submission
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
            expectedOutput: problem.expectedOutput,
            submissionId: submission.id,
        });
    } catch (error) {
        console.error("Submission error:", error);
        return NextResponse.json(
            { error: "Failed to process submission. Check your Judge0 API key." },
            { status: 500 }
        );
    }
}

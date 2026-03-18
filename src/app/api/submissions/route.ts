/**
 * GET /api/submissions
 * 
 * Returns all submissions, optionally filtered by problemId.
 * Query params: ?problemId=1
 */

import { NextRequest, NextResponse } from "next/server";
import { getSubmissions } from "@/lib/data";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const problemId = searchParams.get("problemId") || undefined;

        const submissions = getSubmissions(problemId);
        return NextResponse.json(submissions);
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return NextResponse.json(
            { error: "Failed to fetch submissions" },
            { status: 500 }
        );
    }
}

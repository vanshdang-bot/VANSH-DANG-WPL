/**
 * GET /api/problems
 * 
 * Returns all problems from the JSON file.
 * Supports optional query param: ?difficulty=Easy|Medium|Hard
 */

import { NextRequest, NextResponse } from "next/server";
import { getProblems } from "@/lib/data";

export async function GET(request: NextRequest) {
    try {
        // Read the optional difficulty filter from query params
        const { searchParams } = new URL(request.url);
        const difficulty = searchParams.get("difficulty") || undefined;

        const problems = getProblems(difficulty);

        // Return problems without starterCode (for list view)
        const problemList = problems.map(({ starterCode, ...rest }) => rest);

        return NextResponse.json(problemList);
    } catch (error) {
        console.error("Error fetching problems:", error);
        return NextResponse.json(
            { error: "Failed to fetch problems" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/problems/[id]
 * 
 * Returns a single problem by its ID, including starter code.
 */

import { NextRequest, NextResponse } from "next/server";
import { getProblemById } from "@/lib/data";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const problem = getProblemById(id);

        if (!problem) {
            return NextResponse.json(
                { error: "Problem not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(problem);
    } catch (error) {
        console.error("Error fetching problem:", error);
        return NextResponse.json(
            { error: "Failed to fetch problem" },
            { status: 500 }
        );
    }
}

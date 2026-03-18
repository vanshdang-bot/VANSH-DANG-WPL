/**
 * GET /api/leaderboard
 * 
 * Returns the leaderboard: users ranked by number of unique problems solved.
 */

import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/data";

export async function GET() {
    try {
        const leaderboard = getLeaderboard();
        return NextResponse.json(leaderboard);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return NextResponse.json(
            { error: "Failed to fetch leaderboard" },
            { status: 500 }
        );
    }
}

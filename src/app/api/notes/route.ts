/**
 * GET & POST /api/notes
 * 
 * Simple per-problem notes storage using a JSON file.
 * GET  ?problemId=X  →  returns the saved note text
 * POST { problemId, content }  →  saves the note
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const NOTES_FILE = path.join(process.cwd(), "data", "notes.json");

/** Read all notes from disk */
function readNotes(): Record<string, string> {
    try {
        const raw = fs.readFileSync(NOTES_FILE, "utf-8");
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

/** Write all notes to disk */
function writeNotes(notes: Record<string, string>) {
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
}

// GET — fetch a note for a specific problem
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const problemId = searchParams.get("problemId");

        if (!problemId) {
            return NextResponse.json(
                { error: "problemId is required" },
                { status: 400 }
            );
        }

        const notes = readNotes();
        const content = notes[problemId] || "";

        return NextResponse.json({ content });
    } catch (error) {
        console.error("Error reading notes:", error);
        return NextResponse.json(
            { error: "Failed to read notes" },
            { status: 500 }
        );
    }
}

// POST — save a note for a specific problem
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { problemId, content } = body;

        if (!problemId) {
            return NextResponse.json(
                { error: "problemId is required" },
                { status: 400 }
            );
        }

        const notes = readNotes();
        notes[problemId] = content || "";
        writeNotes(notes);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving notes:", error);
        return NextResponse.json(
            { error: "Failed to save notes" },
            { status: 500 }
        );
    }
}

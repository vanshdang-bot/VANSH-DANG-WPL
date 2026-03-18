/**
 * NotePad Component
 * 
 * A simple per-problem notepad that auto-saves on blur.
 * Notes persist in a JSON file so users can revisit them later.
 */

"use client";

import { useState, useEffect, useCallback } from "react";

interface NotePadProps {
    problemId: string;
}

export default function NotePad({ problemId }: NotePadProps) {
    const [content, setContent] = useState("");
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Load saved note on mount or when problemId changes
    useEffect(() => {
        setLoaded(false);
        fetch(`/api/notes?problemId=${problemId}`)
            .then((res) => res.json())
            .then((data) => {
                setContent(data.content || "");
                setLoaded(true);
            })
            .catch(() => setLoaded(true));
    }, [problemId]);

    // Save note to backend
    const saveNote = useCallback(
        async (text: string) => {
            setSaving(true);
            setSaved(false);
            try {
                await fetch("/api/notes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ problemId, content: text }),
                });
                setSaved(true);
                // Clear "Saved" indicator after 2 seconds
                setTimeout(() => setSaved(false), 2000);
            } catch {
                console.error("Failed to save note");
            } finally {
                setSaving(false);
            }
        },
        [problemId]
    );

    // Auto-save when the user stops typing (debounce 1.5s)
    useEffect(() => {
        if (!loaded) return; // Don't save on initial load

        const timer = setTimeout(() => {
            saveNote(content);
        }, 1500);

        return () => clearTimeout(timer);
    }, [content, loaded, saveNote]);

    return (
        <div className="flex h-[350px] flex-col">
            {/* ─── Header ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between border-b-3 border-brutal-border bg-white px-4 py-3">
                <div>
                    <p className="text-sm font-bold">📝 Your Notes</p>
                    <p className="text-xs text-gray-500">
                        Jot down your thoughts, approach, or key learnings.
                    </p>
                </div>
                <div className="text-xs font-bold">
                    {saving && (
                        <span className="text-brutal-orange">Saving...</span>
                    )}
                    {saved && !saving && (
                        <span className="text-brutal-green">✓ Saved</span>
                    )}
                </div>
            </div>

            {/* ─── Textarea ───────────────────────────────────────── */}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={() => saveNote(content)}
                placeholder={
                    "Write your notes here...\n\n" +
                    "💡 Ideas:\n" +
                    "• What approach are you thinking of?\n" +
                    "• What concepts did you learn?\n" +
                    "• What tripped you up?\n" +
                    "• Key takeaways for next time"
                }
                className="flex-1 resize-none bg-brutal-bg p-4 text-sm font-medium focus:outline-none"
                spellCheck={false}
            />
        </div>
    );
}

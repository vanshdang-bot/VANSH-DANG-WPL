/**
 * POST /api/chat
 * 
 * AI Coding Tutor powered by Groq API.
 * Knows the current problem context and the user's code.
 * Gives hints and guidance — NEVER reveals the full answer.
 */

import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// System prompt that enforces hint-only behavior
function buildSystemPrompt(
    problemTitle: string,
    problemDescription: string,
    expectedOutput: string
) {
    return `You are a friendly, encouraging coding tutor embedded in a coding practice platform called CodePractice.

CURRENT PROBLEM THE STUDENT IS WORKING ON:
Title: "${problemTitle}"
Description: ${problemDescription}
Expected Output: ${expectedOutput}

YOUR RULES (VERY IMPORTANT — NEVER BREAK THESE):
1. NEVER give the complete solution or full working code.
2. NEVER write out the entire answer, even if the student begs or insists.
3. Instead, give HINTS, ask GUIDING QUESTIONS, and explain CONCEPTS.
4. If the student shares their code, point out what's wrong or what to think about — don't fix it entirely for them.
5. Use analogies and simple explanations — remember this is for beginners.
6. If the student says "just give me the answer", politely refuse and offer a helpful hint instead.
7. Keep responses SHORT and focused (under 150 words when possible).
8. Use emojis occasionally to be friendly! 🎯
9. If the student is stuck, break the problem into smaller steps and guide them through one step at a time.
10. You may show small code SNIPPETS (1-3 lines max) to illustrate a concept, but never the full solution.

Remember: Your goal is to help the student LEARN, not just get the right answer.`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            message,
            problemTitle,
            problemDescription,
            expectedOutput,
            userCode,
            chatHistory = [],
        } = body;

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        if (!GROQ_API_KEY || GROQ_API_KEY === "your_groq_api_key_here") {
            return NextResponse.json(
                { error: "Groq API key not configured. Add it to .env.local" },
                { status: 500 }
            );
        }

        // Build the messages array for the API call
        const systemPrompt = buildSystemPrompt(
            problemTitle || "Unknown",
            problemDescription || "No description",
            expectedOutput || "N/A"
        );

        // Include the user's current code as context if available
        const userMessage = userCode
            ? `${message}\n\n[My current code]:\n\`\`\`\n${userCode}\n\`\`\``
            : message;

        const messages = [
            { role: "system", content: systemPrompt },
            // Include recent chat history (last 10 messages to avoid token limits)
            ...chatHistory.slice(-10),
            { role: "user", content: userMessage },
        ];

        // Call Groq API
        const response = await fetch(GROQ_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages,
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Groq API error:", errorText);
            return NextResponse.json(
                { error: `Groq API error: ${response.status}` },
                { status: 500 }
            );
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json(
            { error: "Failed to get AI response. Check your Groq API key." },
            { status: 500 }
        );
    }
}

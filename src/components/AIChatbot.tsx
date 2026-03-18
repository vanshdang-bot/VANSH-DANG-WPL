/**
 * AIChatbot Component
 * 
 * A chat interface for the AI coding tutor.
 * Sends problem context + user code to the Groq-powered API.
 * The AI gives hints and guidance — never the full answer.
 */

"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface AIChatbotProps {
    problemTitle: string;
    problemDescription: string;
    expectedOutput: string;
    userCode: string;
}

export default function AIChatbot({
    problemTitle,
    problemDescription,
    expectedOutput,
    userCode,
}: AIChatbotProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function handleSend() {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        // Add user message to chat
        const userMessage: Message = { role: "user", content: trimmed };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: trimmed,
                    problemTitle,
                    problemDescription,
                    expectedOutput,
                    userCode,
                    // Send chat history (without the system message)
                    chatHistory: newMessages.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessages([
                    ...newMessages,
                    { role: "assistant", content: data.reply },
                ]);
            } else {
                setMessages([
                    ...newMessages,
                    {
                        role: "assistant",
                        content: `⚠️ ${data.error || "Something went wrong. Try again!"}`,
                    },
                ]);
            }
        } catch {
            setMessages([
                ...newMessages,
                {
                    role: "assistant",
                    content: "⚠️ Network error. Please check your connection and try again.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    }

    // Handle Enter key to send
    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="flex h-[350px] flex-col">
            {/* ─── Chat Messages ──────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Welcome message */}
                {messages.length === 0 && (
                    <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-brutal-border bg-brutal-purple text-white text-sm font-bold">
                            AI
                        </div>
                        <div className="rounded-lg border-2 border-brutal-border bg-brutal-purple/10 p-3 text-sm max-w-[80%]">
                            <p className="font-bold mb-1">👋 Hey! I&apos;m your AI tutor.</p>
                            <p>
                                I can help you with <strong>&quot;{problemTitle}&quot;</strong>. Ask me
                                anything — I&apos;ll give you hints and guide you, but I won&apos;t spoil
                                the answer! 🎯
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                                Try: &quot;How should I approach this?&quot; or &quot;What concept do I need?&quot;
                            </p>
                        </div>
                    </div>
                )}

                {/* Message bubbles */}
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""
                            }`}
                    >
                        {/* Avatar */}
                        <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-brutal-border text-sm font-bold ${msg.role === "user"
                                    ? "bg-brutal-blue text-white"
                                    : "bg-brutal-purple text-white"
                                }`}
                        >
                            {msg.role === "user" ? "U" : "AI"}
                        </div>

                        {/* Bubble */}
                        <div
                            className={`rounded-lg border-2 border-brutal-border p-3 text-sm max-w-[80%] whitespace-pre-wrap ${msg.role === "user"
                                    ? "bg-brutal-blue/10"
                                    : "bg-brutal-purple/10"
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-brutal-border bg-brutal-purple text-white text-sm font-bold">
                            AI
                        </div>
                        <div className="rounded-lg border-2 border-brutal-border bg-brutal-purple/10 p-3 text-sm">
                            <span className="brutal-pulse font-bold">Thinking... 🤔</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* ─── Input Area ─────────────────────────────────────── */}
            <div className="border-t-3 border-brutal-border bg-white p-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask for a hint..."
                        className="flex-1 rounded-md border-2 border-brutal-border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brutal-purple"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="brutal-btn rounded-md bg-brutal-purple px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

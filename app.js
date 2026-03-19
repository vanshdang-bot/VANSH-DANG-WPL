/**
 * CodePractice — app.js
 * 
 * All application logic for the frontend-only coding platform.
 * No server, no build step — runs entirely in the browser.
 * 
 * Features:
 *  - Embedded problem data (7 problems with test cases)
 *  - Mock judging (compare user output vs expected)
 *  - Submissions via localStorage
 *  - Leaderboard from localStorage
 *  - Notes via localStorage
 *  - AI Chatbot via Groq API (browser-direct)
 */

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

let GROQ_API_KEY = localStorage.getItem("groq_key");
if (!GROQ_API_KEY) {
    GROQ_API_KEY = prompt("Please enter your Groq API Key to enable the AI Tutor and Auto-Grader:");
    if (GROQ_API_KEY) {
        localStorage.setItem("groq_key", GROQ_API_KEY);
    }
}
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const STORAGE_KEYS = {
    submissions: "codepractice_submissions",
    notes: "codepractice_notes",
    username: "codepractice_username",
};

// ═══════════════════════════════════════════════════════════════
// PROBLEMS DATA (from problems.json)
// ═══════════════════════════════════════════════════════════════

const PROBLEMS = [
    {
        id: "1",
        title: "Hello World",
        description: "Write a program that prints <strong>Hello, World!</strong> to the console.\n\nThis is your very first coding challenge! Simply output the exact text shown in the expected output.",
        difficulty: "Easy",
        testCases: [
            { input: "", expectedOutput: "Hello, World!", hidden: false },
            { input: "", expectedOutput: "Hello, World!", hidden: true },
            { input: "", expectedOutput: "Hello, World!", hidden: true }
        ],
        starterCode: {
            python: "# Write your solution here\n",
            cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    \n    return 0;\n}',
            java: 'public class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n        \n    }\n}'
        },
        solution: {
            python: 'print("Hello, World!")',
            cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
            java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}'
        }
    },
    {
        id: "2",
        title: "Sum of Two Numbers",
        description: "Read two integers from standard input (each on a separate line) and print their sum.\n\n<h3>Example</h3>\n<strong>Input:</strong>\n<pre>3\n5</pre>\n<strong>Output:</strong>\n<pre>8</pre>",
        difficulty: "Easy",
        testCases: [
            { input: "3\n5", expectedOutput: "8", hidden: false },
            { input: "10\n20", expectedOutput: "30", hidden: true },
            { input: "-7\n3", expectedOutput: "-4", hidden: true }
        ],
        starterCode: {
            python: "# Read two numbers and print their sum\n",
            cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Read two numbers and print their sum\n    \n    return 0;\n}',
            java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read two numbers and print their sum\n        \n    }\n}'
        },
        solution: {
            python: "a = int(input())\nb = int(input())\nprint(a + b)",
            cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}',
            java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n    }\n}'
        }
    },
    {
        id: "3",
        title: "Even or Odd",
        description: "Read an integer from standard input and print <code>Even</code> if it is even, or <code>Odd</code> if it is odd.\n\n<h3>Example</h3>\n<strong>Input:</strong>\n<pre>4</pre>\n<strong>Output:</strong>\n<pre>Even</pre>",
        difficulty: "Easy",
        testCases: [
            { input: "4", expectedOutput: "Even", hidden: false },
            { input: "7", expectedOutput: "Odd", hidden: true },
            { input: "0", expectedOutput: "Even", hidden: true }
        ],
        starterCode: {
            python: "# Read a number and check if it's even or odd\n",
            cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Read a number and check if it\'s even or odd\n    \n    return 0;\n}',
            java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read a number and check if it\'s even or odd\n        \n    }\n}'
        },
        solution: {
            python: 'n = int(input())\nif n % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")',
            cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    if (n % 2 == 0) cout << "Even" << endl;\n    else cout << "Odd" << endl;\n    return 0;\n}',
            java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println(n % 2 == 0 ? "Even" : "Odd");\n    }\n}'
        }
    },
    {
        id: "4",
        title: "Reverse a String",
        description: "Read a string from standard input and print it reversed.\n\n<h3>Example</h3>\n<strong>Input:</strong>\n<pre>hello</pre>\n<strong>Output:</strong>\n<pre>olleh</pre>",
        difficulty: "Medium",
        testCases: [
            { input: "hello", expectedOutput: "olleh", hidden: false },
            { input: "abcdef", expectedOutput: "fedcba", hidden: true },
            { input: "racecar", expectedOutput: "racecar", hidden: true }
        ],
        starterCode: {
            python: "# Read a string and print it reversed\n",
            cpp: '#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    // Read a string and print it reversed\n    \n    return 0;\n}',
            java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read a string and print it reversed\n        \n    }\n}'
        },
        solution: {
            python: "s = input()\nprint(s[::-1])",
            cpp: '#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n    reverse(s.begin(), s.end());\n    cout << s << endl;\n    return 0;\n}',
            java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        System.out.println(new StringBuilder(s).reverse().toString());\n    }\n}'
        }
    },
    {
        id: "5",
        title: "FizzBuzz",
        description: "Read an integer <code>n</code> from standard input. For each number from 1 to n:\n- Print <code>FizzBuzz</code> if divisible by both 3 and 5\n- Print <code>Fizz</code> if divisible by 3\n- Print <code>Buzz</code> if divisible by 5\n- Otherwise print the number\n\nEach output on a new line.\n\n<h3>Example</h3>\n<strong>Input:</strong>\n<pre>5</pre>\n<strong>Output:</strong>\n<pre>1\n2\nFizz\n4\nBuzz</pre>",
        difficulty: "Medium",
        testCases: [
            { input: "5", expectedOutput: "1\n2\nFizz\n4\nBuzz", hidden: false },
            { input: "15", expectedOutput: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", hidden: true },
            { input: "3", expectedOutput: "1\n2\nFizz", hidden: true }
        ],
        starterCode: {
            python: "# FizzBuzz\nn = int(input())\n",
            cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // FizzBuzz logic here\n    \n    return 0;\n}',
            java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // FizzBuzz logic here\n        \n    }\n}'
        },
        solution: {
            python: 'n = int(input())\nfor i in range(1, n + 1):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)',
            cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    for (int i = 1; i <= n; i++) {\n        if (i % 15 == 0) cout << "FizzBuzz" << endl;\n        else if (i % 3 == 0) cout << "Fizz" << endl;\n        else if (i % 5 == 0) cout << "Buzz" << endl;\n        else cout << i << endl;\n    }\n    return 0;\n}',
            java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        for (int i = 1; i <= n; i++) {\n            if (i % 15 == 0) System.out.println("FizzBuzz");\n            else if (i % 3 == 0) System.out.println("Fizz");\n            else if (i % 5 == 0) System.out.println("Buzz");\n            else System.out.println(i);\n        }\n    }\n}'
        }
    },
    {
        id: "6",
        title: "Fibonacci Number",
        description: "Read an integer <code>n</code> from standard input and print the <code>n</code>-th Fibonacci number (0-indexed).\n\nThe Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, ...\n\n<h3>Example</h3>\n<strong>Input:</strong>\n<pre>6</pre>\n<strong>Output:</strong>\n<pre>8</pre>",
        difficulty: "Hard",
        testCases: [
            { input: "6", expectedOutput: "8", hidden: false },
            { input: "0", expectedOutput: "0", hidden: true },
            { input: "10", expectedOutput: "55", hidden: true }
        ],
        starterCode: {
            python: "# Find the n-th Fibonacci number\n",
            cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Find the n-th Fibonacci number\n    \n    return 0;\n}',
            java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Find the n-th Fibonacci number\n        \n    }\n}'
        },
        solution: {
            python: "n = int(input())\na, b = 0, 1\nfor _ in range(n):\n    a, b = b, a + b\nprint(a)",
            cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int a = 0, b = 1;\n    for (int i = 0; i < n; i++) {\n        int t = a + b;\n        a = b;\n        b = t;\n    }\n    cout << a << endl;\n    return 0;\n}',
            java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int a = 0, b = 1;\n        for (int i = 0; i < n; i++) {\n            int t = a + b;\n            a = b;\n            b = t;\n        }\n        System.out.println(a);\n    }\n}'
        }
    },
    {
        id: "7",
        title: "Palindrome Check",
        description: "Read a string from standard input and print <code>Yes</code> if it is a palindrome, or <code>No</code> if it is not. A palindrome reads the same forwards and backwards.\n\n<h3>Example</h3>\n<strong>Input:</strong>\n<pre>racecar</pre>\n<strong>Output:</strong>\n<pre>Yes</pre>",
        difficulty: "Hard",
        testCases: [
            { input: "racecar", expectedOutput: "Yes", hidden: false },
            { input: "hello", expectedOutput: "No", hidden: true },
            { input: "madam", expectedOutput: "Yes", hidden: true }
        ],
        starterCode: {
            python: "# Check if the string is a palindrome\n",
            cpp: '#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    // Check if the string is a palindrome\n    \n    return 0;\n}',
            java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Check if the string is a palindrome\n        \n    }\n}'
        },
        solution: {
            python: 's = input()\nif s == s[::-1]:\n    print("Yes")\nelse:\n    print("No")',
            cpp: '#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n    string rev = s;\n    reverse(rev.begin(), rev.end());\n    if (s == rev) cout << "Yes" << endl;\n    else cout << "No" << endl;\n    return 0;\n}',
            java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        String rev = new StringBuilder(s).reverse().toString();\n        System.out.println(s.equals(rev) ? "Yes" : "No");\n    }\n}'
        }
    }
];


// ═══════════════════════════════════════════════════════════════
// HELPER: Get problem by ID
// ═══════════════════════════════════════════════════════════════

function getProblemById(id) {
    return PROBLEMS.find(p => p.id === id) || null;
}

function getProblems(difficulty) {
    if (!difficulty || difficulty === "All") return PROBLEMS;
    return PROBLEMS.filter(p => p.difficulty === difficulty);
}


// ═══════════════════════════════════════════════════════════════
// LOCALSTORAGE HELPERS
// ═══════════════════════════════════════════════════════════════

function getSubmissions(problemId) {
    const raw = localStorage.getItem(STORAGE_KEYS.submissions);
    const all = raw ? JSON.parse(raw) : [];
    if (problemId) return all.filter(s => s.problemId === problemId);
    return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function addSubmission(sub) {
    const all = getSubmissions();
    all.push(sub);
    localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(all));
}

function getUsername() {
    return localStorage.getItem(STORAGE_KEYS.username) || "Player1";
}

function setUsername(name) {
    localStorage.setItem(STORAGE_KEYS.username, name);
}

function getNotes(problemId) {
    const raw = localStorage.getItem(STORAGE_KEYS.notes);
    const all = raw ? JSON.parse(raw) : {};
    return all[problemId] || "";
}

function saveNotes(problemId, content) {
    const raw = localStorage.getItem(STORAGE_KEYS.notes);
    const all = raw ? JSON.parse(raw) : {};
    all[problemId] = content;
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(all));
}


// ═══════════════════════════════════════════════════════════════
// MOCK EVALUATION LOGIC
// ═══════════════════════════════════════════════════════════════

/**
 * Evaluate user's code against all test cases using Groq AI.
 */
async function evaluateWithAI(problem, code, language) {
    const testCases = problem.testCases;

    if (!code || code.trim() === "") {
        return {
            status: "Wrong Answer",
            output: "No code provided.",
            testResults: testCases.map(tc => ({
                passed: false,
                input: tc.hidden ? "(hidden)" : tc.input,
                expected: tc.hidden ? "(hidden)" : tc.expectedOutput,
                actual: "(empty)",
                hidden: tc.hidden,
            })),
            passedCount: 0,
            totalCount: testCases.length,
        };
    }

    if (!GROQ_API_KEY) {
        throw new Error("Groq API key not configured.");
    }

    const testCasesText = testCases.map((tc, i) =>
        `Test ${i + 1}:\nInput: ${tc.input}\nExpected Output: ${tc.expectedOutput}`
    ).join("\n\n");

    const prompt = `You are an auto-grader for a coding platform.
Problem Title: ${problem.title}
Problem Description: ${problem.description}

Here is the student's code in ${language}:
\`\`\`
${code}
\`\`\`

Here are the test cases:
${testCasesText}

Evaluate the student's code against each test case. You must determine if the code correctly solves the problem for each input.
You MUST reply with ONLY a pure JSON array containing the results, with no markdown formatting, no backticks, and no conversational text.
The JSON array MUST contain exactly ${testCases.length} objects in the same order as the test cases.
Each object must have exactly these keys: "passed" (boolean) and "actual_output" (string with the output the code would produce).

Example output:
[
  { "passed": true, "actual_output": "Hello World" },
  { "passed": false, "actual_output": "Error or Wrong Output" }
]`;

    try {
        const response = await fetch(GROQ_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const replyText = data.choices?.[0]?.message?.content || "";

        // Try to parse the JSON. It might have markdown codeblocks around it.
        const cleanedText = replyText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsedResults = JSON.parse(cleanedText);

        const results = [];
        let allPassed = true;

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            const result = parsedResults[i] || { passed: false, actual_output: "Failed to parse API result" };

            if (!result.passed) allPassed = false;

            results.push({
                passed: result.passed,
                input: tc.hidden ? "(hidden)" : tc.input,
                expected: tc.hidden ? "(hidden)" : tc.expectedOutput,
                actual: tc.hidden && result.passed ? "✓" : result.actual_output,
                hidden: tc.hidden,
            });
        }

        return {
            status: allPassed ? "Accepted" : "Wrong Answer",
            output: allPassed ? `All ${testCases.length} test cases passed!` : "Your code failed on one or more test cases.",
            testResults: results,
            passedCount: results.filter(r => r.passed).length,
            totalCount: testCases.length,
        };

    } catch (err) {
        console.error("AI Evaluation Error:", err);
        throw err;
    }
}


// ═══════════════════════════════════════════════════════════════
// LEADERBOARD LOGIC
// ═══════════════════════════════════════════════════════════════

function getLeaderboard() {
    const submissions = getSubmissions();
    const userSolves = {};

    for (const sub of submissions) {
        if (sub.status === "Accepted") {
            if (!userSolves[sub.user]) userSolves[sub.user] = new Set();
            userSolves[sub.user].add(sub.problemId);
        }
    }

    const entries = Object.entries(userSolves)
        .map(([user, problemSet]) => ({
            rank: 0,
            user,
            solved: problemSet.size,
        }))
        .sort((a, b) => b.solved - a.solved);

    entries.forEach((entry, i) => { entry.rank = i + 1; });
    return entries;
}


// ═══════════════════════════════════════════════════════════════
// AI CHATBOT (Groq API — browser-direct)
// ═══════════════════════════════════════════════════════════════

function buildSystemPrompt(problemTitle, problemDescription, expectedOutput) {
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

async function sendChatMessage(message, problemTitle, problemDesc, expectedOutput, userCode, chatHistory) {
    if (!GROQ_API_KEY) {
        return { error: "Groq API key not configured. Set GROQ_API_KEY in app.js" };
    }

    const systemPrompt = buildSystemPrompt(
        problemTitle || "Unknown",
        problemDesc || "No description",
        expectedOutput || "N/A"
    );

    const userMessage = userCode
        ? `${message}\n\n[My current code]:\n\`\`\`\n${userCode}\n\`\`\``
        : message;

    const messages = [
        { role: "system", content: systemPrompt },
        ...chatHistory.slice(-10),
        { role: "user", content: userMessage },
    ];

    try {
        const response = await fetch(GROQ_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages,
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            return { error: `API error: ${response.status}` };
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
        return { reply };
    } catch (err) {
        return { error: "Network error. Please check your connection." };
    }
}


// ═══════════════════════════════════════════════════════════════
// UTILITY: Parse markdown-ish description to HTML
// ═══════════════════════════════════════════════════════════════

function descriptionToHTML(desc) {
    return desc
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
        .replace(/`(.*?)`/g, "<code>$1</code>")
        .replace(/### (.*)/g, "<h3>$1</h3>")
        .replace(/\n- /g, "\n• ")
        .replace(/\n/g, "<br>");
}


// ═══════════════════════════════════════════════════════════════
// UTILITY: Badge / status helpers
// ═══════════════════════════════════════════════════════════════

function getBadgeClass(difficulty) {
    switch (difficulty) {
        case "Easy": return "badge-easy";
        case "Medium": return "badge-medium";
        case "Hard": return "badge-hard";
        default: return "";
    }
}

function getAccentClass(difficulty) {
    switch (difficulty) {
        case "Easy": return "accent-easy";
        case "Medium": return "accent-medium";
        case "Hard": return "accent-hard";
        default: return "";
    }
}

function getStatusBadgeClass(status) {
    switch (status) {
        case "Accepted": return "status-accepted";
        case "Wrong Answer": return "status-wrong";
        default: return "status-error";
    }
}

function getStatusIcon(status) {
    switch (status) {
        case "Accepted": return "✅";
        case "Wrong Answer": return "❌";
        default: return "⚠️";
    }
}

function getLangIcon(lang) {
    switch (lang) {
        case "python": return "🐍";
        case "cpp": return "⚙️";
        case "java": return "☕";
        default: return "📝";
    }
}

function getRankDisplay(rank) {
    switch (rank) {
        case 1: return "🥇";
        case 2: return "🥈";
        case 3: return "🥉";
        default: return `#${rank}`;
    }
}

function getRowClass(rank) {
    switch (rank) {
        case 1: return "row-gold";
        case 2: return "row-silver";
        case 3: return "row-bronze";
        default: return "";
    }
}

function getMonacoLang(lang) {
    switch (lang) {
        case "python": return "python";
        case "cpp": return "cpp";
        case "java": return "java";
        default: return "python";
    }
}

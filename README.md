# ⚡ CodePractice

A beginner-friendly coding practice platform — like a simplified LeetCode. Built with **Next.js**, **Tailwind CSS** (Neo-Brutalism UI), **Monaco Editor**, and **Judge0 API**.

![Neo-Brutalism UI](https://img.shields.io/badge/UI-Neo%20Brutalism-FF6B9D?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge)

---

## ✨ Features

- 🧩 **Problem List** — Browse coding challenges filtered by difficulty (Easy / Medium / Hard)
- 💻 **Code Editor** — Write code in Python, C++, or Java using Monaco Editor
- ▶️ **Code Execution** — Submit code and get instant results via Judge0 API
- 📋 **Submissions** — View your complete submission history
- 🏆 **Leaderboard** — See who has solved the most problems

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ installed
- A free **Judge0 API key** from [RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce)

### 1. Install Dependencies

```bash
cd codepractice
npm install
```

### 2. Set Up Environment Variables

Edit the `.env.local` file in the project root:

```
JUDGE0_API_KEY=your_rapidapi_key_here
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
```

> 💡 Sign up at [RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce) to get a free API key.

### 3. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Project Structure

```
codepractice/
├── data/
│   ├── problems.json        # All coding problems
│   └── submissions.json     # Submission history
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── problems/    # GET /api/problems
│   │   │   ├── submit/      # POST /api/submit
│   │   │   ├── submissions/ # GET /api/submissions
│   │   │   └── leaderboard/ # GET /api/leaderboard
│   │   ├── problem/[id]/    # Problem page with editor
│   │   ├── submissions/     # Submissions history page
│   │   ├── leaderboard/     # Leaderboard page
│   │   ├── layout.tsx       # Root layout + navbar
│   │   ├── page.tsx         # Home page (problem list)
│   │   └── globals.css      # Neo-Brutalism styles
│   └── lib/
│       └── data.ts          # JSON file helpers
├── .env.local               # API keys (not committed)
└── package.json
```

---

## 🔌 API Routes

| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| GET    | `/api/problems`       | List all problems              |
| GET    | `/api/problems/:id`   | Get a single problem           |
| POST   | `/api/submit`         | Submit code for execution      |
| GET    | `/api/submissions`    | Get submission history         |
| GET    | `/api/leaderboard`    | Get leaderboard rankings       |

---

## 🎨 Design

The UI uses a **Neo-Brutalism** design with:
- Thick black borders
- Hard drop shadows
- Flat vibrant colors (green, yellow, red, blue)
- Bold typography (Space Grotesk)
- Interactive hover effects

---

## 🛠 Tech Stack

| Technology     | Purpose                |
|----------------|------------------------|
| Next.js 15     | Full-stack framework   |
| Tailwind CSS   | Styling                |
| Monaco Editor  | Code editor            |
| Judge0 API     | Code execution         |
| JSON files     | Simple data storage    |
| TypeScript     | Type safety            |

---

## 📝 License

This project is for educational purposes.

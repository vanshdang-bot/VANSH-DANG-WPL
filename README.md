# ⚡ CodePractice

A beginner-friendly coding practice platform — like a simplified LeetCode.

![Neo-Brutalism UI](https://img.shields.io/badge/UI-Neo%20Brutalism-FF6B9D?style=for-the-badge)
![HTML/JS](https://img.shields.io/badge/Tech-Vanilla%20JS-yellow?style=for-the-badge)

---

## ✨ Features

- 🧩 **Problem List** — Browse coding challenges filtered by difficulty (Easy / Medium / Hard)
- 💻 **Code Editor** — Write code using Monaco Editor natively in the browser
- ▶️ **AI Auto-Grader** — Submit code and get instant test results via Groq API (LLaMA 3)
- 📋 **Submissions** — View your complete submission history (stored locally)
- 🏆 **Leaderboard** — See who has solved the most problems
- 💬 **AI Tutor** — Get hints and help without spoiling the answer

---

## 🚀 Getting Started

This is a **pure frontend application** (HTML, CSS, JavaScript). No build steps or backend servers are required!

### Prerequisites
- A free **Groq API key** from [GroqCloud](https://console.groq.com/keys)

### 1. Configure Configuration
Open `app.js` and paste your Groq API key:
```javascript
const GROQ_API_KEY = "your_groq_api_key_here";
```

### 2. Run Locally
You can start a simple static file server.
Using Node.js:
```bash
npx serve .
```

Using Python:
```bash
python3 -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) (or whichever port your server uses) in your browser.

---

## 📦 Project Structure

```
codepractice/
├── index.html           # Home page (problem list)
├── problem.html         # Problem solver page with editor & AI tutor
├── submissions.html     # Submissions history page
├── leaderboard.html     # Leaderboard page
├── styles.css           # Neo-Brutalism styling
└── app.js               # Core logic, problem data, & Groq integration
```

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
| HTML/CSS/JS    | Core frontend          |
| Monaco Editor  | Code editor widget     |
| Groq API       | Auto-grading & Tutor   |
| LocalStorage   | User data persistence  |

---

## 📝 License

This project is for educational purposes.

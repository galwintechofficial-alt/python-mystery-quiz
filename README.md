# Python Mystery Quiz Platform

A modern, animated, gamified Python examination platform tailored for college students with strict topic restrictions, anti-cheat detection, single-attempt SIC protection, and an administrative grading portal.

---

## 🎁 Exactly Three Mystery Boxes

Students select **one** of three animated mystery boxes. Each topic contains **exactly 20 questions** (7 Easy, 8 Medium, 5 Hard):

1. **Python Lists (20 questions)**
   - Creating lists, syntax, positive & negative indexing, slicing (`[start:stop:step]`)
   - `append()`, `extend()`, `insert()`, `remove()`, `pop()`, `clear()`, `len()`
   - Membership checks (`in`, `not in`), concatenation (`+`), repetition (`*`), traversal, counting & output prediction.
   - *Strictly isolated: No tuples, dictionaries, sets, functions, or OOP.*

2. **Python Variables (20 questions)**
   - Creation, assignment, reassignment, multiple assignment (`x, y = 5, 10` and `x = y = z = 100`)
   - Variable naming rules & valid/invalid identifiers (no leading digits, reserved keywords, case sensitivity)
   - Dynamic typing, basic value types (`int`, `float`, `str`, `bool`), variable swapping (`a, b = b, a`), output prediction.
   - *Strictly isolated: No functions, classes, loops, or advanced modules.*

3. **Python Operators (20 questions)**
   - Arithmetic (`+`, `-`, `*`, `/`, `%`, `//`, `**`)
   - Comparison (`==`, `!=`, `>`, `<`, `>=`, `<=`)
   - Assignment (`=`, `+=`, `-=`, `*=`, `/=`, `%=`, `//=`, `**=`)
   - Logical (`and`, `or`, `not`) with short-circuit evaluation
   - Membership (`in`, `not in`) & Identity (`is`, `is not`)
   - Operator precedence and expression evaluation.
   - *Strictly isolated: No unrelated Python libraries or constructs.*

**Total Question Bank**: 60 validated questions.

---

## 🔒 Security & Examination Integrity

1. **Single-Attempt SIC Enforcement**:
   - Unique SIC constraint in SQLite (`students` & `quiz_attempts`).
   - If a student with an existing `COMPLETED` or `AUTO_SUBMITTED` status attempts to register or log in again, the backend blocks the attempt and shows:
     > **Quiz Already Attempted**: This SIC number has already been used for this quiz. You cannot attempt the quiz again.
   - If a student refreshes while `IN_PROGRESS`, the backend resumes their active attempt safely without allowing a fresh attempt.

2. **Anti-Cheat Tab Switch & Window Exit Detection**:
   - Uses browser `visibilitychange` and window `blur` events.
   - Immediately auto-submits the attempt to `/api/quiz/auto-submit`.
   - Records the violation count, auto-submitted status, and locks the SIC permanently.

3. **Copy Protection**:
   - Text selection is disabled on questions (`user-select: none`).
   - Right-click context menus are prevented.
   - Shortcut keys like `Ctrl+C`, `Ctrl+X`, `Ctrl+V`, `Ctrl+U`, and `F12` are blocked.

4. **10-Second Countdown Per Question**:
   - Each question has a strict 10-second timer.
   - Reaching 0 seconds automatically logs the question as unanswered and advances forward.
   - **No Previous Button**: Navigation is strictly forward (Question 1 to Question 20).

5. **Confidential Score Policy**:
   - Students **never** see their numerical score, answer keys, or leaderboards.
   - Upon completion, students see only:
     > **🎉 Quiz Completed!**: Your response has been successfully recorded.
   - Gamification rewards (coins, streaks, badges) provide engaging feedback without exposing test marks.

---

## 🛡️ Admin & Faculty Portal

- **URL**: `/admin/login` or via the top navigation bar.
- **Default Credentials**:
  - **Username**: `admin`
  - **Password**: `Admin@Python2026!`
- **Capabilities**:
  - **Overview Stats**: Total students, total attempts, completed count, auto-submitted count, average score, highest score, topic breakdown.
  - **Student Results**: Search by name or SIC number; filter by topic, department, year, and status.
  - **Audit Inspection**: Inspect student answers question-by-question against correct answer keys and response latency.
  - **Leaderboard Ranking**: Ranks top student attempts (score descending, then time taken ascending).
  - **Question Bank CRUD**: Add, edit, delete, activate, or deactivate any of the 60 questions.
  - **Data Export**: One-click CSV export of all examination records.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Motion (Framer Motion), Lucide React, Canvas Confetti.
- **Backend**: Node.js, Express.js, TypeScript.
- **Database**: SQLite (`sql.js`), persistent database saved to `quiz.db`.
- **Security**: `bcryptjs` password hashing, HMAC-signed administrative tokens, parameterized SQL queries preventing SQL injection.

```
React Frontend (Vite)
       ↓
Express API (/api/*)
       ↓
SQLite Database (quiz.db)
```

---

## 🚀 Deployment Instructions

### Frontend Deployment (Vercel / Netlify)
1. Build the frontend:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to Vercel or Netlify.
3. Configure the environment variable:
   - `VITE_API_URL`: Your hosted backend URL (if frontend is hosted on a separate domain from the API).

### Backend Deployment (Node.js with Persistent Storage)
> **CRITICAL**: SQLite requires a persistent disk volume. Do **not** host SQLite on ephemeral serverless functions (like AWS Lambda or Vercel Serverless) without a persistent mount, or the database will reset.
- Deploy the Express backend on platforms that support persistent storage (e.g. Render, Railway, Fly.io, DigitalOcean, or an EC2 VPS).
- Start the server using:
  ```bash
  npm run start
  ```
- The backend will automatically mount `quiz.db` and persist student attempts, questions, and records.

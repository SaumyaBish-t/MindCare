<div align="center">

# 🌿 MindCare

**A safe, warm place for everyday mental wellness.**

_A mood-aware AI companion, gentle habit-building, gratitude journaling, sleep tracking, and curated crisis support — wrapped in a soft, calming design._

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/Postgres-NeonDB-336791?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6c47ff?style=flat-square)](https://clerk.com)
[![Groq](https://img.shields.io/badge/LLM-Groq%20%C2%B7%20gpt--oss--120b-f55036?style=flat-square)](https://groq.com)
[![OpenRouter](https://img.shields.io/badge/Mood-Llama%203.3%2070B%20(OpenRouter)-1f1f1f?style=flat-square)](https://openrouter.ai)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#license)

</div>

---

## ✨ What is MindCare?

MindCare is a **full-stack web app for everyday mental wellness** — designed to feel less like an app and more like a quiet conversation. It is **not** a replacement for therapy; it's a gentle companion for the in-between moments.

Six interconnected tools share a single warm "Soft Dawn" design language:

| Module | What it does |
|---|---|
| 🌅 **Dashboard** | Greeting, today's stats across mood / habits / sleep / gratitude, quick actions, recent activity. |
| 💬 **Buddy** | A mood-aware AI companion (Groq `openai/gpt-oss-120b`). Crisis guardrails, persistent history, gentle tone. |
| 📊 **Mood** | Structured sentiment analysis via OpenRouter (Llama 3.3 70B → Gemini Flash fallback). Trend chart, emotion chips, somatic "body hint," coping suggestions. |
| 🎯 **Habits** | Templates, streaks, daily completion, category-coloured cards. |
| 💛 **Journal** | Gratitude entries grouped by day. |
| 🌙 **Sleep** | Bedtime/waketime logging, weekly chart, box-breathing widget, ambient Spotify embeds. |
| 📚 **Resources** | YouTube search + curated India/US crisis directory (Tele MANAS, iCall, Vandrevala, 988, 911). |

---

## 🧠 Why it's different

- **Mood-aware Buddy.** Every chat reply is conditioned on the user's last 5 mood entries, today's habit completions, and recent sleep — fetched silently from Postgres and injected into the system prompt. The companion feels like it remembers your week.
- **Structured sentiment, not vibes.** The mood endpoint returns strict JSON: `sentiment`, `confidence`, `primary_emotion`, `secondary_emotions`, `description`, `body_hint`, `gentle_suggestion`. The frontend renders chips, a one-line somatic hint, and a coping nudge — far richer than a single happy/sad label.
- **Crisis-first design.** Keyword guardrails on chat route around the LLM with a pre-written safe response. Resources page surfaces region-specific helplines before the rest of the library.
- **Bearer-token auth everywhere.** Centralized `lib/api.js` injects a Clerk session token into every authed request — no fragile cross-origin cookies.
- **Soft Dawn design system.** One palette, one font, one card shape, one shadow. Defined as CSS variables in `src/index.css` and used everywhere.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  React 19 SPA  (Vite, react-router-dom 7, recharts, lucide)  │
│  ─────────────────────────────────────────────────────────   │
│  Pages: Landing · Dashboard · Buddy · Mood · Habits ·        │
│         Journal · Sleep · Resources                          │
│  Auth: @clerk/clerk-react           API: lib/api.js (Bearer) │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTPS  Authorization: Bearer <Clerk JWT>
┌────────────────────────────▼─────────────────────────────────┐
│  Express 5 backend  (Node 22, Clerk middleware, CORS)        │
│  ─────────────────────────────────────────────────────────   │
│  routes/chat.js       ─ Groq · openai/gpt-oss-120b           │
│  routes/sentiment.js  ─ OpenRouter · Llama 3.3 70B (+ fb)    │
│  routes/habits.js     ─ habitService + streaks               │
│  routes/gratitude.js  ─ journal CRUD                         │
│  routes/sleep.js      ─ sleep CRUD                           │
│  worker.js            ─ BullMQ (reminders, scheduled, WIP)   │
└────────────────────────────┬─────────────────────────────────┘
                             │ Prisma 6
┌────────────────────────────▼─────────────────────────────────┐
│  PostgreSQL on NeonDB                                        │
│  habits · habit_completions · gratitude_entries ·            │
│  sentiment_analyses · ChatConversation · chat_messages ·     │
│  sleep_entries · user_profiles                               │
└──────────────────────────────────────────────────────────────┘
```

### Tech stack

| Layer | Stack |
|---|---|
| **Frontend** | React 19 · Vite 7 · React Router 7 · Recharts · lucide-react · Plus Jakarta Sans · plain CSS (CSS variables, no Tailwind utility soup) |
| **Auth** | Clerk (`@clerk/clerk-react` + `@clerk/express`) — JWT Bearer tokens |
| **Backend** | Node 22 · Express 5 · Prisma 6 ORM · PostgreSQL (NeonDB) |
| **AI** | Groq SDK (`openai/gpt-oss-120b`) for chat · OpenRouter REST (Llama 3.3 70B free, Gemini 2.0 Flash fallback) for sentiment |
| **Email / Jobs** | Brevo SDK · BullMQ + ioredis (groundwork for reminders) |
| **Tooling** | nodemon · ESLint 9 · `prisma db push` |

---

## 🚀 Getting started

### Prerequisites
- **Node 20+** (tested on 22)
- **PostgreSQL** — easiest is a free NeonDB project at [neon.tech](https://neon.tech)
- Free API keys: **Clerk**, **Groq**, **OpenRouter**

### 1. Clone and install
```bash
git clone https://github.com/SaumyaBish-t/MindCare.git
cd MindCare

# frontend deps
npm install

# backend deps
cd backend
npm install
cd ..
```

### 2. Environment variables

Create **`.env`** at the project root (frontend):
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3001
VITE_YOUTUBE_API_KEY=...        # optional — enables Resources search
```

Create **`backend/.env`**:
```env
# Database
PRISMA_DATABASE_URL=postgresql://...neon.tech/...

# Auth
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# LLMs
GROQ_API_KEY=gsk_...
GROQ_CHAT_MODEL=openai/gpt-oss-120b

OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MOOD_MODEL=meta-llama/llama-3.3-70b-instruct:free
OPENROUTER_MOOD_FALLBACK=google/gemini-2.0-flash-exp:free
OPENROUTER_REFERER=http://localhost:5174

# Optional — email reminders
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=MindCare

# Optional — job queue
REDIS_URL=redis://localhost:6379

# Port + CORS (defaults usually fine in dev)
PORT=3001
```

### 3. Push the database schema
```bash
cd backend
npx prisma db push
npx prisma generate
```

### 4. Run
Two terminals:
```bash
# Terminal 1 — backend on :3001
cd backend
npm run dev

# Terminal 2 — frontend on :5173 (or next free port)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## 📡 API surface

All authed endpoints require `Authorization: Bearer <Clerk JWT>`. Chat works for anonymous users too (just doesn't persist).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/chat` | optional | Send a message; returns `{ type: "normal"\|"crisis", message }` |
| `GET`  | `/api/chat/history` | optional | Full conversation for signed-in user |
| `POST` | `/api/sentiment/analyze` | optional | Returns structured mood JSON |
| `POST` | `/api/sentiment/save` | required | Persist an analysis |
| `GET`  | `/api/sentiment/history` | required | Last 30 analyses |
| `DELETE` | `/api/sentiment/:id` | required | Owner-scoped delete |
| `GET`  | `/api/habits` | required | All active habits |
| `POST` | `/api/habits` | required | Create habit |
| `POST` | `/api/habits/:id/complete` | required | Mark today done |
| `GET`  | `/api/habits/:id/streak` | required | Streak length |
| `DELETE` | `/api/habits/:id` | required | Delete habit |
| `GET`  | `/api/gratitude` | required | Last 50 entries |
| `POST` | `/api/gratitude` | required | New entry |
| `DELETE` | `/api/gratitude/:id` | required | Delete entry |
| `GET`  | `/api/sleep` | required | Last 60 sleep logs |
| `POST` | `/api/sleep` | required | Log a night |
| `DELETE` | `/api/sleep/:id` | required | Delete a log |

---

## 📁 Project structure

```
MindCare/
├── src/
│   ├── App.jsx                  # Router + Clerk auth guards
│   ├── index.css                # Soft Dawn design system
│   ├── lib/
│   │   ├── api.js               # Centralized fetch with Clerk Bearer
│   │   └── icon.jsx             # lucide-react wrapper
│   ├── components/
│   │   ├── Navbar.jsx · Footer.jsx
│   │   ├── HabitBuilder.jsx
│   │   └── ui-common.jsx        # Modal, EmptyState, Toast, Spinner...
│   └── pages/
│       ├── Landing.jsx          # /
│       ├── DashBoard.jsx        # /dashboard
│       ├── Buddy.jsx            # /buddy   — chat
│       ├── SentimentalAnalysis.jsx  # /mood
│       ├── gratitudeJournal.jsx # /journal
│       ├── Progress.jsx         # /sleep
│       ├── Resources.jsx        # /resources
│       └── SignIn.jsx · SignUp.jsx · AuthShell.jsx
├── backend/
│   ├── server.js                # Express bootstrap, CORS, Clerk middleware
│   ├── worker.js                # BullMQ worker (reminders, WIP)
│   ├── routes/                  # chat · sentiment · habits · gratitude · sleep
│   ├── services/                # habitService · brevoClient
│   └── prisma/schema.prisma     # 8 models
└── README.md
```

---

## 🗺️ Roadmap

Shipped in this iteration (Batches A + B + F):
- ✅ Prisma 6 upgrade, `SleepEntry` + `UserProfile` schemas
- ✅ OpenRouter structured sentiment (Llama 3.3 70B → Gemini Flash fallback)
- ✅ Mood-aware Buddy with silent context injection
- ✅ India crisis directory

Next up:
- **Batch C — Personalization** — onboarding wizard, companion personalities (Warm / Coach / Stoic / Curious), dark mode + quiet mode
- **Batch D — Voice & Privacy** — Web Speech voice journaling, optional client-side encrypted journal entries
- **Batch E — Letters to your future self** — schedule a letter for future delivery via Brevo + BullMQ
- **Future** — Prisma 7 migration (datasource config refactor), Fitbit OAuth integration, end-of-week reflection email

---

## 🤝 Acknowledgements

- **[Groq](https://groq.com)** — blazing-fast inference, the reason Buddy feels responsive
- **[OpenRouter](https://openrouter.ai)** — free-tier access to top open models
- **[Clerk](https://clerk.com)** — auth that just works
- **[NeonDB](https://neon.tech)** — serverless Postgres with a generous free tier
- **[Brevo](https://www.brevo.com)** — transactional email
- **[Plus Jakarta Sans](https://github.com/tokotype/PlusJakartaSans)** by Tokotype — the typeface that carries the calm

---

## ⚠️ Important

MindCare is a wellness tool, **not a medical device or a substitute for professional care.** If you are in crisis, please contact your local emergency number or one of the helplines on the Resources page:

- 🇮🇳 **India** — Tele MANAS `14416` · iCall `+91 9152987821` · Vandrevala `+91 9999666555`
- 🇺🇸 **US** — 988 Suicide & Crisis Lifeline · 911 emergency

---

## 📄 License

MIT © [Saumya Bisht](https://github.com/SaumyaBish-t)

<div align="center">

_Made with care, designed for calm._

</div>

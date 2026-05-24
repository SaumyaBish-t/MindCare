// MindCare companion chat — Groq + openai/gpt-oss-120b.
// Drop-in replacement for the previous Gemini route. Same paths,
// same request/response shape — frontend doesn't change.

import express from "express";
import Groq from "groq-sdk";
import { PrismaClient } from "@prisma/client";
import { getAuth } from "@clerk/express";

const router = express.Router();
const prisma = new PrismaClient();

const MODEL = process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-120b";

// Lazy client — the Groq SDK throws synchronously if the key is missing,
// so we defer construction until the first request. That way the server
// still boots if you forget to set GROQ_API_KEY (chat just returns 503).
let _groq = null;
function getGroq() {
  if (_groq) return _groq;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const err = new Error("GROQ_API_KEY is not set on the server.");
    err.code = "MISSING_GROQ_KEY";
    throw err;
  }
  _groq = new Groq({ apiKey });
  return _groq;
}

// ---- crisis guardrail ---------------------------------------------------
const CRISIS_KEYWORDS = [
  "kill myself",
  "suicide",
  "want to die",
  "end my life",
  "self harm",
  "self-harm",
  "cut myself",
  "hurt myself",
  "i want to disappear",
];

const isCrisisMessage = (text) =>
  !!text && CRISIS_KEYWORDS.some((k) => text.toLowerCase().includes(k));

const crisisResponse = () => ({
  type: "crisis",
  message:
    "I'm really glad you reached out. It sounds like you're in a lot of pain, and I'm so sorry you're feeling this way.\n\n" +
    "I'm only an AI and not a therapist or an emergency service, so I can't keep you safe the way you deserve. " +
    "If you think you might act on these thoughts or are in immediate danger, please contact your local emergency number right now.\n\n" +
    "If you can, consider talking to someone you trust in your life, or reaching out to a mental health professional or crisis helpline in your area. " +
    "You don't have to go through this alone.\n\n" +
    "If you'd like, you can tell me more about what's been happening today, and I'll listen.",
});

// Pull recent context (last few moods + habits done today) so Buddy can
// reflect back what's been going on without the user having to repeat it.
// Best-effort — any failure here is swallowed and chat continues without context.
async function buildUserContext(userId) {
  if (!userId) return "";
  try {
    const [moods, habits, sleep] = await Promise.all([
      prisma.sentimentAnalysis.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { result: true, description: true, createdAt: true },
      }),
      prisma.habit.findMany({
        where: { userId, isActive: true },
        include: {
          completions: {
            where: {
              completionDate: { gte: new Date(Date.now() - 7 * 86400000) },
            },
            orderBy: { completionDate: "desc" },
          },
        },
      }),
      prisma.sleepEntry.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { duration: true, score: true, createdAt: true },
      }),
    ]);

    const lines = [];

    if (moods.length) {
      const recent = moods
        .map((m) => {
          const r = Array.isArray(m.result) ? m.result[0] : m.result;
          const s = r?.sentiment || "?";
          const desc = m.description || r?.primary_emotion || "";
          return `- ${s}${desc ? `: ${desc}` : ""}`;
        })
        .join("\n");
      lines.push(`Recent moods (newest first):\n${recent}`);
    }

    if (habits.length) {
      const todayStr = new Date().toDateString();
      const done = habits.filter((h) =>
        h.completions.some((c) => new Date(c.completionDate).toDateString() === todayStr)
      );
      const totalToday = done.length;
      const totalActive = habits.length;
      lines.push(
        `Today's habits: ${totalToday}/${totalActive} done${
          done.length ? ` (${done.map((h) => h.title).join(", ")})` : ""
        }.`
      );
    }

    if (sleep.length) {
      const last = sleep[0];
      lines.push(`Last logged sleep: ${last.duration}h (score ${last.score}/100).`);
    }

    if (!lines.length) return "";
    return `\n\nGentle context about the user (do NOT recite this back verbatim; let it inform tone and references when natural):\n${lines.join("\n")}\n`;
  } catch (e) {
    console.warn("buildUserContext failed:", e.message);
    return "";
  }
}

const SYSTEM_INSTRUCTIONS = `You are a warm, non-judgmental, supportive chat companion for people dealing with stress, anxiety, or low mood.

Style:
- Be kind, calm, and validating.
- Use short paragraphs and simple language.
- Never shame or judge the user.
- Sound like a caring friend, not a doctor or lecturer.

Rules:
- Do NOT diagnose any mental illness.
- Do NOT give medication or medical advice.
- Do NOT claim to be a therapist, doctor, or emergency service.
- Do NOT give instructions for self-harm, suicide, or anything dangerous.

When the user talks about everyday stress:
- Listen, reflect their feelings, and suggest gentle coping ideas (breathing, journaling, small steps, self-compassion).

If the user mentions suicidal thoughts or self-harm:
- Express empathy and concern.
- Encourage them to reach out to real people they trust.
- Encourage them to contact a professional or crisis helpline.
- Remind them that if they're in immediate danger, they should contact their local emergency number.`;

// ---- auth (logged-in OR anonymous) --------------------------------------
const authenticateApi = (req, _res, next) => {
  try {
    const { userId } = getAuth(req);
    req.userId = userId || null;
  } catch (e) {
    console.error("Auth error:", e.message);
    req.userId = null;
  }
  return next();
};

// ---- POST /api/chat -----------------------------------------------------
router.post("/chat", authenticateApi, async (req, res) => {
  try {
    const userId = req.userId;
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (isCrisisMessage(message)) {
      return res.json(crisisResponse());
    }

    // Build OpenAI-style chat messages: system + recent history + new turn.
    // Keep history bounded so we don't blow context on long conversations.
    const trimmedHistory = history.slice(-20).map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: String(m.content ?? ""),
    }));

    const userContext = await buildUserContext(userId);
    const messages = [
      { role: "system", content: SYSTEM_INSTRUCTIONS + userContext },
      ...trimmedHistory,
      { role: "user", content: message },
    ];

    const completion = await getGroq().chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply =
      completion?.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn't generate a reply.";

    // Persist only for signed-in users.
    if (userId) {
      const conversation = await prisma.chatConversation.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });

      await prisma.chatMessage.createMany({
        data: [
          { conversationId: conversation.id, role: "user",      content: message },
          { conversationId: conversation.id, role: "assistant", content: reply },
        ],
      });
    }

    return res.json({ type: "normal", message: reply });
  } catch (err) {
    if (err?.code === "MISSING_GROQ_KEY") {
      console.error("Chat blocked — missing GROQ_API_KEY");
      return res.status(503).json({
        error: "Chat is not configured. Add GROQ_API_KEY to the backend .env and restart the server.",
      });
    }
    console.error("Groq chat error:", err);
    return res.status(500).json({
      error: "Something went wrong on the server.",
      details: err?.message,
    });
  }
});

// ---- GET /api/chat/history ----------------------------------------------
router.get("/chat/history", authenticateApi, async (req, res) => {
  try {
    if (!req.userId) {
      return res.json({ success: true, messages: [] });
    }

    const conversation = await prisma.chatConversation.findFirst({
      where: { userId: req.userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    return res.json({
      success: true,
      messages: conversation?.messages || [],
    });
  } catch (err) {
    console.error("Chat history error:", err);
    res.status(500).json({ error: "Failed to load history" });
  }
});

export default router;

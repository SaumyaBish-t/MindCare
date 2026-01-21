import { GoogleGenAI } from "@google/genai";
import { PrismaClient } from "@prisma/client";
import { getAuth } from "@clerk/express";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
import express from "express";
const router = express.Router();
const prisma = new PrismaClient();
const isCrisisMessage = (text) => {
  if (!text) return false;
  const t = text.toLowerCase();
  const keywords = [
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
  return keywords.some((k) => t.includes(k));
};

const crisisResponse = () => {
  return {
    type: "crisis",
    message:
      "I'm really glad you reached out. It sounds like you're in a lot of pain, and I'm so sorry you're feeling this way.\n\n" +
      "I'm only an AI and not a therapist or an emergency service, so I can't keep you safe the way you deserve. " +
      "If you think you might act on these thoughts or are in immediate danger, please contact your local emergency number right now.\n\n" +
      "If you can, consider talking to someone you trust in your life, or reaching out to a mental health professional or crisis helpline in your area. " +
      "You don't have to go through this alone.\n\n" +
      "If you'd like, you can tell me more about what’s been happening today, and I’ll listen.",
  };
};
const SYSTEM_INSTRUCTIONS = `
You are a warm, non-judgmental, supportive chat companion for people dealing with stress, anxiety, or low mood.

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
- Remind them that if they're in immediate danger, they should contact their local emergency number.
`;

const authenticateApi = (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (userId) {
      // logged-in user
      req.userId = userId;
    } else {
      // not logged in – allow as anonymous
      req.userId = null; // or `guest-${Date.now()}` if you want an ID
    }

    return next();
  } catch (e) {
    console.error("Auth error:", e.message);
    // if Clerk throws for some reason, still allow request
    req.userId = null;
    return next();
  }
};

router.post("/chat", authenticateApi, async (req, res) => {
  try {
    const userId = req.userId;
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Crisis handling (no DB write)
    if (isCrisisMessage(message)) {
      return res.json(crisisResponse());
    }

    const historyText = history
      .map((m) => `${m.role === "user" ? "User" : "Companion"}: ${m.content}`)
      .join("\n");

    const prompt = `
${SYSTEM_INSTRUCTIONS}

Conversation so far:
${historyText}

User: ${message}

Now respond as the supportive companion.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const reply = response.text || "Sorry, I couldn't generate a reply.";

    // ✅ SAVE TO DB ONLY IF USER IS LOGGED IN
    if (userId) {
      const conversation = await prisma.chatConversation.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });

      await prisma.chatMessage.createMany({
        data: [
          {
            conversationId: conversation.id,
            role: "user",
            content: message,
          },
          {
            conversationId: conversation.id,
            role: "assistant",
            content: reply,
          },
        ],
      });
    }

    return res.json({
      type: "normal",
      message: reply,
    });
  } catch (err) {
    console.error("Gemini error:", err);
    return res.status(500).json({
      error: "Something went wrong on the server.",
    });
  }
});

router.get("/chat/history", authenticateApi, async (req, res) => {
  try {
    if (!req.userId) {
      return res.json({ success: true, messages: [] });
    }

    const conversation = await prisma.chatConversation.findFirst({
      where: { userId: req.userId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
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

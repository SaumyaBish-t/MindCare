// Mood / sentiment analysis — powered by OpenRouter free-tier LLMs.
// Returns a structured JSON the frontend can render directly.
//
// Primary model: meta-llama/llama-3.3-70b-instruct:free
// Fallback:      google/gemini-2.0-flash-exp:free
//
// Both are free on OpenRouter (~20 req/min, daily caps). The route
// catches rate-limit / 5xx from the primary and retries with fallback.

import express from "express";
import { PrismaClient } from "@prisma/client";
import { getAuth } from "@clerk/express";

const router = express.Router();
const prisma = new PrismaClient();

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const PRIMARY_MODEL  = process.env.OPENROUTER_MOOD_MODEL  || "meta-llama/llama-3.3-70b-instruct:free";
const FALLBACK_MODEL = process.env.OPENROUTER_MOOD_FALLBACK || "google/gemini-2.0-flash-exp:free";

const SYSTEM_PROMPT = `You are an empathic emotional analyst.

Given a short personal reflection, produce a JSON object describing the writer's emotional state. Be honest, gentle, and concrete. Never diagnose; never moralize.

Return ONLY a JSON object with these exact fields:
{
  "sentiment": "Positive" | "Neutral" | "Heavy",
  "confidence": number between 0 and 1,
  "primary_emotion": short label (e.g., "anxious", "hopeful", "tired", "content", "lonely", "grateful", "frustrated"),
  "secondary_emotions": array of 0-3 short labels,
  "description": one warm sentence (≤ 28 words) reflecting back what the writer seems to be feeling,
  "body_hint": one short phrase suggesting where in the body this might sit (e.g., "tightness in the chest", "lightness in the shoulders") — or empty string if unclear,
  "gentle_suggestion": one optional short coping idea (≤ 20 words) — or empty string
}

Classification rule:
- "Positive": predominantly bright, content, hopeful, grateful, calm.
- "Heavy": predominantly sad, anxious, angry, overwhelmed, hopeless, lonely, ashamed.
- "Neutral": mixed, flat, observational, or too brief to tell.

Output JSON only. No markdown, no commentary.`;

async function callOpenRouter(model, text) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    const e = new Error("OPENROUTER_API_KEY is not set on the server.");
    e.code = "MISSING_KEY";
    throw e;
  }

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // Optional but recommended by OpenRouter for rate-limit fairness
      "HTTP-Referer": process.env.OPENROUTER_REFERER || "http://localhost:5174",
      "X-Title": "MindCare",
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 400,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: text },
      ],
    }),
  });

  const bodyText = await res.text();
  if (!res.ok) {
    const err = new Error(`OpenRouter ${model} responded ${res.status}: ${bodyText.slice(0, 200)}`);
    err.status = res.status;
    err.transient = res.status === 429 || res.status >= 500;
    throw err;
  }

  let data;
  try { data = JSON.parse(bodyText); } catch {
    throw new Error("OpenRouter returned non-JSON");
  }
  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenRouter returned an empty completion");

  // Model is told to output a JSON object, but be defensive.
  try {
    return JSON.parse(content);
  } catch {
    // Try to fish out a JSON block.
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Model output was not valid JSON");
  }
}

function normalizeResult(raw) {
  const allowed = new Set(["Positive", "Neutral", "Heavy"]);
  return {
    sentiment: allowed.has(raw?.sentiment) ? raw.sentiment : "Neutral",
    confidence: Math.max(0, Math.min(1, Number(raw?.confidence) || 0.7)),
    primary_emotion: String(raw?.primary_emotion || "").slice(0, 40),
    secondary_emotions: Array.isArray(raw?.secondary_emotions)
      ? raw.secondary_emotions.filter((x) => typeof x === "string").slice(0, 3).map((s) => s.slice(0, 40))
      : [],
    description: String(raw?.description || "").slice(0, 240),
    body_hint: String(raw?.body_hint || "").slice(0, 80),
    gentle_suggestion: String(raw?.gentle_suggestion || "").slice(0, 180),
  };
}

// Auth helpers
const requireAuth = (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
};

const optionalAuth = (req, _res, next) => {
  try { req.userId = getAuth(req).userId || null; } catch { req.userId = null; }
  next();
};

// ---- POST /api/sentiment/analyze ----------------------------------------
router.post("/analyze", optionalAuth, async (req, res) => {
  try {
    const text = String(req.body?.text || "").trim();
    if (!text) return res.status(400).json({ success: false, error: "Text is required" });
    if (text.length > 4000) {
      return res.status(400).json({ success: false, error: "Text too long (max 4000 chars)" });
    }

    let raw;
    try {
      raw = await callOpenRouter(PRIMARY_MODEL, text);
    } catch (err) {
      if (err.code === "MISSING_KEY") {
        return res.status(503).json({
          success: false,
          error: "Mood analysis is not configured. Add OPENROUTER_API_KEY to the backend .env and restart.",
        });
      }
      if (!err.transient) throw err;
      console.warn(`[mood] primary model failed (${err.status}); falling back to ${FALLBACK_MODEL}`);
      raw = await callOpenRouter(FALLBACK_MODEL, text);
    }

    const result = normalizeResult(raw);
    // Wrapped in an array to keep one shape across models (frontend already handles arrays).
    res.json({ success: true, data: [result] });
  } catch (err) {
    console.error("Sentiment analyze error:", err);
    res.status(500).json({ success: false, error: err?.message || "Analysis failed" });
  }
});

// ---- POST /api/sentiment/save -------------------------------------------
router.post("/save", requireAuth, async (req, res) => {
  try {
    const { inputText, result, description } = req.body || {};
    if (!inputText || result == null) {
      return res.status(400).json({ error: "inputText and result are required" });
    }
    const analysis = await prisma.sentimentAnalysis.create({
      data: {
        userId: req.userId,
        inputText,
        result,
        description: description ?? null,
      },
    });
    res.status(201).json({ success: true, analysis });
  } catch (error) {
    console.error("Error saving sentiment analysis:", error);
    res.status(500).json({ error: "Failed to save analysis" });
  }
});

// ---- GET /api/sentiment/history -----------------------------------------
router.get("/history", requireAuth, async (req, res) => {
  try {
    const analyses = await prisma.sentimentAnalysis.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    res.json({ analyses });
  } catch (error) {
    console.error("Error fetching analysis history:", error);
    res.status(500).json({ error: "failed to fetch history" });
  }
});

// ---- DELETE /api/sentiment/:id ------------------------------------------
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    // SentimentAnalysis.id is a cuid String — composite ownership check.
    await prisma.sentimentAnalysis.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });
    res.json({ success: true, message: "Analysis deleted" });
  } catch (error) {
    console.error("Error deleting analysis:", error);
    res.status(500).json({ error: "Failed to delete analysis" });
  }
});

export default router;

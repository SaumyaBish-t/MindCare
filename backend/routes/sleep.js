// Sleep entries — backed by Postgres so they sync across devices and
// can feed Dashboard / mood correlations.
import express from "express";
import { PrismaClient } from "@prisma/client";
import { getAuth } from "@clerk/express";

const router = express.Router();
const prisma = new PrismaClient();

const authenticateApi = (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized", message: "Authentication required." });
  }
  req.userId = userId;
  next();
};

// GET /api/sleep
router.get("/sleep", authenticateApi, async (req, res) => {
  try {
    const entries = await prisma.sleepEntry.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 60,
    });
    res.json({ success: true, entries });
  } catch (err) {
    console.error("Error fetching sleep entries:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// POST /api/sleep
router.post("/sleep", authenticateApi, async (req, res) => {
  try {
    const { bedtime, waketime, duration, score, notes } = req.body || {};
    if (!bedtime || !waketime || duration == null || score == null) {
      return res.status(400).json({ success: false, error: "bedtime, waketime, duration, score are required" });
    }
    const entry = await prisma.sleepEntry.create({
      data: {
        userId: req.userId,
        bedtime: String(bedtime),
        waketime: String(waketime),
        duration: Number(duration),
        score: Math.round(Number(score)),
        notes: notes ? String(notes) : "",
      },
    });
    res.status(201).json({ success: true, entry });
  } catch (err) {
    console.error("Error creating sleep entry:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// DELETE /api/sleep/:id
router.delete("/sleep/:id", authenticateApi, async (req, res) => {
  try {
    await prisma.sleepEntry.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting sleep entry:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;

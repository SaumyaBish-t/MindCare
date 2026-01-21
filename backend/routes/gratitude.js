// backend/routes/gratitude.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { getAuth } from "@clerk/express";

const router = express.Router();
const prisma = new PrismaClient();

// simple auth middleware
const authenticateApi = (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "Authentication required." });
  }
  req.userId = userId;
  next();
};

// GET /api/gratitude  → list entries for logged-in user
router.get("/gratitude", authenticateApi, async (req, res) => {
  try {
    const entries = await prisma.gratitudeEntry.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 50, // limit, adjust if you want
    });

    res.json({ success: true, entries });
  } catch (err) {
    console.error("Error fetching gratitude entries:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// POST /api/gratitude  → create new entry
router.post("/gratitude", authenticateApi, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Content is required" });
    }

    const entry = await prisma.gratitudeEntry.create({
      data: {
        userId: req.userId,
        content: content.trim(),
      },
    });

    res.status(201).json({ success: true, entry });
  } catch (err) {
    console.error("Error creating gratitude entry:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// DELETE /api/gratitude/:id  → delete an entry (optional)
router.delete("/gratitude/:id", authenticateApi, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.gratitudeEntry.deleteMany({
      where: {
        id,
        userId: req.userId,
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting gratitude entry:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;

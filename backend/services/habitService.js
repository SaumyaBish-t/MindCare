import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class HabitService {
  async getUserHabits(userId) {
    const habits = await prisma.habit.findMany({
      where: { userId, isActive: true },
      include: {
        completions: {
          select: { completionDate: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // add computed fields manually like before
    return habits.map((h) => {
      const total_completions = h.completions.length;
      const last_completed =
        h.completions.length > 0
          ? h.completions[h.completions.length - 1].completionDate
          : null;
      return { ...h, total_completions, last_completed };
    });
  }

  async createHabit(userId, habitData) {
    const { title, description, category, targetFrequency } = habitData;
    return prisma.habit.create({
      data: {
        userId,
        title,
        description,
        category,
        targetFrequency,
      },
    });
  }

  async completeHabit(habitId, userId, date = new Date()) {
    try {
      return await prisma.habitCompletion.create({
        data: {
          habitId: Number(habitId),
          userId,
          completionDate: date,
        },
      });
    } catch (e) {
      // handle duplicate insert (unique constraint)
      if (e.code === "P2002") {
        return { message: "Already completed today" };
      }
      throw e;
    }
  }

  async deleteHabit(habitId, userId) {
    return prisma.habit.updateMany({
      where: { id: Number(habitId), userId },
      data: { isActive: false },
    });
  }

  async getHabitStreak(habitId, userId) {
    const completions = await prisma.habitCompletion.findMany({
      where: { habitId: Number(habitId), userId },
      orderBy: { completionDate: "desc" },
      take: 30,
    });

    if (completions.length === 0) return 0;

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < completions.length; i++) {
      const completionDate = new Date(completions[i].completionDate);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      if (completionDate.toDateString() === expectedDate.toDateString()) streak++;
      else break;
    }
    return streak;
  }
}

export default new HabitService();

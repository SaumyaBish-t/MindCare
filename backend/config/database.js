// config/database.js
import 'dotenv/config';
import pkg from "pg";
const { Pool } = pkg;

// ✅ Use the same cloud DB as Prisma
const pool = new Pool({
  connectionString: process.env.HABIT_DATABASE_URL || process.env.PRISMA_DATABASE_URL,
  // If your cloud DB requires SSL (most do: Supabase, Neon, etc.)

});

pool.on("connect", () => {
  console.log("✅ Connected to Habit DB (cloud)");
});

pool.on("error", (err) => {
  console.error("❌ Habit DB connection error:", err);
});

export default pool;

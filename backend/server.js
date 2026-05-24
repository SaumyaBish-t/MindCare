// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';

import gratitudeRoutes from './routes/gratitude.js';
import sentimentRoutes from './routes/sentiment.js';
import habitRoutes from './routes/habits.js';
import chatRoutes from './routes/chat.js';
import sleepRoutes from './routes/sleep.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS with credentials for your Vite dev server
// Allow Vite on 5173 / 5174 / 5175 plus an env-overridable list.
// Vite hops to the next free port if the default is busy, so we don't
// hard-code one — anything on localhost (any port) is accepted in dev.
const EXTRA_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl, server-to-server
    if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return cb(null, true);
    if (EXTRA_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON bodies BEFORE routes
app.use(express.json());

// Clerk middleware (after JSON, before protected routes)
app.use(clerkMiddleware());

// Request logger for reminders routes to verify traffic
app.use((req, _res, next) => {
  if (req.path.startsWith('/api/reminders')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Health/test routes
app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// Simple ping to confirm the server receives POST with JSON
app.post('/api/reminders/_ping', (req, res) => {
  console.log('PING body =', req.body);
  res.json({ ok: true });
});

// Feature routers
app.use('/api/sentiment', sentimentRoutes);
app.use('/api', habitRoutes);
app.use('/api', gratitudeRoutes);
app.use('/api', chatRoutes);
app.use('/api', sleepRoutes);

// Global error handler to surface any unexpected errors
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err?.message });
});

app.listen(PORT, () => {
  console.log('Backend running on port', PORT);
});

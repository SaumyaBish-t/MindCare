// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';

import gratitudeRoutes from './routes/gratitude.js';
import sentimentRoutes from './routes/sentiment.js';
import habitRoutes from './routes/habits.js';
import { Client } from '@gradio/client';
import chatRoutes from './routes/gemini.js'

const app = express();
const PORT = process.env.PORT || 3001;

// CORS with credentials for your Vite dev server
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
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

// Feature routers (unchanged)
app.use('/api/sentiment', sentimentRoutes);
app.use('/api', habitRoutes);           // ensure paths inside habits.js are relative to /api
app.use('/api', gratitudeRoutes);
app.use("/api", chatRoutes);

// Gradio client (kept) with lazy connect
let client = null;
async function getClient() {
  if (!client) {
    client = await Client.connect('SamOp224/mental-health-sentiment');
  }
  return client;
}

// Duplicate sentiment analyze route kept as in your code
app.post('/api/sentiment/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const gradioClient = await getClient();
    const result = await gradioClient.predict('/predict', { text });

    res.json({ success: true, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Global error handler to surface any unexpected errors
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err?.message });
});

app.listen(PORT, () => {
  console.log('Backend running on port', PORT);
});

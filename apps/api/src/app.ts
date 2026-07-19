import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from '@/config';
import v1Router from '@/routes/v1/index';
import { errorHandler } from '@/middleware/errorHandler';

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);

import passport from './lib/passport';
import session from 'express-session';

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());

// ── Session & Passport ────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.JWT_SECRET || 'campusos_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));

app.use(passport.initialize());

// ── API v1 routes ─────────────────────────────────────────────────────────────
app.use('/api/v1', v1Router);

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CampusOS API is running"
  });
});

// ── Serve React static files in production if built ─────────────────────────
const webDistPath = path.resolve(__dirname, '../../web/dist');
if (fs.existsSync(webDistPath)) {
  console.log(`Serving static files from: ${webDistPath}`);
  app.use(express.static(webDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(webDistPath, 'index.html'));
  });
}

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

export default app;

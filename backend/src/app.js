/**
 * app.js — สร้างและ configure Express app
 *
 * Middleware stack (ตามลำดับ):
 *   helmet → cors → express.json → morgan → apiLimiter
 *   → /api router → notFound → errorHandler
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import { env, isProd } from './config/env.js';

// Side-effect: initialize Firebase Admin SDK on boot
import './config/firebase.js';

import { apiLimiter } from './middleware/rateLimit.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import router from './routes/index.js';

const app = express();

// ---------------------------------------------------------------------------
// Security headers
// ---------------------------------------------------------------------------
app.use(helmet());

// ---------------------------------------------------------------------------
// CORS
// env.CORS_ORIGIN may be "*" (reflect any origin) or a comma-separated list
// of allowed origins. "*" + credentials is invalid in browsers, so we use
// origin:true (reflects request origin) which works with credentials:true.
// ---------------------------------------------------------------------------
const corsOrigin =
  env.CORS_ORIGIN === '*'
    ? true
    : env.CORS_ORIGIN
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

// ---------------------------------------------------------------------------
// Body parsing
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '1mb' }));

// ---------------------------------------------------------------------------
// Request logging
// ---------------------------------------------------------------------------
app.use(morgan(isProd ? 'combined' : 'dev'));

// ---------------------------------------------------------------------------
// Global rate limiter
// ---------------------------------------------------------------------------
app.use(apiLimiter);

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
app.use('/api', router);

// ---------------------------------------------------------------------------
// 404 + global error handler (ต้อง mount สุดท้ายเสมอ)
// ---------------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

export default app;

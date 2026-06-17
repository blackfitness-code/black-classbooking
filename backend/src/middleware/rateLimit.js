/**
 * rateLimit.js — rate limiter instances
 *
 * apiLimiter  → global API limit (300 req / 15 min)
 * authLimiter → stricter limit for auth routes (20 req / 15 min)
 *
 * Usage in app.js:  app.use(apiLimiter)
 * Usage on auth routes (Phase 1):  router.use(authLimiter)
 */

import { rateLimit } from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: 'draft-7', // Return RateLimit-* headers (RFC draft-7)
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // stricter: 20 attempts per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many authentication attempts, please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
  },
});

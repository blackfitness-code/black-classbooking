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
  windowMs: 15 * 60 * 1000,
  max: 2000, // ~130 req/user สำหรับ 15 คนพร้อมกัน
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // key by LINE uid ถ้ามี (จาก JWT) ไม่งั้น fallback IP
  // ป้องกัน shared-WiFi นับรวมทุกคนเป็น IP เดียว
  keyGenerator: (req) => req.user?.uid || req.ip,
  message: {
    error: {
      message: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // /auth/line เรียกทุกครั้งที่เปิดแอป — shared WiFi ต้องสูง
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many authentication attempts, please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
  },
});

/**
 * routes/index.js — root API router
 *
 * Mount เส้นทางทั้งหมดที่นี่ แล้ว export ไปใส่ใน app.js
 */

import { Router } from 'express';
import { env } from '../config/env.js';

// Phase 1: Authentication + current user profile
import authRouter from './auth.routes.js';
import meRouter from './me.routes.js';

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/health — health check endpoint
// ---------------------------------------------------------------------------
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    env: env.NODE_ENV,
  });
});

// ---------------------------------------------------------------------------
// Phase 1: Authentication routes
// authLimiter ถูก apply ภายใน auth.routes.js เอง
// ---------------------------------------------------------------------------
router.use('/auth', authRouter);

// ---------------------------------------------------------------------------
// Phase 1: Current user profile
// ---------------------------------------------------------------------------
router.use('/me', meRouter);

// ---------------------------------------------------------------------------
// TODO Phase 2: Class management
// import classesRouter from './classes.js';
// router.use('/classes', classesRouter);

// TODO Phase 2: Booking management
// import bookingsRouter from './bookings.js';
// router.use('/bookings', requireAuth, bookingsRouter);

// TODO Phase 3: Check-in / QR
// import checkinsRouter from './checkins.js';
// router.use('/checkins', requireAuth, checkinsRouter);

// TODO Phase 3: Admin operations
// import adminRouter from './admin.js';
// router.use('/admin', requireAuth, requireRole('admin'), adminRouter);
// ---------------------------------------------------------------------------

export default router;

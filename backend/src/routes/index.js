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

// Phase 2: Classes + Bookings + Members
import classesRouter from './classes.routes.js';
import bookingsRouter from './bookings.routes.js';
import membersRouter from './members.routes.js';

// Phase 2/3: Check-in (staff|admin)
import checkinsRouter from './checkins.routes.js';

// Phase 3: Admin operations
import adminRouter from './admin.routes.js';

// CRM lookup (prefill on registration)
import crmRouter from './crm.routes.js';

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
// Phase 2: Class listing (auth handled inside router)
// ---------------------------------------------------------------------------
router.use('/classes', classesRouter);

// ---------------------------------------------------------------------------
// Phase 2: Booking management (auth handled inside router)
// ---------------------------------------------------------------------------
router.use('/bookings', bookingsRouter);

// ---------------------------------------------------------------------------
// Phase 2: Public member card (no auth — handled inside router)
// ---------------------------------------------------------------------------
router.use('/members', membersRouter);

// ---------------------------------------------------------------------------
// Phase 2/3: Check-in (requireAuth + requireRole inside router)
// ---------------------------------------------------------------------------
router.use('/checkins', checkinsRouter);

// ---------------------------------------------------------------------------
// Phase 3: Admin operations (requireAuth + requireRole applied inside router)
// ---------------------------------------------------------------------------
router.use('/admin', adminRouter);

// ---------------------------------------------------------------------------
// CRM: phone lookup for registration prefill (no auth required)
// ---------------------------------------------------------------------------
router.use('/crm', crmRouter);

export default router;

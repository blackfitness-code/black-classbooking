/**
 * checkins.routes.js — Check-in endpoint (staff|admin)
 *
 * POST /api/checkins   (requireAuth + requireRole('staff','admin'))
 *   body: { uid, classId, bookingId?, date? }  (from QR payload)
 *   → { checkin }
 *
 * NOTE: GET /admin/checkins and DELETE /admin/checkins/:id are in the ADMIN task.
 * They are implemented in services/checkins.js (listCheckins, deleteCheckin) ready to mount.
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCheckin } from '../services/checkins.js';

const router = Router();

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const checkinBodySchema = z.object({
  uid: z.string({ required_error: 'uid is required' }).min(1),
  classId: z.string({ required_error: 'classId is required' }).min(1),
  bookingId: z.string().optional(),
  date: z.string().optional(), // "YYYY-MM-DD"
});

// ---------------------------------------------------------------------------
// POST / — create check-in (staff|admin only)
// ---------------------------------------------------------------------------
router.post(
  '/',
  requireAuth,
  requireRole('staff', 'admin'),
  validate(checkinBodySchema),
  async (req, res, next) => {
    try {
      const { uid, classId, bookingId, date } = req.body;
      const checkin = await createCheckin(
        { uid, classId, bookingId, date },
        req.user.uid, // checkedInBy = staff uid
      );
      res.status(201).json({ checkin });
    } catch (err) {
      next(err);
    }
  },
);

export default router;

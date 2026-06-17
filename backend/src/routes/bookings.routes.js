/**
 * bookings.routes.js — Booking endpoints
 *
 * GET    /api/bookings/me    → { bookings: [...] }
 * POST   /api/bookings       body { classId } → { booking, currentBookings }
 * DELETE /api/bookings/:id   → { ok: true }
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listMyBookings, createBooking, cancelBooking } from '../services/bookings.js';

const router = Router();

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const createBookingSchema = z.object({
  classId: z.string({ required_error: 'classId is required' }).min(1, 'classId cannot be empty'),
});

// ---------------------------------------------------------------------------
// GET /me — current user's bookings (all statuses)
// ---------------------------------------------------------------------------
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const bookings = await listMyBookings(req.user.uid);
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST / — create booking
// ---------------------------------------------------------------------------
router.post('/', requireAuth, validate(createBookingSchema), async (req, res, next) => {
  try {
    const { classId } = req.body;
    const { booking, currentBookings } = await createBooking(req.user.uid, classId);
    res.status(201).json({ booking, currentBookings });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — cancel booking
// ---------------------------------------------------------------------------
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await cancelBooking(req.user.uid, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;

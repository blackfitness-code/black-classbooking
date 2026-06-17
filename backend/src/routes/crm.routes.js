/**
 * crm.routes.js
 *
 * GET /api/crm/lookup?phone=0812345678
 *   → { found: true, data: { firstName, lastName, phone, email, dob, gender, nickname, nationalId, branch } }
 *   → { found: false }
 *
 * ไม่ต้อง auth — ใช้เฉพาะตอน prefill หน้า register ก่อน user มี token
 * แต่ใช้ apiLimiter ป้องกัน enumeration
 */

import { Router } from 'express';
import { z } from 'zod';

import { apiLimiter } from '../middleware/rateLimit.js';
import { ApiError } from '../middleware/errorHandler.js';
import { lookupByPhone } from '../services/crm.js';

const router = Router();

router.use(apiLimiter);

const querySchema = z.object({
  phone: z
    .string({ required_error: 'phone is required' })
    .regex(/^\d{9,10}$/, 'phone must be 9–10 digits'),
});

router.get('/lookup', async (req, res, next) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      const err = new ApiError(400, 'Validation failed', 'VALIDATION');
      err.details = parsed.error.flatten();
      return next(err);
    }

    const record = await lookupByPhone(parsed.data.phone);

    if (!record) {
      return res.json({ found: false });
    }

    res.json({ found: true, data: record });
  } catch (err) {
    next(err);
  }
});

export default router;

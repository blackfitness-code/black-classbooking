/**
 * me.routes.js — Current user profile endpoints
 *
 * GET /api/me   → ดึงข้อมูล user ปัจจุบัน
 * PUT /api/me   → อัปเดต profile (ยกเว้น protected fields)
 */

import { Router } from 'express';
import { z } from 'zod';

import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { getUserByLineId, updateProfile, serializeUser } from '../services/users.js';

const router = Router();

// ---------------------------------------------------------------------------
// Schema สำหรับ PUT /me
// passthrough() = ยอมรับ field อื่น ๆ ที่ไม่ได้ define
// .strip() บน field ต้องห้าม → zod จะตัดออกอัตโนมัติ
//
// เราใช้ z.object().passthrough() แล้วดัก protected fields ใน updateProfile
// แต่เพื่อ defense-in-depth ให้ strip ออกที่ schema ก่อนด้วย
// ---------------------------------------------------------------------------
const updateProfileSchema = z
  .object({
    // Protected fields — strip ออก (ไม่ error แต่ทิ้ง)
    role: z.any().optional().transform(() => undefined),
    membershipExpiry: z.any().optional().transform(() => undefined),
    cooldownUntil: z.any().optional().transform(() => undefined),
    lineUserId: z.any().optional().transform(() => undefined),
    createdAt: z.any().optional().transform(() => undefined),
    profileCompleted: z.any().optional().transform(() => undefined),
  })
  .passthrough() // รับ profile fields อื่น ๆ (name, phone, etc.)
  .transform((data) => {
    // ลบ undefined fields ที่ถูก strip ออก
    const clean = {};
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) clean[key] = val;
    }
    return clean;
  });

// ---------------------------------------------------------------------------
// GET / — ดึงข้อมูล user ปัจจุบัน
// ---------------------------------------------------------------------------
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const user = await getUserByLineId(req.user.uid);

    if (!user) {
      return res.json({ user: null, needsProfileSetup: true });
    }

    res.json({
      user: serializeUser(user),
      needsProfileSetup: !user.profileCompleted,
      isAdmin: user.role === 'admin',
      isStaff: user.role === 'staff',
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT / — อัปเดต profile
// ---------------------------------------------------------------------------
router.put('/', requireAuth, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const updated = await updateProfile(req.user.uid, req.body);

    res.json({
      user: serializeUser(updated),
      needsProfileSetup: !updated.profileCompleted,
      isAdmin: updated.role === 'admin',
      isStaff: updated.role === 'staff',
    });
  } catch (err) {
    next(err);
  }
});

export default router;

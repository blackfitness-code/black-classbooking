/**
 * auth.routes.js — Authentication endpoints
 *
 * POST /api/auth/line    → LINE LIFF login (หรือ dev bypass)
 * POST /api/auth/refresh → rotate access token ด้วย refresh token
 * POST /api/auth/logout  → stateless logout (client ทิ้ง token เอง)
 */

import { Router } from 'express';
import { z } from 'zod';

import { authLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { ApiError } from '../middleware/errorHandler.js';
import { isProd } from '../config/env.js';

import { verifyLineIdToken } from '../services/line.js';
import { upsertUserIdentity, getUserByLineId, serializeUser } from '../services/users.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../services/token.js';

const router = Router();

// Apply stricter rate limit ทุก auth route
router.use(authLimiter);

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

// Production path: ต้องมี idToken
// Dev path: อาจใช้ devUid แทน (guard ด้วย !isProd ใน handler)
const lineBodySchema = z
  .object({
    idToken: z.string().optional(),
    devUid: z.string().optional(),
    displayName: z.string().optional(),
    pictureUrl: z.string().optional(),
  })
  .passthrough();

const refreshBodySchema = z.object({
  refreshToken: z.string({ required_error: 'refreshToken is required' }),
});

// ---------------------------------------------------------------------------
// POST /line — LINE LIFF login
// ---------------------------------------------------------------------------
router.post('/line', validate(lineBodySchema), async (req, res, next) => {
  try {
    const { idToken, devUid, displayName, pictureUrl } = req.body;

    let identity;

    // Dev bypass — ห้าม run ใน production เด็ดขาด
    if (!isProd && devUid && !idToken) {
      identity = {
        lineUserId: devUid,
        displayName: displayName ?? 'Dev User',
        pictureUrl: pictureUrl ?? '',
      };
    } else if (idToken) {
      // Production path: ตรวจสอบกับ LINE API
      identity = await verifyLineIdToken(idToken);
    } else {
      throw new ApiError(400, 'idToken is required', 'MISSING_ID_TOKEN');
    }

    // upsert user ใน Firestore
    const userWithFlag = await upsertUserIdentity(identity);
    const { needsProfileSetup, ...userDoc } = userWithFlag;

    // ออก tokens
    const accessToken = signAccessToken({ uid: userDoc.id, role: userDoc.role });
    const refreshToken = signRefreshToken({ uid: userDoc.id });

    res.json({
      accessToken,
      refreshToken,
      user: serializeUser(userDoc),
      needsProfileSetup,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /refresh — แลก refresh token เอา access token ใหม่
// ---------------------------------------------------------------------------
router.post('/refresh', validate(refreshBodySchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // ตรวจสอบ refresh token
    const payload = verifyRefreshToken(refreshToken);

    // ดึง user ปัจจุบันเพื่อให้ได้ role ล่าสุด
    const user = await getUserByLineId(payload.uid);
    if (!user) {
      throw new ApiError(401, 'User not found', 'USER_NOT_FOUND');
    }

    // ออก access token ใหม่
    const newAccessToken = signAccessToken({ uid: user.id, role: user.role });

    // Rotate refresh token ด้วย (optional แต่ดี)
    const newRefreshToken = signRefreshToken({ uid: user.id });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /logout — stateless; client ลบ token เอง
// ---------------------------------------------------------------------------
router.post('/logout', (req, res) => {
  // Stateless JWT logout — client ต้องลบ token ออกจาก storage เอง
  // TODO (future): เพิ่ม refresh token denylist (เช่น Firestore/Redis)
  //   เพื่อ revoke token ก่อนหมดอายุจริง
  res.json({ ok: true });
});

export default router;

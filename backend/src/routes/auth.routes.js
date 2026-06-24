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
import { lookupUserIdentity, getUserByLineId, serializeUser } from '../services/users.js';
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

    // ค้นหา user ใน Firestore โดย **ไม่สร้าง doc** — doc จะสร้างตอน PUT /me เท่านั้น
    const existing = await lookupUserIdentity(identity);

    let uid, role, userPayload, needsProfileSetup;

    if (existing) {
      const { needsProfileSetup: nps, ...userDoc } = existing;
      uid = userDoc.id;
      role = userDoc.role;
      userPayload = serializeUser(userDoc);
      needsProfileSetup = nps;
    } else {
      // User ใหม่ที่ยังไม่เคย submit profile
      uid = identity.lineUserId;
      role = 'user';
      userPayload = null;
      needsProfileSetup = true;
    }

    // ออก tokens (ใช้ lineUserId เป็น uid เสมอ)
    const accessToken = signAccessToken({ uid, role });
    const refreshToken = signRefreshToken({ uid });

    res.json({
      accessToken,
      refreshToken,
      user: userPayload,
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

    // ดึง user ปัจจุบันเพื่อให้ได้ role ล่าสุด (อาจยังไม่มีใน DB ถ้ายังไม่ submit profile)
    const user = await getUserByLineId(payload.uid);
    const uid = payload.uid;
    const role = user?.role ?? 'user';

    // ออก access token ใหม่
    const newAccessToken = signAccessToken({ uid, role });

    // Rotate refresh token ด้วย (optional แต่ดี)
    const newRefreshToken = signRefreshToken({ uid });

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

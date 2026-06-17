/**
 * auth.js — JWT middleware
 *
 * Phase 1: verify access token จาก Authorization header
 *   - requireAuth: ตรวจ Bearer token, attach req.user = { uid, role }
 *   - requireRole: ตรวจสอบ role หลังจาก requireAuth ทำงานแล้ว
 */

import { verifyAccessToken } from '../services/token.js';
import { ApiError } from './errorHandler.js';

/**
 * requireAuth — ตรวจสอบ Bearer token และ attach req.user
 * @type {import('express').RequestHandler}
 */
export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Missing token', 'NO_TOKEN');
    }

    const token = authHeader.slice(7); // ตัด "Bearer " ออก
    const payload = verifyAccessToken(token);

    // attach user ให้ route ถัดไปใช้งานได้
    req.user = { uid: payload.uid, role: payload.role };

    next();
  } catch (err) {
    // ส่ง error ไปให้ errorHandler จัดการ
    next(err);
  }
}

/**
 * requireRole — factory: ตรวจสอบว่า req.user.role อยู่ใน roles ที่อนุญาต
 * ต้อง run หลัง requireAuth เสมอ
 *
 * @param {...string} roles  roles ที่อนุญาต เช่น 'admin', 'staff'
 * @returns {import('express').RequestHandler}
 */
export function requireRole(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      // ป้องกัน mis-use: ถ้า requireAuth ไม่ได้ run ก่อน
      return next(new ApiError(401, 'Missing token', 'NO_TOKEN'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden', 'FORBIDDEN'));
    }

    next();
  };
}

/**
 * services/token.js — sign และ verify JWT access/refresh tokens
 */

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * signAccessToken — ออก access token (อายุสั้น)
 * @param {{ uid: string, role: string }} payload
 * @returns {string} JWT
 */
export function signAccessToken({ uid, role }) {
  return jwt.sign({ uid, role, typ: 'access' }, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
  });
}

/**
 * signRefreshToken — ออก refresh token (อายุยาว)
 * @param {{ uid: string }} payload
 * @returns {string} JWT
 */
export function signRefreshToken({ uid }) {
  return jwt.sign({ uid, typ: 'refresh' }, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL,
  });
}

/**
 * verifyAccessToken — ตรวจสอบ access token และ typ claim
 * @param {string} token
 * @returns {jwt.JwtPayload}
 */
export function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded.typ !== 'access') {
      throw new ApiError(401, 'Invalid token', 'INVALID_TOKEN');
    }
    return decoded;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'Invalid token', 'INVALID_TOKEN');
  }
}

/**
 * verifyRefreshToken — ตรวจสอบ refresh token และ typ claim
 * @param {string} token
 * @returns {jwt.JwtPayload}
 */
export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded.typ !== 'refresh') {
      throw new ApiError(401, 'Invalid token', 'INVALID_TOKEN');
    }
    return decoded;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'Invalid token', 'INVALID_TOKEN');
  }
}

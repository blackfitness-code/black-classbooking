/**
 * errorHandler.js — global error handling middleware
 *
 * Exports:
 *   ApiError  — typed error class สำหรับ throw ใน route/service
 *   notFound  — 404 handler (ควร mount ก่อน errorHandler)
 *   errorHandler — 4-arg Express error handler (mount สุดท้าย)
 */

import { isProd } from '../config/env.js';

// ---------------------------------------------------------------------------
// ApiError — typed error ที่ route สามารถ throw ได้
// ---------------------------------------------------------------------------
export class ApiError extends Error {
  /**
   * @param {number} status   HTTP status code
   * @param {string} message  Human-readable message
   * @param {string} [code]   Machine-readable code เช่น 'UNAUTHORIZED'
   */
  constructor(status, message, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code ?? `HTTP_${status}`;
  }
}

// ---------------------------------------------------------------------------
// notFound — จับ request ที่ไม่มี route รองรับ
// ---------------------------------------------------------------------------
export function notFound(req, res, next) {
  const err = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND');
  next(err);
}

// ---------------------------------------------------------------------------
// errorHandler — 4-arg Express error handler
// ---------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status ?? err.statusCode ?? 500;
  const code = err.code ?? (status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR');

  // Log full error server-side เสมอ
  if (status >= 500) {
    console.error('[error]', {
      status,
      code,
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  } else {
    // 4xx: log แค่ summary
    console.warn('[warn]', { status, code, message: err.message, url: req.originalUrl });
  }

  // ใน production ซ่อน stack และ message ของ 500 errors จาก client
  const clientMessage =
    isProd && status >= 500 ? 'Internal Server Error' : err.message;

  res.status(status).json({
    error: {
      message: clientMessage,
      code,
    },
  });
}

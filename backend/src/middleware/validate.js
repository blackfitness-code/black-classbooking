/**
 * validate.js — Zod validation middleware
 *
 * Usage:
 *   router.post('/route', validate(myZodSchema), handler)
 *
 * ถ้า parse ผ่าน → req.body ถูกแทนที่ด้วย output ที่ผ่าน transform/strip แล้ว
 * ถ้า parse ไม่ผ่าน → throw ApiError(400, 'Validation failed', 'VALIDATION')
 *                      พร้อม .details = flattened zod issues
 */

import { ZodError } from 'zod';
import { ApiError } from './errorHandler.js';

/**
 * validate — Express middleware factory รับ Zod schema
 * @param {import('zod').ZodTypeAny} schema
 * @returns {import('express').RequestHandler}
 */
export function validate(schema) {
  return function validationMiddleware(req, res, next) {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const apiErr = new ApiError(400, 'Validation failed', 'VALIDATION');
        apiErr.details = err.flatten();
        return next(apiErr);
      }
      // ZodError ที่ไม่ตรงแบบ → pass ต่อ
      next(err);
    }
  };
}

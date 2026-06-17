/**
 * services/line.js — ตรวจสอบ LINE LIFF ID Token กับ LINE API
 */

import { env } from '../config/env.js';
import { ApiError } from '../middleware/errorHandler.js';

const LINE_VERIFY_URL = 'https://api.line.me/oauth2/v2.1/verify';

/**
 * verifyLineIdToken — ส่ง id_token ไปตรวจสอบกับ LINE
 * @param {string} idToken  LIFF ID token จาก liff.getIDToken()
 * @returns {{ lineUserId: string, displayName: string, pictureUrl: string }}
 */
export async function verifyLineIdToken(idToken) {
  if (!env.LINE_CHANNEL_ID) {
    throw new ApiError(500, 'LINE_CHANNEL_ID not configured', 'LINE_NOT_CONFIGURED');
  }

  const body = new URLSearchParams({
    id_token: idToken,
    client_id: env.LINE_CHANNEL_ID,
  });

  let res;
  try {
    res = await fetch(LINE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
  } catch (networkErr) {
    throw new ApiError(502, 'Failed to reach LINE API', 'LINE_API_UNREACHABLE');
  }

  const data = await res.json();

  // LINE returns 200 on success; non-200 or error field = invalid token
  if (!res.ok || data.error) {
    throw new ApiError(401, 'Invalid LINE token', 'INVALID_LINE_TOKEN');
  }

  return {
    lineUserId: data.sub,
    displayName: data.name ?? '',
    pictureUrl: data.picture ?? '',
  };
}

/**
 * services/members.js — Public member card (safe fields only)
 *
 * Returns ONLY safe, non-PII fields for the public member card endpoint.
 * Never exposes: phone, nationalId, healthIssues, role, etc.
 */

import { db } from '../config/firebase.js';
import { ApiError } from '../middleware/errorHandler.js';

// ---------------------------------------------------------------------------
// getPublicCard
// ---------------------------------------------------------------------------
/**
 * ดึงข้อมูล member card แบบ public (เฉพาะ safe fields)
 *
 * Safe fields: lineUserId, displayName, fullName, pictureUrl,
 *              membershipExpiry (ISO|null), memberType
 *
 * @param {string} id  lineUserId (= Firestore users doc ID)
 * @returns {Promise<object>}
 * @throws {ApiError} 404 MEMBER_NOT_FOUND
 */
export async function getPublicCard(id) {
  const snap = await db.collection('users').doc(id).get();

  if (!snap.exists) {
    throw new ApiError(404, 'Member not found', 'MEMBER_NOT_FOUND');
  }

  const data = snap.data();

  // displayName: nickname ก่อน → displayName → fallback Thai text
  const displayName = data.nickname || data.displayName || 'สมาชิก';

  // fullName: รวม firstName + lastName (กรองค่าว่างออก)
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ');

  // membershipExpiry: แปลง Timestamp → ISO string หรือ null
  let membershipExpiry = null;
  if (data.membershipExpiry) {
    if (typeof data.membershipExpiry.toDate === 'function') {
      membershipExpiry = data.membershipExpiry.toDate().toISOString();
    } else {
      membershipExpiry = data.membershipExpiry;
    }
  }

  return {
    lineUserId: data.lineUserId ?? id,
    displayName,
    fullName,
    pictureUrl: data.pictureUrl ?? null,
    membershipExpiry,
    memberType: data.memberType ?? '',
  };
}

/**
 * services/users.js — Firestore user CRUD operations
 *
 * Document ID = lineUserId (e.g. "U1234...")
 * Collection: users
 */

import { db, admin } from '../config/firebase.js';
import { ApiError } from '../middleware/errorHandler.js';
import { lookupMembership } from './membership-sheets.js';

const { FieldValue, Timestamp } = admin.firestore;

// ---------------------------------------------------------------------------
// Helper: serialize Timestamp fields ให้เป็น ISO string
// ---------------------------------------------------------------------------
/**
 * serializeUser — แปลง Firestore Timestamp เป็น ISO string ให้ JSON สะอาด
 * @param {{ id: string, [key: string]: any }} user
 * @returns {object}
 */
export function serializeUser(user) {
  if (!user) return null;

  const TIMESTAMP_FIELDS = ['membershipExpiry', 'cooldownUntil', 'createdAt', 'updatedAt', 'profileCompletedAt'];
  const out = { ...user };

  for (const field of TIMESTAMP_FIELDS) {
    if (out[field] && typeof out[field].toDate === 'function') {
      out[field] = out[field].toDate().toISOString();
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// getUserByLineId
// ---------------------------------------------------------------------------
/**
 * อ่าน user document จาก Firestore
 * @param {string} lineUserId
 * @returns {Promise<{ id: string, [key: string]: any } | null>}
 */
export async function getUserByLineId(lineUserId) {
  const docRef = db.collection('users').doc(lineUserId);
  const snap = await docRef.get();

  if (!snap.exists) return null;

  return { id: snap.id, ...snap.data() };
}

// ---------------------------------------------------------------------------
// upsertUserIdentity
// ---------------------------------------------------------------------------
/**
 * สร้างหรืออัปเดต user identity จาก LINE login
 * ถ้า doc ยังไม่มี → สร้างใหม่ (role: 'user', profileCompleted: false)
 * ถ้ามีแล้ว → sync displayName/pictureUrl ถ้าเปลี่ยน
 *
 * @param {{ lineUserId: string, displayName: string, pictureUrl: string }} identity
 * @returns {Promise<{ id: string, needsProfileSetup: boolean, [key: string]: any }>}
 */
export async function upsertUserIdentity({ lineUserId, displayName, pictureUrl }) {
  const docRef = db.collection('users').doc(lineUserId);
  const snap = await docRef.get();

  if (!snap.exists) {
    // สร้าง user ใหม่
    const newUser = {
      lineUserId,
      displayName,
      pictureUrl,
      role: 'user',
      profileCompleted: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await docRef.set(newUser);

    // อ่านกลับเพื่อให้ได้ serverTimestamp จริง
    const created = await docRef.get();
    return { id: created.id, ...created.data(), needsProfileSetup: true };
  }

  // อัปเดตเฉพาะ field ที่อาจเปลี่ยน (display info จาก LINE)
  const data = snap.data();
  const updates = {};

  if (data.displayName !== displayName) updates.displayName = displayName;
  if (data.pictureUrl !== pictureUrl) updates.pictureUrl = pictureUrl;

  if (Object.keys(updates).length > 0) {
    updates.updatedAt = FieldValue.serverTimestamp();
    await docRef.update(updates);
    const updated = await docRef.get();
    const updatedData = updated.data();
    return {
      id: updated.id,
      ...updatedData,
      needsProfileSetup: !updatedData.profileCompleted,
    };
  }

  return { id: snap.id, ...data, needsProfileSetup: !data.profileCompleted };
}

// ---------------------------------------------------------------------------
// updateProfile
// ---------------------------------------------------------------------------

// Fields ที่ client ห้ามแก้เอง — server/admin controlled เท่านั้น
const PROTECTED_FIELDS = new Set([
  'role',
  'memberType',        // server ตั้งเองจาก Google Sheets — client ห้ามปลอม
  'membershipExpiry',
  'cooldownUntil',
  'lineUserId',
  'createdAt',
  'profileCompleted', // เราจะตั้งเองใน function นี้
]);

/**
 * อัปเดต profile ของ user (PUT /me)
 * whitelist: ห้ามแก้ field ที่ server-controlled
 *
 * @param {string} lineUserId
 * @param {object} profileData  ข้อมูลจาก request body (ผ่าน validate แล้ว)
 * @returns {Promise<{ id: string, [key: string]: any }>}
 */
export async function updateProfile(lineUserId, profileData) {
  // Strip protected fields ออกก่อน
  const safeData = {};
  for (const [key, val] of Object.entries(profileData)) {
    if (!PROTECTED_FIELDS.has(key)) {
      safeData[key] = val;
    }
  }

  const docRef = db.collection('users').doc(lineUserId);

  // ตรวจสอบว่า user มีอยู่จริง
  const snap = await docRef.get();
  if (!snap.exists) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  const existing = snap.data();
  const wasCompleted = existing.profileCompleted === true;
  safeData.profileCompleted = true;
  safeData.updatedAt = FieldValue.serverTimestamp();
  if (!wasCompleted) {
    safeData.profileCompletedAt = FieldValue.serverTimestamp();
  }

  // --- Membership lookup จาก Google Sheets (best-effort — ห้ามทำให้ save fail) ---
  try {
    const nickname = safeData.nickname ?? existing.nickname;
    const firstName = safeData.firstName ?? existing.firstName;
    const membership = await lookupMembership(nickname, firstName);
    if (membership) {
      safeData.memberType = membership.memberType;
      safeData.membershipExpiry = Timestamp.fromDate(membership.membershipExpiry);
      console.log(
        `[users] membership matched: ${nickname}/${firstName} → ${membership.memberType} ` +
        `(${membership.rawPackage}) exp=${membership.membershipExpiry.toISOString().slice(0, 10)}`
      );
    }
  } catch (err) {
    console.warn(`[users] membership lookup failed (continuing): ${err.message}`);
  }

  await docRef.update(safeData);

  const updated = await docRef.get();
  return { id: updated.id, ...updated.data() };
}

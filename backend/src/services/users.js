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
// lookupUserIdentity
// ---------------------------------------------------------------------------
/**
 * ตรวจสอบ user จาก LINE login โดย **ไม่สร้าง doc ใหม่**
 * - ถ้ามี doc อยู่แล้ว → sync displayName/pictureUrl ถ้าเปลี่ยน แล้วคืน doc
 * - ถ้ายังไม่มี doc → คืน null (user จะถูกสร้างตอน PUT /me ครั้งแรก)
 *
 * @param {{ lineUserId: string, displayName: string, pictureUrl: string }} identity
 * @returns {Promise<{ id: string, needsProfileSetup: boolean, [key: string]: any } | null>}
 */
export async function lookupUserIdentity({ lineUserId, displayName, pictureUrl }) {
  const docRef = db.collection('users').doc(lineUserId);
  const snap = await docRef.get();

  if (!snap.exists) return null;

  // sync display info จาก LINE ถ้าเปลี่ยน
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

  const snap = await docRef.get();

  // ถ้ายังไม่มี doc → สร้างใหม่ (กรณี first-time profile submit)
  if (!snap.exists) {
    const now = FieldValue.serverTimestamp();
    const baseUser = {
      lineUserId,
      role: 'user',
      profileCompleted: false,
      createdAt: now,
      updatedAt: now,
    };
    await docRef.set(baseUser);
  }

  const existing = snap.exists ? snap.data() : {};
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

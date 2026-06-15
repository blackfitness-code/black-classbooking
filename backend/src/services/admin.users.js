/**
 * services/admin.users.js — Admin-only user operations
 *
 * All writes must set updatedAt.
 * Protected fields (role, membershipExpiry, cooldownUntil, etc.) are
 * NEVER touched by adminUpdateProfile — they have their own dedicated functions.
 */

import { db, admin } from '../config/firebase.js';
import { ApiError } from '../middleware/errorHandler.js';
import { serializeUser } from './users.js';

const { FieldValue, Timestamp } = admin.firestore;

// Fields that adminUpdateProfile is allowed to set
const PROFILE_FIELDS = new Set([
  'nickname', 'firstName', 'lastName', 'nationalId',
  'phone', 'gender', 'birthDate', 'healthIssues',
]);

// ---------------------------------------------------------------------------
// listUsers
// ---------------------------------------------------------------------------
/**
 * ดึง users ทั้งหมดจาก Firestore
 * @returns {Promise<Array<object>>}
 */
export async function listUsers() {
  const snap = await db.collection('users').get();
  return snap.docs.map((doc) => serializeUser({ id: doc.id, ...doc.data() }));
}

// ---------------------------------------------------------------------------
// adminUpdateProfile
// ---------------------------------------------------------------------------
/**
 * อัปเดต profile fields ที่ admin อนุญาต (whitelist only)
 * ห้ามแตะ role / membershipExpiry / cooldown — ใช้ฟังก์ชันเฉพาะแทน
 *
 * @param {string} id  lineUserId (Firestore doc id)
 * @param {object} fields  raw fields จาก request body
 * @returns {Promise<object>}
 */
export async function adminUpdateProfile(id, fields) {
  const docRef = db.collection('users').doc(id);
  const snap = await docRef.get();
  if (!snap.exists) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');

  const safeData = {};
  for (const [key, val] of Object.entries(fields)) {
    if (PROFILE_FIELDS.has(key)) {
      safeData[key] = val;
    }
  }

  safeData.updatedAt = FieldValue.serverTimestamp();
  await docRef.update(safeData);

  const updated = await docRef.get();
  return serializeUser({ id: updated.id, ...updated.data() });
}

// ---------------------------------------------------------------------------
// setRole
// ---------------------------------------------------------------------------
/**
 * @param {string} id
 * @param {'user'|'staff'|'admin'} role
 * @returns {Promise<object>}
 */
export async function setRole(id, role) {
  const docRef = db.collection('users').doc(id);
  const snap = await docRef.get();
  if (!snap.exists) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');

  await docRef.update({ role, updatedAt: FieldValue.serverTimestamp() });

  const updated = await docRef.get();
  return serializeUser({ id: updated.id, ...updated.data() });
}

// ---------------------------------------------------------------------------
// setMembership
// ---------------------------------------------------------------------------
/**
 * ตั้ง membershipExpiry จาก date string "YYYY-MM-DD"
 * stored as Timestamp (ตรงกับ Admin.vue: Timestamp.fromDate(new Date(date)))
 *
 * @param {string} id
 * @param {string} dateStr  "YYYY-MM-DD"
 * @returns {Promise<object>}
 */
export async function setMembership(id, dateStr) {
  const docRef = db.collection('users').doc(id);
  const snap = await docRef.get();
  if (!snap.exists) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');

  const ts = Timestamp.fromDate(new Date(dateStr));
  await docRef.update({ membershipExpiry: ts, updatedAt: FieldValue.serverTimestamp() });

  const updated = await docRef.get();
  return serializeUser({ id: updated.id, ...updated.data() });
}

// ---------------------------------------------------------------------------
// setMemberType
// ---------------------------------------------------------------------------
/**
 * @param {string} id
 * @param {''|'gold'|'platinum'} memberType
 * @returns {Promise<object>}
 */
export async function setMemberType(id, memberType) {
  const docRef = db.collection('users').doc(id);
  const snap = await docRef.get();
  if (!snap.exists) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');

  await docRef.update({ memberType, updatedAt: FieldValue.serverTimestamp() });

  const updated = await docRef.get();
  return serializeUser({ id: updated.id, ...updated.data() });
}

// ---------------------------------------------------------------------------
// setCooldown
// ---------------------------------------------------------------------------
/**
 * ตั้งหรือล้าง cooldown
 * ถ้า cooldownUntil เป็น null → ล้าง (cooldownUntil: null, cooldownReason: null)
 * ถ้า cooldownUntil เป็น string → แปลงเป็น Timestamp
 *
 * @param {string} id
 * @param {{ cooldownUntil: string|null, cooldownReason?: string|null }} opts
 * @returns {Promise<object>}
 */
export async function setCooldown(id, { cooldownUntil, cooldownReason }) {
  const docRef = db.collection('users').doc(id);
  const snap = await docRef.get();
  if (!snap.exists) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');

  let tsValue = null;
  if (cooldownUntil !== null && cooldownUntil !== undefined) {
    tsValue = Timestamp.fromDate(new Date(cooldownUntil));
  }

  await docRef.update({
    cooldownUntil: tsValue,
    cooldownReason: cooldownUntil === null ? null : (cooldownReason ?? null),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await docRef.get();
  return serializeUser({ id: updated.id, ...updated.data() });
}

// ---------------------------------------------------------------------------
// deleteUser
// ---------------------------------------------------------------------------
/**
 * ลบ user document
 * @param {string} id
 * @returns {Promise<{ ok: boolean }>}
 */
export async function deleteUser(id) {
  const snap = await db.collection('users').doc(id).get();
  if (!snap.exists) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');

  await db.collection('users').doc(id).delete();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// importUsers
// ---------------------------------------------------------------------------
/**
 * Bulk upsert users with merge (ตาม Admin.vue importCSV logic)
 *
 * Input record shape (from API body):
 *   { lineUserId, nickname?, firstName?, lastName?, phone?, birthDate?,
 *     gender?, memberType?, role?, membershipExpiry? (ISO date string) }
 *
 * - New doc: set({ ...fields, lineUserId, createdAt, updatedAt, profileCompleted: true }, merge:true)
 * - Existing doc: set({ ...changedFields, updatedAt }, merge:true)
 *
 * Returns { created, updated }
 *
 * @param {Array<object>} records
 * @returns {Promise<{ created: number, updated: number }>}
 */
export async function importUsers(records) {
  // Build existing-user map in one query
  const snap = await db.collection('users').get();
  const existingMap = new Map(snap.docs.map((d) => [d.id, d.data()]));

  let created = 0;
  let updated = 0;

  const ALLOWED_IMPORT_FIELDS = [
    'nickname', 'firstName', 'lastName', 'phone', 'birthDate',
    'gender', 'memberType', 'role',
  ];

  // Firestore batch write — max 500 ops per batch
  // เขียนแบบ batch เพื่อลด round-trips (max 500 ops ต่อ batch)
  const MAX_BATCH_OPS = 500;
  let batch = db.batch();
  let opCount = 0;

  // Helper: commit current batch and start a fresh one
  const flushBatch = async () => {
    if (opCount > 0) {
      await batch.commit();
      batch = db.batch();
      opCount = 0;
    }
  };

  for (const record of records) {
    const uid = (record.lineUserId || '').trim();
    if (!uid) continue;

    // Build field set
    const fields = {};
    for (const key of ALLOWED_IMPORT_FIELDS) {
      if (record[key] !== undefined) {
        fields[key] = record[key];
      }
    }

    // membershipExpiry: convert ISO date string → Timestamp
    if (record.membershipExpiry) {
      const d = new Date(record.membershipExpiry);
      if (!isNaN(d.getTime())) {
        fields.membershipExpiry = Timestamp.fromDate(d);
      }
    }

    const docRef = db.collection('users').doc(uid);
    const existing = existingMap.get(uid);

    if (!existing) {
      // New user — stage onto batch
      if (opCount >= MAX_BATCH_OPS) await flushBatch();
      batch.set(
        docRef,
        {
          ...fields,
          lineUserId: uid,
          profileCompleted: true,
          profileCompletedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      opCount++;
      created++;
    } else {
      // Existing user — write only changed fields
      const changes = {};
      for (const [key, val] of Object.entries(fields)) {
        if (key === 'membershipExpiry') {
          // Compare by milliseconds
          const exMs = existing.membershipExpiry?.toDate
            ? existing.membershipExpiry.toDate().getTime()
            : (existing.membershipExpiry ? new Date(existing.membershipExpiry).getTime() : null);
          const nvMs = val?.toDate ? val.toDate().getTime() : null;
          if (exMs !== nvMs) changes[key] = val;
        } else if (key === 'role') {
          if ((existing.role || 'user') !== val) changes[key] = val;
        } else if (key === 'memberType') {
          if ((existing.memberType || '') !== (val || '')) changes[key] = val;
        } else {
          if ((existing[key] || '') !== (val || '')) changes[key] = val;
        }
      }

      if (Object.keys(changes).length === 0) {
        // No changes — count as neither created nor updated (unchanged)
        continue;
      }

      // Stage onto batch
      if (opCount >= MAX_BATCH_OPS) await flushBatch();
      batch.set(docRef, { ...changes, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      opCount++;
      updated++;
    }
  }

  // Commit any remaining ops
  await flushBatch();

  return { created, updated };
}

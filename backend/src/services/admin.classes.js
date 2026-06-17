/**
 * services/admin.classes.js — Admin class CRUD operations
 *
 * Mirrors the Firestore writes in Admin.vue addClass / updateClass / deleteClass.
 */

import { db, admin } from '../config/firebase.js';
import { ApiError } from '../middleware/errorHandler.js';
import { serializeClass } from './classes.js';

const { FieldValue } = admin.firestore;

// ---------------------------------------------------------------------------
// createClass
// ---------------------------------------------------------------------------
/**
 * สร้าง class ใหม่ (ตาม Admin.vue addClass: addDoc + currentBookings:0)
 *
 * @param {{ name: string, type: string, date: string, time: string,
 *           instructor: string, maxCapacity: number,
 *           subtype?: string, description?: string }} data
 * @returns {Promise<object>}
 */
export async function createClass(data) {
  const classData = {
    name: data.name,
    type: data.type,
    date: data.date,
    time: data.time,
    instructor: data.instructor,
    maxCapacity: data.maxCapacity,
    currentBookings: 0,
    createdAt: FieldValue.serverTimestamp(),
  };

  // Optional fields
  if (data.subtype !== undefined) classData.subtype = data.subtype;
  if (data.description !== undefined) classData.description = data.description;

  const ref = await db.collection('classes').add(classData);
  const created = await ref.get();
  return serializeClass({ id: created.id, ...created.data() });
}

// ---------------------------------------------------------------------------
// updateClass
// ---------------------------------------------------------------------------
/**
 * อัปเดต class fields (partial) — ตาม Admin.vue updateClass (updateDoc)
 *
 * @param {string} id  Firestore class doc ID
 * @param {object} partial  fields to update
 * @returns {Promise<object>}
 */
export async function updateClass(id, partial) {
  const docRef = db.collection('classes').doc(id);
  const snap = await docRef.get();
  if (!snap.exists) throw new ApiError(404, 'Class not found', 'CLASS_NOT_FOUND');

  // Whitelist updatable fields
  const UPDATABLE = ['name', 'type', 'subtype', 'description', 'date', 'time', 'instructor', 'maxCapacity'];
  const updates = {};
  for (const key of UPDATABLE) {
    if (partial[key] !== undefined) updates[key] = partial[key];
  }

  updates.updatedAt = FieldValue.serverTimestamp();
  await docRef.update(updates);

  const updated = await docRef.get();
  return serializeClass({ id: updated.id, ...updated.data() });
}

// ---------------------------------------------------------------------------
// deleteClass
// ---------------------------------------------------------------------------
/**
 * ลบ class document — ตาม Admin.vue deleteClass (deleteDoc)
 *
 * @param {string} id
 * @returns {Promise<{ ok: boolean }>}
 */
export async function deleteClass(id) {
  const snap = await db.collection('classes').doc(id).get();
  if (!snap.exists) throw new ApiError(404, 'Class not found', 'CLASS_NOT_FOUND');

  await db.collection('classes').doc(id).delete();
  return { ok: true };
}

/**
 * services/classes.js — Firestore classes CRUD
 *
 * Collection: classes
 * Document fields: name, type, date ("YYYY-MM-DD"), time ("HH:mm"),
 *   instructor, maxCapacity, currentBookings, [description]
 */

import { db } from '../config/firebase.js';
import { ApiError } from '../middleware/errorHandler.js';

// ---------------------------------------------------------------------------
// Helper: serialize class doc (ไม่มี Timestamp fields พิเศษ แต่ normalize ไว้)
// ---------------------------------------------------------------------------
/**
 * serializeClass — แปลง Firestore doc snapshot เป็น plain object
 * @param {{ id: string, [key: string]: any }} cls
 * @returns {object}
 */
export function serializeClass(cls) {
  if (!cls) return null;

  const TIMESTAMP_FIELDS = ['createdAt', 'updatedAt'];
  const out = { ...cls };

  for (const field of TIMESTAMP_FIELDS) {
    if (out[field] && typeof out[field].toDate === 'function') {
      out[field] = out[field].toDate().toISOString();
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// listClasses
// ---------------------------------------------------------------------------
/**
 * ดึง classes ทั้งหมด (optional: filter by date)
 * @param {{ date?: string }} options  date = "YYYY-MM-DD"
 * @returns {Promise<Array<object>>}
 */
export async function listClasses({ date } = {}) {
  let query = db.collection('classes');

  if (date) {
    query = query.where('date', '==', date);
  }

  const snap = await query.get();
  return snap.docs.map((doc) => serializeClass({ id: doc.id, ...doc.data() }));
}

// ---------------------------------------------------------------------------
// getClass
// ---------------------------------------------------------------------------
/**
 * ดึง class document เดียว
 * @param {string} id  Firestore document ID
 * @returns {Promise<object>}
 * @throws {ApiError} 404 CLASS_NOT_FOUND
 */
export async function getClass(id) {
  const snap = await db.collection('classes').doc(id).get();

  if (!snap.exists) {
    throw new ApiError(404, 'Class not found', 'CLASS_NOT_FOUND');
  }

  return serializeClass({ id: snap.id, ...snap.data() });
}

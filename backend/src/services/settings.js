/**
 * services/settings.js — App-wide settings operations
 *
 * Firestore document: settings/classTypes
 * Stores admin-defined custom class types object.
 * (ตาม Admin.vue saveCustomClassTypes: setDoc(doc(db,'settings','classTypes'), obj))
 */

import { db } from '../config/firebase.js';

const SETTINGS_DOC = 'settings';
const CLASS_TYPES_DOC_ID = 'classTypes';

// ---------------------------------------------------------------------------
// getClassTypes
// ---------------------------------------------------------------------------
/**
 * อ่าน settings/classTypes doc
 * ถ้าไม่มี → return {} (ไม่ error)
 *
 * @returns {Promise<object>}
 */
export async function getClassTypes() {
  const snap = await db.collection(SETTINGS_DOC).doc(CLASS_TYPES_DOC_ID).get();
  return snap.exists ? snap.data() : {};
}

// ---------------------------------------------------------------------------
// setClassTypes
// ---------------------------------------------------------------------------
/**
 * เขียน / merge settings/classTypes
 * (ตาม Admin.vue saveCustomClassTypes: setDoc overwrite)
 *
 * @param {object} obj  full object to write
 * @returns {Promise<object>}  the object that was written
 */
export async function setClassTypes(obj) {
  await db.collection(SETTINGS_DOC).doc(CLASS_TYPES_DOC_ID).set(obj);
  return obj;
}

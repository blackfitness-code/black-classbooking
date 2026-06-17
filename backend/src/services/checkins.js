/**
 * services/checkins.js — Firestore check-in operations
 *
 * Collection: checkins
 *
 * Document shape (ตาม Admin.vue ที่ใช้อยู่):
 *   uid, name, memberType, membershipValid (boolean), pictureUrl,
 *   classId, className, classDate, classTime, instructor,
 *   bookingId, checkedInAt (Timestamp), checkedInBy (lineUserId ของ staff)
 *
 * QR payload: { t: 'checkin', uid, cid (classId), bid (bookingId), d (date) }
 * → ส่งมาใน POST body เป็น { uid, classId, bookingId, date }
 */

import { db, admin } from '../config/firebase.js';
import { ApiError } from '../middleware/errorHandler.js';

const { FieldValue } = admin.firestore;

// ---------------------------------------------------------------------------
// Helper: serialize Timestamp fields
// ---------------------------------------------------------------------------
/**
 * serializeCheckin — แปลง Firestore Timestamp → ISO string
 * @param {{ id: string, [key: string]: any }} checkin
 * @returns {object}
 */
export function serializeCheckin(checkin) {
  if (!checkin) return null;

  const out = { ...checkin };

  if (out.checkedInAt && typeof out.checkedInAt.toDate === 'function') {
    out.checkedInAt = out.checkedInAt.toDate().toISOString();
  }

  return out;
}

// ---------------------------------------------------------------------------
// createCheckin
// ---------------------------------------------------------------------------
/**
 * สร้าง checkin document ใหม่ (เฉพาะ staff|admin)
 *
 * Validates:
 *  1. booking exists (ถ้ามี bookingId)
 *  2. class exists
 *  3. dedupe by bookingId (ถ้ามี) — query existing → 409 ALREADY_CHECKED_IN
 *
 * Enriches:
 *  - className, classTime, instructor จาก class doc
 *  - name, memberType, membershipValid, pictureUrl จาก user doc
 *
 * @param {{ uid: string, classId: string, bookingId?: string, date?: string }} payload  จาก QR
 * @param {string} staffUid  lineUserId ของ staff ที่ทำ checkin
 * @returns {Promise<object>}  checkin doc (serialized)
 */
export async function createCheckin({ uid, classId, bookingId, date }, staffUid) {
  // --- Dedupe by bookingId ---
  if (bookingId) {
    const dupSnap = await db
      .collection('checkins')
      .where('bookingId', '==', bookingId)
      .limit(1)
      .get();

    if (!dupSnap.empty) {
      throw new ApiError(409, 'Already checked in for this booking', 'ALREADY_CHECKED_IN');
    }
  }

  // --- อ่าน class doc เพื่อ enrich ---
  const classSnap = await db.collection('classes').doc(classId).get();
  if (!classSnap.exists) {
    throw new ApiError(404, 'Class not found', 'CLASS_NOT_FOUND');
  }
  const cls = classSnap.data();

  // --- อ่าน user doc เพื่อ enrich member info ---
  const userSnap = await db.collection('users').doc(uid).get();
  const user = userSnap.exists ? userSnap.data() : {};

  // membershipValid: ตรวจ expiry
  let membershipValid = false;
  if (user.membershipExpiry) {
    const expiry = typeof user.membershipExpiry.toDate === 'function'
      ? user.membershipExpiry.toDate()
      : new Date(user.membershipExpiry);
    membershipValid = expiry > new Date();
  }

  // ชื่อที่แสดง (nickname → displayName → '')
  const name = user.nickname || user.displayName || '';

  // --- สร้าง checkin doc (ตาม Admin.vue field shape) ---
  const checkinData = {
    uid,
    name,
    memberType: user.memberType || '',
    membershipValid,
    pictureUrl: user.pictureUrl || '',
    classId,
    className: cls.name || '',
    classDate: date || cls.date || '',
    classTime: cls.time || '',
    instructor: cls.instructor || '',
    checkedInAt: FieldValue.serverTimestamp(),
    checkedInBy: staffUid,
  };

  // เพิ่ม bookingId ถ้ามี (ใช้สำหรับ dedupe ครั้งหน้า)
  if (bookingId) {
    checkinData.bookingId = bookingId;
  }

  const ref = await db.collection('checkins').add(checkinData);

  // อ่านกลับเพื่อ serialize serverTimestamp จริง
  const created = await ref.get();
  return serializeCheckin({ id: created.id, ...created.data() });
}

// ---------------------------------------------------------------------------
// listCheckins (สำหรับ admin — จะถูกเรียกจาก admin routes ในงานถัดไป)
// ---------------------------------------------------------------------------
/**
 * ดึง checkins ทั้งหมด
 * @returns {Promise<Array<object>>}
 */
export async function listCheckins() {
  const snap = await db.collection('checkins').get();
  return snap.docs.map((doc) => serializeCheckin({ id: doc.id, ...doc.data() }));
}

// ---------------------------------------------------------------------------
// deleteCheckin (สำหรับ admin — จะถูกเรียกจาก admin routes ในงานถัดไป)
// ---------------------------------------------------------------------------
/**
 * ลบ checkin document
 * @param {string} id  Firestore checkin ID
 * @returns {Promise<{ ok: boolean }>}
 */
export async function deleteCheckin(id) {
  const snap = await db.collection('checkins').doc(id).get();
  if (!snap.exists) {
    throw new ApiError(404, 'Checkin not found', 'CHECKIN_NOT_FOUND');
  }
  await db.collection('checkins').doc(id).delete();
  return { ok: true };
}

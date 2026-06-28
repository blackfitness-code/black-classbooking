/**
 * services/bookings.js — Firestore bookings operations
 *
 * Collection: bookings
 * Document fields: userId, classId, className, date, time, instructor,
 *   status ('confirmed'|'cancelled'|'completed'), bookedAt (Timestamp),
 *   canCancelUntil (Timestamp), cancelledAt (Timestamp)
 */

import { db, admin } from '../config/firebase.js';
import { ApiError } from '../middleware/errorHandler.js';

const { FieldValue } = admin.firestore;

// แปลง date (YYYY-MM-DD) + time (HH:MM) ที่เป็นเวลาไทย (UTC+7) เป็น Date object
function thaiDateTime(date, time) {
  return new Date(`${date}T${time}:00+07:00`);
}

// คืน "วันนี้" ในเวลาไทย (YYYY-MM-DD)
function thaiToday() {
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// Helper: serialize Timestamp fields ให้เป็น ISO string
// ---------------------------------------------------------------------------
/**
 * serializeBooking — แปลง Firestore Timestamp fields เป็น ISO strings
 * @param {{ id: string, [key: string]: any }} booking
 * @returns {object}
 */
export function serializeBooking(booking) {
  if (!booking) return null;

  const TIMESTAMP_FIELDS = ['bookedAt', 'canCancelUntil', 'cancelledAt'];
  const out = { ...booking };

  for (const field of TIMESTAMP_FIELDS) {
    if (out[field] && typeof out[field].toDate === 'function') {
      out[field] = out[field].toDate().toISOString();
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// listMyBookings
// ---------------------------------------------------------------------------
/**
 * ดึง bookings ทั้งหมดของ user คนนี้ (ทุก status)
 * @param {string} uid  lineUserId
 * @returns {Promise<Array<object>>}
 */
export async function listMyBookings(uid) {
  const snap = await db
    .collection('bookings')
    .where('userId', '==', uid)
    .get();

  return snap.docs.map((doc) => serializeBooking({ id: doc.id, ...doc.data() }));
}

// ---------------------------------------------------------------------------
// createBooking
// ---------------------------------------------------------------------------
/**
 * จองคลาส พร้อม validate กฎทั้งหมดตาม contract
 *
 * Rule checks (ก่อน transaction):
 *  1. user exists
 *  2. membership valid (membershipExpiry > now)
 *  3. not in cooldown (cooldownUntil <= now or null)
 *  4. memberType !== 'gold'
 *  5. class exists
 *  6. time window: (classDateTime - now) > 30min AND <= 7days
 *  7. no existing CONFIRMED booking for same classId by this user
 *
 * In transaction:
 *  8. re-check capacity (currentBookings < maxCapacity)
 *  9. create booking doc
 * 10. increment class.currentBookings
 *
 * @param {string} uid      lineUserId
 * @param {string} classId  Firestore class ID
 * @returns {Promise<{ booking: object, currentBookings: number }>}
 */
export async function createBooking(uid, classId) {
  const now = new Date();

  // --- อ่าน user doc ---
  const userSnap = await db.collection('users').doc(uid).get();
  if (!userSnap.exists) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }
  const user = userSnap.data();

  // 1. Membership validity (admin/staff ไม่ต้องตรวจ)
  if (user.role !== 'admin' && user.role !== 'staff') {
    if (!user.membershipExpiry) {
      throw new ApiError(403, 'Membership expired or not set', 'MEMBERSHIP_EXPIRED');
    }
    const expiry = typeof user.membershipExpiry.toDate === 'function'
      ? user.membershipExpiry.toDate()
      : new Date(user.membershipExpiry);
    if (expiry <= now) {
      throw new ApiError(403, 'Membership expired', 'MEMBERSHIP_EXPIRED');
    }
  }

  // 2. Cooldown check
  if (user.cooldownUntil) {
    const cooldown = typeof user.cooldownUntil.toDate === 'function'
      ? user.cooldownUntil.toDate()
      : new Date(user.cooldownUntil);
    if (cooldown > now) {
      throw new ApiError(403, 'Account is in cooldown', 'IN_COOLDOWN');
    }
  }

  // 3. Gold memberType not allowed
  if (user.memberType === 'gold') {
    throw new ApiError(403, 'Gold members cannot book classes', 'GOLD_NOT_ALLOWED');
  }

  // --- อ่าน class doc ---
  const classSnap = await db.collection('classes').doc(classId).get();
  if (!classSnap.exists) {
    throw new ApiError(404, 'Class not found', 'CLASS_NOT_FOUND');
  }
  const cls = classSnap.data();

  // 4. Time window: classDateTime จาก date + time fields (Thai time UTC+7)
  const classDateTime = thaiDateTime(cls.date, cls.time);
  const diffMs = classDateTime - now;
  const THIRTY_MIN = 30 * 60 * 1000;
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

  if (diffMs <= THIRTY_MIN || diffMs > SEVEN_DAYS) {
    throw new ApiError(400, 'Booking window is closed for this class', 'BOOKING_WINDOW_CLOSED');
  }

  // 5. Dup check + No-show check: query userId (single-field index) แล้ว filter ใน memory
  const today = thaiToday(); // YYYY-MM-DD in Thai timezone

  const userBookingsSnap = await db
    .collection('bookings')
    .where('userId', '==', uid)
    .get();

  const allUserBookings = userBookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // 5a. Dup check
  const hasConfirmedDup = allUserBookings.some(
    (b) => b.classId === classId && b.status === 'confirmed',
  );
  if (hasConfirmedDup) {
    throw new ApiError(409, 'Already booked this class', 'ALREADY_BOOKED');
  }

  // 5b. No-show block: หา booking ล่าสุดของคลาสชื่อเดียวกันที่ผ่านมาแล้ว (date < today)
  //     ถ้าไม่มี check-in สำหรับ booking นั้น และคลาสที่จะจองนี้คือรอบแรกหลัง no-show → block
  //     นับเฉพาะ booking ตั้งแต่วันที่ระบบเริ่มใช้งานจริง (22 มิ.ย. 2026) เป็นต้นไป
  const SYSTEM_START_DATE = '2026-06-22';
  const pastSameClassBookings = allUserBookings
    .filter((b) => b.className === cls.name && b.status !== 'cancelled' && b.date < today && b.date >= SYSTEM_START_DATE)
    .sort((a, b) => b.date.localeCompare(a.date)); // ล่าสุดก่อน

  if (pastSameClassBookings.length > 0) {
    const lastBooking = pastSameClassBookings[0];

    const [byBookingId, byUidClass] = await Promise.all([
      db.collection('checkins').where('bookingId', '==', lastBooking.id).limit(1).get(),
      db.collection('checkins').where('uid', '==', uid).where('classId', '==', lastBooking.classId).limit(1).get(),
    ]);

    if (byBookingId.empty && byUidClass.empty) {
      const futureClassesSnap = await db.collection('classes').get();
      const nextClassAfterNoShow = futureClassesSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((c) => c.name === cls.name && c.date > lastBooking.date)
        .sort((a, b) => a.date.localeCompare(b.date))[0];

      if (nextClassAfterNoShow && nextClassAfterNoShow.id === classId) {
        throw new ApiError(
          403,
          'You missed your last class without check-in. You cannot book the next occurrence.',
          'NO_SHOW_BLOCKED',
        );
      }
    }
  }

  // --- Transaction: re-check capacity + create booking + increment ---
  const classRef = db.collection('classes').doc(classId);
  const bookingRef = db.collection('bookings').doc();

  let newCurrentBookings;

  await db.runTransaction(async (txn) => {
    const classDoc = await txn.get(classRef);
    if (!classDoc.exists) {
      throw new ApiError(404, 'Class not found', 'CLASS_NOT_FOUND');
    }

    const classData = classDoc.data();
    const current = classData.currentBookings ?? 0;
    const max = classData.maxCapacity ?? 0;

    if (current >= max) {
      throw new ApiError(409, 'Class is full', 'CLASS_FULL');
    }

    // สร้าง booking doc
    const bookingData = {
      userId: uid,
      classId,
      className: classData.name ?? '',
      date: classData.date ?? '',
      time: classData.time ?? '',
      instructor: classData.instructor ?? '',
      status: 'confirmed',
      bookedAt: FieldValue.serverTimestamp(),
      canCancelUntil: admin.firestore.Timestamp.fromDate(classDateTime),
    };

    txn.set(bookingRef, bookingData);
    txn.update(classRef, {
      currentBookings: FieldValue.increment(1),
    });

    newCurrentBookings = current + 1;
  });

  // อ่านกลับเพื่อ serialize serverTimestamp จริง
  const createdSnap = await bookingRef.get();
  const booking = serializeBooking({ id: createdSnap.id, ...createdSnap.data() });

  return { booking, currentBookings: newCurrentBookings };
}

// ---------------------------------------------------------------------------
// cancelBooking
// ---------------------------------------------------------------------------
/**
 * ยกเลิกการจอง
 *
 * Validates:
 *  1. booking exists
 *  2. booking.userId === uid (NOT_OWNER)
 *  3. status === 'confirmed' (NOT_CONFIRMED)
 *  4. (classDateTime - now) > 2h (CANCEL_WINDOW_CLOSED)
 *
 * Transaction: set cancelled + cancelledAt, decrement currentBookings (floor 0)
 *
 * @param {string} uid        lineUserId
 * @param {string} bookingId  Firestore booking ID
 * @returns {Promise<{ ok: boolean }>}
 */
export async function cancelBooking(uid, bookingId) {
  const now = new Date();

  const bookingRef = db.collection('bookings').doc(bookingId);
  const bookingSnap = await bookingRef.get();

  if (!bookingSnap.exists) {
    throw new ApiError(404, 'Booking not found', 'BOOKING_NOT_FOUND');
  }

  const booking = bookingSnap.data();

  // 1. Ownership
  if (booking.userId !== uid) {
    throw new ApiError(403, 'Not your booking', 'NOT_OWNER');
  }

  // 2. Status confirmed
  if (booking.status !== 'confirmed') {
    throw new ApiError(400, 'Booking is not confirmed', 'NOT_CONFIRMED');
  }

  // 3. Time window: ต้องมีเวลาเหลือ > 2 ชั่วโมง
  const classDateTime = thaiDateTime(booking.date, booking.time);
  const TWO_HOURS = 2 * 60 * 60 * 1000;

  if ((classDateTime - now) <= TWO_HOURS) {
    throw new ApiError(400, 'Cancel window has closed (< 2 hours before class)', 'CANCEL_WINDOW_CLOSED');
  }

  // Transaction: cancel + decrement (floor 0)
  const classRef = db.collection('classes').doc(booking.classId);

  await db.runTransaction(async (txn) => {
    const classDoc = await txn.get(classRef);
    const currentBookings = classDoc.exists ? (classDoc.data().currentBookings ?? 0) : 0;

    txn.update(bookingRef, {
      status: 'cancelled',
      cancelledAt: FieldValue.serverTimestamp(),
    });

    if (classDoc.exists) {
      // Decrement แต่ floor ที่ 0
      const newCount = Math.max(0, currentBookings - 1);
      txn.update(classRef, { currentBookings: newCount });
    }
  });

  return { ok: true };
}

/**
 * services/admin.bookings.js — Admin booking operations
 *
 * Admin can book on behalf of users (no user-facing rule checks)
 * and change booking status with class counter maintenance.
 *
 * Mirrors Admin.vue confirmAddMembers (addDoc + increment) and
 * removeMemberFromClass (updateDoc status=cancelled + decrement).
 */

import { db, admin } from '../config/firebase.js';
import { ApiError } from '../middleware/errorHandler.js';
import { serializeBooking } from './bookings.js';

const { FieldValue } = admin.firestore;

// ---------------------------------------------------------------------------
// listAllBookings
// ---------------------------------------------------------------------------
/**
 * ดึง bookings ทั้งหมด (ทุก user ทุก status)
 * @returns {Promise<Array<object>>}
 */
export async function listAllBookings() {
  const snap = await db.collection('bookings').get();
  return snap.docs.map((doc) => serializeBooking({ id: doc.id, ...doc.data() }));
}

// ---------------------------------------------------------------------------
// adminCreateBooking
// ---------------------------------------------------------------------------
/**
 * Admin จองคลาสแทน user (ไม่มี user-facing rule checks — admin overrides)
 *
 * Transaction:
 *   1. Re-check class exists (inside txn)
 *   2. Create confirmed booking with class fields
 *   3. Increment class.currentBookings
 *
 * Mirrors Admin.vue confirmAddMembers / addDoc bookings + increment(1)
 *
 * @param {{ classId: string, userId: string }} param
 * @returns {Promise<{ booking: object, currentBookings: number }>}
 */
export async function adminCreateBooking({ classId, userId }) {
  // Pre-check class exists (for early 404, before transaction)
  const classSnap = await db.collection('classes').doc(classId).get();
  if (!classSnap.exists) throw new ApiError(404, 'Class not found', 'CLASS_NOT_FOUND');

  const classRef = db.collection('classes').doc(classId);
  const bookingRef = db.collection('bookings').doc();

  let newCurrentBookings;

  await db.runTransaction(async (txn) => {
    const classDoc = await txn.get(classRef);
    if (!classDoc.exists) throw new ApiError(404, 'Class not found', 'CLASS_NOT_FOUND');

    const cls = classDoc.data();
    const current = cls.currentBookings ?? 0;

    const classDateTime = new Date(`${cls.date}T${cls.time}:00`);

    // Build booking doc (ตาม Admin.vue confirmAddMembers addDoc shape)
    const bookingData = {
      userId,
      classId,
      className: cls.name ?? '',
      date: cls.date ?? '',
      time: cls.time ?? '',
      instructor: cls.instructor ?? '',
      status: 'confirmed',
      bookedAt: FieldValue.serverTimestamp(),
      canCancelUntil: admin.firestore.Timestamp.fromDate(classDateTime),
    };

    txn.set(bookingRef, bookingData);
    txn.update(classRef, { currentBookings: FieldValue.increment(1) });

    newCurrentBookings = current + 1;
  });

  // Read back to serialize serverTimestamp
  const createdSnap = await bookingRef.get();
  const booking = serializeBooking({ id: createdSnap.id, ...createdSnap.data() });

  return { booking, currentBookings: newCurrentBookings };
}

// ---------------------------------------------------------------------------
// adminUpdateBookingStatus
// ---------------------------------------------------------------------------
/**
 * เปลี่ยน booking status — admin only
 *
 * ถ้าเปลี่ยนจาก confirmed → cancelled:
 *   - Transaction: set cancelled + cancelledAt + cancelledBy:'admin'
 *   - Decrement class.currentBookings (floor 0)
 *   (ตาม Admin.vue removeMemberFromClass: updateDoc bookings + updateDoc classes increment(-1))
 *
 * ถ้า status อื่น: update เฉพาะ status field
 *
 * @param {string} id  booking doc ID
 * @param {string} status  'confirmed'|'cancelled'|'completed'
 * @returns {Promise<object>}  serialized booking
 */
export async function adminUpdateBookingStatus(id, status) {
  const bookingRef = db.collection('bookings').doc(id);
  const bookingSnap = await bookingRef.get();
  if (!bookingSnap.exists) throw new ApiError(404, 'Booking not found', 'BOOKING_NOT_FOUND');

  const booking = bookingSnap.data();
  const wasConfirmed = booking.status === 'confirmed';
  const isCancelling = status === 'cancelled';

  if (wasConfirmed && isCancelling) {
    // Transaction: cancel + decrement class
    const classRef = db.collection('classes').doc(booking.classId);

    await db.runTransaction(async (txn) => {
      const classDoc = await txn.get(classRef);
      const current = classDoc.exists ? (classDoc.data().currentBookings ?? 0) : 0;

      txn.update(bookingRef, {
        status: 'cancelled',
        cancelledAt: FieldValue.serverTimestamp(),
        cancelledBy: 'admin',
      });

      if (classDoc.exists) {
        txn.update(classRef, { currentBookings: Math.max(0, current - 1) });
      }
    });
  } else {
    // Simple status update
    const updates = { status };
    if (isCancelling) {
      updates.cancelledAt = FieldValue.serverTimestamp();
      updates.cancelledBy = 'admin';
    }
    await bookingRef.update(updates);
  }

  const updated = await bookingRef.get();
  return serializeBooking({ id: updated.id, ...updated.data() });
}

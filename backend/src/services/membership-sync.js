/**
 * membership-sync.js — sync memberType + membershipExpiry ของ user ทั้งหมด
 * จาก Google Sheets (manual trigger ผ่าน admin endpoint)
 *
 * วน users ทุกคน → match ชื่อเล่น+ชื่อจริงกับ sheet → อัปเดตเฉพาะที่เปลี่ยน
 * เขียนแบบ batch (max 500 ops/batch) เพื่อลด round-trips
 */

import { db, admin } from '../config/firebase.js';
import { lookupMembership, refreshCache } from './membership-sheets.js';

const { FieldValue, Timestamp } = admin.firestore;

/**
 * @returns {Promise<{ scanned: number, matched: number, updated: number }>}
 */
export async function syncAllMemberships() {
  // บังคับดึง sheet ใหม่ (ข้าม cache 10 นาที) ให้ได้ข้อมูลล่าสุดเสมอ
  await refreshCache();

  const snap = await db.collection('users').get();

  let scanned = 0;
  let matched = 0;
  let updated = 0;

  const MAX_BATCH_OPS = 500;
  let batch = db.batch();
  let opCount = 0;

  const flushBatch = async () => {
    if (opCount > 0) {
      await batch.commit();
      batch = db.batch();
      opCount = 0;
    }
  };

  for (const doc of snap.docs) {
    scanned++;
    const user = doc.data();

    const membership = await lookupMembership(user.nickname, user.firstName);
    if (!membership) continue;
    matched++;

    const newType = membership.memberType;
    const newExpiryMs = membership.membershipExpiry.getTime();

    const curType = user.memberType || '';
    const curExpiryMs = user.membershipExpiry?.toDate
      ? user.membershipExpiry.toDate().getTime()
      : (user.membershipExpiry ? new Date(user.membershipExpiry).getTime() : null);

    // อัปเดตเฉพาะเมื่อ tier หรือวันหมดอายุเปลี่ยนจริง
    if (curType === newType && curExpiryMs === newExpiryMs) continue;

    if (opCount >= MAX_BATCH_OPS) await flushBatch();
    batch.update(doc.ref, {
      memberType: newType,
      membershipExpiry: Timestamp.fromDate(membership.membershipExpiry),
      updatedAt: FieldValue.serverTimestamp(),
    });
    opCount++;
    updated++;
  }

  await flushBatch();

  console.log(`[membership-sync] scanned=${scanned} matched=${matched} updated=${updated}`);
  return { scanned, matched, updated };
}

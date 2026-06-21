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
 * dry=true  → คำนวณว่าจะแก้ใคร/อะไร แต่ไม่เขียน Firestore
 * dry=false → แก้จริง
 * @returns {Promise<{ scanned, matched, updated, changes: Array }>}
 */
export async function syncAllMemberships({ dry = false } = {}) {
  await refreshCache();

  const snap = await db.collection('users').get();

  let scanned = 0;
  let matched = 0;
  let updated = 0;
  const changes = [];

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

  const fmtDate = (ms) => ms ? new Date(ms).toISOString().slice(0, 10) : null;

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

    if (curType === newType && curExpiryMs === newExpiryMs) continue;

    changes.push({
      uid: doc.id,
      name: [user.nickname, user.firstName, user.lastName].filter(Boolean).join(' / '),
      from: { memberType: curType, membershipExpiry: fmtDate(curExpiryMs) },
      to:   { memberType: newType, membershipExpiry: fmtDate(newExpiryMs) },
    });

    if (!dry) {
      if (opCount >= MAX_BATCH_OPS) await flushBatch();
      batch.update(doc.ref, {
        memberType: newType,
        membershipExpiry: Timestamp.fromDate(membership.membershipExpiry),
        updatedAt: FieldValue.serverTimestamp(),
      });
      opCount++;
    }
    updated++;
  }

  if (!dry) await flushBatch();

  console.log(`[membership-sync] dry=${dry} scanned=${scanned} matched=${matched} updated=${updated}`);
  return { scanned, matched, updated, changes };
}

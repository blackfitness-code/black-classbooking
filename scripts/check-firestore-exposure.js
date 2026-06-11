/**
 * ตรวจว่า Firestore เปิดให้อ่านโดยไม่ต้อง login หรือไม่ (read-only, ปลอดภัย)
 *
 *   node scripts/check-firestore-exposure.js
 *
 * - ใช้ config สาธารณะเดียวกับที่ฝังอยู่ใน bundle (ไม่ใช่ความลับ)
 * - "ไม่" มีการ login / ไม่มีการเขียน / ไม่มีการลบ ใด ๆ ทั้งสิ้น
 * - ถ้าอ่าน collection 'users' / 'bookings' ได้ = rules เปิดโล่ง = ข้อมูลหลุด
 * - ถ้าโดน "Missing or insufficient permissions" = rules ทำงาน = ปลอดภัย
 */
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, limit, getDocs } from 'firebase/firestore'

// public config (ตัวเดียวกับใน client/.env)
const firebaseConfig = {
  apiKey: 'AIzaSyCZHbBCi1Yg37YKjKRpswAoo5F98rGdlTs',
  authDomain: 'blackyoga-2748c.firebaseapp.com',
  projectId: 'blackyoga-2748c',
  storageBucket: 'blackyoga-2748c.firebasestorage.app',
  messagingSenderId: '295743077337',
  appId: '1:295743077337:web:c744b590e88341970337c8'
}

const db = getFirestore(initializeApp(firebaseConfig))

// collection ที่ "ต้อง" ถูกปกป้อง (มีข้อมูลส่วนตัว) — อ่านได้ = อันตราย
const SENSITIVE = ['users', 'bookings', 'checkins']
// collection ที่ออกแบบให้อ่านสาธารณะได้อยู่แล้ว — อ่านได้ = ปกติ
const PUBLIC = ['classes', 'settings']

async function probe(name) {
  try {
    const snap = await getDocs(query(collection(db, name), limit(1)))
    const sample = snap.docs[0]
    // โชว์แค่ "ชื่อ field" ของ doc แรก ไม่ดึงค่ามาโชว์ (กัน PII โผล่ใน log)
    const fields = sample ? Object.keys(sample.data()).join(', ') : '(ว่าง)'
    return { name, readable: true, count: snap.size, fields }
  } catch (e) {
    return { name, readable: false, code: e.code || e.message }
  }
}

console.log('\n🔍 ทดสอบอ่าน Firestore โดยไม่ login (read-only)\n')

let leaked = false
for (const name of SENSITIVE) {
  const r = await probe(name)
  if (r.readable) {
    leaked = true
    console.log(`❌ [${name}] อ่านได้! → หลุด  | fields ของ doc แรก: ${r.fields}`)
  } else {
    console.log(`✅ [${name}] ถูกบล็อก (${r.code})`)
  }
}

console.log('\n— collection ที่ตั้งใจให้สาธารณะ (อ่านได้ถือว่าปกติ) —')
for (const name of PUBLIC) {
  const r = await probe(name)
  console.log(`   [${name}] ${r.readable ? 'อ่านได้ (ปกติ)' : 'ถูกบล็อก (' + r.code + ')'}`)
}

console.log('\n' + '─'.repeat(50))
if (leaked) {
  console.log('🚨 สรุป: ฐานข้อมูลเปิดโล่ง — ข้อมูลสมาชิกอ่านได้โดยไม่ต้อง login')
} else {
  console.log('🛡️  สรุป: collection ที่อ่อนไหวถูกบล็อกเรียบร้อย')
}
console.log('─'.repeat(50) + '\n')
process.exit(0)

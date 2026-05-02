/**
 * Script สำหรับสร้างคลาสวันจันทร์
 * 
 * คลาสที่สร้าง:
 * - 11:00 Easy Dance (Dancing) ครู Nueng - 15 คน
 * - 18:30 Hatha Vinyasa Flow (Yoga) ครู Jeab - 15 คน
 * - 20:00 Zumba (Dancing) ครู Thwin - 15 คน
 * 
 * วิธีใช้:
 *   node scripts/create-monday-classes.js
 *   node scripts/create-monday-classes.js --weeks 4   (สร้างล่วงหน้า 4 สัปดาห์)
 *   node scripts/create-monday-classes.js --dry-run   (ดูตัวอย่างโดยไม่บันทึก)
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCZHbBCi1Yg37YKjKRpswAoo5F98rGdlTs",
  authDomain: "blackyoga-2748c.firebaseapp.com",
  projectId: "blackyoga-2748c",
  storageBucket: "blackyoga-2748c.firebasestorage.app",
  messagingSenderId: "295743077337",
  appId: "1:295743077337:web:c744b590e88341970337c8"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// คลาสวันจันทร์
const MONDAY_CLASSES = [
  {
    type: 'dancing',
    subtype: 'easy-dance',
    name: 'Easy Dance',
    description: 'คลาสเต้นเบื้องต้นที่เน้นความสนุกสนาน ท่าเต้นง่ายๆ ที่ทุกคนทำตามได้ เหมาะสำหรับผู้เริ่มต้นหรือผู้ที่ต้องการออกกำลังกายแบบสบายๆ',
    time: '11:00',
    instructor: 'Nueng',
    maxCapacity: 15
  },
  {
    type: 'yoga',
    subtype: 'Hatha Vinyasa flow',
    name: 'Hatha Vinyasa flow',
    description: 'คลาสผสมผสานอาสนะโยคะนำมาเรียงร้อยให้ต่อเนื่องแบบไหลลื่น โดยฟังเสียงของร่างกายและลมหายใจของผู้ฝึกเป็นหลัก คลาสนี้เหมาะกับคนที่มีพื้นฐานฝึกมาบ้างแล้ว',
    time: '18:30',
    instructor: 'Jeab',
    maxCapacity: 15
  },
  {
    type: 'dancing',
    subtype: 'zumba',
    name: 'Zumba',
    description: 'ซุมบ้าเต้นตามจังหวะเพลงลาตินที่สนุกสนาน เคลื่อนไหวง่ายตามได้ เหมาะสำหรับทุกคนที่ต้องการออกกำลังกายแบบสนุกและเผาผลาญแคลอรี่',
    time: '20:00',
    instructor: 'Thwin',
    maxCapacity: 15
  }
]

// format วันที่เป็น yyyy-MM-dd โดยใช้ local time (ไม่ใช่ UTC)
const toLocalDateStr = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// หาวันจันทร์ถัดไปจากวันนี้
const getNextMondays = (weeksCount) => {
  const mondays = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // หาวันจันทร์แรก (วันนี้หรือถัดไป)
  const dayOfWeek = today.getDay() // 0=อาทิตย์, 1=จันทร์
  const daysUntilMonday = dayOfWeek === 1 ? 0 : (8 - dayOfWeek) % 7 || 7

  const firstMonday = new Date(today)
  firstMonday.setDate(today.getDate() + daysUntilMonday)

  for (let i = 0; i < weeksCount; i++) {
    const monday = new Date(firstMonday)
    monday.setDate(firstMonday.getDate() + (i * 7))
    mondays.push(toLocalDateStr(monday)) // ใช้ local time แทน UTC
  }

  return mondays
}

const formatDateThai = (dateStr) => {
  // parse แบบ local time โดยแยก string เอง
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('th-TH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

const createClasses = async (weeksCount = 1, dryRun = false) => {
  const mondays = getNextMondays(weeksCount)
  
  console.log(`\n📅 สร้างคลาสวันจันทร์ ${weeksCount} สัปดาห์${dryRun ? ' (DRY RUN - ไม่บันทึกจริง)' : ''}`)
  console.log('='.repeat(60))

  let totalCreated = 0
  let totalSkipped = 0

  for (const dateStr of mondays) {
    console.log(`\n📆 ${formatDateThai(dateStr)} (${dateStr})`)

    for (const classTemplate of MONDAY_CLASSES) {
      const label = `  ${classTemplate.time} ${classTemplate.name} (${classTemplate.type}) ครู ${classTemplate.instructor}`

      if (!dryRun) {
        // ตรวจสอบว่ามีคลาสนี้อยู่แล้วหรือไม่
        const existing = await getDocs(query(
          collection(db, 'classes'),
          where('date', '==', dateStr),
          where('time', '==', classTemplate.time),
          where('name', '==', classTemplate.name)
        ))

        if (!existing.empty) {
          console.log(`${label} → ⏭️  มีอยู่แล้ว`)
          totalSkipped++
          continue
        }

        await addDoc(collection(db, 'classes'), {
          ...classTemplate,
          date: dateStr,
          currentBookings: 0,
          createdAt: new Date()
        })
      }

      console.log(`${label} → ✅ ${dryRun ? 'จะสร้าง' : 'สร้างแล้ว'}`)
      totalCreated++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`✅ สร้างแล้ว: ${totalCreated} คลาส`)
  if (totalSkipped > 0) console.log(`⏭️  ข้ามแล้ว: ${totalSkipped} คลาส (มีอยู่แล้ว)`)
  console.log('='.repeat(60))
}

// อ่าน arguments
const args = process.argv.slice(2)
const weeksArg = args.find(a => a.startsWith('--weeks'))
const weeks = weeksArg ? parseInt(weeksArg.split('=')[1] || args[args.indexOf(weeksArg) + 1]) : 1
const dryRun = args.includes('--dry-run')

createClasses(isNaN(weeks) ? 1 : weeks, dryRun)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err)
    process.exit(1)
  })

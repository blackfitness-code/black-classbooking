/**
 * Script สร้างคลาสสัปดาห์ถัดไป โดยอิงจากประวัติคลาสในแต่ละวันของสัปดาห์
 *
 * วิธีใช้:
 *   node scripts/create-weekly-classes.js              (สร้างสัปดาห์ถัดไป 1 สัปดาห์)
 *   node scripts/create-weekly-classes.js --weeks 4    (สร้างล่วงหน้า 4 สัปดาห์)
 *   node scripts/create-weekly-classes.js --dry-run    (ดูตัวอย่างโดยไม่บันทึก)
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

const DAY_NAMES = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']

const toLocalDateStr = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const parseLocalDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const formatDateThai = (dateStr) => {
  const date = parseLocalDate(dateStr)
  return date.toLocaleDateString('th-TH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

/**
 * ดึงคลาสจากสัปดาห์ก่อนหน้า (7-13 วันที่แล้ว) แล้วจัดกลุ่มตาม dayOfWeek
 */
const buildTemplateByDayOfWeek = async () => {
  console.log('🔍 กำลังดึงประวัติคลาสจากสัปดาห์ก่อน...')

  // หาช่วงวันของสัปดาห์ก่อน
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dow = today.getDay()
  const daysToLastMonday = dow === 1 ? 7 : (dow === 0 ? 6 : dow - 1) + 7
  
  const lastMonday = new Date(today)
  lastMonday.setDate(today.getDate() - daysToLastMonday)
  
  const lastSunday = new Date(lastMonday)
  lastSunday.setDate(lastMonday.getDate() + 6)

  const fromStr = toLocalDateStr(lastMonday)
  const toStr = toLocalDateStr(lastSunday)

  console.log(`   ดึงข้อมูลช่วง: ${fromStr} ถึง ${toStr}`)

  const snapshot = await getDocs(query(
    collection(db, 'classes'),
    where('date', '>=', fromStr),
    where('date', '<=', toStr)
  ))

  const allClasses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  console.log(`   พบคลาส ${allClasses.length} รายการ`)

  if (allClasses.length === 0) {
    console.log('   ⚠️  ไม่พบคลาสในสัปดาห์ก่อน')
    return {}
  }

  // จัดกลุ่มตาม dayOfWeek → key=(time|name) → template
  const templatesByDay = {}

  for (const cls of allClasses) {
    if (!cls.date || !cls.time || !cls.name) continue

    // กรอง field ที่จำเป็น และข้าม undefined
    const template = {
      type: cls.type || null,
      subtype: cls.subtype || null,
      name: cls.name,
      description: cls.description || '',
      time: cls.time,
      instructor: cls.instructor || '',
      maxCapacity: cls.maxCapacity || 15
    }

    // ลบ field ที่เป็น null/undefined ออก
    Object.keys(template).forEach(k => {
      if (template[k] === null || template[k] === undefined) {
        delete template[k]
      }
    })

    const date = parseLocalDate(cls.date)
    const dow = date.getDay()

    if (!templatesByDay[dow]) templatesByDay[dow] = {}
    const key = `${cls.time}|${cls.name}`
    templatesByDay[dow][key] = template
  }

  // แสดงสรุป
  console.log('\n📋 Template ที่พบ:')
  for (let d = 0; d <= 6; d++) {
    const templates = templatesByDay[d]
    if (!templates) continue
    const sorted = Object.values(templates).sort((a, b) => a.time.localeCompare(b.time))
    console.log(`\n  ${DAY_NAMES[d]}:`)
    for (const t of sorted) {
      console.log(`    ${t.time}  ${t.name} (${t.type || 'ไม่ระบุ'}) ครู ${t.instructor} รับ ${t.maxCapacity} คน`)
    }
  }

  return templatesByDay
}

/**
 * หาวันจันทร์ของสัปดาห์แรกที่ยังไม่มีคลาสใน Firestore
 * โดยเริ่มตรวจจากสัปดาห์ถัดไป
 */
const findNextWeekWithoutClasses = async (weeksToCheck = 8) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dow = today.getDay()
  const daysUntilMonday = dow === 1 ? 0 : (8 - dow) % 7 || 7

  const firstMonday = new Date(today)
  firstMonday.setDate(today.getDate() + daysUntilMonday)

  for (let week = 0; week < weeksToCheck; week++) {
    const monday = new Date(firstMonday)
    monday.setDate(firstMonday.getDate() + (week * 7))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const fromStr = toLocalDateStr(monday)
    const toStr = toLocalDateStr(sunday)

    const snapshot = await getDocs(query(
      collection(db, 'classes'),
      where('date', '>=', fromStr),
      where('date', '<=', toStr)
    ))

    if (snapshot.empty) {
      return { monday, fromStr, toStr, weekIndex: week }
    }

    console.log(`   สัปดาห์ ${fromStr} ถึง ${toStr} → มีคลาสอยู่แล้ว (${snapshot.size} คลาส) ข้ามไป`)
  }

  return null
}

/**
 * หาวันที่ในช่วง N สัปดาห์ เริ่มจาก startMonday
 */
const getDatesFromMonday = (startMonday, weeksCount) => {
  const dates = []
  for (let week = 0; week < weeksCount; week++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(startMonday)
      date.setDate(startMonday.getDate() + (week * 7) + d)
      dates.push({ dateStr: toLocalDateStr(date), dow: date.getDay() })
    }
  }
  return dates
}

const createClasses = async (weeksCount = 1, dryRun = false) => {
  console.log(`\n🚀 สร้างคลาส ${weeksCount} สัปดาห์${dryRun ? ' (DRY RUN)' : ''}`)
  console.log('='.repeat(60))

  const templatesByDay = await buildTemplateByDayOfWeek()

  if (Object.keys(templatesByDay).length === 0) {
    console.log('\n⚠️  ไม่พบประวัติคลาสในระบบ ไม่สามารถสร้าง template ได้')
    return
  }

  // หาสัปดาห์แรกที่ยังไม่มีคลาส
  console.log('\n🔍 กำลังหาสัปดาห์ที่ยังไม่มีคลาส...')
  const target = await findNextWeekWithoutClasses()

  if (!target) {
    console.log('\n✅ มีคลาสครบทุกสัปดาห์แล้ว (ตรวจสอบล่วงหน้า 8 สัปดาห์)')
    return
  }

  console.log(`\n📅 จะสร้างคลาสเริ่มจากสัปดาห์: ${target.fromStr} ถึง ${target.toStr}`)

  const upcomingDates = getDatesFromMonday(target.monday, weeksCount)

  console.log(`\n📅 สร้างคลาสสำหรับ ${upcomingDates.length} วัน (${weeksCount} สัปดาห์):`)
  console.log('='.repeat(60))

  let totalCreated = 0
  let totalSkipped = 0
  let totalDays = 0

  for (const { dateStr, dow } of upcomingDates) {
    const templates = templatesByDay[dow]
    if (!templates) continue

    const sorted = Object.values(templates).sort((a, b) => a.time.localeCompare(b.time))
    console.log(`\n📆 ${formatDateThai(dateStr)}`)
    totalDays++

    for (const template of sorted) {
      const label = `  ${template.time}  ${template.name} (${template.type || 'ไม่ระบุ'}) ครู ${template.instructor}`

      if (!dryRun) {
        const existing = await getDocs(query(
          collection(db, 'classes'),
          where('date', '==', dateStr),
          where('time', '==', template.time),
          where('name', '==', template.name)
        ))

        if (!existing.empty) {
          console.log(`${label} → ⏭️  มีอยู่แล้ว`)
          totalSkipped++
          continue
        }

        await addDoc(collection(db, 'classes'), {
          ...template,
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
  console.log(`📊 สรุป:`)
  console.log(`   วันที่มีคลาส: ${totalDays} วัน`)
  console.log(`   ✅ สร้างแล้ว: ${totalCreated} คลาส`)
  if (totalSkipped > 0) console.log(`   ⏭️  ข้ามแล้ว: ${totalSkipped} คลาส (มีอยู่แล้ว)`)
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

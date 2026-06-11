# API Specification — Black Fitness ระบบจองคลาส

ระบบ Black Fitness ไม่มี REST API server กลาง — Frontend เชื่อมต่อ Cloud
Firestore โดยตรงผ่าน Firebase JavaScript SDK ดังนั้น "API" ในที่นี้หมายถึง
**ชุดปฏิบัติการ Firestore (SDK operations)** ที่แอปเรียกใช้ พร้อม contract
ของแต่ละการทำงาน (input, output, side effects, สิทธิ์, ข้อผิดพลาด)

> อ้างอิงจากซอร์สโค้ดจริง ระบุไฟล์ต้นทางของแต่ละ operation

---

## สารบัญ

1. [รูปแบบการเชื่อมต่อ](#1-รูปแบบการเชื่อมต่อ)
2. [Authentication API (LIFF)](#2-authentication-api-liff)
3. [Users API](#3-users-api)
4. [Classes API](#4-classes-api)
5. [Bookings API](#5-bookings-api)
6. [Check-ins API](#6-check-ins-api)
7. [Settings API](#7-settings-api)
8. [สรุปสิทธิ์ตามบทบาท](#8-สรุปสิทธิ์ตามบทบาท)
9. [รูปแบบข้อผิดพลาด](#9-รูปแบบข้อผิดพลาด)

---

## 1. รูปแบบการเชื่อมต่อ

```javascript
import { db } from './firebase'
import { collection, doc, getDoc, getDocs, query, where,
         addDoc, setDoc, updateDoc, deleteDoc,
         runTransaction, increment, Timestamp } from 'firebase/firestore'
```

ทุก operation ทำงานในบริบทของ Security Rules — สิทธิ์ถูกตรวจที่ฝั่ง Firestore
ตาราง operation ด้านล่างใช้สัญลักษณ์:
- **R** = read, **W** = write, **T** = transaction

---

## 2. Authentication API (LIFF)

ไม่ใช่ Firestore — เป็นการยืนยันตัวตนผ่าน LINE LIFF SDK (`stores/liff.js`)

### `liff.init({ liffId })`
- **หน้าที่**: เริ่มต้น LIFF, ตรวจสถานะ login
- **Output**: `isLiffReady`, `isInClient`, `initError`

### `liff.getProfile()`
- **หน้าที่**: ดึงโปรไฟล์ LINE ของผู้ใช้
- **Output**: `{ userId, displayName, pictureUrl, statusMessage }`
- **Dev mode**: คืน mock profile (กำหนดผ่าน query param ได้)

### `authStore.signInWithLineUserId(lineUserId, displayName, pictureUrl)`
- **หน้าที่**: เข้าสู่ระบบ + โหลด/ตรวจโปรไฟล์จาก Firestore
- **Side effect**: อ่าน `users/{lineUserId}`, sync รูปโปรไฟล์ถ้าเปลี่ยน
- **Output**: userProfile + กำหนด isAdmin/isStaff/needsProfileSetup

---

## 3. Users API

| # | Operation | Type | Path | ไฟล์ |
|---|-----------|------|------|------|
| U1 | getDoc | R | `users/{lineUserId}` | auth.js (signIn) |
| U2 | getDoc | R | `users/{lineUserId}` | auth.js (refreshUserProfile) |
| U3 | setDoc | W | `users/{lineUserId}` | auth.js (completeProfileSetup) |
| U4 | updateDoc | W | `users/{lineUserId}` | auth.js (sync รูป) |
| U5 | getDocs | R | `users` (ทั้ง collection) | Admin.vue (loadAllData) |
| U6 | updateDoc | W | `users/{id}` (cooldown) | Admin.vue (setCooldown) |
| U7 | updateDoc | W | `users/{id}` (clear cooldown) | Admin.vue (clearCooldown) |
| U8 | updateDoc | W | `users/{id}` (membershipExpiry) | Admin.vue |
| U9 | updateDoc | W | `users/{id}` (memberType) | Admin.vue |
| U10 | updateDoc | W | `users/{id}` (role) | Admin.vue |
| U11 | deleteDoc | W | `users/{id}` | Admin.vue (ลบสมาชิก) |
| U12 | setDoc (merge) | W | `users/{uid}` (bulk import) | Admin.vue |

### U3 — สร้าง/บันทึกโปรไฟล์ผู้ใช้

```javascript
await setDoc(doc(db, 'users', lineUserId), {
  ...profileData,           // nickname, firstName, lastName, nationalId,
                            // phone, birthDate, gender, healthIssues,
                            // emergencyContact, acceptTerms, acceptRisk
  profileCompleted: true,
  updatedAt: new Date()
})
```
- **สิทธิ์**: เจ้าของเท่านั้น (`isOwner`), role ต้องเป็น `user`
- **ผลลัพธ์**: เอกสารผู้ใช้ใหม่ + ออกจากสถานะ needsProfileSetup

### U6 — ตั้ง Cooldown (admin)

```javascript
await updateDoc(doc(db, 'users', userId), {
  cooldownUntil: Timestamp.fromDate(cooldownUntil),  // now + N วัน 23:59:59
  cooldownReason: reason || null,
  updatedAt: new Date()
})
```
- **สิทธิ์**: admin เท่านั้น (rules ห้าม user แก้ cooldownUntil)

### U8/U9/U10 — แก้สมาชิก (admin/staff)

```javascript
// วันหมดอายุ
await updateDoc(doc(db,'users',id), { membershipExpiry: Timestamp.fromDate(date), updatedAt })
// แพ็คเกจ
await updateDoc(doc(db,'users',id), { memberType: newType, updatedAt })
// บทบาท (admin เท่านั้น)
await updateDoc(doc(db,'users',id), { role: newRole, updatedAt })
```

### U12 — นำเข้าสมาชิกจำนวนมาก (bulk import)

```javascript
// สมาชิกใหม่
await setDoc(doc(db,'users',uid),
  { ...fields, lineUserId: uid, createdAt, updatedAt, profileCompleted: true },
  { merge: true })
// อัปเดตเฉพาะฟิลด์ที่เปลี่ยน
await setDoc(doc(db,'users',uid), { ...changes, updatedAt }, { merge: true })
```

---

## 4. Classes API

| # | Operation | Type | Path / Query | ไฟล์ |
|---|-----------|------|--------------|------|
| C1 | getDocs + where | R | `classes` where `date == X` | Booking.vue (loadClasses) |
| C2 | getDoc | R | `classes/{id}` | ClassDetail.vue |
| C3 | getDocs | R | `classes` (ทั้งหมด) | Admin.vue (loadAllData) |
| C4 | addDoc | W | `classes` | Admin.vue (addClass) |
| C5 | updateDoc | W | `classes/{id}` | Admin.vue (updateClass) |
| C6 | deleteDoc | W | `classes/{id}` | Admin.vue (deleteClass) |
| C7 | getDocs + where (range) | R | `classes` where date ระหว่าง | weekly script |
| C8 | getDocs + where (×3) | R | `classes` where date+time+name | weekly script |
| C9 | addDoc | W | `classes` | weekly script |
| C10 | updateDoc (increment) | W | `classes/{id}.currentBookings` | booking/cancel |

### C1 — โหลดคลาสตามวันที่

```javascript
const snapshot = await getDocs(query(
  collection(db, 'classes'),
  where('date', '==', selectedDate)   // 'yyyy-mm-dd'
))
// → [{ id, type, subtype, name, description, date, time,
//      instructor, maxCapacity, currentBookings }, ...]
```
- **สิทธิ์**: อ่านได้ทุกคน (`allow read: if true`)

### C4 — เพิ่มคลาส (admin)

```javascript
await addDoc(collection(db, 'classes'), {
  type, subtype,
  name: subtypeInfo.label,
  description: subtypeInfo.description,
  date, time, instructor, maxCapacity,
  currentBookings: 0,
  createdAt: new Date()
})
```
- **สิทธิ์**: admin เท่านั้น
- **หมายเหตุ**: name/description มาจาก subtype ที่เลือก (แก้เองไม่ได้)

### C7/C8/C9 — สร้างคลาสรายสัปดาห์ (batch script)

```javascript
// ดึงคลาสในช่วงสัปดาห์
getDocs(query(collection(db,'classes'),
  where('date','>=',fromStr), where('date','<=',toStr)))
// ตรวจซ้ำก่อนสร้าง
getDocs(query(collection(db,'classes'),
  where('date','==',dateStr), where('time','==',time), where('name','==',name)))
// สร้างถ้าไม่ซ้ำ
addDoc(collection(db,'classes'), { ...template, date, currentBookings:0, createdAt })
```

---

## 5. Bookings API

| # | Operation | Type | Path / Query | ไฟล์ |
|---|-----------|------|--------------|------|
| B1 | getDocs + where | R | `bookings` where `userId == X` | Booking.vue, History.vue |
| B2 | runTransaction | T | `classes/{id}` + `bookings` | Booking/ClassDetail (จอง) |
| B3 | updateDoc | W | `bookings/{id}` (ยกเลิก) | History.vue |
| B4 | getDocs | R | `bookings` (ทั้งหมด) | Admin.vue |
| B5 | addDoc | W | `bookings` (admin จองให้) | Admin.vue |

### B1 — โหลดการจองของผู้ใช้

```javascript
const snapshot = await getDocs(query(
  collection(db, 'bookings'),
  where('userId', '==', lineUserId)
))
```
- **สิทธิ์**: เจ้าของ หรือ staff/admin

### B2 — จองคลาส (Transaction) ⭐ สำคัญ

```javascript
await runTransaction(db, async (transaction) => {
  const classSnap = await transaction.get(classRef)
  if (!classSnap.exists()) throw new Error('ไม่พบข้อมูลคลาส')

  const classData = classSnap.data()
  if (classData.currentBookings >= classData.maxCapacity)
    throw new Error('คลาสเต็มแล้ว')

  const bookingRef = doc(collection(db, 'bookings'))
  transaction.set(bookingRef, {
    userId, classId, className, date, time, instructor,
    status: 'confirmed',
    bookedAt: new Date(),
    canCancelUntil: new Date(`${date}T${time}:00`)
  })
  transaction.update(classRef, { currentBookings: increment(1) })
})
```
- **สิทธิ์**: เจ้าของ + membership valid + status='confirmed'
- **Atomic**: ตรวจความจุ + สร้าง booking + เพิ่ม counter ในธุรกรรมเดียว
- **Errors**: `'ไม่พบข้อมูลคลาส'`, `'คลาสเต็มแล้ว'`
- **เงื่อนไขก่อนเรียก** (`canBook`): ไม่ติด cooldown, membership valid,
  ไม่ใช่ Gold, ยังไม่จองซ้ำ, เหลือ > 30 นาทีก่อนคลาส, ไม่เกินหน้าต่างจองล่วงหน้า

### B3 — ยกเลิกการจอง

```javascript
await updateDoc(doc(db, 'bookings', bookingId), {
  status: 'cancelled',
  cancelledAt: new Date()
})
await updateDoc(doc(db, 'classes', classId), {
  currentBookings: increment(-1)
})
```
- **สิทธิ์**: เจ้าของ (เปลี่ยน confirmed → cancelled เท่านั้น)
- **เงื่อนไข** (`canCancel`): ต้องเหลือ > 5 ชั่วโมงก่อนคลาสเริ่ม
- **หมายเหตุ**: ใช้ updateDoc 2 ครั้งแยกกัน (ไม่ atomic) — มี
  `safeCancelBooking()` แบบ transaction ใน utils/firestore.js เป็นทางเลือก

---

## 6. Check-ins API

| # | Operation | Type | Path | ไฟล์ |
|---|-----------|------|------|------|
| K1 | getDocs | R | `checkins` | Admin.vue |
| K2 | addDoc | W | `checkins` | Admin.vue / CheckinScanner |
| K3 | deleteDoc | W | `checkins/{id}` | Admin.vue |

### K2 — บันทึกเช็คอิน (staff/admin)

```javascript
const ref = await addDoc(collection(db, 'checkins'), {
  uid, name, memberType,
  membershipValid,                    // boolean — ตรวจ ณ เวลาเช็คอิน
  classId, className, classDate, classTime, instructor,
  checkedInAt: Timestamp.fromDate(now)
})
```
- **สิทธิ์**: staff/admin เท่านั้น
- **Flow**: สแกน QR/ระบุ uid → ตรวจ membership → บันทึก + แสดงผลสำเร็จ/หมดอายุ

---

## 7. Settings API

| # | Operation | Type | Path | ไฟล์ |
|---|-----------|------|------|------|
| S1 | getDoc | R | `settings/classTypes` | Admin.vue |
| S2 | setDoc | W | `settings/classTypes` | Admin.vue (เพิ่ม/แก้/ลบประเภท) |

### S1/S2 — ตั้งค่าประเภทคลาส (admin)

```javascript
// อ่าน
const snap = await getDoc(doc(db, 'settings', 'classTypes'))
// เขียน (ทับทั้ง document)
await setDoc(doc(db, 'settings', 'classTypes'), updatedSettings)
```
- **สิทธิ์**: อ่านทุกคน, เขียนเฉพาะ admin

---

## 8. สรุปสิทธิ์ตามบทบาท

| Operation | user (เจ้าของ) | staff | admin |
|-----------|:-:|:-:|:-:|
| อ่านโปรไฟล์ตัวเอง | ✅ | ✅ | ✅ |
| อ่านโปรไฟล์ผู้อื่น | ❌ | ✅ | ✅ |
| แก้โปรไฟล์ตัวเอง (ยกเว้น role/expiry/cooldown) | ✅ | ✅ | ✅ |
| ตั้ง membershipExpiry / memberType | ❌ | ✅ | ✅ |
| ตั้ง role / cooldown | ❌ | ❌ | ✅ |
| ลบสมาชิก | ❌ | ❌ | ✅* |
| อ่านคลาส | ✅ | ✅ | ✅ |
| เพิ่ม/แก้/ลบคลาส | ❌ | ❌ | ✅ |
| จองคลาส (ของตัวเอง) | ✅ | ✅ | ✅ |
| ยกเลิกการจอง (ของตัวเอง) | ✅ | ✅ | ✅ |
| อ่านการจองทั้งหมด | ❌ | ✅ | ✅ |
| บันทึกเช็คอิน | ❌ | ✅ | ✅ |
| ตั้งค่าประเภทคลาส | ❌ | ❌ | ✅ |

\* rules ระบุ `allow delete: if false` สำหรับ users — การลบในโค้ด Admin
จะสำเร็จต่อเมื่อ rules ถูกปรับ/ยังไม่ deploy

---

## 9. รูปแบบข้อผิดพลาด

ระบบจัดการ error ผ่าน `utils/errorHandler.js` (`handleFirestoreError`)
แปลงเป็นข้อความภาษาไทย และ retry สำหรับ network error (`retryOperation`)

| สถานการณ์ | ข้อความ/พฤติกรรม |
|-----------|------------------|
| คลาสเต็มระหว่างจอง | `'คลาสเต็มแล้ว กรุณาเลือกคลาสอื่น'` |
| ไม่พบคลาส | `'ไม่พบข้อมูลคลาส'` |
| Gold พยายามจอง | `'แพ็คเกจ Gold ไม่สามารถจองคลาสได้'` |
| network error | retry อัตโนมัติ (exponential backoff) |
| permission denied | แปลเป็นข้อความภาษาไทย แสดง dialog |

contract การจอง/ยกเลิกใช้ SweetAlert2 แจ้งผลสำเร็จ/ผิดพลาดเป็นภาษาไทยเสมอ

---

*เอกสารนี้สร้างจากการวิเคราะห์ซอร์สโค้ดจริง ณ เวอร์ชันปัจจุบัน*

# วิธีลด Firestore Reads/Writes

## ปัญหาปัจจุบัน

### จุดที่อ่านมากที่สุด:
1. **Admin.vue** - อ่านทั้ง 3 collections (classes, users, bookings) ทุกครั้ง
2. **Booking.vue** - อ่านคลาสและ bookings ทุกครั้งที่เปลี่ยนวันที่
3. **Auth Store** - อ่าน user profile หลายครั้ง

## วิธีแก้ไข

### 1. ใช้ LocalStorage Cache
```javascript
// เก็บข้อมูลที่ไม่เปลี่ยนบ่อยใน localStorage
const CACHE_DURATION = 5 * 60 * 1000 // 5 นาที

const getCachedData = (key) => {
  const cached = localStorage.getItem(key)
  if (!cached) return null
  
  const { data, timestamp } = JSON.parse(cached)
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(key)
    return null
  }
  
  return data
}

const setCachedData = (key, data) => {
  localStorage.setItem(key, JSON.stringify({
    data,
    timestamp: Date.now()
  }))
}
```

### 2. ใช้ Query Limit สำหรับ Pagination
```javascript
// แทนที่จะโหลดทั้งหมด
const snapshot = await getDocs(collection(db, 'bookings'))

// ใช้ limit และ pagination
import { query, limit, startAfter, orderBy } from 'firebase/firestore'

const q = query(
  collection(db, 'bookings'),
  orderBy('date', 'desc'),
  limit(10)
)
const snapshot = await getDocs(q)
```

### 3. ใช้ onSnapshot สำหรับ Real-time (ถ้าต้องการ)
```javascript
// แทนที่จะ getDocs ทุกครั้ง
const unsubscribe = onSnapshot(
  collection(db, 'classes'),
  (snapshot) => {
    classes.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  }
)
```

### 4. Cache User Profile ใน Auth Store
```javascript
// เก็บ user profile ใน localStorage
const loadUserProfile = async (lineUserId) => {
  // ลองอ่านจาก cache ก่อน
  const cached = getCachedData(`user_${lineUserId}`)
  if (cached) return cached
  
  // ถ้าไม่มี cache ค่อยอ่านจาก Firestore
  const userDoc = await getDoc(doc(db, 'users', lineUserId))
  const data = { id: userDoc.id, ...userDoc.data() }
  
  // เก็บใน cache
  setCachedData(`user_${lineUserId}`, data)
  
  return data
}
```

### 5. Batch Reads สำหรับ Multiple Documents
```javascript
// แทนที่จะ getDoc หลายครั้ง
const doc1 = await getDoc(doc(db, 'classes', id1))
const doc2 = await getDoc(doc(db, 'classes', id2))

// ใช้ Promise.all
const [doc1, doc2] = await Promise.all([
  getDoc(doc(db, 'classes', id1)),
  getDoc(doc(db, 'classes', id2))
])
```

### 6. ใช้ Composite Indexes สำหรับ Complex Queries
```javascript
// สร้าง index ใน Firebase Console สำหรับ query ที่ซับซ้อน
const q = query(
  collection(db, 'bookings'),
  where('userId', '==', userId),
  where('status', '==', 'confirmed'),
  orderBy('date', 'desc')
)
```

## ผลลัพธ์ที่คาดหวัง

### ก่อนแก้ไข:
- Admin เปิดครั้งแรก: ~300-500 reads (ขึ้นอยู่กับจำนวน documents)
- Booking เปลี่ยนวันที่: ~20-50 reads
- ClassDetail เปิดดู: ~10-20 reads

### หลังแก้ไข (ใช้ cache):
- Admin เปิดครั้งแรก: ~300-500 reads (ครั้งแรก)
- Admin เปิดครั้งถัดไป (ภายใน 5 นาที): 0 reads (ใช้ cache)
- Booking เปลี่ยนวันที่: ~5-10 reads (ใช้ limit)
- ClassDetail เปิดดู: 1 read (cache user bookings)

## การประมาณค่าใช้จ่าย

Firestore Free Tier: 50,000 reads/day

### สมมติ:
- 100 users/day
- แต่ละคนเปิด Admin 2 ครั้ง = 200 x 300 = 60,000 reads
- แต่ละคนจอง 3 คลาส = 300 x 20 = 6,000 reads
- **รวม: ~66,000 reads/day** (เกิน free tier)

### หลังใช้ cache:
- 100 users/day
- แต่ละคนเปิด Admin 2 ครั้ง (ครั้งที่ 2 ใช้ cache) = 100 x 300 = 30,000 reads
- แต่ละคนจอง 3 คลาส (ใช้ limit) = 300 x 5 = 1,500 reads
- **รวม: ~31,500 reads/day** (อยู่ใน free tier)

## สรุป

การใช้ LocalStorage Cache และ Query Limit จะช่วยลด reads ได้มากกว่า 50%

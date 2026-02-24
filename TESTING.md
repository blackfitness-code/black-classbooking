# คู่มือการเทสระบบจองคลาสโยคะ

## ขั้นตอนการเตรียมระบบ

### 1. ติดตั้ง Dependencies
```bash
# ติดตั้ง dependencies หลัก
npm install

# ติดตั้ง client dependencies
cd client
npm install

# ติดตั้ง server dependencies
cd ../server
npm install
cd ..
```

### 2. ตั้งค่า Environment Variables

#### Client (.env)
```bash
cp client/.env.example client/.env
```
แก้ไขไฟล์ `client/.env`:
```
VITE_LIFF_ID=2000000000-abcdefgh
VITE_API_BASE_URL=http://localhost:5000/api
```

#### Server (.env)
```bash
cp server/.env.example server/.env
```
แก้ไขไฟล์ `server/.env`:
```
PORT=5000
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### 3. ตั้งค่า Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. สร้าง Project ใหม่
3. เปิดใช้งาน Firestore Database
4. ตั้งค่า Security Rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
5. คัดลอก Firebase Config จาก Project Settings

### 4. ตั้งค่า LINE LIFF (สำหรับเทสจริง)

1. สร้าง LINE Channel
2. สร้าง LIFF App
3. ตั้งค่า Endpoint URL เป็น `http://localhost:3000`
4. คัดลอก LIFF ID

## การเทสระบบ

### 1. เริ่มระบบ
```bash
# รันทั้ง client และ server
npm run dev

# หรือรันแยก
npm run client  # port 3000
npm run server  # port 5000
```

### 2. เทส API ด้วย curl/Postman

#### Health Check
```bash
curl http://localhost:5000/api/health
```

#### สร้าง User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "lineUserId": "test-user-123",
    "displayName": "Test User",
    "pictureUrl": "https://example.com/avatar.jpg"
  }'
```

#### สร้าง Admin User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "lineUserId": "admin-user-123",
    "displayName": "Admin User",
    "pictureUrl": "https://example.com/admin.jpg"
  }'
```

จากนั้นไปที่ Firebase Console > Firestore และแก้ไข document ของ admin:
```json
{
  "role": "admin",
  "membershipExpiry": "2025-12-31T00:00:00.000Z"
}
```

#### สร้างคลาส
```bash
curl -X POST http://localhost:5000/api/classes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hatha Yoga",
    "date": "2024-12-20",
    "time": "09:00",
    "instructor": "ครูนิดา",
    "maxCapacity": 10
  }'
```

#### ดูคลาส
```bash
curl "http://localhost:5000/api/classes?date=2024-12-20"
```

#### จองคลาส
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "classId": "class-id-from-previous-step",
    "className": "Hatha Yoga",
    "date": "2024-12-20",
    "time": "09:00",
    "instructor": "ครูนิดา"
  }'
```

### 3. เทสผ่าน Frontend

#### เทสแบบ Mock LIFF (ไม่ต้องใช้ LINE)

แก้ไขไฟล์ `client/src/stores/liff.js` เพื่อ mock LIFF:
```javascript
// เพิ่มใน actions
async initLiff() {
  // Mock LIFF for testing
  if (import.meta.env.DEV) {
    this.isLiffReady = true
    this.isLoggedIn = true
    this.profile = {
      userId: 'test-user-123',
      displayName: 'Test User',
      pictureUrl: 'https://via.placeholder.com/150'
    }
    localStorage.setItem('lineUserId', this.profile.userId)
    return
  }
  
  // Original LIFF code...
}
```

#### เทสขั้นตอน:

1. **เข้าหน้าแรก** - `http://localhost:3000`
   - ควรเห็นข้อมูล profile
   - ควรเห็นเมนูต่าง ๆ

2. **เทสการจอง** - คลิก "จองคลาส"
   - ควรเห็น date picker แนวนอน
   - เลือกวันที่และดูคลาส
   - ทดลองจองคลาส

3. **เทสประวัติ** - คลิก "ประวัติการจอง"
   - ควรเห็นการจองที่เพิ่งทำ
   - ทดลองยกเลิกการจอง

4. **เทส Admin** (ถ้าเป็น admin)
   - คลิก "จัดการระบบ"
   - ทดลองเพิ่มคลาส
   - ดูรายชื่อสมาชิก
   - ต่ออายุสมาชิก

### 4. เทสบน Mobile

1. ใช้ ngrok เพื่อ expose localhost:
   ```bash
   npx ngrok http 3000
   ```

2. ตั้งค่า LIFF Endpoint URL เป็น ngrok URL

3. เทสผ่าน LINE app บนมือถือ

## การแก้ไขปัญหาที่พบบ่อย

### 1. CORS Error
- ตรวจสอบว่า server รันอยู่ที่ port 5000
- ตรวจสอบ VITE_API_BASE_URL ใน client/.env

### 2. Firebase Error
- ตรวจสอบ Firebase Config ใน server/.env
- ตรวจสอบ Firestore Rules

### 3. LIFF Error
- ตรวจสอบ LIFF ID
- ใช้ mock mode สำหรับการเทสใน development

### 4. API Error
- ดู console logs ใน browser และ server
- ใช้ Network tab ใน DevTools

## Test Data ตัวอย่าง

### Users
```json
[
  {
    "lineUserId": "user1",
    "displayName": "สมชาย ใจดี",
    "role": "user",
    "membershipExpiry": "2025-06-30T00:00:00.000Z"
  },
  {
    "lineUserId": "admin1",
    "displayName": "ผู้ดูแล",
    "role": "admin",
    "membershipExpiry": "2025-12-31T00:00:00.000Z"
  }
]
```

### Classes
```json
[
  {
    "name": "Hatha Yoga",
    "date": "2024-12-20",
    "time": "09:00",
    "instructor": "ครูนิดา",
    "maxCapacity": 10,
    "currentBookings": 0
  },
  {
    "name": "Vinyasa Flow",
    "date": "2024-12-20",
    "time": "18:00",
    "instructor": "ครูสมใจ",
    "maxCapacity": 8,
    "currentBookings": 0
  }
]
```

## Checklist การเทส

- [ ] API Health Check ทำงาน
- [ ] สร้าง User ได้
- [ ] สร้าง Class ได้
- [ ] จอง Class ได้
- [ ] ยกเลิกการจองได้
- [ ] Admin สามารถจัดการได้
- [ ] Date Picker แสดงผลถูกต้อง
- [ ] ระบบสมาชิกทำงานถูกต้อง
- [ ] Mobile responsive ทำงานดี
- [ ] LIFF integration ทำงาน (ถ้าเทสจริง)
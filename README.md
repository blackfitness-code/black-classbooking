# Fitness Class Booking LIFF App

เว็บแอพลิเคชันจองคลาสออกกำลังกาย (โยคะ, พิลาทิส, ฟิตเนส, เต้น ฯลฯ) สำหรับ LINE LIFF พร้อมระบบจัดการแบบ Mobile First

## คุณสมบัติ

### สำหรับผู้ใช้ทั่วไป
- เข้าสู่ระบบผ่าน LINE LIFF
- ดึง LINE User ID และบันทึกลง Firebase + LocalStorage
- จองคลาสออกกำลังกายหลากหลายประเภท (โยคะ, พิลาทิส, ฟิตเนส, เต้น ฯลฯ)
- จองได้ก่อนคลาสเริ่ม 2 ชั่วโมง
- ยกเลิกการจองได้ตลอดเวลา (ก่อนคลาสเริ่ม)
- ดูประวัติการจอง
- ระบบสมาชิกพร้อมวันหมดอายุ
- UI Date Picker แนวนอน (1 Wed, 2 Thu, ...)

### สำหรับ Admin
- จัดการคลาส (เพิ่ม, ลบ, แก้ไข)
- รองรับคลาสหลากหลายประเภท
- จัดการสมาชิก (ต่ออายุ, ดูรายชื่อ)
- ดูประวัติการจองทั้งหมด
- แก้ไขวันหมดอายุสมาชิก

## เทคโนโลยี

### Frontend
- Vue 3 + Composition API
- Tailwind CSS
- Pinia (State Management)
- Vue Router
- LINE LIFF SDK
- Firebase SDK
- Date-fns

### Backend
- Express.js
- Firebase Client SDK
- Firebase Firestore

## การติดตั้ง

### 1. Clone Repository
```bash
git clone <repository-url>
cd yoga-booking-liff
```

### 2. ติดตั้ง Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. ตั้งค่า Environment Variables

#### Client (.env)
```bash
cp client/.env.example client/.env
```
แก้ไขไฟล์ `client/.env`:
```
VITE_LIFF_ID=your_liff_id_here
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

### 4. ตั้งค่า Firebase

1. สร้าง Firebase Project
2. เปิดใช้งาน Firestore Database
3. ตั้งค่า Firestore Security Rules ให้อนุญาตการอ่าน/เขียน
4. คัดลอก Firebase Config จาก Project Settings ไปใส่ใน server/.env

### 5. ตั้งค่า LINE LIFF

1. สร้าง LINE Channel
2. สร้าง LIFF App
3. ตั้งค่า Endpoint URL เป็น URL ของ client
4. คัดลอก LIFF ID ไปใส่ใน client/.env

### 5. ตั้งค่า Firestore Security Rules

คัดลอกเนื้อหาจากไฟล์ `server/firebase-rules.txt` ไปใส่ใน Firebase Console > Firestore > Rules

### 6. สร้าง Admin User

เข้าไปที่ Firebase Console > Firestore และสร้าง document ใน collection `users`:
```json
{
  "lineUserId": "your_line_user_id",
  "role": "admin",
  "membershipExpiry": "2025-12-31T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## การรัน

### Development
```bash
# รันทั้ง client และ server พร้อมกัน
npm run dev

# หรือรันแยก
npm run client  # รัน client (port 3000)
npm run server  # รัน server (port 5000)
```

### Production
```bash
# Build client
npm run build

# Start server
npm start
```

## โครงสร้างฐานข้อมูล (Firestore)

### Collection: users
```json
{
  "lineUserId": "string",
  "displayName": "string",
  "pictureUrl": "string",
  "role": "user|admin",
  "membershipExpiry": "timestamp",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Collection: classes
```json
{
  "name": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "instructor": "string",
  "maxCapacity": "number",
  "currentBookings": "number",
  "createdAt": "timestamp"
}
```

### Collection: bookings
```json
{
  "userId": "string",
  "classId": "string",
  "className": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "instructor": "string",
  "status": "confirmed|cancelled|completed",
  "bookedAt": "timestamp",
  "cancelledAt": "timestamp",
  "canCancelUntil": "timestamp"
}
```

## API Endpoints

### Health Check
- `GET /api/health` - ตรวจสอบสถานะ API

### User Management
- `GET /api/users/:lineUserId` - ดูข้อมูลผู้ใช้
- `POST /api/users` - สร้าง/อัพเดทผู้ใช้

### Classes
- `GET /api/classes?date=YYYY-MM-DD` - ดูคลาสตามวันที่
- `POST /api/classes` - สร้างคลาสใหม่
- `DELETE /api/classes/:classId` - ลบคลาส

### Bookings
- `GET /api/bookings/:userId` - ดูการจองของผู้ใช้
- `POST /api/bookings` - จองคลาส
- `PATCH /api/bookings/:bookingId/cancel` - ยกเลิกการจอง

### Admin
- `GET /api/admin/users` - ดูผู้ใช้ทั้งหมด
- `GET /api/admin/bookings` - ดูการจองทั้งหมด
- `PATCH /api/admin/users/:userId/extend-membership` - ต่ออายุสมาชิก

## กฎการใช้งาน

1. **การจอง**: จองได้ก่อนคลาสเริ่ม 2 ชั่วโมง
2. **การยกเลิก**: ยกเลิกได้ตลอดเวลาก่อนคลาสเริ่ม (แนะนำก่อน 4 ชั่วโมง)
3. **สมาชิก**: ต้องมีสมาชิกที่ยังไม่หมดอายุถึงจะจองได้
4. **ความจุ**: แต่ละคลาสมีจำนวนคนจำกัด
5. **ประเภทคลาส**: รองรับคลาสหลากหลายประเภท (โยคะ, พิลาทิส, ฟิตเนส, เต้น, มวย ฯลฯ)

## การ Deploy

### Client (Vercel/Netlify)
1. Build project: `cd client && npm run build`
2. Deploy folder `client/dist`

### Server (Railway/Heroku)
1. ตั้งค่า Environment Variables
2. Deploy folder `server`

## License

MIT License
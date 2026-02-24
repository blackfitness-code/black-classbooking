# คู่มือการ Deploy ไปยัง Firebase

## เตรียมความพร้อม

### 1. ติดตั้ง Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login เข้า Firebase
```bash
firebase login
```

### 3. เลือก Firebase Project
```bash
firebase use --add
# เลือก project และตั้งชื่อ alias เป็น "default"
```

หรือแก้ไขไฟล์ `.firebaserc`:
```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

## ตั้งค่า Environment Variables

### 1. Client Production Environment
แก้ไขไฟล์ `client/.env.production`:
```
VITE_LIFF_ID=your_production_liff_id
VITE_API_BASE_URL=https://your-region-your-project-id.cloudfunctions.net/api
```

### 2. Server Production Environment
แก้ไขไฟล์ `server/.env.production`:
```
NODE_ENV=production
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### 3. ตั้งค่า Environment Variables ใน Firebase Functions
```bash
# ตั้งค่าทีละตัว
firebase functions:config:set firebase.api_key="your_api_key"
firebase functions:config:set firebase.auth_domain="your_project.firebaseapp.com"
firebase functions:config:set firebase.project_id="your_project_id"
firebase functions:config:set firebase.storage_bucket="your_project.appspot.com"
firebase functions:config:set firebase.messaging_sender_id="your_sender_id"
firebase functions:config:set firebase.app_id="your_app_id"

# หรือตั้งค่าทั้งหมดพร้อมกัน
firebase functions:config:set firebase='{"api_key":"your_api_key","auth_domain":"your_project.firebaseapp.com","project_id":"your_project_id","storage_bucket":"your_project.appspot.com","messaging_sender_id":"your_sender_id","app_id":"your_app_id"}'
```

## การ Deploy

### 1. Deploy ทั้งหมด (Hosting + Functions)
```bash
npm run deploy
```

### 2. Deploy แยกส่วน

#### Deploy เฉพาะ Frontend (Hosting)
```bash
npm run deploy:hosting
# หรือ
cd client
npm run build
firebase deploy --only hosting
```

#### Deploy เฉพาะ Backend (Functions)
```bash
npm run deploy:functions
# หรือ
cd server
firebase deploy --only functions
```

### 3. Deploy เฉพาะ Firestore Rules
```bash
firebase deploy --only firestore:rules
```

## ตั้งค่า Custom Domain (ถ้าต้องการ)

### 1. เพิ่ม Custom Domain ใน Firebase Console
1. ไปที่ Firebase Console > Hosting
2. คลิก "Add custom domain"
3. ใส่ domain name
4. ตั้งค่า DNS records ตามที่แสดง

### 2. อัพเดท LIFF Endpoint URL
1. ไปที่ LINE Developers Console
2. แก้ไข LIFF App
3. เปลี่ยน Endpoint URL เป็น custom domain

## ตรวจสอบการ Deploy

### 1. ตรวจสอบ Hosting
```bash
# URL จะเป็น: https://your-project-id.web.app
curl https://your-project-id.web.app
```

### 2. ตรวจสอบ Functions
```bash
# URL จะเป็น: https://your-region-your-project-id.cloudfunctions.net/api
curl https://your-region-your-project-id.cloudfunctions.net/api/health
```

### 3. ตรวจสอบ Logs
```bash
# ดู logs ของ Functions
firebase functions:log

# ดู logs แบบ real-time
firebase functions:log --follow
```

## การแก้ไขปัญหา

### 1. Functions Timeout
เพิ่มใน `server/index.js`:
```javascript
export const api = onRequest({
  timeoutSeconds: 300,
  memory: "1GiB"
}, app)
```

### 2. CORS Issues
ตรวจสอบการตั้งค่า CORS ใน `server/index.js`:
```javascript
app.use(cors({
  origin: [
    'https://your-project-id.web.app',
    'https://your-project-id.firebaseapp.com',
    'http://localhost:3000' // สำหรับ development
  ],
  credentials: true
}))
```

### 3. Environment Variables ไม่ทำงาน
```bash
# ดู config ปัจจุบัน
firebase functions:config:get

# ลบ config
firebase functions:config:unset firebase

# ตั้งค่าใหม่
firebase functions:config:set firebase='{"api_key":"..."}'
```

### 4. Build Errors
```bash
# ลบ node_modules และติดตั้งใหม่
rm -rf node_modules client/node_modules server/node_modules
npm install
cd client && npm install
cd ../server && npm install
```

## Security Checklist

### 1. Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Classes are readable by all authenticated users
    match /classes/{classId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Bookings are readable by owner and admin
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

### 2. Functions Security
- ใช้ Environment Variables สำหรับ sensitive data
- ตรวจสอบ authentication ใน API endpoints
- จำกัด CORS origins

### 3. LIFF Security
- ใช้ HTTPS เท่านั้น
- ตรวจสอบ LIFF ID ใน production

## URLs หลังจาก Deploy

### Frontend (Hosting)
- `https://your-project-id.web.app`
- `https://your-project-id.firebaseapp.com`

### Backend (Functions)
- `https://your-region-your-project-id.cloudfunctions.net/api`

### API Endpoints
- Health: `GET /api/health`
- Users: `GET|POST /api/users/:lineUserId`
- Classes: `GET|POST|DELETE /api/classes`
- Bookings: `GET|POST|PATCH /api/bookings`
- Admin: `GET /api/admin/users|bookings`

## การอัพเดทระบบ

### 1. อัพเดท Code
```bash
# แก้ไข code
git add .
git commit -m "Update features"

# Deploy
npm run deploy
```

### 2. อัพเดท Environment Variables
```bash
# อัพเดท Functions config
firebase functions:config:set key="new_value"

# Deploy functions เพื่อใช้ config ใหม่
firebase deploy --only functions
```

### 3. Rollback (ถ้าจำเป็น)
```bash
# ดู deployment history
firebase hosting:releases

# Rollback hosting
firebase hosting:rollback

# Rollback functions (ต้องทำ manual)
```
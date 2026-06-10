# Security Migration Guide

## ⚠️ สถานะปัจจุบัน: ไม่มี Firebase Authentication!

ระบบใช้ LINE LIFF เพียงอย่างเดียว ไม่มี Firebase Auth → **Firestore Rules ใหม่จะใช้ไม่ได้**

## 🔧 สองทางเลือก

### ทางเลือก 1: เพิ่ม Firebase Auth (แนะนำ)

เพิ่ม Firebase Auth Custom Token หลัง LINE LIFF login

**ข้อดี:**
- Security Rules ที่เขียนไว้ใช้ได้เลย
- Server-side validation
- Token refresh อัตโนมัติ

**ข้อเสีย:**
- ต้องมี backend (Firebase Functions)
- เพิ่มความซับซ้อน

**วิธีทำ:** ดู `FIREBASE_AUTH_SETUP.md` (สร้างใหม่ด้านล่าง)

---

### ทางเลือก 2: ใช้ Rules แบบไม่ต้อง Auth (ชั่วคราว)

แก้ไข Rules ให้เช็ค lineUserId จาก request data แทน `request.auth.uid`

**ข้อดี:**
- ไม่ต้องแก้โค้ด frontend/backend
- Deploy ได้ทันที

**ข้อเสีย:**
- ⚠️ User ปลอมแปลง lineUserId ได้
- ⚠️ ไม่ปลอดภัยเท่า Firebase Auth

**Rules สำหรับทางเลือก 2:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ⚠️ WARNING: ไม่มี Firebase Auth - ใช้ชั่วคราวเท่านั้น!
    
    function isValidLineUserId(userId) {
      return userId != null && userId.matches('^U[0-9a-f]{32}$');
    }
    
    function getUserData(userId) {
      return get(/databases/$(database)/documents/users/$(userId)).data;
    }
    
    function isAdmin(userId) {
      return exists(/databases/$(database)/documents/users/$(userId))
             && getUserData(userId).role == 'admin';
    }
    
    function isStaffOrAdmin(userId) {
      return exists(/databases/$(database)/documents/users/$(userId))
             && getUserData(userId).role in ['admin', 'staff'];
    }
    
    // Users
    match /users/{userId} {
      allow read: if isValidLineUserId(userId);
      
      allow create: if isValidLineUserId(request.resource.data.lineUserId)
                    && request.resource.data.lineUserId == userId
                    && request.resource.data.role == 'user';
      
      allow update: if isValidLineUserId(userId)
                    && !request.resource.data.diff(resource.data).affectedKeys()
                       .hasAny(['role', 'membershipExpiry', 'cooldownUntil']);
      
      // Admin override
      allow update: if isAdmin(request.resource.data.get('adminUserId', ''));
    }
    
    // Classes
    match /classes/{classId} {
      allow read: if true;
      allow write: if request.resource.data.get('adminUserId', '') != ''
                   && isAdmin(request.resource.data.adminUserId);
    }
    
    // Bookings
    match /bookings/{bookingId} {
      allow read: if true; // ชั่วคราว - ควรเช็คเจ้าของ
      
      allow create: if isValidLineUserId(request.resource.data.userId);
      
      allow update: if resource.data.userId == request.resource.data.userId
                    && request.resource.data.status == 'cancelled';
    }
    
    // Checkins
    match /checkins/{checkinId} {
      allow read: if true;
      allow create: if request.resource.data.get('staffUserId', '') != ''
                    && isStaffOrAdmin(request.resource.data.staffUserId);
    }
    
    // Settings
    match /settings/{document} {
      allow read: if true;
      allow write: if false; // ปิดไว้ก่อน
    }
  }
}
```

---

## 🚀 ขั้นตอนถัดไป

1. **ทดสอบ Rules ใน Firebase Emulator ก่อน**
   ```bash
   firebase emulators:start --only firestore
   ```

2. **Deploy Rules ทีละขั้น**
   - Deploy แบบ read-only ก่อน
   - ทดสอบว่าระบบยังทำงานได้
   - ค่อยเปิด write restrictions

3. **Monitor Firestore Logs**
   - ดู permission denied errors
   - แก้ไข rules ตามความจำเป็น

4. **วางแผนย้ายไป Firebase Auth** (ในอนาคต)

---

## ⏰ Timeline แนะนำ

- **Week 1:** Deploy Rules แบบทางเลือก 2 (ชั่วคราว)
- **Week 2-3:** สร้าง Firebase Functions + Custom Auth
- **Week 4:** ทดสอบ Firebase Auth ใน staging
- **Week 5:** Deploy Firebase Auth + Rules แบบทางเลือก 1

---

## 📝 สิ่งที่ต้องทำเพิ่ม

1. สร้าง `FIREBASE_AUTH_SETUP.md` - วิธีเพิ่ม Firebase Auth
2. สร้าง Firebase Functions สำหรับ custom token
3. แก้ไข `auth.js` store รองรับ Firebase Auth
4. เพิ่ม error handling สำหรับ permission denied

# Security Setup — LINE LIFF → Firebase Auth

ปิดช่องโหว่ Firestore เปิดโล่ง ด้วยการบังคับ Firebase Auth (custom token จาก LINE)

สถาปัตยกรรม:
```
LIFF ID token ─▶ Cloud Function `lineLogin` (verify กับ LINE + เซ็น custom token)
              ─▶ client signInWithCustomToken ─▶ Firestore rules บังคับ request.auth
```

---

## สิ่งที่โค้ดทำให้แล้ว
- `functions/` — Cloud Function `lineLogin` (verify LINE ID token → Firebase custom token)
- `client/src/firebase.js` — export `auth`, `functions`, ต่อ emulator ตอน dev
- `client/src/stores/liff.js` — แลก token แล้ว `signInWithCustomToken`
- `client/src/stores/auth.js` — เซ็ต `role: 'user'` ตอนสมัคร (ให้ผ่าน create rule)
- `firestore.rules` — rules เข้มที่ครอบคลุม flow จริง (user/admin/booking/checkin)
- `firebase.json` — เพิ่ม functions + emulators

## สิ่งที่ต้องทำเอง (ทำตามลำดับ)

### 1. อัปเกรดเป็น Blaze plan
Cloud Functions ต้องใช้ Blaze (จ่ายตามใช้ — free tier ครอบคลุม แอปนี้แทบ 0 บาท)
- Firebase Console → ⚙️ → Usage and billing → modify plan → Blaze

### 2. เปิด OpenID scope ของ LINE Login channel
ต้องมี scope `openid` ไม่งั้น `liff.getIDToken()` คืน null
- LINE Developers Console → channel ของ LIFF `2007882550-gB0lXQvK`
- LINE Login → ตรวจว่ามี scope `openid` (และ `profile`)
- ยืนยันว่า **channel id = `2007882550`** (ส่วนหน้าของ LIFF ID) — ถ้าไม่ใช่ ตั้ง env `LINE_CHANNEL_ID` ที่ functions

### 3. ติดตั้ง dependencies ของ functions
```powershell
cd functions; npm install; cd ..
```

### 4. ทดสอบในเครื่องด้วย Emulator ก่อน deploy
```powershell
npm run dev:full
```
- รัน emulator (auth/functions/firestore) + Vite dev พร้อมกัน
- dev mode ใช้ mock uid ผ่าน dev-bypass (เปิดเฉพาะใน emulator) → ทดสอบ rules ได้จริงในเครื่อง
- เปิด Emulator UI ที่ http://127.0.0.1:4000 ดูข้อมูล/rules ได้

### 5. Deploy (เรียงตามนี้ — function ก่อน rules)
```powershell
npm run deploy:functions   # ขึ้น Cloud Function ก่อน
npm run deploy:rules       # แล้วค่อยบังคับ rules (จุดที่ตัดคนเข้าถึงแบบเก่า)
npm run deploy             # build + deploy hosting
```
> ⚠️ ห้าม deploy rules ก่อน function/hosting ใหม่ขึ้น ไม่งั้นผู้ใช้ปัจจุบันจะใช้ไม่ได้ชั่วคราว

### 6. ยืนยันว่าปิดรูแล้ว
```powershell
node scripts/check-firestore-exposure.js
```
ต้องเห็น `✅ ถูกบล็อก (permission-denied)` ทั้ง users/bookings/checkins

---

## หมายเหตุ
- `functions/index.js` มี dev-bypass ที่ทำงานเฉพาะเมื่อ `FUNCTIONS_EMULATOR === 'true'` — เป็น true เฉพาะตอนรัน emulator, บน production ตายเสมอ ปลอมตัวตนไม่ได้
- `scripts/create-*.js` ยังเขียน Firestore ตรงด้วย config (ไม่ผ่าน auth) — หลังบังคับ rules สคริปต์พวกนี้จะถูกบล็อก ต้องเปลี่ยนไปใช้ Admin SDK (service account) ถ้าจะรันสร้างคลาสจาก local
```

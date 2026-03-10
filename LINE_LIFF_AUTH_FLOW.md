# LINE LIFF Authentication Flow

## 1. เมื่อไหร่ใช้ Mock Profile?

Mock Profile จะถูกใช้ใน 3 กรณี:

### กรณีที่ 1: Development Mode
```javascript
const DEV_MODE = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_PROFILE === 'true'
```
- เมื่อรัน `npm run dev` → `import.meta.env.DEV = true`
- หรือตั้งค่า `VITE_USE_MOCK_PROFILE=true` ใน `.env`

### กรณีที่ 2: LIFF Init Error (Fallback)
```javascript
catch (error) {
  console.error('LIFF initialization failed:', error)
  // Fallback to mock
  this.profile = MOCK_PROFILE
}
```

### กรณีที่ 3: ทดสอบบน Browser (ไม่ใช่ LINE App)
- เมื่อเปิดใน browser ปกติ (ไม่ใช่ใน LINE)
- LIFF จะ error และ fallback ไปใช้ Mock

---

## 2. Flow การ Authentication

```
┌─────────────────────────────────────────────────────────────┐
│                    App.vue (onMounted)                       │
│                  await liffStore.initLiff()                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   ตรวจสอบ DEV_MODE?          │
         └───────┬───────────────┬───────┘
                 │               │
        ใช่ (Dev) │               │ ไม่ใช่ (Production)
                 │               │
                 ▼               ▼
    ┌────────────────────┐   ┌──────────────────────┐
    │  ใช้ MOCK_PROFILE  │   │  เรียก liff.init()  │
    │  - userId: U123... │   │  - LIFF ID จาก .env │
    │  - displayName     │   └──────────┬───────────┘
    │  - pictureUrl      │              │
    └────────┬───────────┘              │
             │                          ▼
             │              ┌───────────────────────┐
             │              │ liff.isLoggedIn()?    │
             │              └───┬───────────┬───────┘
             │                  │           │
             │             ใช่  │           │ ไม่ใช่
             │                  │           │
             │                  ▼           ▼
             │      ┌──────────────────┐  ┌─────────────────┐
             │      │ liff.getProfile()│  │ แสดงปุ่ม Login │
             │      │ - userId         │  │ (ใน Home.vue)  │
             │      │ - displayName    │  └────────┬────────┘
             │      │ - pictureUrl     │           │
             │      └────────┬─────────┘           │
             │               │                     │
             │               │                     ▼
             │               │         ┌──────────────────────┐
             │               │         │ User กดปุ่ม Login   │
             │               │         │ liff.login()         │
             │               │         └──────────┬───────────┘
             │               │                    │
             │               │                    ▼
             │               │         ┌──────────────────────┐
             │               │         │ Redirect to LINE     │
             │               │         │ OAuth Page           │
             │               │         └──────────┬───────────┘
             │               │                    │
             │               │                    ▼
             │               │         ┌──────────────────────┐
             │               │         │ User อนุญาต         │
             │               │         │ Redirect กลับมา     │
             │               │         └──────────┬───────────┘
             │               │                    │
             │               └────────────────────┘
             │                        │
             └────────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────┐
                    │  Home.vue (onMounted)           │
                    │  authStore.signInWithLineUserId │
                    └─────────────┬───────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────────┐
                    │  ตรวจสอบ Firestore             │
                    │  getDoc(db, 'users', userId)    │
                    └─────────┬───────────┬───────────┘
                              │           │
                    มีข้อมูล  │           │ ไม่มีข้อมูล
                              │           │
                              ▼           ▼
                ┌──────────────────┐  ┌──────────────────────┐
                │ โหลด Profile     │  │ needsProfileSetup    │
                │ isAuthenticated  │  │ = true               │
                │ = true           │  │                      │
                │                  │  │ Redirect to          │
                │ แสดงเมนูหลัก    │  │ /profile-setup       │
                └──────────────────┘  └──────────────────────┘
```

---

## 3. ตัวอย่างการใช้งาน

### Development (Local)
```bash
# รัน dev mode
npm run dev

# ผลลัพธ์:
# ✅ ใช้ MOCK_PROFILE
# ✅ ไม่ต้อง login ผ่าน LINE
# ✅ userId = "U1234567890abcdef1234567890abcdef"
```

### Production (LINE LIFF)
```bash
# Build และ deploy
npm run build

# ผลลัพธ์:
# ✅ ใช้ LIFF จริง
# ✅ ต้อง login ผ่าน LINE
# ✅ userId = LINE User ID จริง
```

---

## 4. ไฟล์ที่เกี่ยวข้อง

### 1. `client/src/stores/liff.js`
- จัดการ LIFF initialization
- ตรวจสอบ DEV_MODE
- ใช้ Mock Profile หรือ LIFF จริง

### 2. `client/src/stores/auth.js`
- `signInWithLineUserId()` - ตรวจสอบ user ใน Firestore
- ตั้งค่า `isAuthenticated`, `needsProfileSetup`

### 3. `client/src/views/Home.vue`
- เรียก `liffStore.initLiff()` ใน onMounted
- เรียก `authStore.signInWithLineUserId()` เมื่อมี profile
- แสดงปุ่ม Login ถ้ายังไม่ได้ login

### 4. `client/src/App.vue`
- เรียก `liffStore.initLiff()` ตอน app start

### 5. `client/src/router/index.js`
- ตรวจสอบ `requiresAuth`, `requiresProfile`
- Redirect ไป `/profile-setup` ถ้า `needsProfileSetup = true`

---

## 5. Environment Variables

### `.env` (Development)
```env
VITE_LIFF_ID=2007882550-gB0lXQvK
VITE_USE_MOCK_PROFILE=true  # บังคับใช้ Mock (optional)
```

### `.env.production` (Production)
```env
VITE_LIFF_ID=your-production-liff-id
# ไม่ต้องตั้ง VITE_USE_MOCK_PROFILE
```

---

## 6. การ Debug

### ดู Console Logs
```javascript
// LIFF Store
console.log('🔧 Dev Mode:', this.devMode)
console.log('🔧 LIFF initialized successfully')
console.log('🔧 Profile received:', this.profile)

// Auth Store
console.log('🔍 Checking user:', lineUserId)
console.log('✅ User found in DB - loading profile')
console.log('❌ User not found in DB - needs profile setup')
```

### ตรวจสอบ State
```javascript
// ใน Vue DevTools
liffStore.isLiffReady    // true/false
liffStore.isLoggedIn     // true/false
liffStore.profile        // { userId, displayName, pictureUrl }
liffStore.devMode        // true/false

authStore.isAuthenticated    // true/false
authStore.needsProfileSetup  // true/false
authStore.userProfile        // { lineUserId, ... }
```

---

## 7. สรุป

| สถานการณ์ | Mock Profile | LIFF จริง |
|-----------|--------------|-----------|
| `npm run dev` | ✅ ใช้ | ❌ |
| `npm run build` (local test) | ❌ | ✅ |
| Production (LINE App) | ❌ | ✅ |
| Browser (ไม่ใช่ LINE) | ✅ Fallback | ❌ Error |
| LIFF Init Error | ✅ Fallback | ❌ Error |

**หมายเหตุ:** Mock Profile ช่วยให้พัฒนาได้โดยไม่ต้องเปิดใน LINE App ทุกครั้ง

# คู่มือการ Deploy

## การอัพโหลดขึ้น GitHub

### 1. สร้าง Repository ใหม่บน GitHub
ไปที่ https://github.com/new และสร้าง repository ใหม่

### 2. เริ่มต้น Git และอัพโหลด
```bash
# เริ่มต้น git repository (ถ้ายังไม่ได้ทำ)
git init

# เพิ่มไฟล์ทั้งหมด
git add .

# Commit
git commit -m "Initial commit: Fitness Class Booking App"

# เชื่อมต่อกับ GitHub repository (แทน YOUR_USERNAME และ YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push ขึ้น GitHub
git branch -M main
git push -u origin main
```

## การ Deploy บน Firebase Hosting

### 1. ติดตั้ง Firebase CLI (ถ้ายังไม่ได้ติดตั้ง)
```bash
npm install -g firebase-tools
```

### 2. Login เข้า Firebase
```bash
firebase login
```

### 3. Build และ Deploy
```bash
# Build client
cd client
npm run build
cd ..

# Deploy ทั้งหมด (Hosting + Firestore Rules)
firebase deploy

# หรือ Deploy เฉพาะ Hosting
firebase deploy --only hosting
```

## ตั้งค่า Environment Variables

### Client (.env)
สร้างไฟล์ `client/.env`:
```
VITE_LIFF_ID=your_liff_id_here
VITE_API_BASE_URL=https://your-api-url.com/api
```

### Server (.env)
สร้างไฟล์ `server/.env`:
```
PORT=5000
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## หมายเหตุ
- ไฟล์ `.env` จะไม่ถูกอัพโหลดขึ้น GitHub (อยู่ใน .gitignore)
- ต้องตั้งค่า environment variables ใหม่ทุกครั้งที่ clone repository
- Firebase project ID อยู่ในไฟล์ `.firebaserc`

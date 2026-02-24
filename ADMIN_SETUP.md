# การตั้งค่า Admin User

## วิธีเปลี่ยน User ธรรมดาเป็น Admin

### 1. ผ่าน Firebase Console (แนะนำ)

1. เข้าไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือก Project ของคุณ
3. ไปที่ **Firestore Database**
4. เข้าไปใน Collection `users`
5. หา Document ที่มี `lineUserId` ของผู้ใช้ที่ต้องการเปลี่ยนเป็น admin
6. แก้ไข field `role` จาก `"user"` เป็น `"admin"`
7. บันทึกการเปลี่ยนแปลง

### 2. ผ่าน Admin Panel (ถ้ามี admin คนอื่นอยู่แล้ว)

1. ให้ admin คนอื่นเข้าไปที่หน้า **จัดการระบบ**
2. ไปที่แท็บ **จัดการสมาชิก**
3. หาผู้ใช้ที่ต้องการเปลี่ยนเป็น admin
4. (ฟีเจอร์นี้ยังไม่ได้ทำ - ต้องเพิ่มปุ่มเปลี่ยน role)

### 3. การสร้าง Admin User แรก

ถ้ายังไม่มี admin เลย:

1. ให้ผู้ใช้เข้าระบบผ่าน LINE LIFF ก่อน
2. เข้าไปที่ Firebase Console
3. ใน Collection `users` จะมี document ของผู้ใช้นั้น
4. แก้ไข field `role` เป็น `"admin"`
5. เพิ่ม field `membershipExpiry` เป็นวันที่ในอนาคต เช่น:
   ```
   membershipExpiry: December 31, 2025 at 12:00:00 AM UTC+7
   ```

## โครงสร้างข้อมูล Admin User

```json
{
  "lineUserId": "U1234567890abcdef",
  "displayName": "ชื่อผู้ดูแล",
  "pictureUrl": "https://profile.line-scdn.net/...",
  "role": "admin",
  "membershipExpiry": "2025-12-31T00:00:00.000Z",
  "nickname": "ชื่อเล่น",
  "firstName": "ชื่อจริง",
  "lastName": "นามสกุล",
  "profileCompleted": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## สิทธิ์ของ Admin

Admin จะสามารถ:
- ✅ เข้าถึงหน้า **จัดการระบบ**
- ✅ จัดการคลาส (เพิ่ม, ลบ)
- ✅ ดูรายชื่อสมาชิกทั้งหมด
- ✅ ต่ออายุสมาชิก
- ✅ ดูประวัติการจองทั้งหมด
- ✅ จองคลาสเหมือนผู้ใช้ทั่วไป

## การตรวจสอบสิทธิ์

ระบบจะตรวจสอบสิทธิ์ admin จาก:
1. Field `role` ใน Firestore ต้องเป็น `"admin"`
2. Router guard จะป้องกันไม่ให้ user ธรรมดาเข้าหน้า admin
3. UI จะแสดงเมนู admin เฉพาะ admin เท่านั้น

## หมายเหตุ

- Admin ยังคงต้องมี `membershipExpiry` ที่ยังไม่หมดอายุเพื่อจองคลาส
- การเปลี่ยน role จะมีผลทันทีหลังจาก refresh หน้าเว็บ
- ควรมี admin อย่างน้อย 1 คนในระบบเสมอ
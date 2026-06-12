/**
 * lineLogin — แลก LIFF ID token เป็น Firebase custom token
 *
 * flow (production):
 *   client ส่ง { idToken } (จาก liff.getIDToken())
 *   → verify กับ LINE (ตรวจ signature/expiry/audience ฝั่ง LINE)
 *   → ใช้ sub (LINE userId) เป็น Firebase uid → เซ็น custom token ส่งกลับ
 *
 * flow (dev/emulator เท่านั้น):
 *   client ส่ง { devUid } → เซ็น token ให้ uid นั้นตรง ๆ
 *   เปิดทำงานเฉพาะเมื่อ FUNCTIONS_EMULATOR === 'true' (true เฉพาะใน emulator)
 *   → บน production path นี้ "ตาย" เสมอ ปลอมตัวตนไม่ได้
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

initializeApp()

// channel id ของ LINE Login channel (ส่วนหน้าของ LIFF ID) — ไม่ใช่ความลับ
const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID || '2007882550'

export const lineLogin = onCall({ region: 'us-central1' }, async (request) => {
  const { idToken, devUid } = request.data || {}

  // ── dev/emulator bypass (ปลอดภัยใน prod เพราะ flag เป็น true เฉพาะใน emulator) ──
  if (process.env.FUNCTIONS_EMULATOR === 'true' && devUid) {
    const token = await getAuth().createCustomToken(String(devUid))
    return { token }
  }

  if (!idToken) {
    throw new HttpsError('invalid-argument', 'ต้องส่ง idToken')
  }

  // ── verify ID token กับ LINE ──
  const res = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ id_token: idToken, client_id: LINE_CHANNEL_ID })
  })
  const data = await res.json().catch(() => ({}))

  if (!res.ok || !data.sub) {
    throw new HttpsError(
      'unauthenticated',
      'LINE token ไม่ถูกต้อง: ' + (data.error_description || data.error || res.status)
    )
  }

  // sub = LINE userId → ใช้เป็น Firebase uid (ตรงกับ document id ใน collection users)
  const token = await getAuth().createCustomToken(data.sub, {
    name: data.name || null,
    picture: data.picture || null
  })
  return { token }
})

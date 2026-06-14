// Auth composable — Dashboard
// จัดการ session ของ admin/staff dashboard

import { ref, computed } from 'vue'
import api, { setTokens, clearTokens, getToken } from './api.js'

const currentUser = ref(null)
const loading = ref(false)
const authError = ref(null)

/** true เมื่อ login แล้วและ role ถูกต้อง */
export const isLoggedIn = computed(() => currentUser.value !== null)

/** user object ปัจจุบัน */
export const user = computed(() => currentUser.value)

/** role ปัจจุบัน */
export const role = computed(() => currentUser.value?.role ?? null)

/** true ถ้า admin */
export const isAdmin = computed(() => currentUser.value?.isAdmin === true)

/** true ถ้า staff หรือ admin */
export const isStaff = computed(() =>
  currentUser.value?.isAdmin === true || currentUser.value?.isStaff === true
)

export const authLoading = computed(() => loading.value)
export const authErrorMsg = computed(() => authError.value)

// ---------------------------------------------------------------------------

/**
 * เข้าสู่ระบบด้วย devUid (DEV bypass)
 * @param {string} devUid
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function login(devUid) {
  loading.value = true
  authError.value = null
  try {
    // 1. POST /auth/line ด้วย devUid
    const loginData = await api.post('/auth/line', { devUid }, { auth: false })
    setTokens(loginData)

    // 2. GET /me เพื่อเช็ค role
    const meData = await api.get('/me')

    if (!meData.isAdmin && !meData.isStaff) {
      clearTokens()
      authError.value = 'บัญชีนี้ไม่มีสิทธิ์เข้าแดชบอร์ด'
      return { ok: false, error: authError.value }
    }

    currentUser.value = {
      ...meData.user,
      isAdmin: meData.isAdmin,
      isStaff: meData.isStaff,
    }
    return { ok: true }
  } catch (err) {
    authError.value = err.message ?? 'เข้าสู่ระบบไม่สำเร็จ'
    clearTokens()
    return { ok: false, error: authError.value }
  } finally {
    loading.value = false
  }
}

/**
 * ออกจากระบบ — ล้าง token และ user state
 */
export function logout() {
  clearTokens()
  currentUser.value = null
  authError.value = null
}

/**
 * ลอง restore session จาก localStorage (เรียกตอน app load)
 * @returns {Promise<boolean>} true ถ้า session ยังใช้งานได้
 */
export async function tryRestoreSession() {
  if (!getToken()) return false
  loading.value = true
  try {
    const meData = await api.get('/me')
    if (!meData.isAdmin && !meData.isStaff) {
      clearTokens()
      return false
    }
    currentUser.value = {
      ...meData.user,
      isAdmin: meData.isAdmin,
      isStaff: meData.isStaff,
    }
    return true
  } catch {
    clearTokens()
    return false
  } finally {
    loading.value = false
  }
}

// API client — Dashboard workspace
// native fetch wrapper คุยกับ REST backend
// ใช้ localStorage keys ที่ต่างจาก frontend เพื่อไม่ให้ session ชนกัน

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

// ---------------------------------------------------------------------------
// Session token helpers (localStorage keys: 'dashboardToken', 'dashboardRefresh')
// ---------------------------------------------------------------------------

const TOKEN_KEY = 'dashboardToken'
const REFRESH_TOKEN_KEY = 'dashboardRefresh'

/** เก็บทั้ง access token และ refresh token พร้อมกัน */
export const setTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY)

/** ล้างทั้งสอง token */
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

/**
 * @param {string} path  - e.g. '/admin/users' (leading slash optional)
 * @param {object} opts
 * @param {string} [opts.method='GET']
 * @param {*}      [opts.body]         - will be JSON-stringified when present
 * @param {boolean}[opts.auth=true]    - attach Bearer token when available
 * @param {object} [opts.headers={}]   - extra headers merged on top
 * @param {boolean}[opts._isRetry]     - internal flag — ห้ามส่งมาจากภายนอก
 */
export async function request(path, { method = 'GET', body, auth = true, headers = {}, _isRetry = false } = {}) {
  const url = BASE_URL + (path.startsWith('/') ? path : '/' + path)

  const reqHeaders = { ...headers }

  // ngrok free แสดงหน้าเตือน HTML ให้ browser แทน response จริง — header นี้ข้ามมัน
  if (BASE_URL.includes('ngrok')) {
    reqHeaders['ngrok-skip-browser-warning'] = 'true'
  }

  if (body !== undefined) {
    reqHeaders['Content-Type'] = 'application/json'
  }

  if (auth) {
    const token = getToken()
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const res = await fetch(url, {
    method,
    headers: reqHeaders,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  })

  // Parse response body (tolerate empty body — e.g. 204 No Content)
  let data = null
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    try {
      data = await res.json()
    } catch {
      data = null
    }
  }

  // on 401 ให้ลอง refresh token แล้ว retry ครั้งเดียว
  if (res.status === 401 && !_isRetry && auth) {
    const storedRefresh = getRefreshToken()
    if (storedRefresh) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(BASE_URL.includes('ngrok') ? { 'ngrok-skip-browser-warning': 'true' } : {})
          },
          body: JSON.stringify({ refreshToken: storedRefresh })
        })
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json()
          setTokens(refreshData)
          // retry original request ด้วย token ใหม่
          return request(path, { method, body, auth, headers, _isRetry: true })
        }
      } catch {
        // refresh call เองล้มเหลว — fall through ไป throw 401
      }
      // refresh ไม่สำเร็จ — ล้าง token แล้ว throw
      clearTokens()
    }
  }

  if (!res.ok) {
    // Backend error shape: { error: { message, code } }
    const errInfo = data?.error ?? {}
    const err = new Error(errInfo.message ?? res.statusText)
    err.status = res.status
    err.code = errInfo.code ?? null
    throw err
  }

  return data
}

// ---------------------------------------------------------------------------
// Convenience methods
// ---------------------------------------------------------------------------

export const get = (path, opts = {}) =>
  request(path, { ...opts, method: 'GET' })

export const post = (path, body, opts = {}) =>
  request(path, { ...opts, method: 'POST', body })

export const put = (path, body, opts = {}) =>
  request(path, { ...opts, method: 'PUT', body })

export const del = (path, opts = {}) =>
  request(path, { ...opts, method: 'DELETE' })

// ---------------------------------------------------------------------------
// Default export
// ---------------------------------------------------------------------------

const api = { get, post, put, del, request, setTokens, getToken, getRefreshToken, clearTokens }
export default api

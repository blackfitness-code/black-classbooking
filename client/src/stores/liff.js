import { defineStore } from 'pinia'
import liff from '@line/liff'
import { signInWithCustomToken, signOut } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { auth, functions } from '../firebase'

const DEV_MODE = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_PROFILE === 'true'

// promise cache ระดับ module — กัน ensureFirebaseAuth ถูกเรียกซ้ำพร้อมกันหลายจุด
// (sign-in ครั้งเดียวพอ; ทุก caller รอ promise เดียวกัน)
let firebaseAuthPromise = null

const DEFAULT_MOCK_PROFILE = {
    userId: 'U1234567890abcdef1234567890abcdef',
    displayName: 'Test User',
    pictureUrl: 'https://stickershop.line-scdn.net/stickershop/v1/product/28253611/LINEStorePC/main.png?v=1',
    statusMessage: 'Testing'
}

// อนุญาตให้ผู้ทดสอบกำหนด mock uid/ชื่อ/รูป เองผ่าน query param
// เช่น  ?mockUid=Utest002&mockName=สมชาย  เพื่อให้แต่ละคนมี account แยกกัน
// ค่าจะถูกจำใน localStorage เผื่อ reload หรือเปลี่ยนหน้า (query หาย)
function getMockProfile() {
    let uid, name, pic
    try {
        const params = new URLSearchParams(window.location.search)
        uid = params.get('mockUid')
        name = params.get('mockName')
        pic = params.get('mockPic')
        if (uid) localStorage.setItem('mockUid', uid)
        if (name) localStorage.setItem('mockName', name)
        if (pic) localStorage.setItem('mockPic', pic)
        uid = uid || localStorage.getItem('mockUid')
        name = name || localStorage.getItem('mockName')
        pic = pic || localStorage.getItem('mockPic')
    } catch { /* ignore (SSR / no window) */ }
    return {
        ...DEFAULT_MOCK_PROFILE,
        ...(uid ? { userId: uid } : {}),
        ...(name ? { displayName: name } : {}),
        ...(pic ? { pictureUrl: pic } : {})
    }
}

export const useLiffStore = defineStore('liff', {
    state: () => ({
        isLiffReady: false,
        isLoggedIn: false,
        isInClient: false,
        profile: null,
        liffId: import.meta.env.VITE_LIFF_ID || '2007882550-gB0lXQvK',
        devMode: DEV_MODE,
        initError: null,
        firebaseAuthReady: false
    }),

    actions: {
        // แลก LINE identity เป็น Firebase Auth (custom token) แล้ว sign-in
        // ต้อง await ตัวนี้ให้เสร็จ "ก่อน" อ่าน/เขียน Firestore ทุกจุด
        // ไม่งั้น request.auth = null → rules ปฏิเสธทุกอย่าง (บั๊กรอบก่อน)
        // idempotent: เรียกซ้ำได้ ทุก caller รอ promise เดียวกัน
        async ensureFirebaseAuth() {
            if (auth.currentUser) {
                this.firebaseAuthReady = true
                return auth.currentUser
            }
            if (firebaseAuthPromise) return firebaseAuthPromise

            firebaseAuthPromise = (async () => {
                const callLineLogin = httpsCallable(functions, 'lineLogin')

                let payload
                if (this.devMode) {
                    // dev: ไม่มี ID token จริง → ใช้ devUid (mock uid = LINE userId)
                    // ผ่าน dev-bypass ใน function ที่เปิดเฉพาะใน emulator เท่านั้น
                    const uid = getMockProfile().userId
                    payload = { devUid: uid }
                } else {
                    const idToken = liff.getIDToken()
                    if (!idToken) {
                        throw new Error('ไม่พบ LINE ID token (ต้องเปิด scope openid ที่ LINE channel)')
                    }
                    payload = { idToken }
                }

                const { data } = await callLineLogin(payload)
                await signInWithCustomToken(auth, data.token)
                this.firebaseAuthReady = true
                return auth.currentUser
            })()

            try {
                return await firebaseAuthPromise
            } catch (error) {
                // ล้าง cache เพื่อให้ลองใหม่ได้ครั้งหน้า
                firebaseAuthPromise = null
                this.firebaseAuthReady = false
                console.error('ensureFirebaseAuth failed:', error)
                throw error
            }
        },

        async initLiff() {
            if (this.devMode) {
                const mock = getMockProfile()
                this.isLiffReady = true
                this.isLoggedIn = true
                this.isInClient = false
                this.profile = mock
                localStorage.setItem('lineUserId', mock.userId)
                // ต้องมี emulator รันอยู่ (npm run dev:full) — ถ้าไม่มีจะ throw แต่ไม่ทำให้แอปล่ม
                try { await this.ensureFirebaseAuth() } catch { /* dev: emulator อาจไม่ได้รัน */ }
                return
            }

            try {
                await liff.init({ liffId: this.liffId })
                this.isLiffReady = true
                this.isInClient = liff.isInClient()
                this.initError = null

                if (liff.isLoggedIn()) {
                    this.isLoggedIn = true
                    this.profile = await liff.getProfile()
                    localStorage.setItem('lineUserId', this.profile.userId)
                    // sign-in Firebase ให้เสร็จก่อน view ใด ๆ จะอ่าน Firestore
                    await this.ensureFirebaseAuth()
                } else {
                    this.isLoggedIn = false
                    this.profile = null
                }
            } catch (error) {
                console.error('LIFF initialization failed:', error)
                this.isLiffReady = true
                this.isLoggedIn = false
                this.profile = null
                this.initError = error.message || 'LIFF init failed'
            }
        },

        async login() {
            if (this.devMode) {
                const mock = getMockProfile()
                this.isLoggedIn = true
                this.profile = mock
                localStorage.setItem('lineUserId', mock.userId)
                try { await this.ensureFirebaseAuth() } catch { /* dev: emulator อาจไม่ได้รัน */ }
                return
            }

            if (!this.isLiffReady || this.initError) return

            if (!liff.isLoggedIn()) {
                liff.login({
                    redirectUri: window.location.href
                })
            }
        },

        async logout() {
            // ล้าง Firebase Auth + cache เสมอ (ทั้ง dev/prod)
            firebaseAuthPromise = null
            this.firebaseAuthReady = false
            try { await signOut(auth) } catch { /* ignore */ }

            if (this.devMode) {
                this.isLoggedIn = false
                this.profile = null
                localStorage.removeItem('lineUserId')
                return
            }

            if (!this.isLiffReady) return

            if (liff.isLoggedIn()) {
                liff.logout()
            }
            this.isLoggedIn = false
            this.profile = null
            localStorage.removeItem('lineUserId')
        },

        async refreshProfile() {
            if (this.devMode) {
                this.profile = getMockProfile()
                return this.profile
            }

            if (!this.isLiffReady || !liff.isLoggedIn()) return null

            try {
                this.profile = await liff.getProfile()
                return this.profile
            } catch (error) {
                console.error('Failed to refresh profile:', error)
                return null
            }
        },

        getLineUserId() {
            return this.profile?.userId || localStorage.getItem('lineUserId')
        },

        getProfilePictureUrl() {
            if (this.profile?.pictureUrl) {
                try {
                    const url = new URL(this.profile.pictureUrl)
                    url.searchParams.set('t', Date.now().toString())
                    return url.toString()
                } catch {
                    return this.profile.pictureUrl
                }
            }
            return null
        }
    }
})

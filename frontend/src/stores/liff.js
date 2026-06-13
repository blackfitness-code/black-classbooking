import { defineStore } from 'pinia'
import liff from '@line/liff'

const DEV_MODE = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_PROFILE === 'true'

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
        initError: null
    }),

    actions: {
        async initLiff() {
            if (this.devMode) {
                const mock = getMockProfile()
                this.isLiffReady = true
                this.isLoggedIn = true
                this.isInClient = false
                this.profile = mock
                localStorage.setItem('lineUserId', mock.userId)
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
        },

        /** คืน LINE ID Token สำหรับส่ง backend (Phase 1)
         *  devMode → return null เพราะ backend จะใช้ devUid แทน
         */
        async getIdToken() {
            if (this.devMode) return null
            try {
                if (!this.isLiffReady || !liff.isLoggedIn()) return null
                return liff.getIDToken()
            } catch {
                return null
            }
        }
    }
})

import { defineStore } from 'pinia'
import liff from '@line/liff'

const DEV_MODE = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_PROFILE === 'true'
const MOCK_PROFILE = {
    userId: 'U1234567890abcdef1234567890abcdef',
    displayName: 'Test User',
    pictureUrl: 'https://via.placeholder.com/150',
    statusMessage: 'Testing'
}

export const useLiffStore = defineStore('liff', {
    state: () => ({
        isLiffReady: false,
        isLoggedIn: false,
        profile: null,
        liffId: import.meta.env.VITE_LIFF_ID || '2007882550-gB0lXQvK',
        devMode: DEV_MODE
    }),

    actions: {
        async initLiff() {
            if (this.devMode) {
                this.isLiffReady = true
                this.isLoggedIn = true
                this.profile = MOCK_PROFILE
                localStorage.setItem('lineUserId', MOCK_PROFILE.userId)
                return
            }

            try {
                await liff.init({ liffId: this.liffId })
                this.isLiffReady = true

                if (liff.isLoggedIn()) {
                    this.isLoggedIn = true
                    this.profile = await liff.getProfile()
                    localStorage.setItem('lineUserId', this.profile.userId)
                } else {
                    this.isLoggedIn = false
                }
            } catch (error) {
                console.error('LIFF initialization failed:', error)
                this.isLiffReady = true
                this.isLoggedIn = true
                this.profile = MOCK_PROFILE
                localStorage.setItem('lineUserId', MOCK_PROFILE.userId)
            }
        },

        async login() {
            if (this.devMode) {
                this.isLoggedIn = true
                this.profile = MOCK_PROFILE
                localStorage.setItem('lineUserId', MOCK_PROFILE.userId)
                return
            }

            if (!this.isLiffReady) return

            if (!liff.isLoggedIn()) {
                liff.login()
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
                this.isLoggedIn = false
                this.profile = null
                localStorage.removeItem('lineUserId')
            }
        },

        async refreshProfile() {
            if (this.devMode) {
                this.profile = { ...MOCK_PROFILE }
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
                const url = new URL(this.profile.pictureUrl)
                url.searchParams.set('t', Date.now().toString())
                return url.toString()
            }
            return this.profile?.pictureUrl
        }
    }
})

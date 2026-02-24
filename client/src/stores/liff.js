import { defineStore } from 'pinia'
import liff from '@line/liff'

// Mock profile for development
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
            console.log('🔧 Initializing LIFF with ID:', this.liffId)
            console.log('🔧 Environment:', import.meta.env.MODE)
            console.log('🔧 Dev Mode:', this.devMode)

            // ถ้าเป็น Dev Mode ให้ใช้ Mock Profile
            if (this.devMode) {
                console.log('🧪 DEV MODE: Using Mock Profile')
                this.isLiffReady = true
                this.isLoggedIn = true
                this.profile = MOCK_PROFILE
                localStorage.setItem('lineUserId', MOCK_PROFILE.userId)
                return
            }

            try {
                console.log('🔧 Calling liff.init...')
                await liff.init({ liffId: this.liffId })
                console.log('🔧 LIFF initialized successfully')
                this.isLiffReady = true

                console.log('🔧 Checking if LIFF is logged in...')
                if (liff.isLoggedIn()) {
                    console.log('🔧 LIFF is logged in, getting profile...')
                    this.isLoggedIn = true
                    this.profile = await liff.getProfile()
                    console.log('🔧 Profile received:', this.profile)

                    // บันทึก LINE User ID ลง localStorage
                    localStorage.setItem('lineUserId', this.profile.userId)
                } else {
                    console.log('🔧 LIFF is not logged in')
                    this.isLoggedIn = false
                }
            } catch (error) {
                console.error('LIFF initialization failed:', error)
                // Fallback to mock in case of error
                console.log('🧪 Falling back to Mock LIFF due to error')
                this.isLiffReady = true
                this.isLoggedIn = true
                this.profile = MOCK_PROFILE
                localStorage.setItem('lineUserId', MOCK_PROFILE.userId)
            }
        },

        async login() {
            console.log('🔐 Login requested')

            // ถ้าเป็น Dev Mode ให้ login ทันที
            if (this.devMode) {
                console.log('🧪 DEV MODE: Auto login with Mock Profile')
                this.isLoggedIn = true
                this.profile = MOCK_PROFILE
                localStorage.setItem('lineUserId', MOCK_PROFILE.userId)
                return
            }

            if (!this.isLiffReady) {
                console.log('🔐 LIFF not ready yet')
                return
            }

            if (!liff.isLoggedIn()) {
                console.log('🔐 Calling liff.login()')
                liff.login()
            } else {
                console.log('🔐 Already logged in')
            }
        },

        async logout() {
            if (this.devMode) {
                console.log('🧪 DEV MODE: Logout')
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
            console.log('🔄 Refreshing profile...')

            if (this.devMode) {
                console.log('🧪 DEV MODE: Refresh Mock Profile')
                this.profile = { ...MOCK_PROFILE }
                return this.profile
            }

            if (!this.isLiffReady || !liff.isLoggedIn()) {
                console.log('🔄 Cannot refresh - LIFF not ready or not logged in')
                return
            }

            try {
                const newProfile = await liff.getProfile()
                console.log('🔄 New profile received:', newProfile)

                // Update profile
                this.profile = newProfile

                // Sync with auth store if available
                const { useAuthStore } = await import('./auth')
                const authStore = useAuthStore()

                if (authStore.isAuthenticated && newProfile.pictureUrl) {
                    console.log('🔄 Syncing profile picture with database...')
                    await authStore.syncProfilePicture(newProfile.pictureUrl)
                }

                console.log('🔄 Profile refreshed and synced')
                return this.profile
            } catch (error) {
                console.error('🔄 Failed to refresh profile:', error)
                return null
            }
        },

        getLineUserId() {
            return this.profile?.userId || localStorage.getItem('lineUserId')
        },

        getProfilePictureUrl() {
            // Always add cache busting parameter to profile picture
            if (this.profile?.pictureUrl) {
                const url = new URL(this.profile.pictureUrl)
                url.searchParams.set('t', Date.now().toString())
                return url.toString()
            }
            return this.profile?.pictureUrl
        }
    }
})
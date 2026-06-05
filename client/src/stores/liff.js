import { defineStore } from 'pinia'
import liff from '@line/liff'

const DEV_MODE = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_PROFILE === 'true'
const MOCK_PROFILE = {
    userId: 'U1234567890abcdef1234567890abcdef',
    displayName: 'Test User',
    pictureUrl: 'https://scontent.fbkk29-9.fna.fbcdn.net/v/t39.30808-6/670997268_2337516446773374_5555059808719805758_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGkLNZiZmkYTkRahLL9__Icv_cLt8F99A-_9wu3wX30D6SmggbCJVJc33muBaF7hxR0NPDupKEzOZPgCDVAeOA-&_nc_ohc=6eBHpynWSuQQ7kNvwFnbBP0&_nc_oc=Adr6qYftj_F49nXyDeXiJV21ZsKBmBF1lYve-_989OeamT2YhMNcHFg-1aus-bomTfw&_nc_zt=23&_nc_ht=scontent.fbkk29-9.fna&_nc_gid=iLnu-BLSGCVo7CTuESO25Q&_nc_ss=7b2a8&oh=00_Af84Fi2zAmenT7U_96fZadLXk5lZ6Lyr_aMAXg9YtXZY7A&oe=6A259AED',
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

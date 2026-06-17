import { defineStore } from 'pinia'
import api, { setTokens, clearTokens } from '../lib/api'
import { useLiffStore } from './liff'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    userProfile: null,
    isAuthenticated: false,
    isAdmin: false,
    isStaff: false,
    needsProfileSetup: false
  }),

  getters: {
    // staff หรือ admin เข้าหน้าจัดการได้ (staff สิทธิ์จำกัด)
    canAccessAdmin: (state) => state.isAdmin || state.isStaff
  },

  actions: {
    async signInWithLineUserId(lineUserId, displayName, pictureUrl) {
      const liffStore = useLiffStore()
      const idToken = await liffStore.getIdToken()

      // devMode → ส่ง devUid, prod → ส่ง idToken
      const body = idToken
        ? { idToken }
        : { devUid: lineUserId, displayName, pictureUrl }

      try {
        const res = await api.post('/auth/line', body, { auth: false })
        setTokens(res)

        this.isAuthenticated = true
        this.userProfile = res.user
        this.needsProfileSetup = res.needsProfileSetup
        this.isAdmin = res.user?.role === 'admin'
        this.isStaff = res.user?.role === 'staff'

        // เก็บลง localStorage สำหรับ offline fallback
        if (res.user) {
          localStorage.setItem('userProfile', JSON.stringify(res.user))
        }
        if (res.needsProfileSetup) {
          localStorage.setItem('needsProfileSetup', 'true')
        } else {
          localStorage.removeItem('needsProfileSetup')
        }

        return this.userProfile
      } catch (error) {
        // offline / backend error → fallback ไปใช้ cache ถ้า userId ตรงกัน
        const storedProfile = localStorage.getItem('userProfile')
        if (storedProfile) {
          try {
            const parsed = JSON.parse(storedProfile)
            if (parsed.lineUserId === lineUserId) {
              this.isAuthenticated = true
              this.userProfile = parsed
              this.isAdmin = parsed.role === 'admin'
              this.isStaff = parsed.role === 'staff'
              this.needsProfileSetup = localStorage.getItem('needsProfileSetup') === 'true'
              return this.userProfile
            }
          } catch {}
        }

        // ไม่มี cache — ตั้ง needsProfileSetup ไว้ก่อน
        this.isAuthenticated = true
        this.needsProfileSetup = true
        this.isAdmin = false
        this.isStaff = false
        localStorage.setItem('needsProfileSetup', 'true')
        return this.userProfile
      }
    },

    async completeProfileSetup(profileData) {
      const res = await api.put('/me', profileData)
      this.userProfile = res.user
      this.needsProfileSetup = false
      this.isAdmin = res.user?.role === 'admin'
      this.isStaff = res.user?.role === 'staff'

      if (res.user) {
        localStorage.setItem('userProfile', JSON.stringify(res.user))
      }
      localStorage.removeItem('needsProfileSetup')

      return res.user
    },

    async loadUserFromStorage() {
      // โหลด cache ทันทีจาก localStorage (offline-first, ไม่ยิง network)
      const storedProfile = localStorage.getItem('userProfile')
      const needsSetup = localStorage.getItem('needsProfileSetup')

      if (storedProfile) {
        try {
          this.userProfile = JSON.parse(storedProfile)
          this.isAuthenticated = true
          this.isAdmin = this.userProfile.role === 'admin'
          this.isStaff = this.userProfile.role === 'staff'
          this.needsProfileSetup = needsSetup === 'true'
          return this.userProfile
        } catch {}
      }

      if (needsSetup === 'true') {
        this.needsProfileSetup = true
      }

      return null
    },

    async refreshUserProfile() {
      // ถ้าไม่มี token ก็ไม่ต้องยิง request
      if (!api.getToken()) return

      try {
        const res = await api.get('/me')
        if (res.user) {
          this.userProfile = res.user
          this.isAdmin = res.user.role === 'admin'
          this.isStaff = res.user.role === 'staff'
          this.needsProfileSetup = res.needsProfileSetup ?? false
          localStorage.setItem('userProfile', JSON.stringify(res.user))
          if (this.needsProfileSetup) {
            localStorage.setItem('needsProfileSetup', 'true')
          } else {
            localStorage.removeItem('needsProfileSetup')
          }
        }
      } catch {
        // swallow — silent like เดิม
      }
    },

    async logout() {
      // best-effort logout call ไม่ throw ถ้า backend ล้มเหลว
      try {
        await api.post('/auth/logout', {}, { auth: false })
      } catch {}

      clearTokens()

      this.user = null
      this.userProfile = null
      this.isAuthenticated = false
      this.isAdmin = false
      this.isStaff = false
      this.needsProfileSetup = false
      localStorage.removeItem('userProfile')
      localStorage.removeItem('needsProfileSetup')
    },

    isMembershipValid() {
      if (!this.userProfile?.membershipExpiry) return false

      try {
        let expiry

        if (typeof this.userProfile.membershipExpiry?.toDate === 'function') {
          expiry = this.userProfile.membershipExpiry.toDate()
        } else if (typeof this.userProfile.membershipExpiry === 'string') {
          expiry = new Date(this.userProfile.membershipExpiry)
        } else if (this.userProfile.membershipExpiry instanceof Date) {
          expiry = this.userProfile.membershipExpiry
        } else {
          return false
        }

        if (!expiry || isNaN(expiry.getTime())) return false

        return expiry > new Date()
      } catch {
        return false
      }
    },

    isCooldownActive() {
      if (!this.userProfile?.cooldownUntil) return false
      try {
        const cooldown = typeof this.userProfile.cooldownUntil?.toDate === 'function'
          ? this.userProfile.cooldownUntil.toDate()
          : new Date(this.userProfile.cooldownUntil)
        if (isNaN(cooldown.getTime())) return false
        return cooldown > new Date()
      } catch {
        return false
      }
    },

    getCooldownEndDate() {
      if (!this.userProfile?.cooldownUntil) return null
      try {
        const cooldown = typeof this.userProfile.cooldownUntil?.toDate === 'function'
          ? this.userProfile.cooldownUntil.toDate()
          : new Date(this.userProfile.cooldownUntil)
        if (isNaN(cooldown.getTime())) return null
        return cooldown
      } catch {
        return null
      }
    }
  }
})

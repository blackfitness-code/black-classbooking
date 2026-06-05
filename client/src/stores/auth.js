import { defineStore } from 'pinia'
import { db } from '../firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    userProfile: null,
    isAuthenticated: false,
    isAdmin: false,
    needsProfileSetup: false
  }),

  actions: {
    // DEV: force the mock test user to Platinum + far-future expiry for design/demo
    applyDevMock() {
      if (!this.userProfile) return
      const id = this.userProfile.lineUserId || this.userProfile.id
      if (id === 'U1234567890abcdef1234567890abcdef') {
        this.userProfile.memberType = 'platinum'
        this.userProfile.membershipExpiry = new Date('2030-01-01')
      }
    },

    async signInWithLineUserId(lineUserId, displayName, pictureUrl) {
      this.isAuthenticated = true
      this.userProfile = { lineUserId, displayName, pictureUrl }

      try {
        const userDoc = await getDoc(doc(db, 'users', lineUserId))

        if (!userDoc.exists()) {
          this.needsProfileSetup = true
          this.isAdmin = false
          localStorage.setItem('needsProfileSetup', 'true')
          localStorage.removeItem('userProfile')
        } else {
          const userData = userDoc.data()

          if (userData.membershipExpiry?.toDate) {
            userData.membershipExpiry = userData.membershipExpiry.toDate()
          }

          this.userProfile = { id: userDoc.id, ...userData, lineUserId, displayName, pictureUrl }
          this.isAdmin = userData.role === 'admin'
          this.needsProfileSetup = false

          this.applyDevMock()

          localStorage.setItem('userProfile', JSON.stringify(this.userProfile))
          localStorage.removeItem('needsProfileSetup')

          // Sync profile picture inline (reuse userData already fetched — no extra read)
          const cleanNew = pictureUrl?.split('?')[0]
          const cleanDb = userData.pictureUrl?.split('?')[0]
          if (cleanNew && cleanNew !== cleanDb) {
            updateDoc(doc(db, 'users', lineUserId), { pictureUrl, updatedAt: new Date() })
              .then(() => {
                this.userProfile.pictureUrl = pictureUrl
                localStorage.setItem('userProfile', JSON.stringify(this.userProfile))
              })
              .catch(() => {})
          }
        }

        return this.userProfile
      } catch (error) {
        const storedProfile = localStorage.getItem('userProfile')
        if (storedProfile) {
          try {
            const parsed = JSON.parse(storedProfile)
            if (parsed.lineUserId === lineUserId) {
              this.userProfile = parsed
              this.isAdmin = parsed.role === 'admin'
              this.needsProfileSetup = false
              return this.userProfile
            }
          } catch {}
        }

        this.needsProfileSetup = true
        this.isAdmin = false
        localStorage.setItem('needsProfileSetup', 'true')
        return this.userProfile
      }
    },

    async completeProfileSetup(profileData) {
      if (!this.userProfile?.lineUserId) throw new Error('No user profile found')

      const completeProfile = {
        ...this.userProfile,
        ...profileData,
        profileCompleted: true,
        updatedAt: new Date()
      }

      await setDoc(doc(db, 'users', this.userProfile.lineUserId), completeProfile)

      this.userProfile = completeProfile
      this.needsProfileSetup = false
      localStorage.setItem('userProfile', JSON.stringify(completeProfile))
      localStorage.removeItem('needsProfileSetup')

      return completeProfile
    },

    async loadUserFromStorage() {
      const storedProfile = localStorage.getItem('userProfile')
      const needsSetup = localStorage.getItem('needsProfileSetup')

      if (storedProfile) {
        try {
          this.userProfile = JSON.parse(storedProfile)
          this.isAuthenticated = true
          this.isAdmin = this.userProfile.role === 'admin'
          this.needsProfileSetup = needsSetup === 'true'
          this.applyDevMock()
          return this.userProfile
        } catch {}
      }

      if (needsSetup === 'true') {
        this.needsProfileSetup = true
      }

      return null
    },

    async refreshUserProfile() {
      if (!this.userProfile?.lineUserId) return

      try {
        const userDoc = await getDoc(doc(db, 'users', this.userProfile.lineUserId))
        if (userDoc.exists()) {
          const freshData = { id: userDoc.id, ...userDoc.data() }
          if (JSON.stringify(this.userProfile) !== JSON.stringify(freshData)) {
            this.userProfile = freshData
            this.isAdmin = freshData.role === 'admin'
            localStorage.setItem('userProfile', JSON.stringify(freshData))
          }
        }
      } catch {}
    },

    logout() {
      this.user = null
      this.userProfile = null
      this.isAuthenticated = false
      this.isAdmin = false
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

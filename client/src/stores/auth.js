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
    async signInWithLineUserId(lineUserId, displayName, pictureUrl) {
      console.log('🔍 Checking user:', lineUserId)
      
      // Set basic authentication
      this.isAuthenticated = true
      this.userProfile = {
        lineUserId,
        displayName,
        pictureUrl
      }
      
      try {
        // Try to check database directly (without Firebase Auth)
        console.log('🔍 Checking database for user...')
        const userDoc = await getDoc(doc(db, 'users', lineUserId))
        
        if (!userDoc.exists()) {
          // User not found in DB - needs profile setup
          console.log('❌ User not found in DB - needs profile setup')
          this.needsProfileSetup = true
          this.isAdmin = false
          localStorage.setItem('needsProfileSetup', 'true')
          localStorage.removeItem('userProfile')
        } else {
          // User exists - load profile data
          console.log('✅ User found in DB - loading profile')
          const userData = userDoc.data()
          
          // Convert Firestore Timestamp to Date if needed
          if (userData.membershipExpiry && userData.membershipExpiry.toDate) {
            userData.membershipExpiry = userData.membershipExpiry.toDate()
          }
          
          this.userProfile = { 
            id: userDoc.id, 
            ...userData,
            lineUserId,
            displayName,
            pictureUrl
          }
          this.isAdmin = userData.role === 'admin'
          this.needsProfileSetup = false
          
          console.log('📋 User profile loaded:', {
            userId: this.userProfile.lineUserId,
            membershipExpiry: this.userProfile.membershipExpiry,
            role: this.userProfile.role
          })
          
          // Save to localStorage
          localStorage.setItem('userProfile', JSON.stringify(this.userProfile))
          localStorage.removeItem('needsProfileSetup')
          
          // Sync profile picture if user exists in DB
          if (!this.needsProfileSetup) {
            await this.syncProfilePicture(pictureUrl)
          }
        }
        
        return this.userProfile
        
      } catch (error) {
        console.error('🚨 Database error:', error)
        
        // Fallback: check localStorage for existing user
        const storedProfile = localStorage.getItem('userProfile')
        if (storedProfile) {
          try {
            const parsed = JSON.parse(storedProfile)
            if (parsed.lineUserId === lineUserId) {
              console.log('📱 Using stored profile as fallback')
              this.userProfile = parsed
              this.isAdmin = parsed.role === 'admin'
              this.needsProfileSetup = false
              return this.userProfile
            }
          } catch (e) {
            console.error('Failed to parse stored profile:', e)
          }
        }
        
        // No stored data - assume new user needs setup
        console.log('🆕 No stored data - assuming new user')
        this.needsProfileSetup = true
        this.isAdmin = false
        localStorage.setItem('needsProfileSetup', 'true')
        
        return this.userProfile
      }
    },

    async completeProfileSetup(profileData) {
      try {
        if (!this.userProfile?.lineUserId) {
          throw new Error('No user profile found')
        }

        const completeProfile = {
          ...this.userProfile,
          ...profileData,
          profileCompleted: true,
          updatedAt: new Date()
        }

        // Save to Firestore
        await setDoc(doc(db, 'users', this.userProfile.lineUserId), completeProfile)
        
        this.userProfile = completeProfile
        this.needsProfileSetup = false
        
        // Update localStorage
        localStorage.setItem('userProfile', JSON.stringify(completeProfile))
        localStorage.removeItem('needsProfileSetup')
        
        return completeProfile
      } catch (error) {
        console.error('Profile setup failed:', error)
        throw error
      }
    },

    async loadUserFromStorage() {
      // Load from storage as fallback while waiting for LIFF
      const storedProfile = localStorage.getItem('userProfile')
      const needsSetup = localStorage.getItem('needsProfileSetup')
      
      if (storedProfile) {
        try {
          this.userProfile = JSON.parse(storedProfile)
          this.isAuthenticated = true
          this.isAdmin = this.userProfile.role === 'admin'
          this.needsProfileSetup = needsSetup === 'true'
          return this.userProfile
        } catch (error) {
          console.error('Failed to parse stored profile:', error)
        }
      }
      
      if (needsSetup === 'true') {
        this.needsProfileSetup = true
      }
      
      return null
    },

    async refreshUserProfile() {
      try {
        if (!this.userProfile?.lineUserId) return
        
        const userDoc = await getDoc(doc(db, 'users', this.userProfile.lineUserId))
        if (userDoc.exists()) {
          const freshData = { id: userDoc.id, ...userDoc.data() }
          
          // Update if there are changes
          if (JSON.stringify(this.userProfile) !== JSON.stringify(freshData)) {
            this.userProfile = freshData
            this.isAdmin = freshData.role === 'admin'
            localStorage.setItem('userProfile', JSON.stringify(freshData))
          }
        }
      } catch (error) {
        console.error('Failed to refresh user profile:', error)
      }
    },

    async syncProfilePicture(linePictureUrl) {
      try {
        if (!this.userProfile?.lineUserId || !linePictureUrl) {
          console.log('🖼️ Cannot sync picture - missing user ID or picture URL')
          return false
        }

        console.log('🖼️ Checking if profile picture needs sync...')
        
        // Get current user data from database
        const userDoc = await getDoc(doc(db, 'users', this.userProfile.lineUserId))
        if (!userDoc.exists()) {
          console.log('🖼️ User not found in database')
          return false
        }

        const userData = userDoc.data()
        const dbPictureUrl = userData.pictureUrl

        // Remove cache busting parameters for comparison
        const cleanLinePictureUrl = linePictureUrl.split('?')[0]
        const cleanDbPictureUrl = dbPictureUrl ? dbPictureUrl.split('?')[0] : null

        console.log('🖼️ Comparing URLs:')
        console.log('  LINE:', cleanLinePictureUrl)
        console.log('  DB:', cleanDbPictureUrl)

        // If URLs are different, update database
        if (cleanLinePictureUrl !== cleanDbPictureUrl) {
          console.log('🖼️ Picture URLs differ, updating database...')
          
          await updateDoc(doc(db, 'users', this.userProfile.lineUserId), {
            pictureUrl: linePictureUrl,
            updatedAt: new Date()
          })

          // Update local profile
          this.userProfile.pictureUrl = linePictureUrl
          localStorage.setItem('userProfile', JSON.stringify(this.userProfile))
          
          console.log('🖼️ Profile picture updated successfully')
          return true
        } else {
          console.log('🖼️ Profile picture is already up to date')
          return false
        }
      } catch (error) {
        console.error('🖼️ Failed to sync profile picture:', error)
        return false
      }
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
      if (!this.userProfile?.membershipExpiry) {
        console.log('❌ No membership expiry found for user:', this.userProfile?.lineUserId)
        return false
      }
      
      try {
        let expiry
        

        
        // Handle different date formats
        if (this.userProfile.membershipExpiry && typeof this.userProfile.membershipExpiry.toDate === 'function') {
          // Firestore Timestamp

          expiry = this.userProfile.membershipExpiry.toDate()
        } else if (typeof this.userProfile.membershipExpiry === 'string') {
          // String date

          expiry = new Date(this.userProfile.membershipExpiry)
        } else if (this.userProfile.membershipExpiry instanceof Date) {
          // Already a Date object

          expiry = this.userProfile.membershipExpiry
        } else {
          console.error('❌ Unknown membershipExpiry format:', this.userProfile.membershipExpiry)
          return false
        }
        
        // Check if date is valid
        if (!expiry || isNaN(expiry.getTime())) {
          console.error('❌ Invalid expiry date:', expiry)
          return false
        }
        
        const now = new Date()
        const isValid = expiry > now
        

        
        return isValid
      } catch (error) {
        console.error('❌ Error checking membership validity:', error, this.userProfile.membershipExpiry)
        return false
      }
    }
  }
})
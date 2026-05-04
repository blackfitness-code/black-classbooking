<template>
  <div class="page-container">
    <!-- Header -->
    <header class="page-header">
      <div class="max-w-md mx-auto px-6 py-4">
        <div class="flex justify-center">
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZPBsy1d02-CXFAD0l9ju7E63p5WAlVp5xwQ&s" 
            alt="Logo" 
            class="h-10 w-10 object-cover rounded-full"
          >
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-md mx-auto px-6 py-6">
      <!-- Profile Card -->
      <div v-if="liffStore.isLoggedIn" class="card mb-6">
        <div class="flex items-center space-x-4">
          <div class="relative">
            <img 
              :src="profilePictureUrl" 
              :alt="liffStore.profile?.displayName"
              class="w-14 h-14 rounded-full object-cover"
              @error="handleImageError"
              @click="refreshProfile"
            >
            <div v-if="authStore.isMembershipValid()" class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
            <!-- Refresh indicator -->
            <button 
              @click="refreshProfile"
              class="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              title="รีเฟรชรูปโปรไฟล์"
            >
              <svg class="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
          </div>
          <div class="flex-1">
            <h2 class="font-semibold text-gray-900">
              {{ authStore.userProfile?.nickname || liffStore.profile?.displayName }}
            </h2>
            <p class="text-sm text-gray-500 mt-1">
              {{ membershipStatus }}
            </p>

          </div>
        </div>
      </div>

      <!-- Login Card -->
      <div v-if="!liffStore.isLoggedIn" class="card text-center">
        <div class="mb-6">
          <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">ยินดีต้อนรับ</h2>
          <p class="text-gray-600">เข้าสู่ระบบเพื่อจองคลาสออกกำลังกาย</p>
        </div>
        <button @click="handleLogin" class="btn-primary w-full">
          เข้าสู่ระบบด้วย LINE
        </button>
      </div>

      <!-- Profile Setup Required -->
      <div v-if="showProfileSetup" class="mt-8">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 text-center">
          <div class="mb-6">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">ยินดีต้อนรับ!</h2>
            <p class="text-gray-700 mb-4">กรุณากรอกข้อมูลเบื้องต้นเพื่อเริ่มใช้งานระบบจองคลาสออกกำลังกาย</p>
            
          </div>
          <button @click="goToProfileSetup" class="btn-primary w-full">
            เริ่มกรอกข้อมูล
          </button>
        </div>
      </div>

      <!-- Quick Actions -->
      <div v-if="showMainMenu" class="mt-8">
        <h3 class="section-title">เมนูหลัก</h3>
        
        <!-- Membership Status Banner -->
        <div v-if="!authStore.isMembershipValid()" class="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4 mb-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-medium text-orange-800">
                {{ !authStore.userProfile?.membershipExpiry ? 'ระบบกำลังตรวจสอบข้อมูล' : 'สมาชิกหมดอายุ' }}
              </p>
              <p class="text-sm text-orange-600">
                {{ !authStore.userProfile?.membershipExpiry ? '' : 'กรุณาต่ออายุสมาชิกเพื่อจองคลาส' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Menu Grid -->
        <div class="grid grid-cols-2 gap-4 animate-fade-in">
          <router-link to="/booking" class="block group">
            <div class="card hover:shadow-soft transition-all text-center bg-gradient-to-br from-white to-primary/5 border-2 border-primary/10 group-hover:border-primary/30 group-hover:scale-105">
              <div class="relative inline-block mb-3">
                <div class="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-md opacity-0 group-hover:opacity-30 transition-opacity"></div>
                <div class="relative w-14 h-14 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-7 h-7 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                </div>
              </div>
              <h3 class="font-bold text-gray-900 mb-1">จองคลาส</h3>
              <p class="text-xs text-gray-500">เลือกคลาสที่ต้องการ</p>
            </div>
          </router-link>

          <router-link to="/history" class="block group">
            <div class="card hover:shadow-soft transition-all text-center bg-gradient-to-br from-white to-blue-50/50 border-2 border-blue-100/50 group-hover:border-blue-200 group-hover:scale-105">
              <div class="relative inline-block mb-3">
                <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur-md opacity-0 group-hover:opacity-30 transition-opacity"></div>
                <div class="relative w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <h3 class="font-bold text-gray-900 mb-1">ประวัติ</h3>
              <p class="text-xs text-gray-500">ดูการจองของคุณ</p>
            </div>
          </router-link>
        </div>

        <!-- Monthly Class Schedule -->
        <div class="mt-8">
          <h3 class="section-title">ตารางคลาสรายเดือน</h3>
          <div class="card p-0 overflow-hidden">
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/blackyoga-2748c.firebasestorage.app/o/wuBa17AVf2z9s8TXU2fU9l6O-beGDt2VAS4h6i7ZZ2qYrHgsNMRnrgupAx92JCQkUwfXMTQS8DzLOIeNpwZKj8hRNuTBMYo60y7gogwll0IBEsmgGbVu13VjXRmyAlky-Y6RmCFYWj9R9NUu3GhWkQ%3D%3D.jpg?alt=media&token=970ad9ba-07e6-4ffa-9e29-877a741a865b" 
              alt="ตารางคลาสรายเดือน" 
              class="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              @click="openScheduleImage"
            >
          </div>
        </div>

        <!-- Admin Menu
        <div v-if="authStore.isAdmin" class="mt-6">
          <router-link to="/admin" class="block">
            <div class="card hover:shadow-md transition-all border-2 border-orange-100">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mr-4">
                  <svg class="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-orange-800">จัดการระบบ</h3>
                  <p class="text-sm text-orange-600">สำหรับผู้ดูแลระบบ</p>
                </div>
                <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </router-link>
        </div> -->
      </div>
    </main>
    
    <!-- Loading Overlay -->
    <LoadingOverlay 
      :show="isLoading" 
      title="กำลังโหลดข้อมูล"
      subtitle="กรุณารอสักครู่..."
    />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLiffStore } from '../stores/liff'
import { useAuthStore } from '../stores/auth'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import LoadingOverlay from '../components/LoadingOverlay.vue'

const router = useRouter()
const liffStore = useLiffStore()
const authStore = useAuthStore()

const isDev = import.meta.env.DEV

const membershipStatus = computed(() => {
  if (!authStore.userProfile?.membershipExpiry) return 'ระบบกำลังตรวจสอบข้อมูล'
  
  const expiry = new Date(authStore.userProfile.membershipExpiry)
  const isValid = expiry > new Date()
  
  if (isValid) {
    return `หมดอายุ ${format(expiry, 'dd MMM yyyy', { locale: th })}`
  } else {
    return 'หมดอายุแล้ว'
  }
})

// Computed properties
const isLoading = computed(() => {
  return !liffStore.isLiffReady || 
         (liffStore.isLiffReady && !liffStore.profile) ||
         (liffStore.profile && !authStore.isAuthenticated)
})

const showProfileSetup = computed(() => {
  // แสดงปุ่มกรอกข้อมูลถ้า:
  // 1. LIFF พร้อมแล้วและมี profile
  // 2. ต้องการ setup profile
  return liffStore.isLiffReady && 
         liffStore.profile && 
         authStore.needsProfileSetup
})

const showMainMenu = computed(() => {
  return authStore.isAuthenticated && !authStore.needsProfileSetup
})

const profilePictureUrl = computed(() => {
  return liffStore.getProfilePictureUrl() || liffStore.profile?.pictureUrl
})

const refreshProfile = async () => {
  try {
    await liffStore.refreshProfile()
  } catch (error) {
    console.error('Failed to refresh profile:', error)
  }
}

const handleImageError = (event) => {
  console.log('Image load error, attempting to refresh profile')
  refreshProfile()
}

const openScheduleImage = () => {
  // เปิดรูปในแท็บใหม่
  window.open('https://firebasestorage.googleapis.com/v0/b/blackyoga-2748c.firebasestorage.app/o/wuBa17AVf2z9s8TXU2fU9l6O-beGDt2VAS4h6i7ZZ2qYrHgsNMRnrgupAx92JCQkUwfXMTQS8DzLOIeNpwZKj8hRNuTBMYo60y7gogwll0IBEsmgGbVu13VjXRmyAlky-Y6RmCFYWj9R9NUu3GhWkQ%3D%3D.jpg?alt=media&token=970ad9ba-07e6-4ffa-9e29-877a741a865b', '_blank')
}

const handleLogin = async () => {
  await liffStore.login()
  
  // Wait for profile to be available after login
  setTimeout(async () => {
    if (liffStore.profile?.userId) {
      await authStore.signInWithLineUserId(
        liffStore.profile.userId, 
        liffStore.profile.displayName, 
        liffStore.profile.pictureUrl
      )
    }
  }, 1000)
}

// Auto refresh profile when user comes back to the page
const handleVisibilityChange = () => {
  if (!document.hidden && liffStore.isLoggedIn) {
    console.log('Page became visible, refreshing profile...')
    refreshProfile()
  }
}

const handleWindowFocus = () => {
  if (liffStore.isLoggedIn) {
    console.log('Window focused, refreshing profile...')
    refreshProfile()
  }
}

const goToProfileSetup = async () => {
  console.log('🔘 Button clicked - Going to profile setup')
  console.log('📊 State:', {
    isLiffReady: liffStore.isLiffReady,
    hasProfile: !!liffStore.profile,
    needsProfileSetup: authStore.needsProfileSetup,
    isAuthenticated: authStore.isAuthenticated
  })
  
  // ตั้งค่า isAuthenticated ถ้ายังไม่ได้ตั้ง
  if (!authStore.isAuthenticated && liffStore.profile) {
    console.log('🔐 Setting authenticated state...')
    await authStore.signInWithLineUserId(
      liffStore.profile.userId,
      liffStore.profile.displayName,
      liffStore.profile.pictureUrl
    )
  }
  
  console.log('🚀 Navigating to /profile-setup')
  router.push('/profile-setup')
}

onMounted(async () => {
  // Load from storage first for immediate display
  await authStore.loadUserFromStorage()
  
  // Add event listeners for auto refresh
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleWindowFocus)
  
  // Keep checking for LIFF profile and auto-authenticate
  const autoAuth = async () => {
    if (liffStore.isLiffReady && liffStore.profile?.userId) {
      // Check DB for fresh data and update if needed
      await authStore.signInWithLineUserId(
        liffStore.profile.userId, 
        liffStore.profile.displayName, 
        liffStore.profile.pictureUrl
      )
    } else if (!liffStore.isLiffReady || !liffStore.profile) {
      // Keep trying until LIFF is ready and has profile
      setTimeout(autoAuth, 500)
    }
  }
  
  // Start auto authentication
  autoAuth()
})

// Cleanup event listeners
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handleWindowFocus)
})
</script>
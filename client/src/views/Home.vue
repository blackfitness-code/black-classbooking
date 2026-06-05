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
            loading="lazy"
          >
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-md mx-auto px-6 py-6">

      <!-- Profile Card skeleton while loading -->
      <div v-if="isLoading" class="card mb-6">
        <div class="flex items-center space-x-4">
          <div class="skeleton w-14 h-14 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="skeleton h-4 w-2/3"></div>
            <div class="skeleton h-3 w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- Member Card -->
      <div v-else-if="liffStore.isLoggedIn">
        <MemberCard
          :display-name="authStore.userProfile?.nickname || liffStore.profile?.displayName"
          :profile-picture-url="profilePictureUrl"
          :membership-expiry="authStore.userProfile?.membershipExpiry"
          :member-type="authStore.userProfile?.memberType || 'gold'"
          :member-id="authStore.userProfile?.lineUserId || liffStore.profile?.userId"
          @image-error="handleImageError"
          @refresh="refreshProfile"
        />
      </div>

      <!-- Login Card -->
      <div v-if="!liffStore.isLoggedIn && !isLoading" class="card text-center animate-fade-in">
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
      <div v-if="showProfileSetup" class="mt-8 animate-slide-up">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 text-center">
          <div class="mb-6">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">ยินดีต้อนรับ!</h2>
            <p class="text-gray-700 mb-4">กรุณากรอกข้อมูลเบื้องต้นเพื่อเริ่มใช้งาน</p>
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
            <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3 shrink-0">
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
              src="https://firebasestorage.googleapis.com/v0/b/blackyoga-2748c.firebasestorage.app/o/85e92359-3955-43b4-ad03-2cbb03cf8723.jpg?alt=media&token=5476fd86-7316-4475-93bd-229eb3b36d30"
              alt="ตารางคลาสรายเดือน"
              class="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              loading="lazy"
              @click="openScheduleImage"
            >
          </div>
        </div>
      </div>
    </main>

    <!-- Update Notice Modal -->
    <transition name="modal">
      <div v-if="showUpdateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);">
        <div class="modal-content bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-xl">
          <div class="flex flex-col items-center pt-8 pb-5 px-6 bg-primary">
            <span class="text-6xl mb-3" style="filter: drop-shadow(0 8px 20px rgba(0,0,0,0.25));">📣</span>
            <span class="text-xs font-medium tracking-widest uppercase text-white/60 mb-1">What's New</span>
            <h2 class="text-xl font-bold text-white">มีอะไรใหม่?</h2>
          </div>

          <div class="px-6 py-5">
            <div class="flex items-center gap-4 p-4 rounded-2xl mb-5 bg-water border border-primary/20">
              <div class="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
              </div>
              <div>
                <p class="font-semibold text-dark text-sm">อัพเดตระบบจองคลาส ให้สามารถจองล่วงหน้าได้ 14 วัน</p>
              </div>
            </div>

            <label class="flex items-center gap-2 cursor-pointer select-none mb-4">
              <input v-model="dontShowAgain" type="checkbox" class="w-4 h-4 rounded accent-primary">
              <span class="text-sm text-gray-400">ไม่แสดงอีก</span>
            </label>

            <button @click="closeUpdateModal" class="btn-primary w-full py-3">
              รับทราบ
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLiffStore } from '../stores/liff'
import { useAuthStore } from '../stores/auth'

import MemberCard from '../components/MemberCard.vue'

const router = useRouter()
const liffStore = useLiffStore()
const authStore = useAuthStore()

const UPDATE_KEY = 'update_notice_v1'
const showUpdateModal = ref(false)
const dontShowAgain = ref(false)

const closeUpdateModal = () => {
  if (dontShowAgain.value) localStorage.setItem(UPDATE_KEY, 'dismissed')
  showUpdateModal.value = false
}


const isLoading = computed(() =>
  !liffStore.isLiffReady ||
  (liffStore.isLiffReady && !liffStore.profile) ||
  (liffStore.profile && !authStore.isAuthenticated)
)

const showProfileSetup = computed(() =>
  liffStore.isLiffReady && liffStore.profile && authStore.needsProfileSetup
)

const showMainMenu = computed(() =>
  authStore.isAuthenticated && !authStore.needsProfileSetup
)

const profilePictureUrl = computed(() => {
  const url = liffStore.profile?.pictureUrl
  if (!url) return null
  try {
    const u = new URL(url)
    u.searchParams.set('t', Date.now().toString())
    return u.toString()
  } catch {
    return url
  }
})

const refreshProfile = async () => {
  try { await liffStore.refreshProfile() } catch {}
}

const handleImageError = () => { refreshProfile() }

const openScheduleImage = () => {
  window.open('https://firebasestorage.googleapis.com/v0/b/blackyoga-2748c.firebasestorage.app/o/85e92359-3955-43b4-ad03-2cbb03cf8723.jpg?alt=media&token=5476fd86-7316-4475-93bd-229eb3b36d30', '_blank')
}

const handleLogin = async () => {
  await liffStore.login()
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

const goToProfileSetup = async () => {
  if (!authStore.isAuthenticated && liffStore.profile) {
    await authStore.signInWithLineUserId(
      liffStore.profile.userId,
      liffStore.profile.displayName,
      liffStore.profile.pictureUrl
    )
  }
  router.push('/profile-setup')
}

// Watch for LIFF becoming ready then auto-authenticate (replaces recursive setTimeout)
watch(
  () => liffStore.isLiffReady && liffStore.profile?.userId,
  async (ready) => {
    if (!ready) return
    await authStore.signInWithLineUserId(
      liffStore.profile.userId,
      liffStore.profile.displayName,
      liffStore.profile.pictureUrl
    )
  },
  { immediate: true }
)

onMounted(async () => {
  if (localStorage.getItem(UPDATE_KEY) !== 'dismissed') {
    showUpdateModal.value = true
  }
  await authStore.loadUserFromStorage()
})
</script>

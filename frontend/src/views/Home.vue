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

      <!-- Skeleton while loading (matches member card + menu) -->
      <div v-if="isLoading" class="animate-fade-in">
        <!-- member card skeleton -->
        <div class="relative overflow-hidden rounded-3xl shadow-2xl aspect-[1.586/1] mb-6 p-6 flex flex-col justify-between bg-[linear-gradient(135deg,#2b2f36_0%,#15171b_45%,#000000_100%)]">
          <div class="flex items-start justify-between">
            <div class="w-14 h-14 rounded-2xl bg-white/10 animate-pulse"></div>
            <div class="w-24 h-7 rounded-full bg-white/10 animate-pulse"></div>
          </div>
          <div class="space-y-2">
            <div class="h-6 w-1/2 bg-white/10 rounded-lg animate-pulse"></div>
            <div class="h-3 w-1/3 bg-white/10 rounded animate-pulse"></div>
          </div>
          <div class="flex items-end justify-between">
            <div class="h-7 w-20 bg-white/10 rounded animate-pulse"></div>
            <div class="h-7 w-24 bg-white/10 rounded animate-pulse"></div>
          </div>
        </div>

        <!-- upcoming class skeleton -->
        <div class="rounded-3xl bg-[linear-gradient(135deg,#2b2f36_0%,#15171b_45%,#000000_100%)] p-3 flex items-center gap-4 mb-8">
          <div class="w-12 h-16 rounded-xl bg-white/10 shrink-0 animate-pulse"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-3/4 bg-white/10 rounded animate-pulse"></div>
            <div class="h-3 w-1/3 bg-white/10 rounded animate-pulse"></div>
          </div>
          <div class="w-20 h-12 rounded-2xl bg-white/10 shrink-0 animate-pulse"></div>
        </div>

        <!-- menu skeleton -->
        <div class="h-5 w-24 skeleton rounded mb-4"></div>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="n in 2" :key="n" class="card flex flex-col items-center justify-center gap-3 py-7">
            <div class="w-14 h-14 rounded-2xl skeleton"></div>
            <div class="h-3 w-16 skeleton rounded"></div>
          </div>
        </div>
      </div>

      <!-- Member Card -->
      <div v-else-if="liffStore.isLoggedIn">
        <MemberCard
          :display-name="authStore.userProfile?.nickname || liffStore.profile?.displayName"
          :full-name="memberFullName"
          :profile-picture-url="profilePictureUrl"
          :membership-expiry="authStore.userProfile?.membershipExpiry"
          :member-type="authStore.userProfile?.memberType || ''"
          :member-id="authStore.userProfile?.lineUserId || liffStore.profile?.userId"
          @image-error="handleImageError"
          @refresh="refreshProfile"
        />
      </div>

      <!-- Login Card -->
      <div v-if="!liffStore.isLoggedIn && !isLoading" class="card text-center animate-fade-in">
        <div class="mb-6">
          <!-- LINE Logo -->
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden" style="background:#06C755">
            <svg class="w-10 h-10" viewBox="0 0 24 24" fill="white">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">ยินดีต้อนรับ</h2>
          <p class="text-gray-500 text-sm">เข้าสู่ระบบเพื่อจองคลาสออกกำลังกาย</p>
        </div>

        <!-- LIFF Error State -->
        <div v-if="liffStore.initError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-left">
          <p class="text-sm font-medium text-red-700 mb-1">ไม่สามารถเชื่อมต่อ LINE ได้</p>
          <p class="text-xs text-red-500">{{ liffStore.initError }}</p>
        </div>

        <button
          @click="handleLogin"
          :disabled="!!liffStore.initError"
          class="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style="background:#06C755"
          :class="{ 'hover:brightness-90 active:scale-95': !liffStore.initError }"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="white">
            <path d="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
          เข้าสู่ระบบด้วย LINE
        </button>

        <!-- Desktop hint -->
        <p v-if="!liffStore.isInClient && !liffStore.initError" class="text-xs text-gray-400 mt-3 leading-relaxed">
          บน Desktop: กด Login แล้วกรอก Email/รหัสผ่าน LINE<br>
          หรือสแกน QR code ด้วยแอป LINE บนมือถือ
        </p>
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

      <!-- Upcoming Classes (with per-class check-in QR) -->
      <UpcomingClasses
        v-if="showMainMenu"
        :user-id="authStore.userProfile?.lineUserId || liffStore.profile?.userId"
        :limit="1"
      />

      <!-- Quick Actions -->
      <div v-if="showMainMenu" class="mt-8">
        <h3 class="section-title">เมนูหลัก</h3>

        <!-- Membership Expired Banner (เฉพาะคนมีแพ็คเกจที่หมดอายุ — pending ไม่แสดงอะไร) -->
        <div v-if="!isPending && !authStore.isMembershipValid()" class="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4 mb-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3 shrink-0">
              <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-medium text-orange-800">สมาชิกหมดอายุ</p>
              <p class="text-sm text-orange-600">กรุณาต่ออายุสมาชิกเพื่อจองคลาส</p>
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

      <!-- App version -->
      <p class="text-center text-[11px] text-gray-300 mt-10 mb-2 select-none">
        เวอร์ชัน {{ appVersion }} · {{ buildTime }}
      </p>
    </main>

    <!-- Update Notice Modal -->
    <transition name="modal">
      <div v-if="showUpdateModal" class="fixed inset-0 z-50 flex items-center justify-center p-5" style="background: rgba(0,0,0,0.4); backdrop-filter: blur(6px);">
        <div class="modal-content bg-white rounded-3xl w-full max-w-xs overflow-hidden shadow-2xl">
          <div class="px-7 pt-8 pb-7">
            <!-- Icon -->
            <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m13.95-6.95-1.4 1.4M7.45 16.55l-1.4 1.4m12.5 0-1.4-1.4M7.45 7.45l-1.4-1.4"/>
              </svg>
            </div>

            <!-- Header -->
            <span class="text-[11px] font-medium tracking-[0.2em] uppercase text-primary">อัพเดตใหม่</span>
            <h2 class="text-lg font-semibold text-dark mt-1.5 mb-4">มีอะไรใหม่?</h2>

            <!-- Content -->
            <p class="text-sm leading-relaxed text-gray-500">
              อัพเดตระบบจองคลาส ให้สามารถจองล่วงหน้าได้ 14 วัน
            </p>

            <!-- Divider -->
            <div class="h-px bg-gray-100 my-6"></div>

            <!-- Action -->
            <button @click="closeUpdateModal" class="btn-primary w-full py-3 rounded-2xl">
              รับทราบ
            </button>

            <label class="flex items-center justify-center gap-2 cursor-pointer select-none mt-4">
              <input v-model="dontShowAgain" type="checkbox" class="w-3.5 h-3.5 rounded accent-primary">
              <span class="text-xs text-gray-400">ไม่แสดงอีก</span>
            </label>
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
import UpcomingClasses from '../components/UpcomingClasses.vue'

const router = useRouter()
const liffStore = useLiffStore()
const authStore = useAuthStore()

// เวอร์ชันแอพ (inject ตอน build จาก package.json + เวลา build) — ดู vite.config.js
const appVersion = __APP_VERSION__
const buildTime = __BUILD_TIME__

const UPDATE_KEY = 'update_notice_v1'
const showUpdateModal = ref(false)
const dontShowAgain = ref(false)

const closeUpdateModal = () => {
  if (dontShowAgain.value) localStorage.setItem(UPDATE_KEY, 'dismissed')
  showUpdateModal.value = false
}


const isLoading = computed(() =>
  !liffStore.isLiffReady ||
  (liffStore.isLiffReady && liffStore.isLoggedIn && !liffStore.profile) ||
  (liffStore.isLoggedIn && liffStore.profile && !authStore.isAuthenticated)
)

const showProfileSetup = computed(() =>
  liffStore.isLiffReady && liffStore.profile && authStore.needsProfileSetup
)

const showMainMenu = computed(() =>
  authStore.isAuthenticated && !authStore.needsProfileSetup
)

const memberFullName = computed(() =>
  [authStore.userProfile?.firstName, authStore.userProfile?.lastName]
    .filter(Boolean).join(' ')
)

// pending = ยังไม่มีแพ็คเกจ (ไม่ใช่ gold/platinum)
const isPending = computed(() =>
  !['gold', 'platinum'].includes(authStore.userProfile?.memberType)
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

<template>
  <div id="app" class="min-h-screen bg-gray-100 lg:bg-[#eceff3]">
    <div class="app-shell mx-auto w-full max-w-md lg:max-w-xl min-h-screen bg-gray-50 lg:shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_8px_30px_rgba(15,23,42,0.08)] lg:ring-1 lg:ring-black/5">
      <div class="app-content-spacing">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
      <BottomNav />
      <DevTools />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useLiffStore } from './stores/liff'
import { useAuthStore } from './stores/auth'
import BottomNav from './components/BottomNav.vue'
import DevTools from './components/DevTools.vue'

const liffStore = useLiffStore()
const authStore = useAuthStore()

// Poll โปรไฟล์ตัวเองทุก 30 วิ เพื่อรับการเปลี่ยนแปลงจาก admin (สิทธิ์/แพ็คเกจ/วันหมดอายุ)
// แบบ realtime — Firestore เป็น deny-all ฟัง listener ตรงไม่ได้ จึงใช้ poll /me (อ่าน doc เดียว ถูก)
// Poll own profile every 30s to pick up admin changes; pauses while the tab is hidden.
const PROFILE_POLL_MS = 30000
let profileTimer = null

const startProfilePoll = () => {
  if (profileTimer) clearInterval(profileTimer)
  profileTimer = setInterval(() => authStore.refreshUserProfile(), PROFILE_POLL_MS)
}

const stopProfilePoll = () => {
  if (profileTimer) { clearInterval(profileTimer); profileTimer = null }
}

// กลับมา foreground → ดึงทันที + เริ่ม poll ใหม่; ซ่อนแท็บ → หยุด poll ประหยัด reads
// Foreground → refetch immediately and (re)start polling; hidden → stop polling to save reads.
const handleVisibility = () => {
  if (document.visibilityState === 'visible') {
    authStore.refreshUserProfile()
    startProfilePoll()
  } else {
    stopProfilePoll()
  }
}

const handleFocus = () => {
  authStore.refreshUserProfile()
}

onMounted(async () => {
  await liffStore.initLiff()
  document.addEventListener('visibilitychange', handleVisibility)
  window.addEventListener('focus', handleFocus)
  if (document.visibilityState === 'visible') startProfilePoll()
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibility)
  window.removeEventListener('focus', handleFocus)
  stopProfilePoll()
})
</script>

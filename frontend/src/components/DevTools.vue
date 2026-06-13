<template>
  <div v-if="isDev" class="fixed bottom-4 right-4 z-[9999] select-none">
    <!-- Collapsed: floating bubble -->
    <button
      v-if="collapsed"
      @click="collapsed = false"
      class="w-11 h-11 rounded-full bg-gray-800 text-white shadow-lg flex items-center justify-center text-lg hover:bg-gray-700"
      title="Dev Tools"
    >
      🧪
    </button>

    <!-- Expanded: panel -->
    <div v-else class="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-xs w-48">
      <div class="mb-2 flex items-center justify-between">
        <span class="font-semibold">🧪 Dev Tools</span>
        <button @click="collapsed = true" class="text-gray-400 hover:text-white px-1" title="ย่อ">✕</button>
      </div>

      <!-- current mock identity -->
      <div class="mb-2 px-2 py-1 rounded bg-gray-900/60 leading-tight">
        <div class="text-gray-400">uid</div>
        <div class="truncate font-mono">{{ currentUid || '—' }}</div>
      </div>

      <div class="space-y-1">
        <button
          @click="switchToUser"
          :class="[
            'block w-full text-left px-2 py-1 rounded',
            currentUserType === 'user' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'
          ]"
        >
          👤 User Mode
        </button>
        <button
          @click="switchToAdmin"
          :class="[
            'block w-full text-left px-2 py-1 rounded',
            currentUserType === 'admin' ? 'bg-orange-600' : 'bg-gray-600 hover:bg-gray-500'
          ]"
        >
          👑 Admin Mode
        </button>
        <button
          @click="refreshProfile"
          class="block w-full text-left px-2 py-1 rounded bg-blue-600 hover:bg-blue-500"
        >
          🔄 Refresh Profile
        </button>
        <button
          @click="createNewUser"
          class="block w-full text-left px-2 py-1 rounded bg-green-600 hover:bg-green-500"
        >
          ✨ New User
        </button>
        <button
          @click="toggleProfileSetup"
          class="block w-full text-left px-2 py-1 rounded bg-purple-600 hover:bg-purple-500"
        >
          📝 Toggle Profile Setup
        </button>
        <button
          @click="clearData"
          class="block w-full text-left px-2 py-1 rounded bg-red-600 hover:bg-red-500"
        >
          🗑️ Clear Data
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useLiffStore } from '../stores/liff'
import Swal from '../utils/dialog'

// แสดงเฉพาะตอน dev หรือเมื่อเปิด mock profile (เผื่อ preview build บนมือถือ)
const isDev = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_PROFILE === 'true'

const authStore = useAuthStore()
const liffStore = useLiffStore()

const collapsed = ref(localStorage.getItem('devToolsCollapsed') === 'true')
watch(collapsed, (v) => localStorage.setItem('devToolsCollapsed', v ? 'true' : 'false'))

const currentUserType = ref(localStorage.getItem('mockUserType') || 'user')
const currentUid = ref(liffStore.getLineUserId())

// บังคับ override role ฝั่ง client ให้ตรงกับโหมดที่เลือก (ไม่พึ่ง Firestore role)
function applyRole(type) {
  authStore.isAdmin = type === 'admin'
  if (type === 'admin') authStore.isStaff = false
}

const switchToUser = () => {
  currentUserType.value = 'user'
  localStorage.setItem('mockUserType', 'user')
  applyRole('user')
}

const switchToAdmin = () => {
  currentUserType.value = 'admin'
  localStorage.setItem('mockUserType', 'admin')
  applyRole('admin')
}

const refreshProfile = async () => {
  await authStore.refreshUserProfile()
  currentUid.value = liffStore.getLineUserId()
}

// สร้าง user ใหม่จริง ๆ ด้วยการสุ่ม mock uid (จะ trigger profile setup เพราะยังไม่มี doc)
const createNewUser = () => {
  const rand = Math.random().toString(16).slice(2).padEnd(32, '0').slice(0, 32)
  localStorage.clear()
  localStorage.setItem('mockUid', 'Udev' + rand)
  localStorage.setItem('mockName', 'Dev User ' + rand.slice(0, 4))
  window.location.reload()
}

const toggleProfileSetup = () => {
  authStore.needsProfileSetup = !authStore.needsProfileSetup
  if (authStore.needsProfileSetup) {
    localStorage.setItem('needsProfileSetup', 'true')
  } else {
    localStorage.removeItem('needsProfileSetup')
  }
}

const clearData = async () => {
  const result = await Swal.fire({
    title: 'ยืนยันการลบข้อมูล',
    text: 'คุณแน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมด?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก'
  })

  if (result.isConfirmed) {
    localStorage.clear()
    window.location.reload()
  }
}

// คงโหมด admin/user ไว้หลัง reload — รอจน auth flow ทำงานเสร็จก่อนค่อย override
watch(
  () => authStore.isAuthenticated,
  (authed) => {
    if (authed) applyRole(currentUserType.value)
  },
  { immediate: true }
)

onMounted(() => {
  currentUid.value = liffStore.getLineUserId()
})
</script>

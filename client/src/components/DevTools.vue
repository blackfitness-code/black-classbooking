<template>
  <div v-if="isDev" class="fixed bottom-4 right-4 z-50">
    <div class="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-xs">
      <div class="mb-2 font-semibold">🧪 Dev Tools</div>
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
          👤 New User
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
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import Swal from '../utils/dialog'

const isDev = import.meta.env.DEV
const authStore = useAuthStore()

const currentUserType = ref(localStorage.getItem('mockUserType') || 'user')

const refreshProfile = async () => {
  await authStore.refreshUserProfile()
}

const createNewUser = () => {
  // Clear all data and create new user
  localStorage.clear()
  // Force new user ID by clearing and reloading
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
</script>
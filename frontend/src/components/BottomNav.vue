<template>
  <nav
    v-if="!isProfileSetupPage"
    class="fixed bottom-0 inset-x-0 z-50 bottom-nav pointer-events-none"
  >
    <div class="max-w-md mx-auto bg-white border-t border-gray-200 safe-area-bottom px-2 sm:px-4 pointer-events-auto sm:rounded-t-2xl sm:shadow-[0_-4px_24px_rgba(15,23,42,0.06)]">
      <div class="flex justify-around items-center py-2 sm:py-3 min-h-[3.5rem] sm:min-h-[4rem]">
        <router-link
          to="/"
          :class="[
            'flex flex-col items-center py-2 px-2 sm:px-3 rounded-lg transition-all min-w-0 flex-1',
            $route.name === 'Home' 
              ? 'text-primary' 
              : 'text-gray-400 hover:text-gray-600'
          ]"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span class="text-xs font-medium truncate">หน้าแรก</span>
        </router-link>

        <router-link
          v-if="authStore.isAuthenticated && !authStore.needsProfileSetup"
          to="/booking"
          :class="[
            'flex flex-col items-center py-2 px-2 sm:px-3 rounded-lg transition-all min-w-0 flex-1',
            $route.name === 'Booking' 
              ? 'text-primary' 
              : 'text-gray-400 hover:text-gray-600'
          ]"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
          <span class="text-xs font-medium truncate">จองคลาส</span>
        </router-link>

        <router-link
          v-if="authStore.isAuthenticated && !authStore.needsProfileSetup"
          to="/history"
          :class="[
            'flex flex-col items-center py-2 px-2 sm:px-3 rounded-lg transition-all min-w-0 flex-1',
            $route.name === 'History' 
              ? 'text-primary' 
              : 'text-gray-400 hover:text-gray-600'
          ]"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z"/>
          </svg>
          <span class="text-xs font-medium truncate">ประวัติ</span>
        </router-link>

        <router-link
          v-if="authStore.canAccessAdmin"
          to="/admin"
          :class="[
            'flex flex-col items-center py-2 px-2 sm:px-3 rounded-lg transition-all min-w-0 flex-1',
            $route.name === 'Admin' 
              ? 'text-primary' 
              : 'text-gray-400 hover:text-gray-600'
          ]"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
          </svg>
          <span class="text-xs font-medium truncate">จัดการ</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const authStore = useAuthStore()

// Hide navigation on standalone pages (profile setup, shared member card)
const isProfileSetupPage = computed(() => {
  return route.name === 'ProfileSetup' || route.name === 'PhoneLookup' || route.name === 'MemberCardView'
})
</script>
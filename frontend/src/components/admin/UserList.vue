<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-lg font-bold text-gray-900">จัดการสมาชิก</h2>
        <p class="text-xs text-gray-400">{{ users.length }} คน</p>
      </div>
      <input v-model="searchQuery" type="text" placeholder="ค้นหา..." class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary">
    </div>

    <!-- filter chips -->
    <div class="flex gap-2 mb-3 flex-wrap">
      <button
        @click="filterMode = filterMode === 'no-package' ? '' : 'no-package'"
        :class="filterMode === 'no-package'
          ? 'bg-orange-500 text-white'
          : 'bg-white text-gray-600 border border-gray-200'"
        class="px-3 py-1 rounded-full text-xs font-semibold transition-colors"
      >
        มีวันหมด / ไม่มี package
        <span v-if="noPackageCount" class="ml-1 opacity-80">({{ noPackageCount }})</span>
      </button>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="bg-white rounded-2xl p-4 border border-gray-100">
        <div class="h-5 w-2/3 bg-gray-100 rounded animate-pulse"></div>
      </div>
    </div>

    <div v-else class="space-y-2">
      <div v-for="user in filteredUsers" :key="user.id" class="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
        <div class="flex items-center gap-3">
          <img :src="user.pictureUrl" alt="" class="w-10 h-10 rounded-full" v-if="user.pictureUrl">
          <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center" v-else>
            <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 text-sm">{{ user.nickname || user.displayName }}</p>
            <p class="text-xs text-gray-400">{{ user.firstName }} {{ user.lastName }}</p>
          </div>
          <div class="text-right shrink-0">
            <span v-if="user.role === 'admin'" class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">Admin</span>
            <span v-else-if="user.role === 'staff'" class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">Staff</span>
<p :class="['text-xs font-medium', isExpired(user.membershipExpiry) ? 'text-red-600' : 'text-emerald-600']">
              {{ formatExpiry(user.membershipExpiry) }}
            </p>
          </div>
          <button @click="$emit('edit-user', user)" class="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  users: Array,
  loading: Boolean
})

defineEmits(['edit-user'])

const searchQuery = ref('')
const filterMode = ref('')

const hasExpiryNoPackage = (u) =>
  !!u.membershipExpiry && !u.memberType && u.role !== 'admin' && u.role !== 'staff'

const noPackageCount = computed(() => props.users?.filter(hasExpiryNoPackage).length ?? 0)

const filteredUsers = computed(() => {
  let list = props.users ?? []
  if (filterMode.value === 'no-package') {
    list = list.filter(hasExpiryNoPackage)
  }
  if (!searchQuery.value) return list
  const q = searchQuery.value.toLowerCase()
  return list.filter(u =>
    u.nickname?.toLowerCase().includes(q) ||
    u.displayName?.toLowerCase().includes(q) ||
    u.firstName?.toLowerCase().includes(q) ||
    u.lastName?.toLowerCase().includes(q)
  )
})

const isExpired = (expiry) => {
  if (!expiry) return true
  const date = expiry.toDate ? expiry.toDate() : new Date(expiry)
  return date < new Date()
}

const formatExpiry = (expiry) => {
  if (!expiry) return 'ไม่มีข้อมูล'
  const date = expiry.toDate ? expiry.toDate() : new Date(expiry)
  return isExpired(expiry) ? 'หมดอายุ' : date.toLocaleDateString('th-TH')
}
</script>

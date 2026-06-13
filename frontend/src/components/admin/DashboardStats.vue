<template>
  <div>
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <p class="text-3xl font-bold text-gray-900">{{ classes.length }}</p>
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">คลาสทั้งหมด</p>
        <p class="text-xs text-emerald-600 mt-1.5">{{ upcomingClassesCount }} กำลังจะมา</p>
      </div>
      <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <p class="text-3xl font-bold text-gray-900">{{ users.length }}</p>
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">สมาชิกทั้งหมด</p>
        <p class="text-xs text-emerald-600 mt-1.5">{{ activeMembers }} ใช้งานได้</p>
      </div>
      <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <p class="text-3xl font-bold text-emerald-600">{{ bookingStats.confirmed }}</p>
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">การจองที่ยืนยัน</p>
      </div>
      <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <p class="text-3xl font-bold text-blue-600">{{ todayBookingsCount }}</p>
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">การจองวันนี้</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mt-4">
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">ทำรายการด่วน</p>
      <div class="grid grid-cols-2 gap-2">
        <button @click="$emit('add-class')" class="flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          เพิ่มคลาส
        </button>
        <button @click="$emit('view-users')" class="flex items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          จัดการสมาชิก
        </button>
        <button @click="$emit('export-csv')" class="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Export CSV
        </button>
        <button @click="$emit('view-class-types')" class="flex items-center gap-2 p-3 bg-violet-50 text-violet-600 rounded-xl text-sm font-semibold hover:bg-violet-100 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
          ประเภทคลาส
        </button>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-4">
      <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <p class="font-semibold text-gray-900">คลาสวันนี้</p>
        <button @click="$emit('view-all-classes')" class="text-xs text-primary font-semibold">ดูทั้งหมด →</button>
      </div>
      <div v-if="todayClasses.length === 0" class="px-4 py-8 text-center text-sm text-gray-400">ไม่มีคลาสวันนี้</div>
      <div v-else class="divide-y divide-gray-50">
        <div v-for="cls in todayClasses" :key="cls.id" class="px-4 py-3 flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path :d="cls.iconPath"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate">{{ cls.name }}</p>
            <p class="text-xs text-gray-400">{{ cls.time }} · {{ cls.instructor }}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-sm font-bold text-gray-900">{{ cls.currentBookings }}<span class="text-gray-300 font-normal">/{{ cls.maxCapacity }}</span></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  classes: Array,
  users: Array,
  bookingStats: Object,
  todayClasses: Array,
  upcomingClassesCount: Number,
  activeMembers: Number,
  todayBookingsCount: Number
})

defineEmits(['add-class', 'view-users', 'export-csv', 'view-class-types', 'view-all-classes'])
</script>

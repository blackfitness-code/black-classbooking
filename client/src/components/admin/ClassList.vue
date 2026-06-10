<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-lg font-bold text-gray-900">จัดการคลาส</h2>
        <p class="text-xs text-gray-400">{{ classes.length }} คลาส</p>
      </div>
      <button @click="$emit('add-class')" class="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        เพิ่มคลาส
      </button>
    </div>

    <div class="flex items-center gap-2 mb-4">
      <input v-model="localDateFilter" @input="$emit('update:dateFilter', localDateFilter)" type="date" class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white">
      <button v-if="localDateFilter" @click="clearFilter" class="px-3 py-2 text-sm bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap">
        ล้าง
      </button>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div class="h-5 w-3/4 bg-gray-100 rounded animate-pulse mb-2"></div>
        <div class="h-4 w-1/2 bg-gray-100 rounded animate-pulse"></div>
      </div>
    </div>

    <div v-else-if="classes.length === 0" class="text-center py-12">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <p class="text-gray-500">ไม่มีคลาส</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="cls in classes" :key="cls.id" class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path :d="cls.iconPath"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ cls.name }}</h3>
              <p class="text-sm text-gray-500">{{ cls.instructor }}</p>
            </div>
          </div>
          <button @click="$emit('delete-class', cls.id)" class="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-4 text-gray-500">
            <span>📅 {{ formatDate(cls.date) }}</span>
            <span>🕐 {{ cls.time }}</span>
          </div>
          <div class="text-right">
            <span class="font-bold text-gray-900">{{ cls.currentBookings }}</span>
            <span class="text-gray-400">/{{ cls.maxCapacity }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  classes: Array,
  loading: Boolean,
  dateFilter: String
})

const emit = defineEmits(['add-class', 'delete-class', 'update:dateFilter'])

const localDateFilter = ref(props.dateFilter)

watch(() => props.dateFilter, (val) => {
  localDateFilter.value = val
})

const clearFilter = () => {
  localDateFilter.value = ''
  emit('update:dateFilter', '')
}

const formatDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}
</script>

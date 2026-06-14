<template>
  <div class="card h-full flex flex-col min-h-0">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 shrink-0">
      <div class="flex items-center gap-2">
        <span class="text-base font-semibold text-gray-900">สมาชิกใหม่ล่าสุด</span>
        <!-- live indicator -->
        <span class="flex items-center gap-1 text-xs text-green-600 font-medium">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          LIVE
        </span>
      </div>
      <span class="text-xs text-gray-400">ทุก 5 วินาที</span>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto space-y-2 min-h-0 pr-1">
      <!-- Loading skeleton -->
      <template v-if="loading && incomingList.length === 0">
        <div v-for="i in 4" :key="i" class="h-14 rounded-lg skeleton"></div>
      </template>

      <!-- Empty -->
      <div
        v-else-if="incomingList.length === 0"
        class="flex flex-col items-center justify-center h-32 text-gray-400 text-sm gap-1"
      >
        <span class="text-2xl">📭</span>
        <span>ยังไม่มีสมาชิกใหม่</span>
      </div>

      <!-- Items -->
      <div
        v-else
        v-for="u in incomingList"
        :key="u.id"
        :class="['flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 transition-colors', u._isNew ? 'row-flash' : '']"
      >
        <!-- Avatar placeholder -->
        <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold text-sm">
          {{ displayInitial(u) }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ displayName(u) }}</p>
          <p class="text-xs text-gray-400">{{ relativeTime(u.createdAt) }}</p>
        </div>
        <span :class="memberTypeBadgeClass(u.memberType)">{{ memberTypeLabel(u.memberType) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  incomingList: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

function displayName(u) {
  return u.nickname || u.displayName || u.firstName || u.lineUserId || '—'
}

function displayInitial(u) {
  const n = displayName(u)
  return n.charAt(0).toUpperCase()
}

function memberTypeLabel(t) {
  if (t === 'gold') return 'Gold'
  if (t === 'platinum') return 'Platinum'
  return 'ทั่วไป'
}

function memberTypeBadgeClass(t) {
  if (t === 'gold') return 'badge-gold'
  if (t === 'platinum') return 'badge-platinum'
  return 'badge-none'
}

function relativeTime(isoStr) {
  if (!isoStr) return '—'
  const diff = Date.now() - new Date(isoStr).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s} วินาทีที่แล้ว`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} นาทีที่แล้ว`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`
  const d = Math.floor(h / 24)
  return `${d} วันที่แล้ว`
}
</script>

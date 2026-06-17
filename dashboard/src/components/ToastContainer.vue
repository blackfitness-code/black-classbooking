<template>
  <div class="fixed top-4 right-4 z-toast flex flex-col gap-2 pointer-events-none max-w-sm">
    <transition-group name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        role="status"
        class="pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-lg shadow-dropdown text-sm font-medium border"
        :class="toastClass(t.type)"
      >
        <svg v-if="t.type === 'success'" class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <svg v-else-if="t.type === 'error'" class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        <span>{{ t.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

function toastClass(type) {
  if (type === 'error') return 'bg-red-50 text-red-900 border-red-200'
  if (type === 'warning') return 'bg-amber-50 text-amber-900 border-amber-200'
  return 'bg-surface-raised text-ink border-line shadow-panel'
}

function show(message, type = 'success', duration = 3200) {
  const id = ++nextId
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, duration)
}

defineExpose({ show })
</script>

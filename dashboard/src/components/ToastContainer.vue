<template>
  <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
    <transition-group name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm"
        :class="t.type === 'error'
          ? 'bg-red-600 text-white'
          : t.type === 'warning'
          ? 'bg-yellow-500 text-white'
          : 'bg-gray-900 text-white'"
      >
        <span v-if="t.type === 'success'">✓</span>
        <span v-else-if="t.type === 'error'">✕</span>
        <span v-else-if="t.type === 'warning'">⚠</span>
        <span>{{ t.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

/** แสดง toast — เรียกจากภายนอกผ่าน expose */
function show(message, type = 'success', duration = 3000) {
  const id = ++nextId
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, duration)
}

defineExpose({ show })
</script>

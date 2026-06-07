<template>
  <div class="mb-6 animate-fade-in">
    <!-- ════════════ OLD : simple profile card ════════════ -->
    <div class="card">
      <div class="flex items-center space-x-4">
        <div class="relative">
          <img
            v-if="profilePictureUrl"
            :src="profilePictureUrl"
            :alt="displayName"
            class="w-14 h-14 rounded-full object-cover"
            loading="lazy"
            @error="$emit('image-error')"
          >
          <div
            v-else
            class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <svg class="w-7 h-7 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
          <div v-if="isValid" class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
          <button
            @click="$emit('refresh')"
            class="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="รีเฟรชรูปโปรไฟล์"
          >
            <svg class="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>
        <div class="flex-1">
          <h2 class="font-semibold text-gray-900">{{ displayName }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ membershipStatus }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const props = defineProps({
  displayName: String,
  profilePictureUrl: String,
  membershipExpiry: [Date, String, Object],
  memberType: { type: String, default: 'gold' }, // 'gold' | 'platinum'
  memberId: String
})

defineEmits(['image-error', 'refresh'])

// ─── Membership data ──────────────────────────────────────────
function parseExpiry(v) {
  if (!v) return null
  try {
    let d = v
    if (typeof d?.toDate === 'function') d = d.toDate()
    else d = new Date(d)
    return isNaN(d.getTime()) ? null : d
  } catch { return null }
}
const expiryDate = computed(() => parseExpiry(props.membershipExpiry))
const isValid = computed(() => !!expiryDate.value && expiryDate.value > new Date())
const expiryLine = computed(() =>
  expiryDate.value ? format(expiryDate.value, 'dd MMM yyyy', { locale: th }) : 'ไม่มีข้อมูล'
)
const membershipStatus = computed(() => {
  if (!expiryDate.value) return 'ระบบกำลังตรวจสอบข้อมูล'
  return isValid.value ? `หมดอายุ ${expiryLine.value}` : 'หมดอายุแล้ว'
})
</script>

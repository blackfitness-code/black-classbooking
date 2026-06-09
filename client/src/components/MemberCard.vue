<template>
  <div class="mb-6 animate-fade-in">
    <!-- ════════════ MODERN : dark glass card ════════════ -->
    <div :class="modernBg" class="relative overflow-hidden rounded-3xl shadow-2xl aspect-[1.586/1]">
      <!-- glow accent -->
      <div :class="modernGlow" class="absolute -top-16 -right-10 w-56 h-56 rounded-full blur-3xl opacity-40"></div>
      <div class="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 blur-2xl"></div>
      <!-- mesh dots -->
      <svg class="absolute inset-0 w-full h-full opacity-[0.07]">
        <defs>
          <pattern id="cc-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="white"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cc-dots)"/>
      </svg>
      <!-- logo watermark -->
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZPBsy1d02-CXFAD0l9ju7E63p5WAlVp5xwQ&s"
        alt=""
        aria-hidden="true"
        class="absolute -right-6 -bottom-6 w-44 h-44 object-cover rounded-full opacity-[0.06] grayscale pointer-events-none select-none"
      >

      <div class="relative h-full p-6 flex flex-col" :class="hasPackage ? 'justify-between' : 'gap-4'">
        <!-- top: photo (left) + tier chip (right) -->
        <div class="flex items-start justify-between">
          <div class="relative shrink-0">
            <img
              v-if="profilePictureUrl"
              :src="profilePictureUrl"
              :alt="displayName"
              class="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/10"
              @error="$emit('image-error')"
            >
            <div v-else class="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center ring-2 ring-white/10">
              <svg class="w-7 h-7 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
            </div>
            <div v-if="hasPackage && isValid" class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-gray-900"></div>
          </div>
          <span v-if="hasPackage" :class="modernTierChip">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 4L12 4l3.5 5L21 5l-2 11H5zm0 2h14v2H5v-2z"/></svg>
            {{ tierLabel }}
          </span>
        </div>

        <!-- name block (below photo) -->
        <div class="min-w-0">
          <h2 class="text-white text-2xl font-extrabold leading-none tracking-tight truncate">{{ displayName }}</h2>
          <p v-if="fullName" class="text-white/50 text-sm font-light leading-tight truncate mt-1.5">{{ fullName }}</p>
        </div>

        <!-- bottom (เฉพาะคนที่มีแพ็คเกจ) -->
        <div v-if="hasPackage" class="flex items-end justify-between">
          <div>
            <p class="text-gray-500 text-[10px] tracking-wider uppercase mb-1">สถานะ</p>
            <div class="flex items-center gap-1.5">
              <span :class="['w-1.5 h-1.5 rounded-full', isValid ? 'bg-green-400' : 'bg-red-400']"></span>
              <p :class="['text-sm font-semibold', isValid ? 'text-green-400' : 'text-red-400']">{{ isValid ? 'Active' : 'Expired' }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-gray-500 text-[10px] tracking-wider uppercase mb-1">หมดอายุ</p>
            <p class="text-white text-sm font-semibold">{{ expiryLine }}</p>
          </div>
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
  fullName: String, // ชื่อจริง (firstName lastName) — แสดงบางๆ ใต้ชื่อเล่น
  profilePictureUrl: String,
  membershipExpiry: [Date, String, Object],
  memberType: { type: String, default: '' }, // '' = ยังไม่มีแพ็คเกจ | 'gold' | 'platinum'
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

// ─── Tier styling ─────────────────────────────────────────────
const hasPackage = computed(() => ['gold', 'platinum'].includes(props.memberType))
const isGold = computed(() => props.memberType === 'gold')
const tierLabel = computed(() => props.memberType === 'platinum' ? 'PLATINUM' : 'GOLD')
// พื้นหลังการ์ดเปลี่ยนตามระดับสมาชิก (GOLD = โทนทอง, อื่นๆ = โทนดำ)
const modernBg = computed(() => isGold.value
  ? 'bg-[linear-gradient(135deg,#6e5a20_0%,#2c2512_45%,#000000_100%)]'
  : 'bg-[linear-gradient(135deg,#2b2f36_0%,#15171b_45%,#000000_100%)]'
)
const modernGlow = computed(() => isGold.value ? 'bg-amber-500' : 'bg-slate-300')
const modernTierChip = computed(() => [
  'inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full tracking-widest shadow-md',
  isGold.value
    ? 'text-amber-950 bg-amber-400'
    : 'text-slate-800 bg-slate-100'
])
</script>

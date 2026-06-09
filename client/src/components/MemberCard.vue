<template>
  <div class="mb-6 animate-fade-in">
    <!-- ════════════ MEMBER CARD (tier-aware) ════════════ -->
    <div :class="cfg.card" class="relative overflow-hidden rounded-3xl shadow-2xl aspect-[1.586/1]">
      <!-- glow accent -->
      <div :class="cfg.glow" class="absolute -top-16 -right-10 w-56 h-56 rounded-full blur-3xl opacity-40"></div>
      <!-- top sheen -->
      <div :class="cfg.sheen" class="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b to-transparent pointer-events-none"></div>
      <!-- mesh dots -->
      <svg class="absolute inset-0 w-full h-full" :class="cfg.dots">
        <defs>
          <pattern id="cc-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" :fill="cfg.dotFill"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cc-dots)"/>
      </svg>
      <!-- logo watermark -->
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZPBsy1d02-CXFAD0l9ju7E63p5WAlVp5xwQ&s"
        alt=""
        aria-hidden="true"
        :class="cfg.watermark"
        class="absolute -right-6 -bottom-6 w-44 h-44 object-cover rounded-full grayscale pointer-events-none select-none"
      >

      <!-- shine sweep (วับๆ วิบๆ) -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
        <div class="card-shine" :class="isPending ? 'opacity-40' : 'opacity-100'"></div>
      </div>

      <div class="relative h-full p-6 flex flex-col justify-between">
        <!-- top: photo (left) + tier pill (right) -->
        <div class="flex items-start justify-between">
          <div class="relative shrink-0">
            <img
              v-if="profilePictureUrl"
              :src="profilePictureUrl"
              :alt="displayName"
              class="w-14 h-14 rounded-2xl object-cover ring-2"
              :class="cfg.avatarRing"
              @error="$emit('image-error')"
            >
            <div v-else class="w-14 h-14 rounded-2xl flex items-center justify-center ring-2" :class="[cfg.avatarBg, cfg.avatarRing]">
              <svg class="w-7 h-7" :class="cfg.avatarIcon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
            </div>
            <div v-if="!isPending && isValid" class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-black/30"></div>
            <div v-else-if="isPending" class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gray-300 rounded-full border-2 border-white"></div>
          </div>

          <!-- tier pills -->
          <span v-if="isPending" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-gray-600 text-[11px] font-bold tracking-widest shadow-sm border border-gray-200">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 2h12M6 22h12M7 2v4.2a4 4 0 002 3.46L12 12l-3 2.34A4 4 0 007 17.8V22M17 2v4.2a4 4 0 01-2 3.46L12 12l3 2.34A4 4 0 0117 17.8V22"/></svg>
            PENDING
          </span>
          <span v-else-if="tier === 'gold'" class="relative overflow-hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 text-amber-900 text-[11px] font-bold tracking-widest shadow-md">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 4L12 4l3.5 5L21 5l-2 11H5zm0 2h14v2H5v-2z"/></svg>
            GOLD
            <span class="pill-shine"></span>
          </span>
          <span v-else class="relative overflow-hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-b from-gray-100 to-gray-300 text-gray-700 text-[11px] font-bold tracking-widest shadow-md">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 4L12 4l3.5 5L21 5l-2 11H5zm0 2h14v2H5v-2z"/></svg>
            PLATINUM
            <span class="pill-shine"></span>
          </span>
        </div>

        <!-- name block -->
        <div class="min-w-0">
          <h2 :class="cfg.name" class="text-2xl font-extrabold leading-none tracking-tight truncate">{{ displayName }}</h2>
          <p v-if="fullName" :class="cfg.sub" class="text-sm font-light leading-tight truncate mt-1.5">{{ fullName }}</p>
        </div>

        <!-- bottom: status + expiry -->
        <div class="flex items-end justify-between">
          <div>
            <p :class="cfg.label" class="text-[10px] tracking-wider uppercase mb-1">สถานะ</p>
            <div class="flex items-center gap-1.5">
              <span :class="statusDot" class="w-1.5 h-1.5 rounded-full"></span>
              <p :class="statusTextClass" class="text-sm font-semibold">{{ statusLabel }}</p>
            </div>
          </div>
          <div v-if="!isPending" class="text-right">
            <p :class="cfg.label" class="text-[10px] tracking-wider uppercase mb-1">หมดอายุ</p>
            <p :class="cfg.name" class="text-sm font-semibold">{{ expiryLine }}</p>
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
  fullName: String, // ชื่อจริง (firstName lastName)
  profilePictureUrl: String,
  membershipExpiry: [Date, String, Object],
  memberType: { type: String, default: '' }, // '' = pending | 'gold' | 'platinum'
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

// ─── Tier ─────────────────────────────────────────────────────
const tier = computed(() => {
  if (props.memberType === 'gold') return 'gold'
  if (props.memberType === 'platinum') return 'platinum'
  return 'pending'
})
const isPending = computed(() => tier.value === 'pending')

// สถานะ
const statusLabel = computed(() =>
  isPending.value ? 'ระบบกำลังตรวจสอบข้อมูล' : (isValid.value ? 'Active' : 'Expired')
)
const statusDot = computed(() =>
  isPending.value ? 'bg-gray-400' : (isValid.value ? 'bg-green-400' : 'bg-red-400')
)
const statusTextClass = computed(() =>
  isPending.value ? 'text-gray-500' : (isValid.value ? 'text-green-400' : 'text-red-400')
)

// สไตล์ตามระดับ
const cfg = computed(() => {
  switch (tier.value) {
    case 'gold':
      return {
        card: 'bg-[linear-gradient(135deg,#dcc063_0%,#a07e2e_45%,#6f5519_100%)] ring-1 ring-amber-200/50',
        name: 'text-white', sub: 'text-white/60', label: 'text-white/45',
        glow: 'bg-amber-200', dots: 'opacity-[0.10]', dotFill: 'white', sheen: 'from-white/25',
        watermark: 'opacity-[0.10]', avatarRing: 'ring-white/25', avatarBg: 'bg-white/15', avatarIcon: 'text-white/70'
      }
    case 'platinum':
      return {
        card: 'bg-[linear-gradient(135deg,#3a3d42_0%,#1a1b1e_45%,#000000_100%)] ring-1 ring-white/10',
        name: 'text-white', sub: 'text-white/55', label: 'text-white/40',
        glow: 'bg-slate-300', dots: 'opacity-[0.07]', dotFill: 'white', sheen: 'from-white/12',
        watermark: 'opacity-[0.07]', avatarRing: 'ring-white/10', avatarBg: 'bg-white/10', avatarIcon: 'text-white/60'
      }
    default: // pending — การ์ดสว่าง
      return {
        card: 'bg-[linear-gradient(135deg,#ffffff_0%,#eceef1_100%)] ring-1 ring-gray-200',
        name: 'text-gray-900', sub: 'text-gray-400', label: 'text-gray-400',
        glow: 'bg-gray-200', dots: 'opacity-[0.06]', dotFill: 'black', sheen: 'from-white/50',
        watermark: 'opacity-[0.05]', avatarRing: 'ring-black/5', avatarBg: 'bg-black/5', avatarIcon: 'text-gray-400'
      }
  }
})
</script>

<style scoped>
.card-shine {
  position: absolute;
  top: -60%;
  left: -75%;
  width: 45%;
  height: 220%;
  transform: rotate(22deg);
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.05) 40%,
    rgba(255, 255, 255, 0.18) 50%,
    rgba(255, 255, 255, 0.05) 60%,
    transparent 100%
  );
  animation: card-shine-sweep 5.5s ease-in-out infinite;
}
@keyframes card-shine-sweep {
  0% { left: -75%; }
  35%, 100% { left: 130%; }
}

/* glint บนป้าย tier */
.pill-shine {
  position: absolute;
  top: 0;
  left: -120%;
  width: 55%;
  height: 100%;
  transform: skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.75), transparent);
  animation: pill-shine-sweep 3.4s ease-in-out infinite;
  pointer-events: none;
}
@keyframes pill-shine-sweep {
  0% { left: -120%; }
  45%, 100% { left: 160%; }
}
@media (prefers-reduced-motion: reduce) {
  .card-shine, .pill-shine { animation: none; }
}
</style>

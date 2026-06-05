<template>
  <div class="mb-6 animate-fade-in">
    <!-- ════════════ MODERN : dark glass card ════════════ -->
    <div class="relative overflow-hidden rounded-3xl shadow-2xl aspect-[1.586/1] bg-gradient-to-br from-gray-900 via-gray-950 to-black">
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

      <div class="relative h-full p-6 flex flex-col justify-between">
        <!-- top -->
        <div class="flex items-start justify-between">
          <div class="relative">
            <img
              v-if="profilePictureUrl"
              :src="profilePictureUrl"
              :alt="displayName"
              class="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/10"
              @error="$emit('image-error')"
            >
            <div v-else class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center ring-2 ring-white/10">
              <svg class="w-6 h-6 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
            </div>
            <div v-if="isValid" class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-gray-900"></div>
          </div>
          <span :class="modernTierChip">
            {{ tierLabel }}
          </span>
        </div>

        <!-- middle name -->
        <div>
          <p class="text-gray-500 text-[10px] font-medium tracking-[0.2em] uppercase mb-1">Black Member</p>
          <h2 class="text-white text-2xl font-extrabold leading-none tracking-tight">{{ displayName }}</h2>
        </div>

        <!-- bottom -->
        <div class="flex items-end justify-between">
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

    <!-- Check-in button -->
    <button
      @click="openCheckin"
      class="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-900 text-white font-semibold text-sm shadow-lg hover:bg-gray-800 transition-colors active:scale-[0.99]"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm13 0h3m-3 3v3m3-3h-3m3 3h-3"/>
      </svg>
      เช็คอินด้วย QR Code
    </button>

    <!-- Check-in QR Modal -->
    <Teleport to="body">
    <transition name="qr-modal">
      <div
        v-if="showCheckin"
        class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
        @click.self="showCheckin = false"
      >
        <div class="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl text-center animate-slide-up">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-900">QR เช็คอิน</h3>
            <button @click="showCheckin = false" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- QR -->
          <div class="relative bg-white rounded-2xl border border-gray-100 p-4 mx-auto inline-block">
            <img
              v-if="qrUrl"
              :src="qrUrl"
              alt="Check-in QR"
              class="w-52 h-52 mx-auto"
            >
            <div v-else class="w-52 h-52 flex items-center justify-center text-gray-400 text-sm">
              ไม่มีข้อมูลสมาชิก
            </div>
          </div>

          <p class="mt-4 font-semibold text-gray-900">{{ displayName }}</p>
          <div class="flex items-center justify-center gap-2 mt-1.5">
            <span :class="['text-[11px] font-bold px-2 py-0.5 rounded-full', isGold ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600']">{{ tierLabel }}</span>
            <span :class="['text-[11px] font-medium px-2 py-0.5 rounded-full', isValid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500']">{{ isValid ? 'Active' : 'Expired' }}</span>
          </div>
          <p class="text-xs text-gray-500 mt-2">หมดอายุ {{ expiryLine }}</p>
          <p class="text-xs text-gray-400 mt-3">แสดง QR นี้ให้เจ้าหน้าที่สแกนเพื่อเช็คอิน</p>
          <p class="text-[11px] text-gray-300 mt-1">รหัสรีเฟรชอัตโนมัติทุก 30 วินาที</p>
        </div>
      </div>
    </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const props = defineProps({
  displayName: String,
  profilePictureUrl: String,
  membershipExpiry: [Date, String, Object],
  memberType: { type: String, default: 'gold' }, // 'gold' | 'platinum'
  memberId: String // lineUserId — encoded in the check-in QR
})

defineEmits(['image-error', 'refresh'])

// ─── Check-in QR ──────────────────────────────────────────────
const showCheckin = ref(false)
const qrToken = ref(Date.now())
let qrTimer = null

const qrPayload = computed(() => {
  if (!props.memberId) return ''
  return JSON.stringify({ t: 'checkin', uid: props.memberId, ts: qrToken.value })
})

const qrUrl = computed(() =>
  qrPayload.value
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=0&data=${encodeURIComponent(qrPayload.value)}`
    : ''
)

function openCheckin() {
  qrToken.value = Date.now()
  showCheckin.value = true
  clearInterval(qrTimer)
  qrTimer = setInterval(() => { qrToken.value = Date.now() }, 30000)
}

watch(showCheckin, (open) => { if (!open) clearInterval(qrTimer) })
onUnmounted(() => clearInterval(qrTimer))

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
const isGold = computed(() => props.memberType !== 'platinum')
const tierLabel = computed(() => isGold.value ? 'GOLD' : 'PLATINUM')
const modernGlow = computed(() => isGold.value ? 'bg-amber-500' : 'bg-slate-300')
const modernTierChip = computed(() => [
  'text-[11px] font-bold px-3 py-1 rounded-full tracking-widest border',
  isGold.value
    ? 'text-amber-300 border-amber-400/40 bg-amber-400/10'
    : 'text-slate-200 border-slate-300/40 bg-slate-300/10'
])
</script>

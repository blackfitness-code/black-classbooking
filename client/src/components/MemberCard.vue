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
const membershipStatus = computed(() => {
  if (!expiryDate.value) return 'ระบบกำลังตรวจสอบข้อมูล'
  return isValid.value ? `หมดอายุ ${expiryLine.value}` : 'หมดอายุแล้ว'
})

// ─── Tier styling (used in QR modal) ──────────────────────────
const isGold = computed(() => props.memberType !== 'platinum')
const tierLabel = computed(() => isGold.value ? 'GOLD' : 'PLATINUM')
</script>

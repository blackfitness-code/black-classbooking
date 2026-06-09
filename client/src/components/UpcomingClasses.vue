<template>
  <div v-if="loading || upcoming.length > 0" class="mt-8">
    <div class="flex items-center justify-between mb-1">
      <h3 class="section-title mb-0">คลาสที่กำลังจะมา</h3>
      <router-link to="/history" class="text-xs text-primary font-semibold">ดูทั้งหมด →</router-link>
    </div>
    <p class="text-xs text-gray-400 mb-4">แตะการ์ดเพื่อแสดง QR ให้เจ้าหน้าที่สแกนเช็คอิน</p>

    <!-- Skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 2" :key="i" class="rounded-3xl bg-gradient-to-br from-gray-900 via-gray-950 to-black p-3 flex items-center gap-4">
        <div class="w-12 h-16 rounded-xl bg-white/10 shrink-0 animate-pulse"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 w-3/4 bg-white/10 rounded animate-pulse"></div>
          <div class="h-3 w-1/3 bg-white/10 rounded animate-pulse"></div>
        </div>
        <div class="w-20 h-12 rounded-2xl bg-white/10 shrink-0 animate-pulse"></div>
      </div>
    </div>

    <!-- Cards -->
    <div v-else class="space-y-3 animate-fade-in">
      <button
        v-for="b in upcoming"
        :key="b.id"
        @click="openQr(b)"
        class="group w-full text-left rounded-3xl p-3 flex items-center gap-3 shadow-lg transition-all hover:shadow-xl active:scale-[0.99] bg-gradient-to-br from-gray-900 via-gray-950 to-black"
      >
        <!-- Date column -->
        <div class="shrink-0 pl-2 pr-4 border-r border-white/10 flex flex-col items-center text-white">
          <span class="text-xl font-extrabold leading-none">{{ dayNum(b.date) }}</span>
          <span class="text-[11px] font-medium text-white/50 mt-1">{{ monthShort(b.date) }}</span>
          <span class="block w-3 border-t border-white/15 my-1.5"></span>
          <span class="text-xs font-bold tracking-tight">{{ b.time }}</span>
        </div>

        <!-- Details -->
        <div class="flex-1 min-w-0">
          <h4 class="text-white font-bold text-sm leading-snug truncate">
            {{ b.className }}<span v-if="b.instructor" class="font-normal text-white/50"> · ครู {{ b.instructor }}</span>
          </h4>
          <span :class="['inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[11px] font-semibold', relativeStyle(b)]">
            <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
            {{ relativeLabel(b) }}
          </span>
        </div>

        <!-- Check-in button (outlined) -->
        <span class="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-white/25 text-white text-[13px] font-bold transition-all group-hover:bg-white/10 group-active:scale-95">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm13 0h3m-3 3v3m3-3h-3m3 3h-3"/>
          </svg>
          เช็คอิน
        </span>
      </button>
    </div>

    <!-- QR Modal -->
    <Teleport to="body">
      <transition name="qr-modal">
        <div
          v-if="qrBooking"
          class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          @click.self="qrBooking = null"
        >
          <div class="relative w-full max-w-xs rounded-[1.75rem] shadow-2xl overflow-hidden animate-slide-up bg-gradient-to-br from-gray-900 via-gray-950 to-black">
            <!-- mesh dots -->
            <svg class="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none">
              <defs>
                <pattern id="qr-dots" width="22" height="22" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.3" fill="white"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#qr-dots)"/>
            </svg>

            <div class="relative px-6 pt-6 pb-7 text-center">
              <!-- close -->
              <button @click="qrBooking = null"
                class="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>

              <p class="text-gray-400 text-xs font-medium">QR เช็คอิน</p>
              <h3 class="text-white text-2xl font-extrabold mt-1.5 leading-tight px-6 break-words">{{ qrBooking.className }}</h3>

              <!-- date / time pill -->
              <div class="inline-flex items-center gap-3 mt-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-semibold">
                <span class="flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  {{ formatDate(qrBooking.date) }}
                </span>
                <span class="w-px h-4 bg-white/15"></span>
                <span class="flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {{ qrBooking.time }}
                </span>
              </div>

              <!-- QR with corner frame -->
              <div class="relative bg-white rounded-3xl p-5 mt-5 mx-auto w-fit">
                <span class="absolute top-2.5 left-2.5 w-6 h-6 border-t-[3px] border-l-[3px] border-gray-300 rounded-tl-lg"></span>
                <span class="absolute top-2.5 right-2.5 w-6 h-6 border-t-[3px] border-r-[3px] border-gray-300 rounded-tr-lg"></span>
                <span class="absolute bottom-2.5 left-2.5 w-6 h-6 border-b-[3px] border-l-[3px] border-gray-300 rounded-bl-lg"></span>
                <span class="absolute bottom-2.5 right-2.5 w-6 h-6 border-b-[3px] border-r-[3px] border-gray-300 rounded-br-lg"></span>
                <img v-if="qrUrl" :src="qrUrl" alt="Check-in QR" class="w-52 h-52 mx-auto block">
                <div v-else class="w-52 h-52 flex items-center justify-center text-gray-400 text-sm">ไม่มีข้อมูล</div>
              </div>

              <!-- instructor + instructions -->
              <p v-if="qrBooking.instructor" class="flex items-center justify-center gap-1.5 text-white/85 text-sm font-medium mt-5">
                <svg class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                ครู {{ qrBooking.instructor }}
              </p>
              <p class="text-white/60 text-sm mt-2">ให้เจ้าหน้าที่สแกนเพื่อเช็คอินเข้าคลาส</p>
              <p class="text-white/30 text-xs mt-1">ระบบจะตรวจสอบการจองอัตโนมัติ</p>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { db } from '../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { format, isSameMonth } from 'date-fns'
import { th } from 'date-fns/locale'

const props = defineProps({
  userId: { type: String, default: '' }, // lineUserId
  // how many upcoming classes to show
  limit: { type: Number, default: 2 }
})

const loading = ref(false)
const bookings = ref([])
const qrBooking = ref(null)

const bookingDateTime = (b) => new Date(`${b.date}T${b.time || '00:00'}:00`)

// Upcoming confirmed bookings within the current calendar month
const upcoming = computed(() => {
  const now = new Date()
  return bookings.value
    .filter(b => b.status === 'confirmed')
    .filter(b => {
      const dt = bookingDateTime(b)
      return dt >= now && isSameMonth(dt, now)
    })
    .sort((a, b) => bookingDateTime(a) - bookingDateTime(b))
    .slice(0, props.limit)
})

const formatDate = (dateString) => {
  try { return format(new Date(dateString), 'dd MMM yyyy', { locale: th }) } catch { return dateString }
}
const dayNum = (dateString) => {
  try { return format(new Date(dateString), 'd') } catch { return '' }
}
const monthShort = (dateString) => {
  try { return format(new Date(dateString), 'MMM', { locale: th }) } catch { return '' }
}

const daysUntil = (b) => {
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0)
  return Math.round((new Date(b.date) - startOfToday) / 86400000)
}
const relativeLabel = (b) => {
  const days = daysUntil(b)
  if (days <= 0) return 'วันนี้'
  if (days === 1) return 'พรุ่งนี้'
  return `อีก ${days} วัน`
}
const relativeStyle = (b) => {
  const days = daysUntil(b)
  if (days <= 0) return 'bg-primary text-white'
  if (days === 1) return 'bg-amber-400/20 text-amber-300'
  return 'bg-emerald-500/20 text-emerald-300'
}

// Per-class check-in QR — encodes the booking so staff can verify it's real
const buildQrUrl = (b) => {
  if (!b || !props.userId) return ''
  const payload = JSON.stringify({ t: 'checkin', uid: props.userId, cid: b.classId, bid: b.id, d: b.date })
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=0&data=${encodeURIComponent(payload)}`
}
const qrUrl = computed(() => buildQrUrl(qrBooking.value))

const openQr = (b) => { qrBooking.value = b }

const loadBookings = async () => {
  if (!props.userId) { bookings.value = []; return }
  loading.value = true
  try {
    const snap = await getDocs(query(
      collection(db, 'bookings'),
      where('userId', '==', props.userId)
    ))
    bookings.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('load upcoming bookings failed:', e)
  } finally {
    loading.value = false
  }
}

watch(() => props.userId, loadBookings, { immediate: true })
</script>

<style scoped>
.qr-modal-enter-active { transition: opacity 0.2s ease; }
.qr-modal-leave-active { transition: opacity 0.15s ease; }
.qr-modal-enter-from, .qr-modal-leave-to { opacity: 0; }
</style>

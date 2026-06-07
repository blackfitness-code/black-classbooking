<template>
  <div v-if="loading || upcoming.length > 0" class="mt-8">
    <div class="flex items-center justify-between mb-1">
      <h3 class="section-title mb-0">คลาสที่กำลังจะมา</h3>
      <router-link to="/history" class="text-xs text-primary font-semibold">ดูทั้งหมด →</router-link>
    </div>
    <p class="text-xs text-gray-400 mb-4">แตะการ์ดเพื่อแสดง QR ให้เจ้าหน้าที่สแกนเช็คอิน</p>

    <!-- Skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 2" :key="i" class="rounded-2xl bg-white shadow-card border border-gray-100 p-3 flex items-center gap-3">
        <div class="skeleton w-14 h-16 rounded-xl shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="skeleton h-4 w-3/4"></div>
          <div class="skeleton h-3 w-1/3"></div>
        </div>
        <div class="skeleton w-14 h-14 rounded-xl shrink-0"></div>
      </div>
    </div>

    <!-- Cards -->
    <div v-else class="space-y-3 animate-fade-in">
      <button
        v-for="b in upcoming"
        :key="b.id"
        @click="openQr(b)"
        class="group w-full text-left rounded-2xl bg-white shadow-card border border-gray-100 p-3 flex items-center gap-3 transition-all hover:shadow-soft hover:border-primary/20 active:scale-[0.99]"
      >
        <!-- Date + time badge -->
        <div class="shrink-0 w-14 rounded-xl bg-gradient-to-br from-primary to-[#E85D2F] text-white flex flex-col items-center py-2 shadow-sm shadow-primary/30">
          <span class="text-xl font-bold leading-none">{{ dayNum(b.date) }}</span>
          <span class="text-[10px] font-medium uppercase tracking-wide opacity-90 mt-0.5">{{ monthShort(b.date) }}</span>
          <span class="block w-7 border-t border-white/30 my-1.5"></span>
          <span class="text-[11px] font-semibold leading-none tracking-tight">{{ b.time }}</span>
        </div>

        <!-- Details -->
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-gray-900 text-sm leading-snug truncate">
            {{ b.className }}<span v-if="b.instructor" class="font-normal text-gray-400"> · ครู {{ b.instructor }}</span>
          </h4>
          <span :class="['inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full text-[11px] font-semibold', relativeStyle(b)]">
            <span class="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
            {{ relativeLabel(b) }}
          </span>
        </div>

        <!-- Check-in button (tap card to open QR) -->
        <span class="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold shadow-sm transition-all group-hover:bg-primary group-hover:shadow-md group-active:scale-95">
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
          <div class="w-full max-w-xs bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <!-- Header -->
            <div class="relative bg-gradient-to-br from-primary to-[#E85D2F] px-6 pt-6 pb-8 text-white text-center">
              <button
                @click="qrBooking = null"
                class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <p class="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-90">QR เช็คอิน</p>
              <h3 class="font-bold text-lg mt-1 leading-snug px-4 truncate">{{ qrBooking.className }}</h3>
              <p class="text-sm opacity-90 mt-0.5">{{ formatDate(qrBooking.date) }} · {{ qrBooking.time }}</p>
            </div>

            <!-- QR with corner frame -->
            <div class="px-6 -mt-4">
              <div class="relative bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mx-auto">
                <span class="absolute top-2.5 left-2.5 w-5 h-5 border-t-[3px] border-l-[3px] border-primary rounded-tl-md"></span>
                <span class="absolute top-2.5 right-2.5 w-5 h-5 border-t-[3px] border-r-[3px] border-primary rounded-tr-md"></span>
                <span class="absolute bottom-2.5 left-2.5 w-5 h-5 border-b-[3px] border-l-[3px] border-primary rounded-bl-md"></span>
                <span class="absolute bottom-2.5 right-2.5 w-5 h-5 border-b-[3px] border-r-[3px] border-primary rounded-br-md"></span>
                <img v-if="qrUrl" :src="qrUrl" alt="Check-in QR" class="w-48 h-48 mx-auto">
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 pt-4 pb-6 text-center">
              <p v-if="qrBooking.instructor" class="text-xs text-gray-400">ครู {{ qrBooking.instructor }}</p>
              <p class="text-xs text-gray-500 mt-2">ให้เจ้าหน้าที่สแกนเพื่อเช็คอินเข้าคลาส</p>
              <p class="text-[11px] text-gray-300 mt-1">ระบบจะตรวจสอบการจองอัตโนมัติ</p>
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
  if (days === 1) return 'bg-amber-100 text-amber-700'
  return 'bg-emerald-100 text-emerald-700'
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

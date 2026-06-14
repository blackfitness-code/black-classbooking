<template>
  <div class="page-container">
    <!-- Header -->
    <header class="page-header">
      <div class="max-w-md mx-auto px-6 py-4 flex items-center">
        <button @click="$router.go(-1)" class="mr-4 p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="page-title">จองคลาส</h1>
      </div>
    </header>

    <main class="max-w-md mx-auto px-6 py-6">

      <!-- Cooldown Warning -->
      <div v-if="authStore.isCooldownActive()" class="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-4 mb-6">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3 shrink-0">
            <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-medium text-red-800">ถูกระงับการจองชั่วคราว</p>
            <p class="text-sm text-red-600">
              จองได้อีกครั้งหลัง {{ authStore.getCooldownEndDate()?.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Membership Expired -->
      <div v-else-if="!authStore.isMembershipValid() && authStore.userProfile?.membershipExpiry" class="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4 mb-6">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3 shrink-0">
            <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-medium text-orange-800">สมาชิกหมดอายุ</p>
            <p class="text-sm text-orange-600">กรุณาต่ออายุสมาชิกเพื่อจองคลาส</p>
          </div>
        </div>
      </div>
      <!-- Checking / no membership data → small icon -->
      <div v-else-if="!authStore.isMembershipValid()" class="mb-6">
        <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-400" title="ระบบกำลังตรวจสอบข้อมูล">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </span>
      </div>

      <!-- Date Picker -->
      <div class="card mb-6">
        <h3 class="section-title">เลือกวันที่</h3>
        <div class="flex overflow-x-auto space-x-3 pb-2 -mx-2 px-2 scrollbar-hide">
          <button
            v-for="date in availableDates"
            :key="date.dateString"
            @click="selectedDate = date.dateString"
            :class="[
              'flex-shrink-0 text-center p-4 rounded-2xl transition-all min-w-[80px]',
              selectedDate === date.dateString
                ? 'bg-primary text-white shadow-md scale-105'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-95'
            ]"
          >
            <div class="text-lg font-semibold">{{ date.day }}</div>
            <div class="text-xs mt-1 opacity-80">{{ date.dayName }}</div>
          </button>
        </div>
      </div>

      <!-- Classes List -->
      <div v-if="selectedDate">
        <h3 class="section-title">คลาสที่เปิดสอน</h3>

        <!-- Skeleton loading -->
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="card">
            <div class="skeleton h-5 w-3/4 mb-3"></div>
            <div class="skeleton h-4 w-1/2 mb-2"></div>
            <div class="skeleton h-4 w-1/3 mb-4"></div>
            <div class="skeleton h-11 w-full rounded-xl"></div>
          </div>
        </div>

        <div v-else-if="filteredClasses.length === 0" class="text-center py-12 animate-fade-in">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p class="text-gray-500">ไม่มีคลาสในวันนี้</p>
        </div>

        <div v-else class="space-y-4 animate-fade-in">
          <div
            v-for="yogaClass in filteredClasses"
            :key="yogaClass.id"
            class="card hover:shadow-soft transition-all"
          >
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <svg class="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path :d="getClassTypeInfo(yogaClass.type).iconPath"></path>
                  </svg>
                  <h4 class="font-semibold text-gray-900">{{ yogaClass.name }}</h4>
                </div>
                <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mb-2', getClassTypeColor(yogaClass.type)]">
                  {{ getClassTypeInfo(yogaClass.type).label }}
                </span>
                <div class="flex items-center text-sm text-gray-500 mb-1">
                  <svg class="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ yogaClass.time }}
                </div>
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  ครู {{ yogaClass.instructor }}
                </div>

                <div v-if="yogaClass.description" class="mt-3 pt-3 border-t border-gray-100">
                  <p class="text-sm text-gray-600 leading-relaxed">{{ yogaClass.description }}</p>
                </div>
              </div>
              <div class="text-right ml-4 shrink-0">
                <div class="text-sm text-gray-500 mb-2">
                  {{ yogaClass.currentBookings }}/{{ yogaClass.maxCapacity }} คน
                </div>
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    yogaClass.currentBookings >= yogaClass.maxCapacity
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  ]"
                >
                  {{ yogaClass.currentBookings >= yogaClass.maxCapacity ? 'เต็ม' : 'ว่าง' }}
                </span>
              </div>
            </div>

            <button
              @click="bookClass(yogaClass)"
              :disabled="!canBook(yogaClass)"
              :class="[
                'w-full py-3 px-4 rounded-xl font-medium transition-all',
                canBook(yogaClass)
                  ? 'btn-primary'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              ]"
            >
              {{ getBookingButtonText(yogaClass) }}
            </button>

            <button
              @click="$router.push(`/class/${yogaClass.id}`)"
              class="w-full py-2 px-4 rounded-xl font-medium transition-all bg-white border-2 border-primary text-primary hover:bg-primary/5 active:scale-95 mt-2"
            >
              ดูรายละเอียด
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Booking Confirmation Modal -->
    <transition name="modal">
      <div v-if="showConfirmModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6" @click.self="showConfirmModal = false">
        <div class="modal-content bg-white rounded-3xl w-full max-w-sm max-h-[80dvh] overflow-y-auto">
          <div class="p-6">
            <div class="text-center mb-5">
              <div class="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">ยืนยันการจอง</h3>
              <p class="text-xs text-orange-600 leading-relaxed">
                หมายเหตุ: สามารถยกเลิกได้เฉพาะก่อน 5 ชั่วโมงก่อนคลาสเริ่มเท่านั้น
              </p>
            </div>

            <div v-if="selectedClass" class="bg-gray-50 rounded-2xl p-4 mb-5 text-sm">
              <div class="space-y-2">
                <div class="flex justify-between gap-3">
                  <span class="text-gray-500 shrink-0">คลาส:</span>
                  <span class="font-medium text-right">{{ selectedClass.name }}</span>
                </div>
                <div class="flex justify-between gap-3">
                  <span class="text-gray-500 shrink-0">วันที่:</span>
                  <span class="font-medium text-right">{{ formatDate(selectedDate) }}</span>
                </div>
                <div class="flex justify-between gap-3">
                  <span class="text-gray-500 shrink-0">เวลา:</span>
                  <span class="font-medium text-right">{{ selectedClass.time }}</span>
                </div>
                <div class="flex justify-between gap-3">
                  <span class="text-gray-500 shrink-0">ครู:</span>
                  <span class="font-medium text-right">{{ selectedClass.instructor }}</span>
                </div>
                <div v-if="selectedClass.description" class="pt-2 border-t border-gray-200">
                  <span class="text-gray-500 block mb-1">รายละเอียด:</span>
                  <p class="text-gray-700 leading-relaxed">{{ selectedClass.description }}</p>
                </div>
              </div>
            </div>

            <div class="flex gap-3">
              <button @click="showConfirmModal = false" class="btn-secondary flex-1 py-3">
                ยกเลิก
              </button>
              <button @click="confirmBooking" class="btn-primary flex-1 py-3" :disabled="booking">
                {{ booking ? 'กำลังจอง...' : 'ยืนยัน' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../lib/api'
import { format, addDays } from 'date-fns'
import { th } from 'date-fns/locale'
import Swal from '../utils/dialog'
import { getClassTypeInfo, getClassTypeColor } from '../constants/classTypes'

const authStore = useAuthStore()

const selectedDate = ref('')
const classes = ref([])
const userBookings = ref([])
const loading = ref(false)
const showConfirmModal = ref(false)
const selectedClass = ref(null)
const booking = ref(false)

const availableDates = computed(() => {
  const dates = []
  for (let i = 0; i < 14; i++) {
    const date = addDays(new Date(), i)
    dates.push({
      dateString: format(date, 'yyyy-MM-dd'),
      day: format(date, 'd'),
      dayName: format(date, 'EEE', { locale: th })
    })
  }
  return dates
})

const filteredClasses = computed(() => {
  if (!selectedDate.value) return []
  return classes.value
    .filter(c => c.date === selectedDate.value)
    .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'))
})

const canBook = (yogaClass) => {
  if (authStore.isCooldownActive()) return false
  if (!authStore.isMembershipValid()) return false
  if (authStore.userProfile?.memberType === 'gold') return false
  if (yogaClass.currentBookings >= yogaClass.maxCapacity) return false

  const alreadyBooked = userBookings.value.some(b =>
    b.classId === yogaClass.id &&
    b.date === selectedDate.value &&
    b.status === 'confirmed'
  )
  if (alreadyBooked) return false

  const classDateTime = new Date(`${yogaClass.date}T${yogaClass.time}:00`)
  const minutesDiff = (classDateTime - new Date()) / (1000 * 60)
  return minutesDiff > 30 && minutesDiff <= (14 * 24 * 60)
}

const getBookingButtonText = (yogaClass) => {
  if (authStore.isCooldownActive()) return 'ถูกระงับการจองชั่วคราว'
  // หมดอายุเท่านั้นที่โชว์ข้อความ — Gold / กำลังตรวจข้อมูล แค่ปิดปุ่ม (canBook คืน false)
  if (!authStore.isMembershipValid() && authStore.userProfile?.membershipExpiry) {
    return 'สมาชิกหมดอายุ'
  }
  if (yogaClass.currentBookings >= yogaClass.maxCapacity) return 'เต็มแล้ว'

  const alreadyBooked = userBookings.value.some(b =>
    b.classId === yogaClass.id &&
    b.date === selectedDate.value &&
    b.status === 'confirmed'
  )
  if (alreadyBooked) return 'จองแล้ว'

  const classDateTime = new Date(`${yogaClass.date}T${yogaClass.time}:00`)
  const minutesDiff = (classDateTime - new Date()) / (1000 * 60)

  if (minutesDiff <= 0) return 'คลาสเริ่มแล้ว'
  if (minutesDiff <= 30) return 'ปิดรับจองแล้ว (จองได้ก่อนคลาส 30 นาที)'
  if (minutesDiff > (14 * 24 * 60)) return 'ยังไม่เปิดรับจอง'
  return 'จองคลาส'
}

const formatDate = (dateString) => {
  return format(new Date(dateString), 'dd MMMM yyyy', { locale: th })
}

// Load classes for selected date only (fast — filtered by date)
const loadClasses = async () => {
  if (!selectedDate.value) return
  loading.value = true
  try {
    const { classes: fetched } = await api.get('/classes?date=' + selectedDate.value)
    classes.value = fetched
  } catch (error) {
    console.error('Error loading classes:', error)
  } finally {
    loading.value = false
  }
}

// Load user bookings once on mount — no need to reload on every date change
const loadUserBookings = async () => {
  if (!authStore.userProfile?.lineUserId) return
  try {
    const { bookings } = await api.get('/bookings/me')
    userBookings.value = bookings
  } catch (error) {
    console.error('Error loading bookings:', error)
  }
}

const bookClass = (yogaClass) => {
  selectedClass.value = yogaClass
  showConfirmModal.value = true
}

const confirmBooking = async () => {
  if (!selectedClass.value || booking.value) return
  booking.value = true

  try {
    const { booking: newBooking, currentBookings } = await api.post('/bookings', { classId: selectedClass.value.id })

    // อัปเดต currentBookings ของคลาสใน local state ตามที่ server ส่งกลับมา
    const booked = classes.value.find(c => c.id === selectedClass.value.id)
    if (booked) booked.currentBookings = currentBookings

    userBookings.value.push(newBooking)

    showConfirmModal.value = false
    selectedClass.value = null

    Swal.fire({
      title: 'สำเร็จ!',
      text: 'จองคลาสสำเร็จ!',
      icon: 'success',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#FF8C61'
    })
  } catch (err) {
    // แปลง error code จาก server เป็นข้อความภาษาไทย
    const msgMap = {
      CLASS_FULL: 'คลาสเต็มแล้ว กรุณาเลือกคลาสอื่น',
      ALREADY_BOOKED: 'คุณจองคลาสนี้ไปแล้ว',
      MEMBERSHIP_EXPIRED: 'สมาชิกหมดอายุ',
      IN_COOLDOWN: 'ถูกระงับการจองชั่วคราว',
      GOLD_NOT_ALLOWED: 'แพ็คเกจ Gold ไม่สามารถจองได้',
      BOOKING_WINDOW_CLOSED: 'อยู่นอกช่วงเวลาที่จองได้'
    }
    Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: msgMap[err.code] ?? 'เกิดข้อผิดพลาดในการจอง',
      icon: 'error',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#FF8C61'
    })
  } finally {
    booking.value = false
  }
}

watch(selectedDate, loadClasses)

onMounted(async () => {
  selectedDate.value = availableDates.value[0].dateString
  // Load bookings once in parallel with classes
  await Promise.all([loadClasses(), loadUserBookings()])
})
</script>

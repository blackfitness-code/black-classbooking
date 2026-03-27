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

      <!-- Membership Status -->
      <div v-if="!authStore.isMembershipValid()" class="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4 mb-6">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-medium text-orange-800">
              {{ !authStore.userProfile?.membershipExpiry ? 'ระบบกำลังตรวจสอบข้อมูล' : 'สมาชิกหมดอายุ' }}
            </p>
            <p class="text-sm text-orange-600">
              {{ !authStore.userProfile?.membershipExpiry ? '' : 'กรุณาต่ออายุสมาชิกเพื่อจองคลาส' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Date Picker -->
      <div class="card mb-6">
        <h3 class="section-title">เลือกวันที่</h3>
        <div class="flex overflow-x-auto space-x-3 pb-2 -mx-2 px-2">
          <button
            v-for="date in availableDates"
            :key="date.dateString"
            @click="selectedDate = date.dateString"
            :class="[
              'flex-shrink-0 text-center p-4 rounded-2xl transition-all min-w-[80px]',
              selectedDate === date.dateString
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
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
        
        <div v-if="!loading && filteredClasses.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p class="text-gray-500">ไม่มีคลาสในวันนี้</p>
        </div>

        <div v-if="!loading && filteredClasses.length > 0" class="space-y-4">
          <div
            v-for="yogaClass in filteredClasses"
            :key="yogaClass.id"
            class="card hover:shadow-md transition-all"
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
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ yogaClass.time }}
                </div>
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  ครู {{ yogaClass.instructor }}
                </div>
                
                <!-- Class Description -->
                <div v-if="yogaClass.description" class="mt-3 pt-3 border-t border-gray-100">
                  <p class="text-sm text-gray-600 leading-relaxed">{{ yogaClass.description }}</p>
                </div>
              </div>
              <div class="text-right ml-4">
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
              class="w-full py-2 px-4 rounded-xl font-medium transition-all bg-white border-2 border-primary text-primary hover:bg-primary/5 mt-2"
            >
              ดูรายละเอียด
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Booking Confirmation Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl w-full sm:max-w-sm max-h-[90dvh] overflow-y-auto">
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
    
    <!-- Loading Overlay -->
    <LoadingOverlay 
      :show="loading" 
      title="กำลังโหลดคลาส"
      subtitle="กรุณารอสักครู่..."
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useLiffStore } from '../stores/liff'
import { db } from '../firebase'
import { collection, query, where, getDocs, addDoc, updateDoc, doc, increment } from 'firebase/firestore'
import { format, addDays, startOfDay } from 'date-fns'
import { th } from 'date-fns/locale'
import Swal from 'sweetalert2'
import LoadingOverlay from '../components/LoadingOverlay.vue'
import { getClassTypeInfo, getClassTypeColor, getClassSubtypeInfo } from '../constants/classTypes'

const authStore = useAuthStore()
const liffStore = useLiffStore()

const selectedDate = ref('')
const classes = ref([])
const userBookings = ref([])
const loading = ref(false)
const showConfirmModal = ref(false)
const selectedClass = ref(null)
const booking = ref(false)

// Generate available dates (next 7 days)
const availableDates = computed(() => {
  const now = new Date()
  console.log('Debug System Date/Time:', {
    systemDateTime: now.toISOString(),
    localDateTime: now.toLocaleString('th-TH'),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
  
  const dates = []
  for (let i = 0; i < 7; i++) {
    const date = addDays(new Date(), i)
    dates.push({
      dateString: format(date, 'yyyy-MM-dd'),
      day: format(date, 'd'),
      dayName: format(date, 'EEE', { locale: th })
    })
  }
  
  console.log('Debug Available Dates:', dates)
  return dates
})

const filteredClasses = computed(() => {
  if (!selectedDate.value) return []
  const filtered = classes.value.filter(c => c.date === selectedDate.value)
  
  // Sort by time
  filtered.sort((a, b) => {
    const timeA = a.time.split(':').map(Number)
    const timeB = b.time.split(':').map(Number)
    
    // Compare hours first, then minutes
    if (timeA[0] !== timeB[0]) {
      return timeA[0] - timeB[0]
    }
    return timeA[1] - timeB[1]
  })
  
  console.log('Debug Filtered Classes:', {
    selectedDate: selectedDate.value,
    allClasses: classes.value,
    filteredClasses: filtered
  })
  
  return filtered
})

const canBook = (yogaClass) => {
  if (!authStore.isMembershipValid()) return false
  if (yogaClass.currentBookings >= yogaClass.maxCapacity) return false
  
  // Check if user already booked this class
  const alreadyBooked = userBookings.value.some(booking => 
    booking.classId === yogaClass.id && 
    booking.date === selectedDate.value &&
    booking.status === 'confirmed'
  )
  if (alreadyBooked) return false
  
  // Check if class starts more than 30 minutes from now (can book until 30 minutes before class)
  const classDateTime = new Date(`${yogaClass.date}T${yogaClass.time}:00`)
  const now = new Date()
  const minutesDiff = (classDateTime - now) / (1000 * 60)
  
  // Debug logging
  console.log('Debug canBook:', {
    className: yogaClass.name,
    classDate: yogaClass.date,
    classTime: yogaClass.time,
    classDateTime: classDateTime.toISOString(),
    now: now.toISOString(),
    minutesDiff: minutesDiff,
    canBook: minutesDiff > 30 && minutesDiff <= (7 * 24 * 60)
  })
  
  // Can book if class is more than 30 minutes away and within 7 days
  return minutesDiff > 30 && minutesDiff <= (7 * 24 * 60)
}

const getBookingButtonText = (yogaClass) => {
  if (!authStore.isMembershipValid()) {
    return !authStore.userProfile?.membershipExpiry ? 'ระบบกำลังตรวจสอบข้อมูล' : 'สมาชิกหมดอายุ'
  }
  if (yogaClass.currentBookings >= yogaClass.maxCapacity) return 'เต็มแล้ว'
  
  // Check if user already booked this class
  const alreadyBooked = userBookings.value.some(booking => 
    booking.classId === yogaClass.id && 
    booking.date === selectedDate.value &&
    booking.status === 'confirmed'
  )
  if (alreadyBooked) return 'จองแล้ว'
  
  const classDateTime = new Date(`${yogaClass.date}T${yogaClass.time}:00`)
  const now = new Date()
  const minutesDiff = (classDateTime - now) / (1000 * 60)
  
  // Debug logging
  console.log('Debug getBookingButtonText:', {
    className: yogaClass.name,
    classDate: yogaClass.date,
    classTime: yogaClass.time,
    minutesDiff: minutesDiff
  })
  
  if (minutesDiff <= 0) return 'คลาสเริ่มแล้ว'
  if (minutesDiff <= 30) return 'ปิดรับจองแล้ว (จองได้ก่อนคลาส 30 นาที)'
  if (minutesDiff > (7 * 24 * 60)) return 'ยังไม่เปิดรับจอง'
  
  return 'จองคลาส'
}

const formatDate = (dateString) => {
  return format(new Date(dateString), 'dd MMMM yyyy', { locale: th })
}

const loadClasses = async () => {
  if (!selectedDate.value) return
  
  loading.value = true
  try {
    // Load classes for selected date
    const classesQuery = query(
      collection(db, 'classes'),
      where('date', '==', selectedDate.value)
    )
    const classesSnapshot = await getDocs(classesQuery)
    classes.value = classesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => {
      // เรียงตามเวลา (เช้า -> เย็น)
      const timeA = a.time || '00:00'
      const timeB = b.time || '00:00'
      return timeA.localeCompare(timeB)
    })
    
    // Load user's bookings
    if (authStore.userProfile?.lineUserId) {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', authStore.userProfile.lineUserId)
      )
      const bookingsSnapshot = await getDocs(bookingsQuery)
      userBookings.value = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    }
  } catch (error) {
    console.error('Error loading classes:', error)
  } finally {
    loading.value = false
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
    const bookingData = {
      userId: authStore.userProfile.lineUserId,
      classId: selectedClass.value.id,
      className: selectedClass.value.name,
      date: selectedDate.value,
      time: selectedClass.value.time,
      instructor: selectedClass.value.instructor,
      status: 'confirmed',
      bookedAt: new Date(),
      canCancelUntil: new Date(`${selectedDate.value}T${selectedClass.value.time}:00`)
    }
    
    // Add booking
    await addDoc(collection(db, 'bookings'), bookingData)
    
    // Update class capacity
    await updateDoc(doc(db, 'classes', selectedClass.value.id), {
      currentBookings: increment(1)
    })
    
    // Refresh classes
    await loadClasses()
    
    showConfirmModal.value = false
    selectedClass.value = null
    
    Swal.fire({
      title: 'สำเร็จ!',
      text: 'จองคลาสสำเร็จ!',
      icon: 'success',
      confirmButtonText: 'ตกลง'
    })
  } catch (error) {
    console.error('Error booking class:', error)
    Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: 'เกิดข้อผิดพลาดในการจอง',
      icon: 'error',
      confirmButtonText: 'ตกลง'
    })
  } finally {
    booking.value = false
  }
}

watch(selectedDate, loadClasses)

onMounted(() => {
  // Set default date to today
  selectedDate.value = availableDates.value[0].dateString
})
</script>
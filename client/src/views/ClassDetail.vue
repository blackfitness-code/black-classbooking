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
        <h1 class="page-title">รายละเอียดคลาส</h1>
      </div>
    </header>

    <main class="max-w-md mx-auto px-6 py-6">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p class="text-gray-500 mt-4">กำลังโหลด...</p>
      </div>

      <div v-else-if="!yogaClass" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <p class="text-gray-500">ไม่พบข้อมูลคลาส</p>
        <button @click="$router.go(-1)" class="btn-primary mt-4">
          กลับ
        </button>
      </div>

      <div v-else class="space-y-6">
        <!-- Class Header -->
        <div class="card">
          <div class="flex items-center gap-3 mb-3">
            <svg class="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path :d="getClassTypeInfo(yogaClass.type).iconPath"></path>
            </svg>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900">{{ yogaClass.name }}</h2>
              <span :class="['inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border mt-1', getClassTypeColor(yogaClass.type)]">
                {{ getClassTypeInfo(yogaClass.type).label }}
              </span>
            </div>
          </div>

          <!-- Status Badge -->
          <div class="flex items-center justify-between pt-3 border-t border-gray-100">
            <span class="text-sm text-gray-600">สถานะ</span>
            <span
              :class="[
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                getClassStatus() === 'upcoming' 
                  ? 'bg-green-100 text-green-800'
                  : getClassStatus() === 'ongoing'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              ]"
            >
              {{ getClassStatusText() }}
            </span>
          </div>
        </div>

        <!-- Class Info -->
        <div class="card space-y-4">
          <h3 class="font-semibold text-lg text-gray-900">ข้อมูลคลาส</h3>
          
          <div class="space-y-3">
            <div class="flex items-start">
              <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-500">วันที่</p>
                <p class="font-medium text-gray-900">{{ formatDate(yogaClass.date) }}</p>
              </div>
            </div>

            <div class="flex items-start">
              <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-500">เวลา</p>
                <p class="font-medium text-gray-900">{{ yogaClass.time }} น.</p>
              </div>
            </div>

            <div class="flex items-start">
              <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-500">ครูผู้สอน</p>
                <p class="font-medium text-gray-900"> ครู {{ yogaClass.instructor }}</p>
              </div>
            </div>

            <div class="flex items-start">
              <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-500">จำนวนผู้เข้าร่วม</p>
                <div class="flex items-center gap-2">
                  <p class="font-medium text-gray-900">{{ yogaClass.currentBookings }}/{{ yogaClass.maxCapacity }} คน</p>
                  <span
                    :class="[
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                      yogaClass.currentBookings >= yogaClass.maxCapacity
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    ]"
                  >
                    {{ yogaClass.currentBookings >= yogaClass.maxCapacity ? 'เต็ม' : 'ว่าง' }}
                  </span>
                </div>
                <!-- Progress Bar -->
                <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all"
                    :class="yogaClass.currentBookings >= yogaClass.maxCapacity ? 'bg-red-500' : 'bg-green-500'"
                    :style="{ width: `${(yogaClass.currentBookings / yogaClass.maxCapacity) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Class Description -->
        <div v-if="yogaClass.description" class="card">
          <h3 class="font-semibold text-lg text-gray-900 mb-3">รายละเอียด</h3>
          <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ yogaClass.description }}</p>
        </div>

        <!-- Membership Warning -->
        <div v-if="!authStore.isMembershipValid()" class="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4">
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
                {{ !authStore.userProfile?.membershipExpiry ? 'โปรดติดต่อแอดมินเพื่อสมัครสมาชิก' : 'กรุณาต่ออายุสมาชิกเพื่อจองคลาส' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Booking Status -->
        <div v-if="isAlreadyBooked" class="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-medium text-blue-800">คุณได้จองคลาสนี้แล้ว</p>
              <p class="text-sm text-blue-600">ดูรายละเอียดได้ที่หน้าประวัติการจอง</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3 pb-6">
          <button
            v-if="!isAlreadyBooked"
            @click="bookClass"
            :disabled="!canBook()"
            :class="[
              'w-full py-4 px-4 rounded-xl font-medium transition-all text-lg',
              canBook()
                ? 'btn-primary'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            ]"
          >
            {{ getBookingButtonText() }}
          </button>
          
          <button
            v-else
            @click="$router.push('/history')"
            class="w-full py-4 px-4 rounded-xl font-medium transition-all text-lg bg-blue-500 text-white hover:bg-blue-600"
          >
            ดูประวัติการจอง
          </button>
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
          
          <div v-if="yogaClass" class="bg-gray-50 rounded-2xl p-4 mb-5 text-sm">
            <div class="space-y-2">
              <div class="flex justify-between gap-3">
                <span class="text-gray-500 shrink-0">คลาส:</span>
                <span class="font-medium text-right">{{ yogaClass.name }}</span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-gray-500 shrink-0">วันที่:</span>
                <span class="font-medium text-right">{{ formatDate(yogaClass.date) }}</span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-gray-500 shrink-0">เวลา:</span>
                <span class="font-medium text-right">{{ yogaClass.time }}</span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-gray-500 shrink-0">ครู:</span>
                <span class="font-medium text-right">{{ yogaClass.instructor }}</span>
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
      title="กำลังโหลดข้อมูล"
      subtitle="กรุณารอสักครู่..."
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { db } from '../firebase'
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, increment } from 'firebase/firestore'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import Swal from 'sweetalert2'
import LoadingOverlay from '../components/LoadingOverlay.vue'
import { getClassTypeInfo, getClassTypeColor, getClassSubtypeInfo } from '../constants/classTypes'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const yogaClass = ref(null)
const userBookings = ref([])
const loading = ref(false)
const showConfirmModal = ref(false)
const booking = ref(false)

const isAlreadyBooked = computed(() => {
  if (!yogaClass.value) return false
  return userBookings.value.some(booking => 
    booking.classId === yogaClass.value.id && 
    booking.date === yogaClass.value.date &&
    booking.status === 'confirmed'
  )
})

const formatDate = (dateString) => {
  return format(new Date(dateString), 'dd MMMM yyyy', { locale: th })
}

const getClassStatus = () => {
  if (!yogaClass.value) return 'unknown'
  const now = new Date()
  const classStart = new Date(`${yogaClass.value.date}T${yogaClass.value.time}`)
  const classEnd = new Date(classStart.getTime() + (90 * 60 * 1000))
  
  if (now < classStart) return 'upcoming'
  if (now >= classStart && now <= classEnd) return 'ongoing'
  return 'completed'
}

const getClassStatusText = () => {
  const status = getClassStatus()
  const statusMap = {
    upcoming: 'กำลังจะมา',
    ongoing: 'กำลังดำเนินการ',
    completed: 'เสร็จสิ้น'
  }
  return statusMap[status] || 'ไม่ทราบสถานะ'
}

const canBook = () => {
  if (!yogaClass.value) return false
  if (!authStore.isMembershipValid()) return false
  if (yogaClass.value.currentBookings >= yogaClass.value.maxCapacity) return false
  if (isAlreadyBooked.value) return false
  
  const classDateTime = new Date(`${yogaClass.value.date}T${yogaClass.value.time}:00`)
  const now = new Date()
  const minutesDiff = (classDateTime - now) / (1000 * 60)
  
  return minutesDiff > 30 && minutesDiff <= (7 * 24 * 60)
}

const getBookingButtonText = () => {
  if (!yogaClass.value) return 'กำลังโหลด...'
  if (!authStore.isMembershipValid()) {
    return !authStore.userProfile?.membershipExpiry ? 'ระบบกำลังตรวจสอบข้อมูล' : 'สมาชิกหมดอายุ'
  }
  if (yogaClass.value.currentBookings >= yogaClass.value.maxCapacity) return 'เต็มแล้ว'
  if (isAlreadyBooked.value) return 'จองแล้ว'
  
  const classDateTime = new Date(`${yogaClass.value.date}T${yogaClass.value.time}:00`)
  const now = new Date()
  const minutesDiff = (classDateTime - now) / (1000 * 60)
  
  if (minutesDiff <= 0) return 'คลาสเริ่มแล้ว'
  if (minutesDiff <= 30) return 'ปิดรับจองแล้ว (จองได้ก่อนคลาส 30 นาที)'
  if (minutesDiff > (7 * 24 * 60)) return 'ยังไม่เปิดรับจอง'
  
  return 'จองคลาส'
}

const loadClassDetail = async () => {
  loading.value = true
  try {
    const classId = route.params.id
    const classDoc = await getDoc(doc(db, 'classes', classId))
    
    if (classDoc.exists()) {
      yogaClass.value = {
        id: classDoc.id,
        ...classDoc.data()
      }
      
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
    }
  } catch (error) {
    console.error('Error loading class detail:', error)
    Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: 'ไม่สามารถโหลดข้อมูลคลาสได้',
      icon: 'error',
      confirmButtonText: 'ตกลง'
    })
  } finally {
    loading.value = false
  }
}

const bookClass = () => {
  showConfirmModal.value = true
}

const confirmBooking = async () => {
  if (!yogaClass.value || booking.value) return
  
  booking.value = true
  try {
    const bookingData = {
      userId: authStore.userProfile.lineUserId,
      classId: yogaClass.value.id,
      className: yogaClass.value.name,
      date: yogaClass.value.date,
      time: yogaClass.value.time,
      instructor: yogaClass.value.instructor,
      status: 'confirmed',
      bookedAt: new Date(),
      canCancelUntil: new Date(`${yogaClass.value.date}T${yogaClass.value.time}:00`)
    }
    
    await addDoc(collection(db, 'bookings'), bookingData)
    await updateDoc(doc(db, 'classes', yogaClass.value.id), {
      currentBookings: increment(1)
    })
    
    await loadClassDetail()
    
    showConfirmModal.value = false
    
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

onMounted(() => {
  loadClassDetail()
})
</script>

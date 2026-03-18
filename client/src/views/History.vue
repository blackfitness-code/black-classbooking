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
        <h1 class="page-title">ประวัติการจอง</h1>
      </div>
    </header>

    <main class="max-w-md mx-auto px-6 py-6">
      <!-- Filter Tabs -->
      <div class="flex bg-gray-100 rounded-2xl p-1 mb-6">
        <button
          @click="activeTab = 'upcoming'"
          :class="[
            'flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all',
            activeTab === 'upcoming'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          ]"
        >
          กำลังจะมา
        </button>
        <button
          @click="activeTab = 'past'"
          :class="[
            'flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all',
            activeTab === 'past'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          ]"
        >
          ผ่านมาแล้ว
        </button>
      </div>

      <!-- No bookings -->
      <div v-if="!loading && filteredBookings.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <p class="text-gray-500">ไม่มีประวัติการจอง</p>
      </div>

      <!-- Bookings List -->
      <div v-if="!loading && filteredBookings.length > 0" class="space-y-4">
        <div
          v-for="booking in filteredBookings"
          :key="booking.id"
          class="card hover:shadow-md transition-all"
        >
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 mb-2">{{ booking.className }}</h4>
              <div class="space-y-1">
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  {{ formatDate(booking.date) }}
                </div>
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ booking.time }}
                </div>
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  ครู {{ booking.instructor }}
                </div>
              </div>
            </div>
            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-4',
                getStatusColor(booking.status)
              ]"
            >
              {{ getStatusText(booking.status) }}
            </span>
          </div>

          <!-- Cancel Button -->
          <button
            v-if="canCancel(booking)"
            @click="cancelBooking(booking)"
            class="w-full py-3 px-4 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 transition-all"
            :disabled="cancelling === booking.id"
          >
            {{ cancelling === booking.id ? 'กำลังยกเลิก...' : 'ยกเลิกการจอง' }}
          </button>

          <div v-else-if="booking.status === 'confirmed'" class="text-center py-3">
            <p class="text-sm text-gray-500">{{ getCancelReasonText(booking) }}</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Cancel Confirmation Modal -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">ยืนยันการยกเลิก</h3>
          <p class="text-gray-600 mb-2">คุณแน่ใจหรือไม่ที่จะยกเลิกการจองนี้?</p>
          <p class="text-xs text-orange-600">
            หมายเหตุ: สามารถยกเลิกได้เฉพาะก่อน 24 ชั่วโมงก่อนคลาสเริ่มเท่านั้น
          </p>
        </div>
        
        <div v-if="selectedBooking" class="bg-gray-50 rounded-2xl p-4 mb-6">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">คลาส:</span>
              <span class="font-medium">{{ selectedBooking.className }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">วันที่:</span>
              <span class="font-medium">{{ formatDate(selectedBooking.date) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">เวลา:</span>
              <span class="font-medium">{{ selectedBooking.time }}</span>
            </div>
          </div>
        </div>
        
        <div class="flex space-x-3">
          <button @click="showCancelModal = false" class="btn-secondary flex-1">
            ไม่ยกเลิก
          </button>
          <button @click="confirmCancel" class="bg-red-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-red-600 transition-all flex-1">
            ยืนยันยกเลิก
          </button>
        </div>
      </div>
    </div>
    
    <!-- Loading Overlay -->
    <LoadingOverlay 
      :show="loading" 
      title="กำลังโหลดประวัติ"
      subtitle="กรุณารอสักครู่..."
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { db } from '../firebase'
import { collection, query, where, getDocs, updateDoc, doc, increment } from 'firebase/firestore'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import Swal from 'sweetalert2'
import LoadingOverlay from '../components/LoadingOverlay.vue'

const authStore = useAuthStore()

const activeTab = ref('upcoming')
const bookings = ref([])
const loading = ref(false)
const showCancelModal = ref(false)
const selectedBooking = ref(null)
const cancelling = ref(null)

const filteredBookings = computed(() => {
  const now = new Date()
  
  return bookings.value.filter(booking => {
    const bookingDate = new Date(`${booking.date}T${booking.time}:00`)
    
    if (activeTab.value === 'upcoming') {
      return bookingDate >= now && booking.status !== 'cancelled'
    } else {
      return bookingDate < now || booking.status === 'cancelled'
    }
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}:00`)
    const dateB = new Date(`${b.date}T${b.time}:00`)
    
    if (activeTab.value === 'upcoming') {
      return dateA - dateB // Ascending for upcoming
    } else {
      return dateB - dateA // Descending for past
    }
  })
})

const formatDate = (dateString) => {
  return format(new Date(dateString), 'dd MMMM yyyy', { locale: th })
}

const getStatusText = (status) => {
  const statusMap = {
    confirmed: 'ยืนยันแล้ว',
    cancelled: 'ยกเลิกแล้ว',
    completed: 'เสร็จสิ้น'
  }
  return statusMap[status] || status
}

const getStatusColor = (status) => {
  const colorMap = {
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800'
}

const canCancel = (booking) => {
  if (booking.status !== 'confirmed') return false
  
  const now = new Date()
  const bookingDate = new Date(`${booking.date}T${booking.time}:00`)
  
  // Can cancel only if more than 24 hours before class starts
  const hoursDiff = (bookingDate - now) / (1000 * 60 * 60)
  return hoursDiff > 24
}

const getCancelReasonText = (booking) => {
  const now = new Date()
  const bookingDate = new Date(`${booking.date}T${booking.time}:00`)
  const hoursDiff = (bookingDate - now) / (1000 * 60 * 60)
  
  if (hoursDiff <= 0) {
    return 'คลาสเริ่มแล้ว'
  } else if (hoursDiff <= 24) {
    const hoursLeft = Math.floor(hoursDiff)
    const minutesLeft = Math.floor((hoursDiff - hoursLeft) * 60)
    return `ไม่สามารถยกเลิกได้ (เหลือเวลา ${hoursLeft} ชม. ${minutesLeft} นาที)`
  } else {
    return 'ไม่สามารถยกเลิกได้แล้ว'
  }
}

const cancelBooking = (booking) => {
  selectedBooking.value = booking
  showCancelModal.value = true
}

const confirmCancel = async () => {
  if (!selectedBooking.value) return
  
  cancelling.value = selectedBooking.value.id
  
  try {
    // Update booking status
    await updateDoc(doc(db, 'bookings', selectedBooking.value.id), {
      status: 'cancelled',
      cancelledAt: new Date()
    })
    
    // Update class capacity
    await updateDoc(doc(db, 'classes', selectedBooking.value.classId), {
      currentBookings: increment(-1)
    })
    
    // Update local state
    const bookingIndex = bookings.value.findIndex(b => b.id === selectedBooking.value.id)
    if (bookingIndex !== -1) {
      bookings.value[bookingIndex].status = 'cancelled'
    }
    
    showCancelModal.value = false
    selectedBooking.value = null
    
    Swal.fire({
      title: 'สำเร็จ!',
      text: 'ยกเลิกการจองสำเร็จ!',
      icon: 'success',
      confirmButtonText: 'ตกลง'
    })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: 'เกิดข้อผิดพลาดในการยกเลิก',
      icon: 'error',
      confirmButtonText: 'ตกลง'
    })
  } finally {
    cancelling.value = null
  }
}

const loadBookings = async () => {
  loading.value = true
  try {
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', authStore.userProfile.lineUserId)
    )
    const snapshot = await getDocs(q)
    bookings.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error loading bookings:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadBookings()
})
</script>
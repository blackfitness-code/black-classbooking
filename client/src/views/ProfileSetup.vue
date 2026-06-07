<template>
  <div class="page-container">
    <!-- Header -->
    <header class="page-header">
      <div class="max-w-md mx-auto px-6 py-4">
        <h1 class="page-title text-center">ข้อมูลเบื้องต้น</h1>
        <p class="text-sm text-gray-600 text-center mt-1">กรุณากรอกข้อมูลสำหรับการจองคลาส</p>
      </div>
    </header>

    <main class="max-w-md mx-auto px-6 py-6">
      <!-- Profile Card -->
      <div class="card mb-6">
        <div class="flex items-center space-x-4 mb-4">
          <div class="relative">
            <img
              v-if="profilePictureUrl"
              :src="profilePictureUrl"
              :alt="liffStore.profile?.displayName"
              class="w-16 h-16 rounded-full object-cover"
              @error="onImageError"
            >
            <div
              v-else
              class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <svg class="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
          </div>
          <div>
            <h2 class="text-lg font-semibold">{{ liffStore.profile?.displayName }}</h2>
            <p class="text-sm text-gray-600">ยินดีต้อนรับสู่ระบบจองคลาส</p>
          </div>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
        <div class="flex items-start">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
            <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-medium text-blue-800 mb-1">ข้อมูลที่จำเป็น</h3>
            <p class="text-sm text-blue-700">
              ฟิลด์ที่มีเครื่องหมาย <span class="text-red-500 font-medium">*</span> 
              จำเป็นต้องกรอกให้ครบถ้วนก่อนดำเนินการต่อ
            </p>
          </div>
        </div>
      </div>

      <!-- Profile Form -->
      <form @submit.prevent="submitProfile" class="space-y-6">
        <!-- Personal Information -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">ข้อมูลส่วนตัว</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">ชื่อเล่น *</label>
              <input
                v-model="form.nickname"
                type="text"
                required
                data-field="nickname"
                :class="[
                  'input-field',
                  errors.nickname ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                ]"
                placeholder="ชื่อที่ต้องการให้เรียก"
              >
              <p v-if="errors.nickname" class="text-red-500 text-sm mt-1">{{ errors.nickname }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">ชื่อจริง *</label>
              <input
                v-model="form.firstName"
                type="text"
                required
                data-field="firstName"
                :class="[
                  'input-field',
                  errors.firstName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                ]"
                placeholder="ชื่อจริง"
              >
              <p v-if="errors.firstName" class="text-red-500 text-sm mt-1">{{ errors.firstName }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">นามสกุล *</label>
              <input
                v-model="form.lastName"
                type="text"
                required
                data-field="lastName"
                :class="[
                  'input-field',
                  errors.lastName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                ]"
                placeholder="นามสกุล"
              >
              <p v-if="errors.lastName" class="text-red-500 text-sm mt-1">{{ errors.lastName }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">เบอร์โทรศัพท์</label>
              <input
                v-model="form.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="08X-XXX-XXXX"
              >
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">วันเกิด</label>
              <input
                v-model="form.birthDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">เพศ</label>
              <select
                v-model="form.gender"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">เลือกเพศ</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Exercise Experience -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">ประสบการณ์การออกกำลังกาย</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">ระดับประสบการณ์ *</label>
              <select
                v-model="form.yogaLevel"
                required
                data-field="yogaLevel"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
                  errors.yogaLevel 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-primary'
                ]"
              >
                <option value="">เลือกระดับ</option>
                <option value="beginner">มือใหม่ (ไม่เคยออกกำลังกาย)</option>
                <option value="basic">เริ่มต้น (ออกกำลังกายมาแล้ว 1-6 เดือน)</option>
                <option value="intermediate">ปานกลาง (ออกกำลังกายมาแล้ว 6 เดือน - 2 ปี)</option>
                <option value="advanced">ขั้นสูง (ออกกำลังกายมาแล้วมากกว่า 2 ปี)</option>
              </select>
              <p v-if="errors.yogaLevel" class="text-red-500 text-sm mt-1">{{ errors.yogaLevel }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">เป้าหมายในการออกกำลังกาย</label>
              <textarea
                v-model="form.goals"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="เช่น ต้องการผ่อนคลาย, เพิ่มความยืดหยุ่น, ลดน้ำหนัก, สร้างกล้ามเนื้อ..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Health Information -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">ข้อมูลสุขภาพ</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">มีปัญหาสุขภาพหรือการบาดเจ็บที่ควรระวังหรือไม่?</label>
              <textarea
                v-model="form.healthIssues"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="เช่น ปวดหลัง, ปัญหาข้อเข่า, ความดันโลหิตสูง... (ถ้าไม่มีให้ใส่ 'ไม่มี')"
              ></textarea>
            </div>

            <div>
              <label class="flex items-center">
                <input
                  v-model="form.emergencyContact.hasContact"
                  type="checkbox"
                  class="mr-2"
                >
                ต้องการเพิ่มข้อมูลผู้ติดต่อฉุกเฉิน
              </label>
            </div>

            <div v-if="form.emergencyContact.hasContact" class="space-y-3 pl-6">
              <div>
                <label class="block text-sm font-medium mb-1">ชื่อผู้ติดต่อฉุกเฉิน</label>
                <input
                  v-model="form.emergencyContact.name"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="ชื่อ-นามสกุล"
                >
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">เบอร์โทรศัพท์</label>
                <input
                  v-model="form.emergencyContact.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="08X-XXX-XXXX"
                >
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">ความสัมพันธ์</label>
                <input
                  v-model="form.emergencyContact.relationship"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="เช่น พ่อ, แม่, สามี, ภรรยา, เพื่อน"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="card">
          <div class="space-y-3">
            <div>
              <label class="flex items-start">
                <input
                  v-model="form.acceptTerms"
                  type="checkbox"
                  required
                  class="mr-2 mt-1"
                >
                <span class="text-sm">
                  ฉันยอมรับ<a href="#" class="text-primary underline">ข้อกำหนดและเงื่อนไข</a>การใช้บริการ
                  และ<a href="#" class="text-primary underline">นโยบายความเป็นส่วนตัว</a> *
                </span>
              </label>
              <p v-if="errors.acceptTerms" class="text-red-500 text-sm mt-1 ml-6">{{ errors.acceptTerms }}</p>
            </div>

            <div>
              <label class="flex items-start">
                <input
                  v-model="form.acceptRisk"
                  type="checkbox"
                  required
                  class="mr-2 mt-1"
                >
                <span class="text-sm">
                  ฉันรับทราบและยอมรับความเสี่ยงในการออกกำลังกาย และจะปฏิบัติตามคำแนะนำของครูผู้สอน *
                </span>
              </label>
              <p v-if="errors.acceptRisk" class="text-red-500 text-sm mt-1 ml-6">{{ errors.acceptRisk }}</p>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="mt-8 pt-6">
          <button
            type="submit"
            :disabled="submitting"
            class="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold text-lg py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div class="flex items-center justify-center space-x-3">
              <span>{{ submitting ? 'กำลังบันทึก...' : 'เริ่มใช้งาน' }}</span>
              <svg v-if="!submitting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
              <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </button>
          
          <!-- Additional Info -->
          <p class="text-center text-sm text-gray-500 mt-4">
            ข้อมูลของคุณจะถูกเก็บไว้อย่างปลอดภัย
          </p>
        </div>
      </form>
    </main>
    
    <!-- Loading Overlay -->
    <LoadingOverlay 
      :show="submitting" 
      title="กำลังบันทึกข้อมูล"
      subtitle="กรุณารอสักครู่..."
    />
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLiffStore } from '../stores/liff'
import { useAuthStore } from '../stores/auth'
import Swal from '../utils/dialog'
import LoadingOverlay from '../components/LoadingOverlay.vue'

const router = useRouter()
const liffStore = useLiffStore()
const authStore = useAuthStore()

const submitting = ref(false)
const errors = ref({})

const form = reactive({
  nickname: '',
  firstName: '',
  lastName: '',
  phone: '',
  birthDate: '',
  gender: '',
  yogaLevel: '',
  interests: [],
  goals: '',
  healthIssues: '',
  emergencyContact: {
    hasContact: false,
    name: '',
    phone: '',
    relationship: ''
  },
  acceptTerms: false,
  acceptRisk: false
})

const validateForm = () => {
  errors.value = {}
  
  // Required fields validation
  if (!form.nickname.trim()) {
    errors.value.nickname = 'กรุณากรอกชื่อเล่น'
  }
  
  if (!form.firstName.trim()) {
    errors.value.firstName = 'กรุณากรอกชื่อจริง'
  }
  
  if (!form.lastName.trim()) {
    errors.value.lastName = 'กรุณากรอกนามสกุล'
  }
  
  if (!form.yogaLevel) {
    errors.value.yogaLevel = 'กรุณาเลือกระดับประสบการณ์'
  }
  
  if (!form.acceptTerms) {
    errors.value.acceptTerms = 'กรุณายอมรับข้อกำหนดและเงื่อนไข'
  }
  
  if (!form.acceptRisk) {
    errors.value.acceptRisk = 'กรุณายอมรับความเสี่ยงในการเล่นโยคะ'
  }
  
  return Object.keys(errors.value).length === 0
}

const profilePictureUrl = computed(() => {
  const url = liffStore.profile?.pictureUrl
  if (!url) return null
  try {
    const u = new URL(url)
    u.searchParams.set('t', Date.now().toString())
    return u.toString()
  } catch {
    return url
  }
})

const onImageError = (event) => {
  event.target.style.display = 'none'
}

// Clear errors when user starts typing
watch(() => form.nickname, () => {
  if (errors.value.nickname) delete errors.value.nickname
})

watch(() => form.firstName, () => {
  if (errors.value.firstName) delete errors.value.firstName
})

watch(() => form.lastName, () => {
  if (errors.value.lastName) delete errors.value.lastName
})

watch(() => form.yogaLevel, () => {
  if (errors.value.yogaLevel) delete errors.value.yogaLevel
})

watch(() => form.acceptTerms, () => {
  if (errors.value.acceptTerms) delete errors.value.acceptTerms
})

watch(() => form.acceptRisk, () => {
  if (errors.value.acceptRisk) delete errors.value.acceptRisk
})

const submitProfile = async () => {
  // Validate form first
  if (!validateForm()) {
    // Show validation errors
    const errorMessages = Object.values(errors.value)
    
    // Scroll to first error field
    const firstErrorField = Object.keys(errors.value)[0]
    const element = document.querySelector(`[data-field="${firstErrorField}"]`) || 
                   document.querySelector('.border-red-500')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.focus()
    }
    
    Swal.fire({
      title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      html: `<div class="text-left">
        <p class="mb-2">ฟิลด์ที่จำเป็นต้องกรอก:</p>
        <ul class="list-disc list-inside space-y-1">
          ${errorMessages.map(msg => `<li class="text-red-600">${msg}</li>`).join('')}
        </ul>
      </div>`,
      icon: 'warning',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#00B900'
    })
    return
  }
  
  submitting.value = true
  
  try {
    const profileData = {
      nickname: form.nickname.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      birthDate: form.birthDate,
      gender: form.gender,
      yogaLevel: form.yogaLevel,
      interests: form.interests,
      goals: form.goals.trim(),
      healthIssues: form.healthIssues.trim(),
      emergencyContact: form.emergencyContact.hasContact ? {
        name: form.emergencyContact.name.trim(),
        phone: form.emergencyContact.phone.trim(),
        relationship: form.emergencyContact.relationship.trim()
      } : null,
      acceptTerms: form.acceptTerms,
      acceptRisk: form.acceptRisk
    }

    await authStore.completeProfileSetup(profileData)
    
    // Show success message
    await Swal.fire({
      title: 'สำเร็จ!',
      text: 'บันทึกข้อมูลเรียบร้อยแล้ว ยินดีต้อนรับสู่ระบบจองคลาส',
      icon: 'success',
      confirmButtonText: 'เริ่มใช้งาน',
      confirmButtonColor: '#00B900'
    })
    
    // Redirect to home
    router.push('/')
  } catch (error) {
    console.error('Profile setup failed:', error)
    Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง',
      icon: 'error',
      confirmButtonText: 'ตกลง'
    })
  } finally {
    submitting.value = false
  }
}
</script>
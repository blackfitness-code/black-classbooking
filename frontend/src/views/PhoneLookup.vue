<template>
  <div class="min-h-screen bg-gradient-to-b from-primary/5 via-gray-50 to-gray-50 flex flex-col">

    <!-- Card -->
    <main class="flex-1 max-w-md mx-auto w-full px-5 pt-8 relative">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

        <!-- Step indicator -->
        <div class="flex items-center gap-2 mb-6">
          <div class="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-xs font-bold shrink-0">1</div>
          <div class="h-0.5 flex-1 bg-gray-200 rounded-full">
            <div class="h-full w-0 bg-primary rounded-full"></div>
          </div>
          <div class="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-400 text-xs font-bold shrink-0">2</div>
        </div>

        <h2 class="font-bold text-gray-900 text-lg mb-1">กรอกเบอร์โทรศัพท์</h2>
        <p class="text-sm text-gray-500 mb-6">ระบบจะค้นหาข้อมูลของคุณโดยอัตโนมัติ</p>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              เบอร์โทรศัพท์ <span class="text-red-400">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>
                </svg>
              </div>
              <input
                ref="phoneInput"
                v-model="phone"
                type="tel"
                inputmode="numeric"
                maxlength="12"
                autofocus
                placeholder="08X-XXX-XXXX"
                :class="[
                  'w-full pl-11 pr-4 py-3.5 rounded-xl border bg-gray-50 text-gray-900 text-lg font-medium tracking-wider placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition',
                  error ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-gray-200 focus:border-primary'
                ]"
                @keydown.enter.prevent="handleSubmit"
              >
            </div>
            <p v-if="error" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              {{ error }}
            </p>
          </div>

          <!-- CRM found preview -->
          <transition name="slide-down">
            <div v-if="crmData" class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                  <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  </svg>
                </div>
                <span class="text-sm font-semibold text-emerald-700">พบข้อมูลของคุณในระบบ</span>
              </div>
              <div class="space-y-1 text-sm text-emerald-800">
                <p><span class="text-emerald-600">ชื่อ:</span> {{ crmData.firstName }} {{ crmData.lastName }}
                  <span v-if="crmData.nickname" class="text-emerald-500">({{ crmData.nickname }})</span>
                </p>
                <p v-if="crmData.branch"><span class="text-emerald-600">สาขา:</span> {{ crmData.branch }}</p>
              </div>
              <p class="text-xs text-emerald-600 mt-2.5">ข้อมูลด้านล่างจะถูกกรอกให้อัตโนมัติ</p>
            </div>
          </transition>

          <!-- Not found hint (only show after lookup, not on error) -->
          <transition name="slide-down">
            <div v-if="notFound" class="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
              <svg class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <div>
                <p class="text-sm font-medium text-amber-700">ไม่พบข้อมูลเบอร์นี้</p>
                <p class="text-xs text-amber-600 mt-0.5">คุณสามารถดำเนินการต่อและกรอกข้อมูลด้วยตัวเองได้</p>
              </div>
            </div>
          </transition>
        </form>
      </div>
    </main>

    <!-- Sticky button -->
    <div class="sticky bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-100 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div class="max-w-md mx-auto">
        <button
          type="button"
          :disabled="loading"
          @click="handleSubmit"
          class="w-full bg-gradient-to-r from-primary to-primary/90 text-white font-semibold text-base py-3.5 rounded-2xl shadow-lg hover:shadow-xl active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="flex items-center justify-center gap-2">
            <span>{{ loading ? 'กำลังค้นหา...' : 'ถัดไป' }}</span>
            <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </span>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLiffStore } from '../stores/liff'
import api from '../lib/api'

const router = useRouter()
const liffStore = useLiffStore()

const phone = ref('')
const loading = ref(false)
const error = ref('')
const crmData = ref(null)
const notFound = ref(false)

// format 0XX-XXX-XXXX ระหว่างพิมพ์
const phoneDigits = (val) => (val || '').replace(/\D/g, '').slice(0, 10)
const formatPhone = (val) => {
  const d = phoneDigits(val)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
}

watch(phone, (val) => {
  const formatted = formatPhone(val)
  if (formatted !== val) phone.value = formatted

  // reset state เมื่อแก้เบอร์
  crmData.value = null
  notFound.value = false
  error.value = ''
})

const handleSubmit = async () => {
  const digits = phoneDigits(phone.value)

  // validate
  if (!digits) {
    error.value = 'กรุณากรอกเบอร์โทรศัพท์'
    return
  }
  if (!/^0\d{9}$/.test(digits)) {
    error.value = 'เบอร์โทรไม่ถูกต้อง (10 หลัก ขึ้นต้นด้วย 0)'
    return
  }

  error.value = ''
  loading.value = true

  try {
    const res = await api.get(`/crm/lookup?phone=${digits}`, { auth: false })

    if (res.found) {
      crmData.value = res.data
      notFound.value = false

      // รอให้ animation แสดงนิดนึงก่อน navigate
      await new Promise(r => setTimeout(r, 700))
    } else {
      crmData.value = null
      notFound.value = true

      await new Promise(r => setTimeout(r, 500))
    }

    // ส่ง prefill ผ่าน sessionStorage (reliable กว่า history.state กับ Vue Router)
    sessionStorage.setItem('prefill_phone', digits)
    sessionStorage.setItem('prefill_crm', res.found ? JSON.stringify(res.data) : '')

    router.push({ name: 'ProfileSetup' })
  } catch (err) {
    console.error('[PhoneLookup]', err)
    sessionStorage.setItem('prefill_phone', digits)
    sessionStorage.setItem('prefill_crm', '')
    router.push({ name: 'ProfileSetup' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

<template>
  <div class="min-h-screen bg-gradient-to-b from-primary/5 via-gray-50 to-gray-50 pb-32">
    <!-- Hero header -->
    <header class="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 text-white rounded-b-[2rem] shadow-lg">
      <div class="absolute -top-12 -right-10 w-44 h-44 bg-white/10 rounded-full blur-2xl"></div>
      <div class="absolute -bottom-16 -left-8 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>

      <div class="relative max-w-md mx-auto px-6 pt-8 pb-10">
        <h1 class="text-xl font-bold text-center">ตั้งค่าโปรไฟล์</h1>
        <p class="text-sm text-white/80 text-center mt-1">กรอกข้อมูลเพื่อเริ่มจองคลาส</p>

        <!-- Step indicator -->
        <div class="flex items-center gap-2 mt-5 max-w-[180px] mx-auto">
          <div class="flex items-center justify-center w-7 h-7 rounded-full bg-white/30 text-white text-xs font-bold shrink-0">1</div>
          <div class="h-0.5 flex-1 bg-white/30 rounded-full">
            <div class="h-full w-full bg-white rounded-full"></div>
          </div>
          <div class="flex items-center justify-center w-7 h-7 rounded-full bg-white text-primary text-xs font-bold shrink-0">2</div>
        </div>
      </div>
    </header>

    <main class="max-w-md mx-auto px-5 -mt-6 relative">
      <!-- Progress -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-gray-500">กรอกข้อมูลที่จำเป็น</span>
          <span class="text-xs font-bold" :class="completion === 100 ? 'text-emerald-500' : 'text-primary'">{{ completion }}%</span>
        </div>
        <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="completion === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-primary to-emerald-400'"
            :style="{ width: completion + '%' }"
          ></div>
        </div>
      </div>

      <form @submit.prevent="submitProfile" class="space-y-5">
        <!-- Personal Information -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div class="flex items-center gap-2.5 mb-5">
            <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
            <h3 class="font-bold text-gray-900">ข้อมูลส่วนตัว</h3>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">ชื่อเล่น <span class="text-red-400">*</span></label>
              <input
                v-model="form.nickname"
                type="text"
                required
                data-field="nickname"
                :class="inputClass('nickname')"
                placeholder="ชื่อที่ต้องการให้เรียก"
              >
              <p v-if="errors.nickname" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                {{ errors.nickname }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">ชื่อจริง <span class="text-red-400">*</span></label>
                <input
                  v-model="form.firstName"
                  type="text"
                  required
                  data-field="firstName"
                  :class="inputClass('firstName')"
                  placeholder="ชื่อจริง"
                >
                <p v-if="errors.firstName" class="text-red-500 text-xs mt-1.5">{{ errors.firstName }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">นามสกุล <span class="text-red-400">*</span></label>
                <input
                  v-model="form.lastName"
                  type="text"
                  required
                  data-field="lastName"
                  :class="inputClass('lastName')"
                  placeholder="นามสกุล"
                >
                <p v-if="errors.lastName" class="text-red-500 text-xs mt-1.5">{{ errors.lastName }}</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">เลขบัตรประชาชน <span class="text-red-400">*</span></label>
              <input
                v-model="form.nationalId"
                type="text"
                inputmode="numeric"
                maxlength="13"
                required
                data-field="nationalId"
                :class="[inputClass('nationalId'), 'tracking-[0.15em] font-medium']"
                placeholder="เลข 13 หลัก"
              >
              <p v-if="errors.nationalId" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                {{ errors.nationalId }}
              </p>
              <p v-else class="text-gray-400 text-xs mt-1.5">{{ form.nationalId.length }}/13 หลัก</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">เบอร์โทรศัพท์</label>
              <input
                v-model="form.phone"
                type="tel"
                inputmode="numeric"
                maxlength="12"
                data-field="phone"
                :class="inputClass('phone')"
                placeholder="08X-XXX-XXXX"
              >
              <p v-if="errors.phone" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                {{ errors.phone }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">วันเกิด</label>
              <input
                v-model="form.birthDate"
                type="text"
                inputmode="numeric"
                maxlength="10"
                placeholder="dd/mm/yyyy"
                :class="[inputClass('birthDate'), 'tracking-widest']"
              >
              <p v-if="errors.birthDate" class="text-red-500 text-xs mt-1.5">{{ errors.birthDate }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">เพศ</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="g in genders"
                  :key="g.value"
                  type="button"
                  @click="form.gender = g.value"
                  :class="['py-2.5 rounded-xl text-sm font-medium border transition',
                    form.gender === g.value
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300']"
                >
                  {{ g.label }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Health Information -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div class="flex items-center gap-2.5 mb-5">
            <div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </div>
            <h3 class="font-bold text-gray-900">ข้อมูลสุขภาพ</h3>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">ปัญหาสุขภาพ/การบาดเจ็บที่ควรระวัง</label>
              <textarea
                v-model="form.healthIssues"
                rows="3"
                :class="inputClass('healthIssues')"
                placeholder="เช่น ปวดหลัง, ปัญหาข้อเข่า, ความดันโลหิตสูง... (ถ้าไม่มีให้ใส่ 'ไม่มี')"
              ></textarea>
            </div>

            <!-- Emergency contact toggle -->
            <button
              type="button"
              @click="form.emergencyContact.hasContact = !form.emergencyContact.hasContact"
              class="w-full flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <svg class="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.7 21 3 14.3 3 6V5z"/></svg>
                <span class="text-sm font-medium text-gray-700 truncate">เพิ่มผู้ติดต่อฉุกเฉิน</span>
              </div>
              <span :class="['relative w-10 h-6 rounded-full transition-colors shrink-0', form.emergencyContact.hasContact ? 'bg-primary' : 'bg-gray-300']">
                <span :class="['absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', form.emergencyContact.hasContact ? 'translate-x-4' : '']"></span>
              </span>
            </button>

            <div v-if="form.emergencyContact.hasContact" class="space-y-3 rounded-xl bg-gray-50 p-4 border border-gray-100">
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">ชื่อผู้ติดต่อ</label>
                <input v-model="form.emergencyContact.name" type="text" :class="inputClass('ecName')" placeholder="ชื่อ-นามสกุล">
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">เบอร์โทรศัพท์</label>
                <input v-model="form.emergencyContact.phone" type="tel" inputmode="numeric" maxlength="12" data-field="ecPhone" :class="inputClass('ecPhone')" placeholder="08X-XXX-XXXX">
                <p v-if="errors.ecPhone" class="text-red-500 text-xs mt-1">{{ errors.ecPhone }}</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">ความสัมพันธ์</label>
                <input v-model="form.emergencyContact.relationship" type="text" :class="inputClass('ecRel')" placeholder="เช่น พ่อ, แม่, สามี, ภรรยา, เพื่อน">
              </div>
            </div>
          </div>
        </section>

        <!-- Terms and Conditions -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div class="space-y-3">
            <label
              :class="['flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition',
                errors.acceptTerms ? 'border-red-300 bg-red-50' : 'border-gray-200']"
            >
              <input v-model="form.acceptTerms" type="checkbox" required class="mt-0.5 w-5 h-5 accent-primary shrink-0">
              <span class="text-sm text-gray-600">
                ฉันยอมรับ<a href="#" @click.prevent.stop="openLegal('terms')" class="text-primary underline">ข้อกำหนดและเงื่อนไข</a>การใช้บริการ
                และ<a href="#" @click.prevent.stop="openLegal('privacy')" class="text-primary underline">นโยบายความเป็นส่วนตัว</a> <span class="text-red-400">*</span>
              </span>
            </label>
            <p v-if="errors.acceptTerms" class="text-red-500 text-xs ml-1">{{ errors.acceptTerms }}</p>

            <label
              :class="['flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition',
                errors.acceptRisk ? 'border-red-300 bg-red-50' : 'border-gray-200']"
            >
              <input v-model="form.acceptRisk" type="checkbox" required class="mt-0.5 w-5 h-5 accent-primary shrink-0">
              <span class="text-sm text-gray-600">
                ฉันรับทราบและยอมรับความเสี่ยงในการออกกำลังกาย และจะปฏิบัติตามคำแนะนำของครูผู้สอน <span class="text-red-400">*</span>
              </span>
            </label>
            <p v-if="errors.acceptRisk" class="text-red-500 text-xs ml-1">{{ errors.acceptRisk }}</p>
          </div>
        </section>
      </form>
    </main>

    <!-- Sticky submit -->
    <div class="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-100 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div class="max-w-md mx-auto">
        <button
          type="button"
          @click="submitProfile"
          :disabled="submitting"
          class="w-full bg-gradient-to-r from-primary to-primary/90 text-white font-semibold text-base py-3.5 rounded-2xl shadow-lg hover:shadow-xl active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="flex items-center justify-center gap-2">
            <span>{{ submitting ? 'กำลังบันทึก...' : 'เริ่มใช้งาน' }}</span>
            <svg v-if="!submitting" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            <span v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          </span>
        </button>
        <p class="text-center text-[11px] text-gray-400 mt-2 flex items-center justify-center gap-1">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11V11z"/></svg>
          ข้อมูลของคุณจะถูกเก็บไว้อย่างปลอดภัย
        </p>
      </div>
    </div>

    <!-- Legal Modal (ข้อกำหนด / นโยบายความเป็นส่วนตัว) -->
    <transition name="modal">
      <div
        v-if="legalView"
        class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
        style="background: rgba(0,0,0,0.45); backdrop-filter: blur(4px);"
        @click.self="closeLegal"
      >
        <div class="modal-content bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85dvh] flex flex-col">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <h3 class="font-bold text-gray-900">
              {{ legalView === 'terms' ? 'ข้อกำหนดและเงื่อนไขการใช้บริการ' : 'นโยบายความเป็นส่วนตัว' }}
            </h3>
            <button
              type="button"
              @click="closeLegal"
              class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200"
              aria-label="ปิด"
            >✕</button>
          </div>
          <div
            class="overflow-y-auto px-5 py-4 text-sm text-gray-600 leading-relaxed"
            v-html="legalView === 'terms' ? TERMS_HTML : PRIVACY_HTML"
          ></div>
          <div class="px-5 py-3 border-t border-gray-100 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button type="button" @click="closeLegal" class="btn-primary w-full">ปิด</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Loading Overlay -->
    <LoadingOverlay
      :show="submitting"
      title="กำลังบันทึกข้อมูล"
      subtitle="กรุณารอสักครู่..."
    />
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, nextTick } from 'vue'
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

// ข้อกำหนด / นโยบายความเป็นส่วนตัว (modal)
const legalView = ref(null) // null | 'terms' | 'privacy'
const openLegal = (v) => { legalView.value = v }
const closeLegal = () => { legalView.value = null }

const TERMS_HTML = `
  <p class="font-semibold text-gray-800 mb-3">ระเบียบการใช้บริการ</p>
  <ul class="list-disc pl-5 space-y-2.5">
    <li>สมาชิกต้องผ่านการลงทะเบียน เข้าและออก ที่เครื่องสแกนใบหน้าบริเวณประตูทางเข้าทุกครั้ง</li>
    <li>สมาชิกจะต้องนำสิ่งของสัมภาระออกจากตู้ล็อกเกอร์ทุกครั้งที่ออกจากยิม</li>
    <li>ตู้ล็อกเกอร์มีไว้เพื่ออำนวยความสะดวกแก่สมาชิกเท่านั้น มิได้ใช้เป็นการรับฝากของและทรัพย์สิน หากเกิดการสูญหายหรือเสียหายไม่ว่ากรณีใดๆ Black Fitness ขอสงวนสิทธิ์ไม่รับผิดชอบ และไม่อนุญาตให้เก็บสิ่งของข้ามคืนโดยเด็ดขาด</li>
    <li>สมาชิกต้องรับผิดชอบต่อความเสียหายที่เกิดขึ้นภายในสถานที่ให้บริการ ที่เกิดจากสมาชิกและแขกของสมาชิก</li>
    <li>สมาชิกจะต้องสวมใส่เสื้อผ้าให้เหมาะสมกับการใช้บริการ และจะต้องสวมใส่รองเท้ากีฬาเท่านั้น</li>
    <li>สมาชิกห้ามถอดเสื้อขณะเข้าใช้บริการทุกกรณี</li>
    <li>สมาชิกห้ามสูบบุหรี่ทุกชนิดภายในตัวอาคาร โดยจะต้องสูบในบริเวณที่ทางผู้ให้บริการจัดเตรียมไว้เท่านั้น</li>
    <li>ห้ามนำสัตว์เลี้ยงเข้ามาในสถานที่ออกกำลังกาย และไม่รับฝากสัตว์เลี้ยงทุกกรณี</li>
    <li>สมาชิกที่อายุต่ำกว่า 15 ปี จะต้องได้รับความยินยอมจากผู้ปกครองในการเข้าใช้บริการ</li>
    <li>Black Fitness ไม่อนุญาตให้สมาชิกนำผู้ฝึกสอนส่วนตัว (Trainer) เข้ามาในสถานที่ให้บริการ</li>
    <li>หากสมาชิกไม่ปฏิบัติตามระเบียบข้อหนึ่งข้อใดจากที่กล่าวมาทั้งหมด ทางผู้ให้บริการมีสิทธิ์เชิญผู้รับบริการออกจากพื้นที่ตัวอาคาร หรือถอดถอนสภาพความเป็นสมาชิกได้ทันที</li>
    <li>หากสมาชิกได้รับการบาดเจ็บหรือเสียชีวิตภายในสถานที่ออกกำลังกาย โดยมีสาเหตุจากตัวเองหรือการใช้อุปกรณ์ด้วยความประมาท ทาง Black Fitness จะไม่รับผิดชอบใดๆ ทั้งสิ้น</li>
    <li>การหยุดพักสถานะสมาชิกชั่วคราว สามารถทำได้ในกรณีมีปัญหาสุขภาพหรือตั้งครรภ์เท่านั้น โดยระยะเวลาการหยุดจะขึ้นอยู่กับใบรับรองแพทย์ที่ออกโดยโรงพยาบาล และแพทย์เห็นสมควรให้งดออกกำลังกาย</li>
    <li>Black Fitness ขอสงวนสิทธิ์ในการไม่คืนเงินทุกกรณี</li>
    <li>Black Fitness มีการบันทึกภาพและวิดีโอ รวมถึงการจัดเก็บข้อมูลจากกล้องวงจรปิด (CCTV) ซึ่งติดตั้งบริเวณอาคารและสถานที่ เพื่อวัตถุประสงค์ในการป้องกันเหตุอันตรายและการกระทำผิดกฎหมายที่เกิดขึ้นในบริเวณที่ทำการ รวมทั้งการปฏิบัติตามกฎที่เกี่ยวข้อง ซึ่งบริษัทอาจมีการใช้และเปิดเผยข้อมูลให้กับบุคคลหรือหน่วยงานที่มีอำนาจตามกฎหมาย เพื่อใช้เป็นหลักฐานทางกฎหมายที่เกี่ยวข้อง</li>
  </ul>
`

const PRIVACY_HTML = `
  <p class="text-xs text-gray-400 mb-3">ปรับปรุงล่าสุด: 11 มิถุนายน 2569</p>
  <p class="mb-4">Black Fitness ("เรา") เคารพความเป็นส่วนตัวของท่านสมาชิก และให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) นโยบายฉบับนี้อธิบายวิธีที่เราเก็บรวบรวม ใช้ เปิดเผย และคุ้มครองข้อมูลของท่าน</p>

  <p class="font-semibold text-gray-800 mt-4 mb-2">1. ข้อมูลที่เราเก็บรวบรวม</p>
  <ul class="list-disc pl-5 space-y-1.5">
    <li><span class="font-medium">ข้อมูลส่วนตัว:</span> ชื่อเล่น ชื่อ-นามสกุล เลขบัตรประจำตัวประชาชน วันเกิด เพศ และเบอร์โทรศัพท์</li>
    <li><span class="font-medium">ข้อมูลจากบัญชี LINE:</span> LINE User ID ชื่อที่แสดง และรูปโปรไฟล์ เพื่อใช้ระบุตัวตนและเข้าสู่ระบบ</li>
    <li><span class="font-medium">ข้อมูลผู้ติดต่อฉุกเฉิน:</span> ชื่อ เบอร์โทรศัพท์ และความสัมพันธ์ (หากท่านระบุ)</li>
    <li><span class="font-medium">ข้อมูลอ่อนไหว:</span> ข้อมูลสุขภาพ/การบาดเจ็บที่ท่านแจ้ง และข้อมูลภาพใบหน้า (biometric) สำหรับระบบสแกนใบหน้าเข้า-ออก ซึ่งเราจะเก็บและใช้ต่อเมื่อได้รับความยินยอมโดยชัดแจ้งจากท่าน</li>
    <li><span class="font-medium">ข้อมูลการใช้บริการ:</span> ประวัติการจองคลาส การเข้า-ออกสถานที่ และสถานะสมาชิก</li>
    <li><span class="font-medium">ภาพจากกล้องวงจรปิด (CCTV):</span> ที่ติดตั้งภายในบริเวณอาคารและสถานที่ให้บริการ</li>
  </ul>

  <p class="font-semibold text-gray-800 mt-4 mb-2">2. วัตถุประสงค์ในการใช้ข้อมูล</p>
  <ul class="list-disc pl-5 space-y-1.5">
    <li>ลงทะเบียนและบริหารจัดการสมาชิกภาพ</li>
    <li>ยืนยันตัวตนและควบคุมการเข้า-ออกสถานที่ผ่านระบบสแกนใบหน้า</li>
    <li>ให้บริการจองคลาสและจัดการตารางการใช้บริการ</li>
    <li>ดูแลความปลอดภัยของสมาชิก พนักงาน และทรัพย์สิน</li>
    <li>ติดต่อสื่อสาร แจ้งข่าวสาร และให้ความช่วยเหลือกรณีฉุกเฉิน</li>
    <li>ปฏิบัติตามกฎหมายและกฎระเบียบที่เกี่ยวข้อง</li>
  </ul>

  <p class="font-semibold text-gray-800 mt-4 mb-2">3. ฐานทางกฎหมาย</p>
  <p>เราประมวลผลข้อมูลของท่านบนฐานความยินยอม การปฏิบัติตามสัญญาการเป็นสมาชิก ประโยชน์โดยชอบด้วยกฎหมาย (เช่น ความปลอดภัยและ CCTV) และการปฏิบัติตามกฎหมาย สำหรับข้อมูลอ่อนไหว (สุขภาพและภาพใบหน้า) เราจะประมวลผลบนฐานความยินยอมโดยชัดแจ้งเท่านั้น</p>

  <p class="font-semibold text-gray-800 mt-4 mb-2">4. การเปิดเผยข้อมูล</p>
  <p>เราจะไม่ขายหรือเปิดเผยข้อมูลของท่านเพื่อวัตถุประสงค์ทางการตลาดของบุคคลภายนอก เราอาจเปิดเผยข้อมูลให้แก่ผู้ให้บริการระบบที่ช่วยดำเนินงานแทนเรา (เช่น ระบบจองและจัดเก็บข้อมูล) และแก่หน่วยงานราชการหรือผู้มีอำนาจตามกฎหมาย เมื่อมีความจำเป็นต้องปฏิบัติตามกฎหมายหรือเพื่อเป็นหลักฐานทางกฎหมาย</p>

  <p class="font-semibold text-gray-800 mt-4 mb-2">5. ระยะเวลาการเก็บรักษา</p>
  <p>เราจะเก็บรักษาข้อมูลของท่านตลอดระยะเวลาที่ท่านเป็นสมาชิก และต่อเนื่องเท่าที่จำเป็นตามวัตถุประสงค์ข้างต้นหรือตามที่กฎหมายกำหนด ภาพจากกล้องวงจรปิดจะถูกเก็บไว้ในระยะเวลาที่เหมาะสมตามการใช้งานปกติ จากนั้นจะถูกลบหรือทำให้ไม่สามารถระบุตัวตนได้</p>

  <p class="font-semibold text-gray-800 mt-4 mb-2">6. สิทธิของเจ้าของข้อมูล</p>
  <p>ภายใต้กฎหมาย ท่านมีสิทธิขอเข้าถึง ขอรับสำเนา ขอแก้ไขให้ถูกต้อง ขอลบ ขอระงับการใช้ ขอคัดค้านการประมวลผล ขอให้โอนย้ายข้อมูล และถอนความยินยอมได้ทุกเมื่อ ทั้งนี้การถอนความยินยอมบางกรณี (เช่น ข้อมูลสแกนใบหน้า) อาจทำให้ท่านไม่สามารถใช้บริการบางส่วนได้</p>

  <p class="font-semibold text-gray-800 mt-4 mb-2">7. ความปลอดภัยของข้อมูล</p>
  <p>เราจัดให้มีมาตรการรักษาความมั่นคงปลอดภัยที่เหมาะสมเพื่อป้องกันการเข้าถึง ใช้ หรือเปิดเผยข้อมูลโดยไม่ได้รับอนุญาต</p>

  <p class="font-semibold text-gray-800 mt-4 mb-2">8. ติดต่อเรา</p>
  <p>หากท่านมีคำถามเกี่ยวกับนโยบายฉบับนี้ หรือต้องการใช้สิทธิของท่าน กรุณาติดต่อ Black Fitness ผ่านช่องทาง LINE Official Account หรือ ณ เคาน์เตอร์ของสาขาที่ท่านใช้บริการ</p>
`

const genders = [
  { value: 'male', label: 'ชาย' },
  { value: 'female', label: 'หญิง' },
  { value: 'other', label: 'อื่นๆ' }
]

const form = reactive({
  nickname: '',
  firstName: '',
  lastName: '',
  nationalId: '',
  phone: '',
  birthDate: '',
  gender: '',
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

// แปลง dd-mm-yyyy (จาก CRM) → dd/mm/yyyy (สำหรับแสดงใน input)
const parseCrmDate = (dmy) => {
  if (!dmy || dmy === '-') return ''
  const [d, m, y] = dmy.split('-')
  if (!d || !m || !y) return ''
  return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
}

// auto-format dd/mm/yyyy ระหว่างพิมพ์
const formatBirthDate = (val) => {
  const digits = (val || '').replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

// แปลง dd/mm/yyyy → yyyy-mm-dd สำหรับส่ง backend
const birthDateToISO = (val) => {
  const digits = (val || '').replace(/\D/g, '')
  if (digits.length !== 8) return ''
  const d = digits.slice(0, 2), m = digits.slice(2, 4), y = digits.slice(4, 8)
  return `${y}-${m}-${d}`
}

const isValidBirthDate = (val) => {
  const digits = (val || '').replace(/\D/g, '')
  if (digits.length !== 8) return false
  const d = parseInt(digits.slice(0, 2)), m = parseInt(digits.slice(2, 4)), y = parseInt(digits.slice(4, 8))
  if (m < 1 || m > 12 || d < 1 || d > 31) return false
  if (y < 1900 || y > new Date().getFullYear()) return false
  return true
}

onMounted(() => {
  const phone = sessionStorage.getItem('prefill_phone')
  const crmRaw = sessionStorage.getItem('prefill_crm')

  // ลบทันทีหลังอ่าน ป้องกันค้างข้าม session
  sessionStorage.removeItem('prefill_phone')
  sessionStorage.removeItem('prefill_crm')

  if (phone) {
    form.phone = formatThaiPhone(phone)
  }

  if (crmRaw) {
    try {
      const crm = JSON.parse(crmRaw)

      // ใช้ nextTick เพื่อให้ watchers ที่ validate ทำงานหลัง reactive ตั้งค่าเสร็จ
      nextTick(() => {
        if (crm.firstName)  form.firstName  = crm.firstName.trim()
        if (crm.lastName)   form.lastName   = crm.lastName.trim()
        if (crm.nickname)   form.nickname   = crm.nickname.trim()
        if (crm.nationalId) form.nationalId = crm.nationalId.replace(/\D/g, '').slice(0, 13)
        if (crm.email && crm.email !== '-') form.email = crm.email.trim()
        if (crm.dob)        form.birthDate  = parseCrmDate(crm.dob)
        if (crm.gender && ['male', 'female', 'other'].includes(crm.gender)) {
          form.gender = crm.gender
        }
      })
    } catch {
      // ignore parse error
    }
  }
})

// อนุญาตเฉพาะอักษรไทย + เว้นวรรค
const THAI_ONLY = /^[฀-๿\s]+$/
const isThaiText = (s) => THAI_ONLY.test((s || '').trim())

// ตรวจเลขบัตรประชาชนไทย (13 หลัก + checksum)
const isValidThaiId = (id) => {
  if (!/^\d{13}$/.test(id)) return false
  let sum = 0
  for (let i = 0; i < 12; i++) sum += parseInt(id.charAt(i), 10) * (13 - i)
  return (11 - (sum % 11)) % 10 === parseInt(id.charAt(12), 10)
}

// เบอร์โทรไทย: 10 หลัก ขึ้นต้นด้วย 0 (มือถือ/บ้าน)
const phoneDigits = (val) => (val || '').replace(/\D/g, '').slice(0, 10)
const isValidThaiPhone = (val) => /^0\d{9}$/.test(phoneDigits(val))
// จัดรูปแบบ 0XX-XXX-XXXX ระหว่างพิมพ์
const formatThaiPhone = (val) => {
  const d = phoneDigits(val)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
}

// ตรวจทีละฟิลด์ระหว่างพิมพ์ (เตือนทันที)
const validateField = (field) => {
  switch (field) {
    case 'nickname':
    case 'firstName':
    case 'lastName':
      if (form[field] && !isThaiText(form[field])) {
        errors.value[field] = 'กรุณากรอกเป็นภาษาไทยเท่านั้น'
      } else {
        delete errors.value[field]
      }
      break
    case 'nationalId':
      // เตือนเฉพาะตอนครบ 13 หลักแล้วแต่ checksum ไม่ผ่าน (ระหว่างพิมพ์ใช้ตัวนับหลักแทน)
      if (form.nationalId.length === 13 && !isValidThaiId(form.nationalId)) {
        errors.value.nationalId = 'เลขบัตรประชาชนไม่ถูกต้อง'
      } else {
        delete errors.value.nationalId
      }
      break
    case 'phone':
      // เตือนเฉพาะตอนครบ 10 หลักแต่รูปแบบไม่ถูก (ระหว่างพิมพ์ปล่อยให้กรอกต่อ)
      if (phoneDigits(form.phone).length === 10 && !isValidThaiPhone(form.phone)) {
        errors.value.phone = 'เบอร์โทรไม่ถูกต้อง'
      } else {
        delete errors.value.phone
      }
      break
    case 'ecPhone':
      if (phoneDigits(form.emergencyContact.phone).length === 10 && !isValidThaiPhone(form.emergencyContact.phone)) {
        errors.value.ecPhone = 'เบอร์โทรไม่ถูกต้อง'
      } else {
        delete errors.value.ecPhone
      }
      break
  }
}

// คลาส input ที่ใช้ร่วมกัน (มีสถานะ error)
const inputClass = (field) => [
  'w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition',
  errors.value[field] ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-gray-200 focus:border-primary'
]

// % ความคืบหน้าของฟิลด์ที่จำเป็น
const completion = computed(() => {
  const checks = [
    !!form.nickname.trim() && isThaiText(form.nickname),
    !!form.firstName.trim() && isThaiText(form.firstName),
    !!form.lastName.trim() && isThaiText(form.lastName),
    isValidThaiId(form.nationalId.trim()),
    form.acceptTerms,
    form.acceptRisk
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
})

const validateForm = () => {
  errors.value = {}

  // Required fields validation
  if (!form.nickname.trim()) {
    errors.value.nickname = 'กรุณากรอกชื่อเล่น'
  } else if (!isThaiText(form.nickname)) {
    errors.value.nickname = 'กรุณากรอกเป็นภาษาไทยเท่านั้น'
  }

  if (!form.firstName.trim()) {
    errors.value.firstName = 'กรุณากรอกชื่อจริง'
  } else if (!isThaiText(form.firstName)) {
    errors.value.firstName = 'กรุณากรอกเป็นภาษาไทยเท่านั้น'
  }

  if (!form.lastName.trim()) {
    errors.value.lastName = 'กรุณากรอกนามสกุล'
  } else if (!isThaiText(form.lastName)) {
    errors.value.lastName = 'กรุณากรอกเป็นภาษาไทยเท่านั้น'
  }

  if (!form.nationalId.trim()) {
    errors.value.nationalId = 'กรุณากรอกเลขบัตรประชาชน'
  } else if (!isValidThaiId(form.nationalId.trim())) {
    errors.value.nationalId = 'เลขบัตรประชาชนไม่ถูกต้อง'
  }

  // เบอร์โทร: ไม่บังคับ แต่ถ้ากรอกต้องถูกต้อง
  if (form.phone.trim() && !isValidThaiPhone(form.phone)) {
    errors.value.phone = 'เบอร์โทรไม่ถูกต้อง (10 หลัก ขึ้นต้นด้วย 0)'
  }

  if (form.emergencyContact.hasContact && form.emergencyContact.phone.trim() && !isValidThaiPhone(form.emergencyContact.phone)) {
    errors.value.ecPhone = 'เบอร์โทรผู้ติดต่อฉุกเฉินไม่ถูกต้อง'
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

// เตือนแบบ real-time ขณะพิมพ์
watch(() => form.nickname, () => validateField('nickname'))
watch(() => form.firstName, () => validateField('firstName'))
watch(() => form.lastName, () => validateField('lastName'))

// เลขบัตร: รับเฉพาะตัวเลข สูงสุด 13 หลัก + เตือนทันที
watch(() => form.nationalId, (val) => {
  const digits = (val || '').replace(/\D/g, '').slice(0, 13)
  if (digits !== val) {
    form.nationalId = digits
    return // watcher จะรันซ้ำหลังแก้ค่า แล้วค่อย validate
  }
  validateField('nationalId')
})

// เบอร์โทร: รับเฉพาะตัวเลข + จัดรูปแบบ 0XX-XXX-XXXX แล้วค่อย validate
watch(() => form.phone, (val) => {
  const formatted = formatThaiPhone(val)
  if (formatted !== val) {
    form.phone = formatted
    return // watcher จะรันซ้ำหลังแก้ค่า แล้วค่อย validate
  }
  validateField('phone')
})

watch(() => form.birthDate, (val) => {
  const formatted = formatBirthDate(val)
  if (formatted !== val) {
    form.birthDate = formatted
    return
  }
  if (val.replace(/\D/g, '').length === 8 && !isValidBirthDate(val)) {
    errors.value.birthDate = 'วันเกิดไม่ถูกต้อง'
  } else {
    delete errors.value.birthDate
  }
})

watch(() => form.emergencyContact.phone, (val) => {
  const formatted = formatThaiPhone(val)
  if (formatted !== val) {
    form.emergencyContact.phone = formatted
    return
  }
  validateField('ecPhone')
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
                   document.querySelector('.border-red-400')
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
      nationalId: form.nationalId.trim(),
      phone: phoneDigits(form.phone),
      birthDate: birthDateToISO(form.birthDate),
      gender: form.gender,
      healthIssues: form.healthIssues.trim(),
      emergencyContact: form.emergencyContact.hasContact ? {
        name: form.emergencyContact.name.trim(),
        phone: phoneDigits(form.emergencyContact.phone),
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

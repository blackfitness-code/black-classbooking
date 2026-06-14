<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 modal-backdrop"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-900">แก้ไขข้อมูลสมาชิก</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none">&times;</button>
      </div>

      <!-- Body -->
      <form @submit.prevent="handleSubmit" class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
        <div class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
          ID: {{ user?.id }}
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Nickname</label>
            <input v-model="form.nickname" type="text" class="input-field" placeholder="nickname" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">ชื่อ (firstName)</label>
            <input v-model="form.firstName" type="text" class="input-field" placeholder="ชื่อจริง" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">นามสกุล (lastName)</label>
            <input v-model="form.lastName" type="text" class="input-field" placeholder="นามสกุล" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">เบอร์โทร</label>
            <input v-model="form.phone" type="tel" class="input-field" placeholder="0xx-xxx-xxxx" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">เพศ</label>
            <select v-model="form.gender" class="input-field">
              <option value="">— เลือก —</option>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
              <option value="other">อื่น ๆ</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">วันเกิด</label>
            <input v-model="form.birthDate" type="date" class="input-field" />
          </div>
          <div class="col-span-2">
            <label class="block text-xs font-medium text-gray-600 mb-1">เลขบัตรประชาชน</label>
            <input v-model="form.nationalId" type="text" class="input-field" placeholder="x-xxxx-xxxxx-xx-x" maxlength="17" />
          </div>
          <div class="col-span-2">
            <label class="block text-xs font-medium text-gray-600 mb-1">ปัญหาสุขภาพ / โรคประจำตัว</label>
            <textarea v-model="form.healthIssues" rows="2" class="input-field resize-none" placeholder="ระบุถ้ามี"></textarea>
          </div>
        </div>

        <!-- Error -->
        <p v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ error }}</p>
      </form>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
        <button type="button" class="btn-secondary" @click="$emit('close')" :disabled="saving">ยกเลิก</button>
        <button type="button" class="btn-primary" @click="handleSubmit" :disabled="saving">
          {{ saving ? 'กำลังบันทึก…' : 'บันทึก' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '../lib/api.js'

const props = defineProps({
  visible: Boolean,
  user: { type: Object, default: null },
})

const emit = defineEmits(['close', 'saved'])

const saving = ref(false)
const error = ref(null)

const form = ref({
  nickname: '',
  firstName: '',
  lastName: '',
  phone: '',
  gender: '',
  birthDate: '',
  nationalId: '',
  healthIssues: '',
})

// รีเซ็ต form ทุกครั้งที่เปิด modal หรือเปลี่ยน user
watch(
  () => [props.visible, props.user],
  () => {
    if (props.visible && props.user) {
      const u = props.user
      form.value = {
        nickname: u.nickname ?? '',
        firstName: u.firstName ?? '',
        lastName: u.lastName ?? '',
        phone: u.phone ?? '',
        gender: u.gender ?? '',
        birthDate: u.birthDate ? u.birthDate.slice(0, 10) : '',
        nationalId: u.nationalId ?? '',
        healthIssues: u.healthIssues ?? '',
      }
      error.value = null
    }
  },
  { immediate: true }
)

async function handleSubmit() {
  if (!props.user) return
  saving.value = true
  error.value = null
  try {
    const res = await api.put(`/admin/users/${props.user.id}`, {
      nickname: form.value.nickname || undefined,
      firstName: form.value.firstName || undefined,
      lastName: form.value.lastName || undefined,
      phone: form.value.phone || undefined,
      gender: form.value.gender || undefined,
      birthDate: form.value.birthDate || undefined,
      nationalId: form.value.nationalId || undefined,
      healthIssues: form.value.healthIssues || undefined,
    })
    emit('saved', res.user)
  } catch (err) {
    error.value = err.message ?? 'บันทึกไม่สำเร็จ'
  } finally {
    saving.value = false
  }
}
</script>

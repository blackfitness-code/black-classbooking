<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-modal flex items-end sm:items-center justify-center bg-overlay p-0 sm:p-4"
      @click.self="$emit('close')"
    >
      <div
        class="bg-surface-raised rounded-t-xl sm:rounded-xl shadow-modal w-full sm:max-w-lg max-h-[92vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="แก้ไขข้อมูลสมาชิก"
      >
        <div class="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <UserAvatar v-if="user" :user="user" size="lg" />
            <div class="min-w-0">
              <h2 class="text-lg font-semibold text-ink truncate">แก้ไขข้อมูล</h2>
              <p class="text-2xs text-ink-muted truncate">{{ user?.nickname || user?.displayName || user?.id }}</p>
            </div>
          </div>
          <button @click="$emit('close')" class="btn-ghost p-2 -mr-2" aria-label="ปิด">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
          <p class="text-2xs text-ink-muted mb-4 font-mono">ID: {{ user?.id }}</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">ชื่อเล่น</label>
              <input v-model="form.nickname" type="text" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">เบอร์โทร</label>
              <input v-model="form.phone" type="tel" class="input-field" placeholder="08xxxxxxxx" />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">ชื่อจริง</label>
              <input v-model="form.firstName" type="text" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">นามสกุล</label>
              <input v-model="form.lastName" type="text" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">เพศ</label>
              <select v-model="form.gender" class="input-field">
                <option value="">— เลือก —</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="other">อื่น ๆ</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">วันเกิด</label>
              <input v-model="form.birthDate" type="date" class="input-field" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">เลขบัตรประชาชน</label>
              <input v-model="form.nationalId" type="text" class="input-field font-mono text-sm" maxlength="13" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">ปัญหาสุขภาพ</label>
              <textarea v-model="form.healthIssues" rows="3" class="input-field resize-none"></textarea>
            </div>
          </div>

          <p v-if="error" class="text-sm text-danger bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-4">
            {{ error }}
          </p>
        </form>

        <div class="flex items-center justify-end gap-2 px-5 sm:px-6 py-4 border-t border-line shrink-0 bg-surface-sunken/50">
          <button type="button" class="btn-secondary" @click="$emit('close')" :disabled="saving">ยกเลิก</button>
          <button type="button" class="btn-primary" @click="handleSubmit" :disabled="saving">
            {{ saving ? 'กำลังบันทึก…' : 'บันทึก' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import UserAvatar from './UserAvatar.vue'
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

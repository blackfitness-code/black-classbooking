<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-modal flex items-end sm:items-center justify-center bg-overlay p-0 sm:p-4"
      @click.self="$emit('close')"
    >
      <div
        class="bg-surface-raised rounded-t-xl sm:rounded-xl shadow-modal w-full sm:max-w-xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <div class="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-line shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <UserAvatar v-if="user" :user="user" size="lg" />
            <div class="min-w-0">
              <h2 class="text-lg font-semibold text-ink truncate">{{ title }}</h2>
              <p v-if="subtitle" class="text-2xs text-ink-muted mt-0.5">{{ subtitle }}</p>
            </div>
          </div>
          <button @click="$emit('close')" class="btn-ghost p-2 -mr-2" aria-label="ปิด">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
          <dl class="divide-y divide-line-faint">
            <div
              v-for="field in fields"
              :key="field.key"
              class="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div class="flex-1 min-w-0">
                <dt class="text-2xs font-medium text-ink-muted">{{ field.label }}</dt>
                <dd class="text-sm text-ink mt-1 break-all whitespace-pre-wrap">{{ field.value || '—' }}</dd>
              </div>
              <button
                type="button"
                @click="copyField(field)"
                :disabled="!field.value"
                class="btn-ghost text-2xs shrink-0"
                :class="copiedKey === field.key ? '!text-success' : ''"
              >
                {{ copiedKey === field.key ? 'คัดลอกแล้ว' : 'คัดลอก' }}
              </button>
            </div>
          </dl>
        </div>

        <div class="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-line shrink-0 bg-surface-sunken/50">
          <button type="button" class="btn-secondary" :disabled="!hasAnyValue" @click="copyAll">
            คัดลอกทั้งหมด
          </button>
          <button type="button" class="btn-primary" @click="$emit('close')">ปิด</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import UserAvatar from './UserAvatar.vue'
import { getProfileFields, displayName, completionTime, relativeTime } from '../lib/profileFields.js'

const props = defineProps({
  visible: Boolean,
  user: { type: Object, default: null },
})

const emit = defineEmits(['close', 'toast'])

const copiedKey = ref(null)
let copiedTimer = null

const fields = computed(() => getProfileFields(props.user))
const title = computed(() => displayName(props.user))
const subtitle = computed(() => {
  const t = completionTime(props.user)
  return t ? `กรอกข้อมูลครบ ${relativeTime(t)}` : ''
})
const hasAnyValue = computed(() => fields.value.some(f => f.value))

watch(() => props.visible, (open) => {
  if (!open) {
    copiedKey.value = null
    if (copiedTimer) clearTimeout(copiedTimer)
  }
})

async function copyText(text) {
  if (!text) return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  }
}

async function copyField(field) {
  if (!field.value) return
  const ok = await copyText(field.value)
  if (!ok) {
    emit('toast', { message: 'คัดลอกไม่สำเร็จ', type: 'error' })
    return
  }
  copiedKey.value = field.key
  if (copiedTimer) clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => { copiedKey.value = null }, 1500)
}

async function copyAll() {
  const text = fields.value.filter(f => f.value).map(f => `${f.label}: ${f.value}`).join('\n')
  const ok = await copyText(text)
  emit('toast', {
    message: ok ? 'คัดลอกข้อมูลทั้งหมดแล้ว' : 'คัดลอกไม่สำเร็จ',
    type: ok ? 'success' : 'error',
  })
}
</script>

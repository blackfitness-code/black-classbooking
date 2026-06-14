<template>
  <div ref="rootEl">
    <button
      ref="btnEl"
      type="button"
      @click.stop="toggleOpen"
      class="relative p-2 rounded-lg transition-colors duration-150"
      :class="[
        unreadCount > 0
          ? 'text-primary bg-primary-muted hover:bg-primary-muted bell-has-unread'
          : 'text-ink-secondary hover:text-ink hover:bg-surface-sunken',
        { 'bell-ring': ring },
      ]"
      :aria-expanded="open"
      aria-haspopup="true"
      :aria-label="unreadCount > 0 ? `การแจ้งเตือน ${unreadCount} รายการใหม่` : 'การแจ้งเตือนสมาชิกใหม่'"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
      </svg>

      <!-- Count badge + ping ring -->
      <span v-if="unreadCount > 0" class="absolute -top-0.5 -right-0.5 flex items-center justify-center">
        <span class="absolute inline-flex h-full w-full min-w-[1.125rem] rounded-full bg-danger opacity-40 bell-ping" aria-hidden="true"></span>
        <span class="relative min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center rounded-full bg-danger text-white text-[10px] font-bold leading-none ring-2 ring-surface-raised">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </span>
    </button>

    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="open"
          ref="panelEl"
          class="fixed z-dropdown w-[min(100vw-1rem,22rem)] bg-surface-raised rounded-xl shadow-dropdown overflow-hidden"
          :style="panelStyle"
          role="dialog"
          aria-label="รายการแจ้งเตือน"
        >
          <div class="flex items-center justify-between px-4 py-3 border-b border-line">
            <div>
              <p class="text-sm font-semibold text-ink">สมาชิกใหม่</p>
              <p class="text-2xs text-ink-muted mt-0.5">กรอกโปรไฟล์ครบแล้ว</p>
            </div>
            <button
              v-if="unreadCount > 0"
              type="button"
              @click="$emit('mark-all-read')"
              class="text-2xs font-medium text-primary hover:text-primary-hover"
            >
              อ่านทั้งหมด
            </button>
          </div>

          <div class="max-h-[min(20rem,60vh)] overflow-y-auto overscroll-contain">
            <template v-if="loading && items.length === 0">
              <div v-for="i in 3" :key="i" class="h-16 mx-3 my-2 rounded-lg skeleton"></div>
            </template>

            <div
              v-else-if="items.length === 0"
              class="flex flex-col items-center justify-center py-12 px-4 text-center"
            >
              <div class="w-10 h-10 rounded-full bg-surface-sunken flex items-center justify-center mb-2">
                <svg class="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
              </div>
              <p class="text-sm text-ink-secondary">ยังไม่มีแจ้งเตือน</p>
              <p class="text-2xs text-ink-muted mt-1">จะแจ้งเมื่อมีคนกรอกข้อมูลครบ</p>
            </div>

            <button
              v-else
              v-for="item in items"
              :key="item.id"
              type="button"
              @click="onSelect(item)"
              :class="[
                'w-full text-left flex items-center gap-3 px-4 py-3 border-b border-line-faint last:border-0 transition-colors duration-150',
                item.unread ? 'bg-primary-muted hover:bg-surface-sunken' : 'hover:bg-surface-sunken',
              ]"
            >
              <div class="relative shrink-0">
                <UserAvatar :user="item.user" size="md" />
                <span
                  v-if="item.unread"
                  class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-danger ring-2 ring-surface-raised"
                ></span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-ink truncate">{{ displayName(item.user) }}</p>
                <p class="text-2xs text-ink-muted mt-0.5">{{ relativeTime(completionTime(item.user)) }}</p>
              </div>
              <svg class="w-4 h-4 text-ink-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import UserAvatar from './UserAvatar.vue'
import { displayName, completionTime, relativeTime } from '../lib/profileFields.js'

defineProps({
  items: { type: Array, default: () => [] },
  unreadCount: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  ring: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'mark-all-read'])

const open = ref(false)
const rootEl = ref(null)
const btnEl = ref(null)
const panelEl = ref(null)
const panelPos = ref({ top: 0, right: 0 })

const panelStyle = computed(() => ({
  top: `${panelPos.value.top}px`,
  right: `${panelPos.value.right}px`,
}))

function updatePanelPos() {
  if (!btnEl.value) return
  const rect = btnEl.value.getBoundingClientRect()
  panelPos.value = {
    top: rect.bottom + 8,
    right: Math.max(8, window.innerWidth - rect.right),
  }
}

function toggleOpen() {
  open.value = !open.value
  if (open.value) nextTick(updatePanelPos)
}

function close() {
  open.value = false
}

function onSelect(item) {
  emit('select', item.user)
  close()
}

function onClickOutside(e) {
  if (!open.value) return
  const t = e.target
  if (rootEl.value?.contains(t) || panelEl.value?.contains(t)) return
  close()
}

function onScrollOrResize() {
  if (open.value) updatePanelPos()
}

watch(open, (v) => {
  if (v) nextTick(updatePanelPos)
})

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  window.addEventListener('resize', onScrollOrResize)
  window.addEventListener('scroll', onScrollOrResize, true)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  window.removeEventListener('resize', onScrollOrResize)
  window.removeEventListener('scroll', onScrollOrResize, true)
})

defineExpose({ close })
</script>

<style scoped>
.bell-has-unread {
  box-shadow: inset 0 0 0 1px var(--color-primary-border);
}

.bell-ping {
  animation: bellPing 1.6s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

@keyframes bellPing {
  0% { transform: scale(1); opacity: 0.5; }
  70%, 100% { transform: scale(1.6); opacity: 0; }
}

.bell-ring {
  animation: bellRing 0.5s cubic-bezier(0.25, 1, 0.5, 1) 2;
}

@keyframes bellRing {
  0%, 100% { transform: rotate(0); }
  20% { transform: rotate(10deg); }
  40% { transform: rotate(-8deg); }
  60% { transform: rotate(5deg); }
  80% { transform: rotate(-3deg); }
}

@media (prefers-reduced-motion: reduce) {
  .bell-ping { animation: none; opacity: 0.35; transform: none; }
  .bell-ring { animation: none; }
}
</style>

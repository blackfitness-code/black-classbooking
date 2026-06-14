<template>
  <div class="panel flex flex-col min-h-0 h-full">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-line shrink-0">
      <div class="min-w-0">
        <h2 class="text-base font-semibold text-ink">รายชื่อสมาชิก</h2>
        <p class="text-2xs text-ink-muted mt-0.5">คลิกแถวเพื่อดูข้อมูล · แก้ไข inline ได้ทันที</p>
      </div>

      <div class="relative flex-1 sm:max-w-xs sm:ml-auto">
        <input
          v-model="search"
          type="search"
          class="input-field pl-9 py-2"
          placeholder="ค้นหาชื่อ / เบอร์โทร…"
          aria-label="ค้นหาสมาชิก"
        />
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>

      <span class="text-2xs text-ink-muted shrink-0 tabular-nums">{{ filtered.length }} รายการ</span>
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-auto min-h-0">
      <template v-if="loading && users.length === 0">
        <div class="p-4 space-y-2">
          <div v-for="i in 8" :key="i" class="h-11 rounded-lg skeleton"></div>
        </div>
      </template>

      <div
        v-else-if="filtered.length === 0"
        class="flex flex-col items-center justify-center h-full min-h-[240px] text-center px-6"
      >
        <div class="w-12 h-12 rounded-full bg-surface-sunken flex items-center justify-center mb-3">
          <svg class="w-6 h-6 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <p class="text-sm font-medium text-ink-secondary">ไม่พบสมาชิก</p>
        <p class="text-2xs text-ink-muted mt-1">ลองค้นหาด้วยชื่อเล่น เบอร์โทร หรือชื่อ LINE</p>
      </div>

      <table v-else class="w-full border-collapse min-w-[760px]">
        <thead class="sticky top-0 z-10">
          <tr>
            <th class="table-header w-[220px]">สมาชิก</th>
            <th class="table-header">เบอร์โทร</th>
            <th class="table-header">แพ็คเกจ</th>
            <th class="table-header">วันหมดอายุ</th>
            <th class="table-header">สิทธิ์</th>
            <th class="table-header">สมัครเมื่อ</th>
            <th class="table-header text-right w-[140px]"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="u in filtered"
            :key="u.id"
            :class="[
              'group transition-colors duration-150',
              highlightId === u.id ? 'row-flash' : 'hover:bg-surface-sunken/60',
            ]"
          >
            <td class="table-cell">
              <div class="flex items-center gap-2.5 min-w-0">
                <UserAvatar :user="u" size="sm" />
                <div class="min-w-0">
                  <p class="font-medium text-ink truncate">{{ displayName(u) }}</p>
                  <p v-if="u.displayName && u.nickname" class="text-2xs text-ink-muted truncate">{{ u.displayName }}</p>
                </div>
              </div>
            </td>

            <td class="table-cell text-ink-secondary tabular-nums">{{ u.phone || '—' }}</td>

            <td class="table-cell">
              <select
                :value="u.memberType"
                @change="e => onMemberTypeChange(u, e.target.value)"
                :disabled="savingCell === `mt-${u.id}`"
                class="input-inline min-w-[7rem]"
              >
                <option value="">ยังไม่มี</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </td>

            <td class="table-cell">
              <div class="flex items-center gap-1.5">
                <input
                  :value="expiryMap[u.id] ?? isoDateStr(u.membershipExpiry)"
                  @input="e => expiryMap[u.id] = e.target.value"
                  type="date"
                  class="input-inline w-[8.5rem]"
                  :disabled="savingCell === `exp-${u.id}`"
                />
                <button
                  v-if="expiryMap[u.id] !== undefined && expiryMap[u.id] !== isoDateStr(u.membershipExpiry)"
                  @click="onSaveExpiry(u)"
                  :disabled="savingCell === `exp-${u.id}`"
                  class="btn-primary text-2xs px-2 py-1"
                >
                  {{ savingCell === `exp-${u.id}` ? '…' : 'บันทึก' }}
                </button>
              </div>
            </td>

            <td class="table-cell">
              <select
                v-if="isAdmin"
                :value="u.role"
                @change="e => onRoleChange(u, e.target.value)"
                :disabled="savingCell === `role-${u.id}`"
                class="input-inline"
              >
                <option value="user">user</option>
                <option value="staff">staff</option>
                <option value="admin">admin</option>
              </select>
              <span v-else :class="roleBadgeClass(u.role)">{{ u.role }}</span>
            </td>

            <td class="table-cell text-ink-muted whitespace-nowrap text-2xs">{{ formatDate(u.createdAt) }}</td>

            <td class="table-cell text-right">
              <div class="flex items-center justify-end gap-0.5 opacity-80 group-hover:opacity-100">
                <button @click="$emit('view-profile', u)" class="btn-ghost text-2xs">ดู</button>
                <button v-if="isAdmin" @click="$emit('edit-profile', u)" class="btn-ghost text-2xs text-primary">
                  แก้ไข
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import UserAvatar from './UserAvatar.vue'
import api from '../lib/api.js'

const props = defineProps({
  users: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  highlightId: { type: String, default: null },
})

const emit = defineEmits(['update-user', 'edit-profile', 'view-profile', 'toast'])

const search = ref('')
const savingCell = ref(null)
const expiryMap = reactive({})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.users
  return props.users.filter(u => {
    const name = displayName(u).toLowerCase()
    const phone = (u.phone ?? '').toLowerCase()
    const line = (u.displayName ?? '').toLowerCase()
    return name.includes(q) || phone.includes(q) || line.includes(q)
  })
})

function displayName(u) {
  return u.nickname || u.displayName || u.firstName || u.lineUserId || '—'
}

function isoDateStr(isoStr) {
  if (!isoStr) return ''
  return isoStr.slice(0, 10)
}

function formatDate(isoStr) {
  if (!isoStr) return '—'
  try {
    return new Date(isoStr).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch {
    return isoStr.slice(0, 10)
  }
}

function roleBadgeClass(r) {
  if (r === 'admin') return 'badge-admin'
  if (r === 'staff') return 'badge-staff'
  return 'badge-user'
}

async function onMemberTypeChange(user, memberType) {
  savingCell.value = `mt-${user.id}`
  try {
    const res = await api.put(`/admin/users/${user.id}/member-type`, { memberType })
    emit('update-user', res.user)
    emit('toast', { message: 'อัปเดตแพ็คเกจสำเร็จ', type: 'success' })
  } catch (err) {
    emit('toast', { message: err.message ?? 'อัปเดตไม่สำเร็จ', type: 'error' })
  } finally {
    savingCell.value = null
  }
}

async function onSaveExpiry(user) {
  const expiry = expiryMap[user.id]
  if (!expiry) return
  savingCell.value = `exp-${user.id}`
  try {
    const res = await api.put(`/admin/users/${user.id}/membership`, { membershipExpiry: expiry })
    emit('update-user', res.user)
    delete expiryMap[user.id]
    emit('toast', { message: 'อัปเดตวันหมดอายุสำเร็จ', type: 'success' })
  } catch (err) {
    emit('toast', { message: err.message ?? 'อัปเดตไม่สำเร็จ', type: 'error' })
  } finally {
    savingCell.value = null
  }
}

async function onRoleChange(user, role) {
  savingCell.value = `role-${user.id}`
  try {
    const res = await api.put(`/admin/users/${user.id}/role`, { role })
    emit('update-user', res.user)
    emit('toast', { message: `เปลี่ยนสิทธิ์เป็น ${role} สำเร็จ`, type: 'success' })
  } catch (err) {
    emit('toast', { message: err.message ?? 'อัปเดตไม่สำเร็จ', type: 'error' })
  } finally {
    savingCell.value = null
  }
}
</script>

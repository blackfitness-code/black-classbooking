<template>
  <div class="card flex flex-col min-h-0 h-full">
    <!-- Header + search -->
    <div class="flex items-center justify-between mb-4 shrink-0 gap-4">
      <h2 class="text-base font-semibold text-gray-900 shrink-0">รายชื่อสมาชิก</h2>
      <div class="relative flex-1 max-w-xs">
        <input
          v-model="search"
          type="text"
          class="input-field pl-9"
          placeholder="ค้นหาชื่อ / เบอร์โทร…"
        />
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      <span class="text-xs text-gray-400 shrink-0">{{ filtered.length }} คน</span>
    </div>

    <!-- Table wrapper -->
    <div class="flex-1 overflow-auto min-h-0 -mx-5 px-5">
      <!-- Loading -->
      <template v-if="loading && users.length === 0">
        <div v-for="i in 6" :key="i" class="h-12 my-1 rounded skeleton"></div>
      </template>

      <!-- Empty -->
      <div
        v-else-if="filtered.length === 0"
        class="flex flex-col items-center justify-center h-40 text-gray-400 text-sm gap-1"
      >
        <span class="text-2xl">🔍</span>
        <span>ไม่พบสมาชิก</span>
      </div>

      <!-- Table -->
      <table v-else class="w-full border-collapse text-sm">
        <thead class="sticky top-0 z-10">
          <tr>
            <th class="table-header rounded-tl-lg">ชื่อ</th>
            <th class="table-header">เบอร์โทร</th>
            <th class="table-header">แพ็คเกจ</th>
            <th class="table-header">วันหมดอายุ</th>
            <th class="table-header">Role</th>
            <th class="table-header">สมัครเมื่อ</th>
            <th class="table-header rounded-tr-lg">จัดการ</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr
            v-for="u in filtered"
            :key="u.id"
            :class="['hover:bg-gray-50 transition-colors', u._isNew ? 'row-flash' : '']"
          >
            <!-- Name -->
            <td class="table-cell font-medium text-gray-900">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                  {{ displayInitial(u) }}
                </div>
                <span class="truncate max-w-[140px]">{{ displayName(u) }}</span>
              </div>
            </td>

            <!-- Phone -->
            <td class="table-cell text-gray-500">{{ u.phone || '—' }}</td>

            <!-- Member type — inline select -->
            <td class="table-cell">
              <select
                :value="u.memberType"
                @change="e => onMemberTypeChange(u, e.target.value)"
                :disabled="savingCell === `mt-${u.id}`"
                class="text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/40 bg-white disabled:opacity-50 cursor-pointer"
              >
                <option value="">ยังไม่มี</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </td>

            <!-- Membership expiry — date input + save -->
            <td class="table-cell">
              <div class="flex items-center gap-1">
                <input
                  :value="expiryMap[u.id] ?? isoDateStr(u.membershipExpiry)"
                  @input="e => expiryMap[u.id] = e.target.value"
                  type="date"
                  class="text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/40 w-32 disabled:opacity-50"
                  :disabled="savingCell === `exp-${u.id}`"
                />
                <button
                  v-if="expiryMap[u.id] !== undefined && expiryMap[u.id] !== isoDateStr(u.membershipExpiry)"
                  @click="onSaveExpiry(u)"
                  :disabled="savingCell === `exp-${u.id}`"
                  class="text-xs bg-primary text-white rounded px-2 py-1 hover:bg-opacity-90 disabled:opacity-50 shrink-0"
                >
                  {{ savingCell === `exp-${u.id}` ? '…' : 'บันทึก' }}
                </button>
                <span v-else-if="!u.membershipExpiry" class="text-gray-400 text-xs">—</span>
              </div>
            </td>

            <!-- Role — admin only -->
            <td class="table-cell">
              <select
                v-if="isAdmin"
                :value="u.role"
                @change="e => onRoleChange(u, e.target.value)"
                :disabled="savingCell === `role-${u.id}`"
                class="text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/40 bg-white disabled:opacity-50 cursor-pointer"
              >
                <option value="user">user</option>
                <option value="staff">staff</option>
                <option value="admin">admin</option>
              </select>
              <span v-else :class="roleBadgeClass(u.role)">{{ u.role }}</span>
            </td>

            <!-- Created at -->
            <td class="table-cell text-gray-400 whitespace-nowrap">{{ formatDate(u.createdAt) }}</td>

            <!-- Actions -->
            <td class="table-cell">
              <button
                v-if="isAdmin"
                @click="$emit('edit-profile', u)"
                class="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              >
                แก้ไข
              </button>
              <span v-else class="text-gray-300 text-xs">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import api from '../lib/api.js'

const props = defineProps({
  users: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
})

const emit = defineEmits(['update-user', 'edit-profile', 'toast'])

const search = ref('')
const savingCell = ref(null)

// track unsaved expiry edits per user id
const expiryMap = reactive({})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.users
  return props.users.filter(u => {
    const name = displayName(u).toLowerCase()
    const phone = (u.phone ?? '').toLowerCase()
    return name.includes(q) || phone.includes(q)
  })
})

function displayName(u) {
  return u.nickname || u.displayName || u.firstName || u.lineUserId || '—'
}

function displayInitial(u) {
  return displayName(u).charAt(0).toUpperCase()
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

// ---------------------------------------------------------------------------
// Inline edit handlers
// ---------------------------------------------------------------------------

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
    emit('toast', { message: `เปลี่ยน role เป็น ${role} สำเร็จ`, type: 'success' })
  } catch (err) {
    emit('toast', { message: err.message ?? 'อัปเดตไม่สำเร็จ', type: 'error' })
  } finally {
    savingCell.value = null
  }
}
</script>

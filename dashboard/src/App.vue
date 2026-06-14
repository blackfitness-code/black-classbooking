<template>
  <!-- Toast layer -->
  <ToastContainer ref="toast" />

  <!-- ─── LOGIN SCREEN ──────────────────────────────────────────────── -->
  <div
    v-if="!isLoggedIn"
    class="min-h-screen bg-gray-50 flex items-center justify-center p-4"
  >
    <div class="bg-white rounded-2xl shadow-soft border border-gray-100 w-full max-w-sm p-8">
      <!-- Logo / title -->
      <div class="mb-8 text-center">
        <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </div>
        <h1 class="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <p class="text-sm text-gray-500 mt-1">Blackfitness Booking System</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">LINE User ID</label>
          <input
            v-model="loginUid"
            type="text"
            class="input-field"
            placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            autocomplete="off"
            spellcheck="false"
          />
        </div>

        <p v-if="loginError" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ loginError }}</p>

        <button
          type="submit"
          class="btn-primary w-full justify-center py-3 text-base"
          :disabled="loginLoading"
        >
          {{ loginLoading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ' }}
        </button>
      </form>

      <p class="text-xs text-center text-gray-400 mt-6">
        Dev mode — ใช้ LINE UID ตรง ๆ (backend NODE_ENV=development)
      </p>
    </div>
  </div>

  <!-- ─── MAIN DASHBOARD ───────────────────────────────────────────── -->
  <div v-else class="min-h-screen bg-gray-50 flex flex-col">

    <!-- Top bar -->
    <header class="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
      <div class="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <span class="font-semibold text-gray-900">Blackfitness Admin</span>
          <span class="hidden sm:inline text-gray-300">|</span>
          <span class="hidden sm:inline text-xs text-gray-500">{{ currentUserDisplay }}</span>
        </div>

        <div class="flex items-center gap-3">
          <!-- Role badge -->
          <span :class="roleBadgeClass">{{ roleLabel }}</span>

          <!-- Poll status indicator -->
          <span class="flex items-center gap-1 text-xs text-gray-400">
            <span class="w-1.5 h-1.5 rounded-full" :class="pollError ? 'bg-red-400' : 'bg-green-400'"></span>
            {{ pollError ? 'ไม่สามารถโหลดข้อมูล' : `${users.length} สมาชิก` }}
          </span>

          <!-- Logout -->
          <button @click="handleLogout" class="btn-secondary text-xs py-1.5 px-3">
            ออกจากระบบ
          </button>
        </div>
      </div>
    </header>

    <!-- Content area: two-column desktop layout -->
    <main class="flex-1 max-w-[1600px] mx-auto w-full px-6 py-5 flex gap-5 min-h-0" style="height: calc(100vh - 3.5rem);">

      <!-- Left: Incoming panel (fixed width) -->
      <div class="w-72 xl:w-80 shrink-0 flex flex-col">
        <IncomingPanel :incoming-list="incomingList" :loading="usersLoading" />
      </div>

      <!-- Right: Members table (fills rest) -->
      <div class="flex-1 min-w-0 flex flex-col">
        <MembersTable
          :users="users"
          :loading="usersLoading"
          :is-admin="isAdmin"
          @update-user="onUserUpdated"
          @edit-profile="openEditModal"
          @toast="showToast"
        />
      </div>
    </main>
  </div>

  <!-- Edit profile modal -->
  <EditProfileModal
    :visible="editModalVisible"
    :user="editingUser"
    @close="editModalVisible = false"
    @saved="onProfileSaved"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ToastContainer from './components/ToastContainer.vue'
import IncomingPanel from './components/IncomingPanel.vue'
import MembersTable from './components/MembersTable.vue'
import EditProfileModal from './components/EditProfileModal.vue'
import { login, logout, tryRestoreSession, isLoggedIn, user, role, isAdmin } from './lib/auth.js'
import api from './lib/api.js'

// ─── Auth ───────────────────────────────────────────────────────────────────

const loginUid = ref(import.meta.env.VITE_DEFAULT_ADMIN_UID ?? '')
const loginLoading = ref(false)
const loginError = ref(null)
const sessionChecking = ref(true)

const currentUserDisplay = computed(() => {
  const u = user.value
  if (!u) return ''
  return u.nickname || u.displayName || u.lineUserId || ''
})

const roleBadgeClass = computed(() => {
  const r = role.value
  if (r === 'admin') return 'badge-admin'
  if (r === 'staff') return 'badge-staff'
  return 'badge-user'
})

const roleLabel = computed(() => role.value ?? '—')

async function handleLogin() {
  loginLoading.value = true
  loginError.value = null
  const { ok, error } = await login(loginUid.value.trim())
  if (!ok) {
    loginError.value = error
  } else {
    startPolling()
  }
  loginLoading.value = false
}

function handleLogout() {
  stopPolling()
  logout()
}

// ─── Users / polling ────────────────────────────────────────────────────────

const users = ref([])           // full sorted list (by createdAt desc)
const incomingList = ref([])    // "new arrivals" feed (prepended)
const usersLoading = ref(false)
const pollError = ref(false)

// Track known IDs to detect new arrivals after the first load
const knownIds = new Set()
let isFirstLoad = true
let pollTimer = null

// IDs that should flash (cleared after animation duration)
const flashingIds = new Set()

async function fetchUsers() {
  try {
    const data = await api.get('/admin/users')
    const fetched = data.users ?? []

    // Sort by createdAt desc (newest first) for main table
    const sorted = [...fetched].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta
    })

    if (isFirstLoad) {
      // Populate known IDs without triggering "new" highlight
      for (const u of fetched) knownIds.add(u.id)
      users.value = sorted.map(u => ({ ...u, _isNew: false }))
      // Init incoming list = top 20 by createdAt desc
      incomingList.value = sorted.slice(0, 20).map(u => ({ ...u, _isNew: false }))
      isFirstLoad = false
    } else {
      // Detect new IDs
      const newUsers = fetched.filter(u => !knownIds.has(u.id))

      for (const u of newUsers) {
        knownIds.add(u.id)
        flashingIds.add(u.id)
        // Prepend to incoming list (newest at top)
        incomingList.value.unshift({ ...u, _isNew: true })
        // Remove flash class after animation finishes (2s)
        setTimeout(() => {
          flashingIds.delete(u.id)
          // update _isNew flag in both lists
          users.value = users.value.map(r => r.id === u.id ? { ...r, _isNew: false } : r)
          incomingList.value = incomingList.value.map(r => r.id === u.id ? { ...r, _isNew: false } : r)
        }, 2500)
      }

      // Update full table — merge in new data, keep _isNew state
      users.value = sorted.map(u => {
        const isNew = flashingIds.has(u.id)
        return { ...u, _isNew: isNew }
      })
    }

    pollError.value = false
  } catch {
    pollError.value = true
  } finally {
    usersLoading.value = false
  }
}

function startPolling() {
  usersLoading.value = true
  isFirstLoad = true
  knownIds.clear()
  fetchUsers()
  pollTimer = setInterval(fetchUsers, 5000)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  users.value = []
  incomingList.value = []
  knownIds.clear()
  isFirstLoad = true
  pollError.value = false
}

// ─── User update handlers ────────────────────────────────────────────────────

function onUserUpdated(updatedUser) {
  // Update in-place in both lists
  users.value = users.value.map(u =>
    u.id === updatedUser.id ? { ...updatedUser, _isNew: u._isNew } : u
  )
  incomingList.value = incomingList.value.map(u =>
    u.id === updatedUser.id ? { ...updatedUser, _isNew: u._isNew } : u
  )
}

// ─── Toast ───────────────────────────────────────────────────────────────────

const toast = ref(null)

function showToast({ message, type = 'success' }) {
  toast.value?.show(message, type)
}

// ─── Edit profile modal ──────────────────────────────────────────────────────

const editModalVisible = ref(false)
const editingUser = ref(null)

function openEditModal(u) {
  editingUser.value = u
  editModalVisible.value = true
}

function onProfileSaved(updatedUser) {
  editModalVisible.value = false
  onUserUpdated(updatedUser)
  toast.value?.show('บันทึกข้อมูลสำเร็จ', 'success')
}

// ─── App lifecycle ───────────────────────────────────────────────────────────

onMounted(async () => {
  const restored = await tryRestoreSession()
  if (restored) {
    startPolling()
  }
  sessionChecking.value = false
})

onUnmounted(() => {
  stopPolling()
})
</script>

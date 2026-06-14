<template>
  <ToastContainer ref="toast" />

  <!-- Login -->
  <div v-if="!isLoggedIn" class="min-h-screen bg-shell flex">
    <div class="hidden lg:flex lg:w-[42%] bg-ink text-white flex-col justify-between p-10">
      <div>
        <p class="text-sm font-semibold text-white/70">Blackfitness</p>
        <h1 class="text-[2rem] font-bold leading-tight mt-6 text-balance" style="letter-spacing: -0.02em">
          จัดการสมาชิก<br />จากที่เดียว
        </h1>
        <p class="text-white/70 mt-4 max-w-sm leading-relaxed">
          รับแจ้งเตือนเมื่อมีคนกรอกโปรไฟล์ครบ ปรับแพ็คเกจและข้อมูลได้ทันที
        </p>
      </div>
      <p class="text-2xs text-white/40">Staff & Admin Dashboard</p>
    </div>

    <div class="flex-1 flex items-center justify-center p-6">
      <div class="w-full max-w-md">
        <div class="lg:hidden mb-8">
          <p class="text-2xs font-semibold text-ink-muted">Blackfitness</p>
          <h1 class="text-2xl font-bold text-ink mt-1">Admin Dashboard</h1>
        </div>

        <div class="panel p-8">
          <h2 class="text-lg font-semibold text-ink">เข้าสู่ระบบ</h2>
          <p class="text-sm text-ink-muted mt-1">ใช้ LINE User ID ของ staff/admin</p>

          <form @submit.prevent="handleLogin" class="mt-6 space-y-4">
            <div>
              <label for="login-uid" class="block text-sm font-medium text-ink-secondary mb-1.5">LINE User ID</label>
              <input
                id="login-uid"
                v-model="loginUid"
                type="text"
                class="input-field font-mono text-xs"
                placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                autocomplete="off"
                spellcheck="false"
              />
            </div>

            <p v-if="loginError" class="text-sm text-danger bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {{ loginError }}
            </p>

            <button type="submit" class="btn-primary w-full py-2.5" :disabled="loginLoading">
              {{ loginLoading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ' }}
            </button>
          </form>

          <p class="text-2xs text-center text-ink-muted mt-5">
            Dev mode — backend NODE_ENV=development
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Dashboard shell -->
  <div v-else class="min-h-screen bg-shell flex flex-col">
    <header class="sticky top-0 z-sticky bg-surface-raised border-b border-line">
      <div class="max-w-[1680px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-primary-muted flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-ink leading-none truncate">สมาชิก</p>
            <p class="text-2xs text-ink-muted truncate hidden sm:block">{{ currentUserDisplay }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <span :class="roleBadgeClass">{{ roleLabel }}</span>

          <span v-if="!pollError" class="badge-live hidden md:inline-flex">
            <span class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
            Live
          </span>

          <NotificationBell
            :items="notificationItems"
            :unread-count="unreadCount"
            :loading="usersLoading"
            :ring="bellRing"
            :is-admin="isAdmin"
            @select="onNotificationSelect"
            @mark-all-read="markAllRead"
          />

          <button @click="handleLogout" class="btn-secondary text-xs py-1.5 px-3 hidden sm:inline-flex">
            ออกจากระบบ
          </button>
          <button @click="handleLogout" class="btn-ghost sm:hidden" aria-label="ออกจากระบบ">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Stats strip -->
    <div class="border-b border-line bg-surface-raised">
      <div class="max-w-[1680px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2 sm:gap-3">
        <div class="stat-chip">
          <span class="text-ink-muted text-2xs">สมาชิกทั้งหมด</span>
          <span class="font-semibold text-ink tabular-nums">{{ users.length }}</span>
        </div>
        <div class="stat-chip">
          <span class="text-ink-muted text-2xs">กรอกโปรไฟล์ครบ</span>
          <span class="font-semibold text-ink tabular-nums">{{ completedCount }}</span>
        </div>
        <div
          class="stat-chip"
          :class="unreadCount > 0 ? 'border-primary-border bg-primary-muted' : ''"
        >
          <span class="text-ink-muted text-2xs">รอตรวจ</span>
          <span class="font-semibold tabular-nums" :class="unreadCount > 0 ? 'text-primary' : 'text-ink'">
            {{ unreadCount }}
          </span>
        </div>
        <p v-if="pollError" class="text-2xs text-danger ml-auto">โหลดข้อมูลไม่สำเร็จ — จะลองใหม่ใน 5 วินาที</p>
      </div>
    </div>

    <main class="flex-1 max-w-[1680px] mx-auto w-full px-4 sm:px-6 py-4 sm:py-5 min-h-0 flex flex-col" style="height: calc(100vh - var(--header-h) - 3.25rem);">
      <MembersTable
        :users="users"
        :loading="usersLoading"
        :is-admin="isAdmin"
        :highlight-id="highlightUserId"
        @update-user="onUserUpdated"
        @edit-profile="openEditModal"
        @view-profile="openProfileDetail"
        @toast="showToast"
      />
    </main>
  </div>

  <EditProfileModal
    :visible="editModalVisible"
    :user="editingUser"
    @close="editModalVisible = false"
    @saved="onProfileSaved"
  />

  <ProfileDetailModal
    :visible="profileDetailVisible"
    :user="detailUser"
    @close="profileDetailVisible = false"
    @toast="showToast"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ToastContainer from './components/ToastContainer.vue'
import NotificationBell from './components/NotificationBell.vue'
import MembersTable from './components/MembersTable.vue'
import EditProfileModal from './components/EditProfileModal.vue'
import ProfileDetailModal from './components/ProfileDetailModal.vue'
import { login, logout, tryRestoreSession, isLoggedIn, user, role, isAdmin } from './lib/auth.js'
import { displayName, completionTime } from './lib/profileFields.js'
import api from './lib/api.js'

const loginUid = ref(import.meta.env.VITE_DEFAULT_ADMIN_UID ?? '')
const loginLoading = ref(false)
const loginError = ref(null)

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
  if (!ok) loginError.value = error
  else startPolling()
  loginLoading.value = false
}

function handleLogout() {
  stopPolling()
  logout()
}

const users = ref([])
const usersLoading = ref(false)
const pollError = ref(false)
const bellRing = ref(false)
const highlightUserId = ref(null)
const notifications = ref([])
const unreadIds = ref(new Set())

const unreadCount = computed(() => unreadIds.value.size)
const completedCount = computed(() => users.value.filter(u => u.profileCompleted).length)

const notificationItems = computed(() =>
  [...notifications.value].sort((a, b) => {
    if (a.unread !== b.unread) return a.unread ? -1 : 1
    const ta = completionTime(a.user) ? new Date(completionTime(a.user)).getTime() : 0
    const tb = completionTime(b.user) ? new Date(completionTime(b.user)).getTime() : 0
    return tb - ta
  })
)

const knownCompletedIds = new Set()
let isFirstLoad = true
let pollTimer = null
let bellRingTimer = null

function getCompletedUsers(fetched) {
  return fetched
    .filter(u => u.profileCompleted)
    .sort((a, b) => {
      const ta = completionTime(a) ? new Date(completionTime(a)).getTime() : 0
      const tb = completionTime(b) ? new Date(completionTime(b)).getTime() : 0
      return tb - ta
    })
}

function triggerBellRing() {
  bellRing.value = true
  if (bellRingTimer) clearTimeout(bellRingTimer)
  bellRingTimer = setTimeout(() => { bellRing.value = false }, 1800)
}

function addNotification(user, unread = true) {
  const existing = notifications.value.find(n => n.id === user.id)
  if (existing) {
    existing.user = user
    if (unread) existing.unread = true
  } else {
    notifications.value.unshift({ id: user.id, user, unread })
  }
  if (unread) unreadIds.value = new Set([...unreadIds.value, user.id])
  if (notifications.value.length > 30) {
    notifications.value = notifications.value.slice(0, 30)
  }
}

async function fetchUsers() {
  try {
    const data = await api.get('/admin/users')
    const fetched = data.users ?? []
    const completed = getCompletedUsers(fetched)
    const sorted = [...fetched].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta
    })

    if (isFirstLoad) {
      for (const u of completed) knownCompletedIds.add(u.id)
      users.value = sorted
      notifications.value = completed.slice(0, 20).map(u => ({ id: u.id, user: u, unread: false }))
      isFirstLoad = false
    } else {
      for (const u of completed.filter(u => !knownCompletedIds.has(u.id))) {
        knownCompletedIds.add(u.id)
        addNotification(u, true)
        triggerBellRing()
        toast.value?.show(`สมาชิกใหม่: ${displayName(u)}`, 'success')
      }
      users.value = sorted
      const completedMap = new Map(completed.map(u => [u.id, u]))
      notifications.value = notifications.value.map(n => {
        const latest = completedMap.get(n.id)
        return latest ? { ...n, user: latest } : n
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
  knownCompletedIds.clear()
  notifications.value = []
  unreadIds.value = new Set()
  fetchUsers()
  pollTimer = setInterval(fetchUsers, 5000)
}

function stopPolling() {
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = null
  users.value = []
  notifications.value = []
  knownCompletedIds.clear()
  unreadIds.value = new Set()
  isFirstLoad = true
  pollError.value = false
  highlightUserId.value = null
}

function markAsRead(userId) {
  const next = new Set(unreadIds.value)
  next.delete(userId)
  unreadIds.value = next
  const n = notifications.value.find(x => x.id === userId)
  if (n) n.unread = false
}

function markAllRead() {
  unreadIds.value = new Set()
  notifications.value = notifications.value.map(n => ({ ...n, unread: false }))
}

function onNotificationSelect(u) {
  markAsRead(u.id)
  highlightUserId.value = u.id
  setTimeout(() => { highlightUserId.value = null }, 3000)
  if (isAdmin.value) openEditModal(u)
  else openProfileDetail(u)
}

function onUserUpdated(updatedUser) {
  users.value = users.value.map(u => u.id === updatedUser.id ? updatedUser : u)
  notifications.value = notifications.value.map(n =>
    n.id === updatedUser.id ? { ...n, user: updatedUser } : n
  )
  if (detailUser.value?.id === updatedUser.id) detailUser.value = updatedUser
}

const toast = ref(null)
function showToast({ message, type = 'success' }) {
  toast.value?.show(message, type)
}

const editModalVisible = ref(false)
const editingUser = ref(null)
function openEditModal(u) {
  editingUser.value = u
  editModalVisible.value = true
}
function onProfileSaved(updatedUser) {
  editModalVisible.value = false
  markAsRead(updatedUser.id)
  onUserUpdated(updatedUser)
  toast.value?.show('บันทึกข้อมูลสำเร็จ', 'success')
}

const profileDetailVisible = ref(false)
const detailUser = ref(null)
function openProfileDetail(u) {
  detailUser.value = u
  profileDetailVisible.value = true
}

onMounted(async () => {
  if (await tryRestoreSession()) startPolling()
})

onUnmounted(() => {
  stopPolling()
  if (bellRingTimer) clearTimeout(bellRingTimer)
})
</script>

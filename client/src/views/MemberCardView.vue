<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-10">
    <div class="w-full max-w-md">
      <!-- Loading -->
      <div v-if="loading" class="card">
        <div class="flex items-center space-x-4">
          <div class="skeleton w-14 h-14 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="skeleton h-4 w-2/3"></div>
            <div class="skeleton h-3 w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- Not found -->
      <div v-else-if="error" class="card text-center py-10 animate-fade-in">
        <div class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          </svg>
        </div>
        <p class="font-semibold text-gray-900">ไม่พบบัตรสมาชิก</p>
        <p class="text-sm text-gray-500 mt-1">ลิงก์อาจไม่ถูกต้องหรือสมาชิกถูกลบไปแล้ว</p>
      </div>

      <!-- Member card -->
      <MemberCard
        v-else
        :display-name="member.displayName"
        :full-name="member.fullName"
        :profile-picture-url="member.pictureUrl"
        :membership-expiry="member.membershipExpiry"
        :member-type="member.memberType || 'gold'"
        :member-id="member.lineUserId"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useLiffStore } from '../stores/liff'
import { useAuthStore } from '../stores/auth'
import MemberCard from '../components/MemberCard.vue'

const route = useRoute()
const router = useRouter()
const liffStore = useLiffStore()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref(false)
const member = ref(null)

// /card/:id → public card by id   |   /card → the logged-in user's own card
const ownMode = computed(() => !route.params.id)

// ─── Public card by id ────────────────────────────────────────
async function loadById(id) {
  try {
    const snap = await getDoc(doc(db, 'users', id))
    if (!snap.exists()) {
      error.value = true
    } else {
      const data = snap.data()
      let expiry = data.membershipExpiry
      if (expiry?.toDate) expiry = expiry.toDate()

      member.value = {
        lineUserId: snap.id,
        displayName: data.nickname || data.displayName || 'สมาชิก',
        fullName: [data.firstName, data.lastName].filter(Boolean).join(' '),
        pictureUrl: data.pictureUrl || '',
        membershipExpiry: expiry,
        memberType: data.memberType || 'gold'
      }
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

// ─── Own card: verify the user exists in the system first ─────
async function resolveOwnCard() {
  // Use the real Firestore-backed check when we have a LINE profile,
  // otherwise fall back to anything cached in storage.
  if (liffStore.profile?.userId) {
    if (!authStore.isAuthenticated || authStore.needsProfileSetup) {
      await authStore.signInWithLineUserId(
        liffStore.profile.userId,
        liffStore.profile.displayName,
        liffStore.profile.pictureUrl
      )
    }
  } else {
    await authStore.loadUserFromStorage()
  }

  const profile = authStore.userProfile
  // No data in the system yet → send them to the home page.
  if (!authStore.isAuthenticated || authStore.needsProfileSetup || !profile) {
    router.replace('/')
    return
  }

  member.value = {
    lineUserId: profile.lineUserId || profile.id,
    displayName: profile.nickname || profile.displayName || 'สมาชิก',
    fullName: [profile.firstName, profile.lastName].filter(Boolean).join(' '),
    pictureUrl: profile.pictureUrl || liffStore.profile?.pictureUrl || '',
    membershipExpiry: profile.membershipExpiry,
    memberType: profile.memberType || 'gold'
  }
  loading.value = false
}

onMounted(() => {
  if (!ownMode.value) {
    loadById(route.params.id)
  }
})

// Own mode: wait until LIFF has finished initializing, then resolve.
watch(
  () => liffStore.isLiffReady,
  (ready) => {
    if (ownMode.value && ready) resolveOwnCard()
  },
  { immediate: true }
)
</script>

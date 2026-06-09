<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <div class="app-content-spacing">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <BottomNav />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useLiffStore } from './stores/liff'
import BottomNav from './components/BottomNav.vue'

const liffStore = useLiffStore()

onMounted(async () => {
  await liffStore.initLiff()
})
</script>

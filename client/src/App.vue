<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <div class="app-content-spacing">
      <router-view />
    </div>
    <BottomNav />
    <DevTools />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useLiffStore } from './stores/liff'
import BottomNav from './components/BottomNav.vue'
import DevTools from './components/DevTools.vue'

const liffStore = useLiffStore()

onMounted(async () => {
  await liffStore.initLiff()
})
</script>
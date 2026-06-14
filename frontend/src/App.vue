<template>
  <div id="app" class="min-h-screen bg-gray-100 lg:bg-[#eceff3]">
    <div class="app-shell mx-auto w-full max-w-md lg:max-w-xl min-h-screen bg-gray-50 lg:shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_8px_30px_rgba(15,23,42,0.08)] lg:ring-1 lg:ring-black/5">
      <div class="app-content-spacing">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
      <BottomNav />
      <DevTools />
    </div>
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

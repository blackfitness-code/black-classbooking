<template>
  <div v-if="show" class="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="text-center">
      <!-- Animated Logo/Icon -->
      <div class="relative mb-6">
        <div class="w-20 h-20 mx-auto">
          <!-- Outer rotating ring -->
          <div class="absolute inset-0 border-4 border-primary/20 rounded-full animate-spin"></div>
          <!-- Inner pulsing circle -->
          <div class="absolute inset-2 bg-primary/10 rounded-full animate-pulse"></div>
          <!-- Center yoga icon -->
          <div class="absolute inset-0 flex items-center justify-center">
            <svg class="w-8 h-8 text-primary animate-bounce" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Loading text -->
      <div class="space-y-2">
        <h3 class="text-lg font-semibold text-gray-800">{{ title }}</h3>
        <p class="text-sm text-gray-600">{{ subtitle }}</p>
        
        <!-- Animated dots -->
        <div class="flex justify-center space-x-1 mt-4">
          <div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0ms"></div>
          <div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 150ms"></div>
          <div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 300ms"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'กำลังโหลด...'
  },
  subtitle: {
    type: String,
    default: 'กรุณารอสักครู่'
  }
})
</script>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 2s linear infinite;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translateY(0);
  }
  40%, 43% {
    transform: translateY(-8px);
  }
  70% {
    transform: translateY(-4px);
  }
  90% {
    transform: translateY(-2px);
  }
}

.animate-bounce {
  animation: bounce 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
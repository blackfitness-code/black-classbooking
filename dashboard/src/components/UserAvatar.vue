<template>
  <div
    :class="[
      'rounded-full shrink-0 overflow-hidden flex items-center justify-center bg-surface-sunken text-primary font-semibold ring-1 ring-line',
      sizeClass,
    ]"
  >
    <img
      v-if="pictureUrl && !imgError"
      :src="pictureUrl"
      :alt="alt"
      class="w-full h-full object-cover"
      loading="lazy"
      @error="imgError = true"
    />
    <span v-else class="select-none">{{ initial }}</span>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { displayName } from '../lib/profileFields.js'

const props = defineProps({
  user: { type: Object, default: null },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg'].includes(v),
  },
})

const imgError = ref(false)
const pictureUrl = computed(() => props.user?.pictureUrl || '')
const alt = computed(() => displayName(props.user))
const initial = computed(() => alt.value.charAt(0).toUpperCase())

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'w-8 h-8 text-xs'
  if (props.size === 'lg') return 'w-14 h-14 text-lg'
  return 'w-10 h-10 text-sm'
})

watch(pictureUrl, () => { imgError.value = false })
</script>

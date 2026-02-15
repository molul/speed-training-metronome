<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import MetronomeControls from './MetronomeControls.vue'
import Button from './Button.vue'
import { Icon } from '@iconify/vue'

const menuVisible = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (
    menuVisible.value &&
    containerRef.value &&
    !containerRef.value.contains(event.target as Node)
  ) {
    menuVisible.value = false
  }
}

onMounted(() => window.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => window.removeEventListener('mousedown', handleClickOutside))
</script>

<template>
  <div
    ref="containerRef"
    class="flex flex-col p-4 pl-2.5 relative z-50 bg-gray-800 rounded-t-lg"
  >
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <Icon icon="mdi:metronome" class="size-8" />
        <span class="text-xl lg:text-3xl font-bold">SPEED BUILDER</span>
      </div>

      <Icon
        :icon="menuVisible ? 'majesticons:close-line' : 'solar:hamburger-menu-linear'"
        class="size-8"
        @click="menuVisible = !menuVisible"
      />

      <!-- <Button
        type="text"
        size="big"
        :icon="menuVisible ? 'majesticons:close-line' : 'solar:hamburger-menu-linear'"
        @click="menuVisible = !menuVisible"
      /> -->
    </div>
    <MetronomeControls v-if="menuVisible" />
  </div>
</template>

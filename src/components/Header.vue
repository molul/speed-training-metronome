<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SettingsModal from './SettingsModal.vue'
import { Icon } from '@iconify/vue'
import { useDialog } from 'primevue/usedialog'
import MyButton from './MyButton.vue'
import { useMetronomeStore } from '../stores/useMetronomeStore'
import InfoModal from './InfoModal.vue'

const menuVisible = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const store = useMetronomeStore()

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

const dialog = useDialog()

const handleShowSettingsModal = () => {
  dialog.open(SettingsModal, {
    props: {
      dismissableMask: true,
      header: 'Settings',
      modal: true
    }
  })
}

const handleShowInfoModal = () => {
  dialog.open(InfoModal, {
    props: {
      dismissableMask: true,
      header: 'Info',
      modal: true
    }
  })
}
</script>

<template>
  <div
    ref="containerRef"
    class="flex flex-col gap-3 p-4 pl-2.5 relative z-50 bg-zinc-800 rounded-t-lg"
  >
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <Icon icon="mdi:metronome" class="size-8" />
        <span class="text-lg font-bold text-left leading-none">
          SPEED BUILDER <br />
          METRONOME
        </span>
      </div>

      <div class="flex gap-2.5">
        <!-- <MyButton
          icon="solar:refresh-linear"
          severity="secondary"
          :disabled="store.isRunning"
          @click="store.reset"
        /> -->

        <MyButton
          icon="solar:info-circle-linear"
          severity="secondary"
          :disabled="store.isRunning"
          @click="handleShowInfoModal"
        />

        <MyButton
          icon="solar:settings-linear"
          severity="secondary"
          :disabled="store.isRunning"
          @click="handleShowSettingsModal"
        />
      </div>
    </div>

    <MetronomeControls v-if="menuVisible" />
  </div>
</template>

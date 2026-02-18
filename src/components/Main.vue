<script setup lang="ts">
import MetronomeSection from './MetronomeSection.vue'
import { useMetronomeEngine } from '../composables/useMetronomeEngine'
import { useMetronomeStore } from '../stores/useMetronomeStore'
import MyButton from './MyButton.vue'
import Header from './Header.vue'
import BeatIndicator from './BeatIndicator.vue'

const store = useMetronomeStore()
const engine = useMetronomeEngine()

function start() {
  store.isRunning = true
  engine.start(
    store.config.points,
    store.config.stopAtEnd,
    store.config.barsPerCell,
    store.config.tempoStep
  )
}

function stop() {
  engine.stop()
  store.isRunning = false
}
</script>

<template>
  <div
    class="size-full lg:h-auto mx-auto lg:rounded-lg flex flex-col gap-0 relative p-0 lg:border border-zinc-700 shadow-md"
  >
    <Header />

    <div class="flex flex-col gap-3 w-full">
      <BeatIndicator />

      <MetronomeSection :cols="16" :rows="37" :playhead-bar="store.visualBar" />

      <div class="flex gap-2 justify-center items-center px-3">
        <MyButton
          v-if="!store.isRunning"
          icon="solar:play-bold"
          size="big"
          shape="rounded"
          @click="start"
        />
        <MyButton
          v-if="store.isRunning"
          icon="solar:stop-bold"
          severity="danger"
          shape="rounded"
          size="big"
          @click="stop"
        />
      </div>

      <div class="text-xs text-center font-medium p-4 pt-0">
        Developed by
        <a
          href="https://www.luismorcilloluque.com"
          rel="noopener noreferrer"
          target="_blank"
          class="text-blue-300 hover:underline"
        >
          Luis Morcillo Luque
        </a>
        with Vue 3 © 2026
      </div>
    </div>
  </div>
</template>

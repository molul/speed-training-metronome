<script setup lang="ts">
import { useMetronomeStore } from '../stores/useMetronomeStore'

defineProps<{ height: number }>()
const store = useMetronomeStore()
</script>

<template>
  <div class="flex flex-col select-none z-10 -translate-x-[2px]">
    <div
      v-for="r in store.rows"
      :key="r"
      class="text-[11px] text-white flex items-end justify-end pr-0.5 border-b border-white relative leading-none font-semibold"
      :style="{
        width: store.temposColumnWidth + 'px',
        height: height / store.rows + 'px'
      }"
    >
      <div class="absolute top-0 left-0 w-full flex">
        <div
          v-if="store.rowToBpm(r) === store.config.startBpm"
          class="border-t-3 border-green-500 w-full"
        />
        <div
          v-if="store.rowToBpm(r) === store.config.maxBpm"
          class="border-t-3 border-red-500 w-full"
        />
        <div
          v-if="store.rowToBpm(r) === store.config.endBpm"
          class="border-t-3 border-yellow-500 w-full"
        />
      </div>
      <span>{{ store.rowToBpm(r) }}</span>
    </div>
  </div>
</template>

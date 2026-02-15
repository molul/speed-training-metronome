<script setup lang="ts">
import { useMetronomeStore } from '../stores/useMetronomeStore'

defineProps<{ height: number }>()
const store = useMetronomeStore()
</script>

<template>
  <div class="flex flex-col h-full select-none z-10 bg-gray-800 translate-y-[1px]">
    <div
      v-for="r in store.rows"
      :key="r"
      class="text-[10px] text-gray-200 flex items-end justify-end pr-0.5 border-b border-white relative font-semibold box-border"
      :style="{
        width: store.temposColumnWidth + 'px',
        height: height / store.rows + 'px'
      }"
    >
      <div class="absolute top-0 left-0 w-full flex">
        <div
          v-if="store.rowToBpm(r - 1) === store.config.startBpm"
          class="border-t-4 border-green-500 w-full"
        />
        <div
          v-if="store.rowToBpm(r - 1) === store.config.maxBpm"
          class="border-t-4 border-red-500 w-full"
        />
        <div
          v-if="store.rowToBpm(r - 1) === store.config.endBpm"
          class="border-t-4 border-yellow-500 w-full"
        />
      </div>
      <span class="translate-y-[3px]">{{ store.rowToBpm(r) }}</span>
    </div>
  </div>
</template>

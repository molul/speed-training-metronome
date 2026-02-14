<script setup lang="ts">
import type { MetronomeConfig } from "../assets/types";
import Button from "./Button.vue";

interface Props {
  model: MetronomeConfig;
}

const props = defineProps<Props>();

// Only the keys we want to display
const labels = {
  startBpm: "BPM Inicial",
  maxBpm: "BPM Máximo",
  endBpm: "BPM Final",
} as const;

type BpmKey = keyof typeof labels; // 'startBpm' | 'maxBpm' | 'endBpm'

const emit = defineEmits<{
  (e: "bump", key: BpmKey, delta: number): void;
}>();
</script>

<template>
  <div
    v-for="key in Object.keys(labels) as BpmKey[]"
    :key="`bpmVariable-${key}`"
    class="flex items-center justify-between gap-2"
  >
    <div class="w-24 text-left">{{ labels[key] }}</div>
    <div class="flex items-center gap-2">
      <Button label="-5" @click="emit('bump', key, -5)" />
      <div class="w-12 text-center">
        {{ props.model[key] }}
      </div>
      <Button label="+5" @click="emit('bump', key, 5)" />
    </div>
  </div>
</template>

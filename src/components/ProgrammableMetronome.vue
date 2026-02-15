<script setup lang="ts">
import { reactive, computed, onMounted, watch } from "vue";
import MetronomeGrid from "./MetronomeGrid.vue";
import {
  type TempoPoint,
  useMetronomeEngine,
} from "../composables/useMetronomeEngine";
import type { MetronomeConfig } from "../assets/types";
import Button from "./Button.vue";
import Header from "./Header.vue";

const cfg = reactive<MetronomeConfig>({
  startBpm: 100,
  maxBpm: 140,
  endBpm: 115,
  stopAtEnd: true,
  barsPerCell: 1,
  tempoStep: "cell", // Default value
  points: [
    { bar: 0, bpm: 100 },
    { bar: 8, bpm: 140 },
    { bar: 12, bpm: 115 },
  ],
});

onMounted(() => {
  const saved = localStorage.getItem("metronomeConfig");
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.assign(cfg, parsed);
  }
});

watch([() => cfg.startBpm, () => cfg.maxBpm, () => cfg.endBpm], ([s, m, e]) => {
  cfg.points[0].bpm = s;
  cfg.points[1].bpm = m;
  cfg.points[2].bpm = e;
});

function updatePoints(p: [TempoPoint, TempoPoint, TempoPoint]) {
  cfg.points = p;
  cfg.startBpm = p[0].bpm;
  cfg.maxBpm = p[1].bpm;
  cfg.endBpm = p[2].bpm;
}

const engine = useMetronomeEngine();
const tempoMap = computed(() => cfg.points);

function start() {
  // Pass the new tempoStep to the engine
  engine.start(cfg.points, cfg.stopAtEnd, cfg.barsPerCell, cfg.tempoStep);
}

const isRunning = computed(() => engine.isRunning.value);
</script>

<template>
  <div
    class="w-full max-w-[1080px] mx-auto lg:rounded-lg flex flex-col gap-0 bg-gray-800 relative p-0 h-full"
  >
    <Header v-model="cfg" :is-running="engine.isRunning" />

    <div class="flex flex-col gap-4">
      <MetronomeGrid
        :cols="16"
        :rows="37"
        :start-bpm="cfg.startBpm"
        :max-bpm="cfg.maxBpm"
        :end-bpm="cfg.endBpm"
        :bars-per-cell="cfg.barsPerCell"
        :tempo-map="tempoMap"
        :playhead-bar="engine.visualBar"
        @update:points="updatePoints"
      />

      <div class="flex gap-2 justify-center items-center px-3">
        <Button
          v-if="!isRunning"
          icon="solar:play-bold"
          size="big"
          shape="rounded"
          @click="start"
        />
        <Button
          v-if="isRunning"
          icon="solar:stop-bold"
          type="alert"
          shape="rounded"
          size="big"
          @click="engine.stop()"
        />
      </div>
      <span class="font-bold text-2xl px-3 text-white text-center">
        {{ engine.currentBpm }} BPM
      </span>
    </div>
  </div>
</template>

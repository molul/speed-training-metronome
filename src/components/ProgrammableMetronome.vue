<script setup lang="ts">
import { reactive, ref, computed, onMounted } from "vue";
import MetronomeGrid from "./MetronomeGrid.vue";
import MetronomeControls from "./MetronomeControls.vue";
import {
  type TempoPoint,
  useMetronomeEngine,
} from "../composables/useMetronomeEngine";
import Button from "./Button.vue";

const cfg = reactive({
  startBpm: 100,
  maxBpm: 140,
  endBpm: 115,
  stopAtEnd: true,
  barsPerCell: 1,
});

onMounted(() => {
  const saved = localStorage.getItem("metronomeConfig");
  if (saved) {
    Object.assign(cfg, JSON.parse(saved));
  }
});

const cols = 16;
const rows = 32;

const points = ref<[TempoPoint, TempoPoint, TempoPoint]>([
  { bar: 0, bpm: cfg.startBpm },
  { bar: 8, bpm: cfg.maxBpm },
  { bar: 12, bpm: cfg.endBpm },
]);

function updatePoints(p: [TempoPoint, TempoPoint, TempoPoint]) {
  points.value = p;
}

const engine = useMetronomeEngine();

const tempoMap = computed(() => engine.buildTempoMap(points.value));

function start() {
  engine.start(points.value, cfg.stopAtEnd, cfg.barsPerCell);
}
</script>

<template>
  <div
    class="w-full max-w-[1080px] mx-auto p-3 rounded-md flex flex-col gap-4 bg-gray-700"
  >
    <MetronomeControls v-model="cfg" />

    <div class="flex gap-2 justify-center">
      <Button label="Start" @click="start" />
      <Button label="Stop" @click="engine.stop()" />
    </div>

    <div>Current tempo: {{ engine.currentBpm }}</div>

    <MetronomeGrid
      :cols="cols"
      :rows="rows"
      :start-bpm="cfg.startBpm"
      :max-bpm="cfg.maxBpm"
      :end-bpm="cfg.endBpm"
      :bars-per-cell="cfg.barsPerCell"
      :tempo-map="tempoMap"
      :playhead-bar="engine.visualBar"
      @update:points="(points:[TempoPoint, TempoPoint, TempoPoint]) => updatePoints(points)"
    />
  </div>
</template>

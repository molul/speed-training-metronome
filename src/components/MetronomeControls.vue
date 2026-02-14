<script setup lang="ts">
import { reactive, watch } from "vue";
import type { MetronomeConfig } from "../assets/types";
import TempoVariables from "./TempoVariables.vue";

// Strong type for presets
interface MetronomePreset extends MetronomeConfig {
  name: string;
}

// Tell defineModel the type explicitly
const model = defineModel<MetronomeConfig>();

// Presets array
const presets = reactive<MetronomePreset[]>(
  JSON.parse(localStorage.getItem("metronomePresets") || "[]")
);

// Increment / decrement a BPM value
function bump(key: keyof MetronomeConfig, delta: number) {
  if (model.value && typeof model.value[key] === "number") {
    // We cast to 'any' or 'number' here because the check above
    // already proved it's safe for us humans.
    const currentValue = model.value[key] as number;
    (model.value[key] as number) = Math.min(
      200,
      Math.max(40, currentValue + delta)
    );
  }
}

// Save config
function saveConfig() {
  localStorage.setItem("metronomeConfig", JSON.stringify(model.value));
  alert("Configuración guardada.");
}

// Save preset
function savePreset() {
  const name = prompt("Nombre del preset:");
  if (!name) return;

  // Copy all required fields with defaults
  const preset: MetronomePreset = {
    startBpm: model.value?.startBpm ?? 100,
    maxBpm: model.value?.maxBpm ?? 140,
    endBpm: model.value?.endBpm ?? 115,
    stopAtEnd: model.value?.stopAtEnd ?? false,
    barsPerCell: model.value?.barsPerCell ?? 1,
    name,
  };

  presets.push(preset);
  localStorage.setItem("metronomePresets", JSON.stringify(presets));
}

// Load preset
function loadPreset(p: MetronomePreset | undefined) {
  if (!p) return;
  if (model.value) {
    model.value.startBpm = p.startBpm;
    model.value.maxBpm = p.maxBpm;
    model.value.endBpm = p.endBpm;
    model.value.stopAtEnd = p.stopAtEnd;
    model.value.barsPerCell = p.barsPerCell;
  }
}

// Watch presets to save changes
watch(
  presets,
  () => localStorage.setItem("metronomePresets", JSON.stringify(presets)),
  { deep: true }
);
</script>

<template>
  <div v-if="model" class="flex flex-col gap-2 text-sm">
    <TempoVariables :model="model" @bump="(key, delta) => bump(key, delta)" />

    <div class="flex gap-2 items-center bg-gray-600 p-2 rounded">
      <div>
        <span>Bars per cell</span>
        <input
          type="number"
          v-model.number="model.barsPerCell"
          class="border w-20 px-1"
        />
      </div>

      <label class="flex gap-2 items-center">
        <input type="checkbox" v-model="model.stopAtEnd" />
        Stop at end
      </label>
    </div>

    <div class="flex gap-2 mt-2">
      <button class="border px-2 py-1" @click="saveConfig">
        Guardar Configuración
      </button>
      <button class="border px-2 py-1" @click="savePreset">
        Guardar Preset
      </button>
      <select
        class="border px-1"
        @change="
          loadPreset(
            presets[($event.target as HTMLSelectElement)?.selectedIndex - 1]
          )
        "
      >
        <option disabled selected>Seleccionar preset</option>
        <option v-for="p in presets" :key="`preset-${p.name}`">
          {{ p.name }}
        </option>
      </select>
    </div>
  </div>
</template>

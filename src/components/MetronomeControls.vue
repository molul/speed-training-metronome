<script setup lang="ts">
import { reactive, watch } from "vue";

// Strong types for your model
interface MetronomeConfig {
  startBpm: number;
  maxBpm: number;
  endBpm: number;
  infinite: boolean;
  barsPerCell: number;
}

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
    infinite: model.value?.infinite ?? true,
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
    model.value.infinite = p.infinite;
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
    <div
      v-for="key in ['startBpm', 'maxBpm', 'endBpm']"
      :key="`bpmVariable-${key}`"
      class="flex items-center gap-2"
    >
      <div class="w-24">{{ key }}</div>
      <button
        class="px-2 border"
        @click="bump(key as keyof MetronomeConfig, -5)"
      >
        -5
      </button>
      <div class="w-12 text-center">
        {{ model[key as keyof MetronomeConfig] }}
      </div>
      <button
        class="px-2 border"
        @click="bump(key as keyof MetronomeConfig, 5)"
      >
        +5
      </button>
    </div>

    <label class="flex gap-2 items-center">
      <input type="checkbox" v-model="model.infinite" />
      infinito
    </label>

    <div class="flex gap-2 items-center">
      <span>compases/cuadrado</span>
      <input
        type="number"
        v-model.number="model.barsPerCell"
        class="border w-20 px-1"
      />
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

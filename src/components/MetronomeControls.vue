<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useMetronomeStore } from '../stores/useMetronomeStore'
import type { MetronomePreset, TempoStep } from '../assets/types'
import TempoVariables from './TempoVariables.vue'
import Button from './Button.vue'
import Label from './Label.vue'

const store = useMetronomeStore()
const presets = reactive<MetronomePreset[]>(
  JSON.parse(window.localStorage.getItem('metronomePresets') || '[]')
)

function saveConfig() {
  window.localStorage.setItem('metronomeConfig', JSON.stringify(store.config))
  alert('Configuración guardada.')
}

function handleLoadDefault() {
  const saved = window.localStorage.getItem('metronomeConfig')
  if (!saved) {
    alert('No hay configuración predeterminada guardada.')
    return
  }
  store.loadPreset(JSON.parse(saved))
}

function savePreset() {
  const name = prompt('Nombre del preset:')
  if (!name) return
  const preset: MetronomePreset = {
    ...store.config,
    name,
    points: JSON.parse(JSON.stringify(store.config.points))
  }
  presets.push(preset)
  window.localStorage.setItem('metronomePresets', JSON.stringify(presets))
}

function handlePresetChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const index = target.selectedIndex - 1
  const selectedPreset = presets[index]
  if (selectedPreset) {
    store.loadPreset(selectedPreset)
  }
}

watch(
  presets,
  () => window.localStorage.setItem('metronomePresets', JSON.stringify(presets)),
  { deep: true }
)
</script>

<template>
  <div
    class="flex w-full flex-col rounded-lg p-4 gap-4 text-sm bg-gray-700 transition-all"
  >
    <TempoVariables />

    <hr class="border-gray-500" />

    <div class="flex flex-col gap-4">
      <div class="flex justify-between items-center w-full">
        <Label label="Bars per cell" />
        <div class="flex gap-2 items-center">
          <Button
            label="-"
            @click="store.config.barsPerCell = Math.max(1, store.config.barsPerCell - 1)"
            class="w-14"
          />
          <div class="w-12 text-center text-white font-bold">
            {{ store.config.barsPerCell }}
          </div>
          <Button
            label="+"
            @click="store.config.barsPerCell = Math.min(8, store.config.barsPerCell + 1)"
            class="w-14"
          />
        </div>
      </div>

      <div class="flex justify-between items-center w-full">
        <Label label="Increase tempo" />
        <div class="flex bg-gray-800 p-1 rounded-md">
          <button
            v-for="step in (['bar', 'cell'] as TempoStep[])"
            :key="step"
            @click="store.config.tempoStep = step"
            :class="[
              'px-3 py-1 rounded font-semibold transition-colors cursor-pointer capitalize',
              store.config.tempoStep === step
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            ]"
          >
            Every {{ step }}
          </button>
        </div>
      </div>

      <label class="flex gap-2 items-center py-2 cursor-pointer">
        <input type="checkbox" v-model="store.config.stopAtEnd" class="w-4 h-4" />
        <Label label="Stop at end" />
      </label>
    </div>

    <hr class="border-gray-500" />

    <div class="flex flex-col gap-4 w-full">
      <div class="flex gap-4">
        <Button
          icon="solar:diskette-linear"
          label="Save default"
          @click="saveConfig"
          class="flex-1"
        />
        <Button
          icon="solar:restart-linear"
          label="Load default"
          @click="handleLoadDefault"
          class="flex-1"
        />
      </div>

      <Button
        icon="solar:diskette-linear"
        label="Save new preset"
        :full-width="true"
        @click="savePreset"
      />

      <div class="flex gap-2 items-center justify-between">
        <Label label="Load preset" />
        <select
          class="font-bold rounded-md py-2 px-2 bg-gray-600 border border-gray-500 text-gray-100 min-w-[200px]"
          @change="handlePresetChange"
        >
          <option disabled selected>-</option>
          <option v-for="p in presets" :key="`preset-${p.name}`">
            {{ p.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

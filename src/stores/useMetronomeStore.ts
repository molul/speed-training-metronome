import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import type {
  MetronomeConfig,
  MetronomePreset,
  TempoPoint,
  TempoStep
} from '../assets/types'

export const useMetronomeStore = defineStore('metronome', () => {
  // 1. State

  const isRunning = ref(false)
  const currentBar = ref(0)
  const visualBar = ref(0)
  const currentBpm = ref(0)
  const beatInBar = ref(0)

  const dragging = ref<number | null>(null)

  const defaultConfig = {
    startBpm: 100,
    maxBpm: 160,
    endBpm: 115,
    stopAtEnd: true,
    barsPerCell: 1,
    tempoStep: 'cell' as TempoStep,
    points: [
      { bar: 0, bpm: 100 },
      { bar: 8, bpm: 140 },
      { bar: 12, bpm: 115 }
    ] as [TempoPoint, TempoPoint, TempoPoint]
  }

  const config = reactive<MetronomeConfig>(defaultConfig)

  const temposColumnWidth = ref(25)
  const metronomeSectionPadding = ref(16)

  const rows = 37 // Total number of 5-BPM steps from 40 to 220

  // 2. Load initial data from localStorage
  const saved = window.localStorage.getItem('metronomeConfig')
  if (saved) {
    try {
      Object.assign(config, JSON.parse(saved))
    } catch (e) {
      console.error('Failed to parse saved metronome config', e)
    }
  }

  // 3. Mathematical Helpers
  const bpmToRow = (bpm: number) => Math.round(rows - (bpm - 40) / 5)
  const rowToBpm = (row: number) => 40 + (rows - row) * 5

  // 4. Actions

  function updatePoints(p: [TempoPoint, TempoPoint, TempoPoint]) {
    config.points = p
    config.startBpm = p[0].bpm
    config.maxBpm = p[1].bpm
    config.endBpm = p[2].bpm
  }

  function loadPreset(p: MetronomePreset | MetronomeConfig) {
    if (!p) return

    if (p.points) {
      config.points = JSON.parse(JSON.stringify(p.points))
    }

    config.startBpm = p.startBpm
    config.maxBpm = p.maxBpm
    config.endBpm = p.endBpm
    config.stopAtEnd = p.stopAtEnd
    config.barsPerCell = p.barsPerCell
    config.tempoStep = p.tempoStep || 'cell'
  }

  function reset() {
    config.startBpm = 100
    config.maxBpm = 160
    config.endBpm = 130
    config.stopAtEnd = false
    config.barsPerCell = 1
    config.tempoStep = 'bar'
    config.points = [
      { bar: 0, bpm: 100 },
      { bar: 8, bpm: 140 },
      { bar: 12, bpm: 115 }
    ]
  }

  // 5. Watchers
  // Sync BPM changes (from buttons/inputs) to the points array
  watch(
    [() => config.startBpm, () => config.maxBpm, () => config.endBpm],
    ([s, m, e]) => {
      config.points[0].bpm = s
      config.points[1].bpm = m
      config.points[2].bpm = e
    }
  )

  // Getters
  const gridPoints = computed(() =>
    config.points.map(p => ({
      col: p.bar,
      row: bpmToRow(p.bpm)
    }))
  )

  return {
    dragging,
    beatInBar,
    config,
    isRunning,
    currentBar,
    visualBar,
    currentBpm,
    temposColumnWidth,
    rows,
    metronomeSectionPadding,
    gridPoints, // Add this
    updatePoints,
    reset,
    loadPreset,
    bpmToRow,
    rowToBpm
  }
})

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useMetronomeStore } from '../stores/useMetronomeStore'
import MetronomeGrid from './MetronomeGrid.vue'
import MetronomeTempos from './MetronomeTempos.vue'
import type { TempoPoint } from '../composables/useMetronomeEngine'

const props = defineProps<{ cols: number; playheadBar: any }>()
const store = useMetronomeStore()

const container = ref<HTMLDivElement | null>(null)
const w = ref(300)
const h = ref(500)

// Local copy for smooth dragging before updating store
const localPoints = ref([...store.gridPoints])

const resize = () => {
  if (!container.value) return
  const cw = container.value.clientWidth
  // 30 is Axis width, 32 is horizontal padding
  w.value = cw - store.temposColumnWidth - store.metronomeSectionPadding * 2

  // Reverted multiplier to 1.5 for a taller grid
  // Increased viewport height limit to 80%
  h.value = Math.min(window.innerHeight * 0.7, cw * 1.5)
}

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
})
onUnmounted(() => window.removeEventListener('resize', resize))

const handleDragStart = (i: number) => {
  if (store.isRunning) return
  localPoints.value = [...store.gridPoints]
  store.dragging = i // Update store instead
}

const handleDragMove = (e: MouseEvent | TouchEvent) => {
  if (store.dragging === null || !container.value) return // Check store

  const p0 = localPoints.value[0]
  const p1 = localPoints.value[1]
  const p2 = localPoints.value[2]
  if (!p0 || !p1 || !p2) return

  const svgEl = container.value.querySelector('svg')
  if (!svgEl) return

  const rect = svgEl.getBoundingClientRect()
  const touch = 'touches' in e ? e.touches[0] : (e as MouseEvent)
  if (!touch) return

  const internalX = ((touch.clientX - rect.left) / rect.width) * w.value
  const internalY = ((touch.clientY - rect.top) / rect.height) * h.value

  let col = Math.max(
    0,
    Math.min(props.cols - 1, Math.floor(internalX / (w.value / props.cols)))
  )
  let row = Math.max(
    0,
    Math.min(store.rows, Math.round(internalY / (h.value / store.rows)))
  )

  // Boundary Logic
  if (store.dragging === 0) {
    col = Math.min(col, p1.col - 1)
    row = Math.max(p1.row, p2.row, row)
  } else if (store.dragging === 1) {
    col = Math.max(p0.col + 1, Math.min(col, p2.col - 1))
    row = Math.min(row, p0.row, p2.row)
  } else if (store.dragging === 2) {
    col = Math.max(col, p1.col + 1)
    row = Math.max(p1.row, Math.min(p0.row, row))
  }

  localPoints.value[store.dragging] = { col, row }
}

const handleDragEnd = () => {
  if (store.dragging === null) return
  const updated = localPoints.value.map(p => ({
    bar: p.col,
    bpm: store.rowToBpm(p.row)
  })) as [TempoPoint, TempoPoint, TempoPoint]

  store.updatePoints(updated)
  store.dragging = null
}

const playheadX = computed(() => {
  const bar =
    typeof props.playheadBar === 'object' ? props.playheadBar.value : props.playheadBar
  return (bar / store.config.barsPerCell) * (w.value / props.cols) || 0
})

const currentCol = computed(() => {
  const bar =
    typeof props.playheadBar === 'object' ? props.playheadBar.value : props.playheadBar
  if (bar === null || bar === undefined) return null
  return Math.min(props.cols - 1, Math.floor(bar / store.config.barsPerCell))
})
</script>

<template>
  <div
    ref="container"
    class="w-full flex"
    :style="{
      padding: `0 ${store.metronomeSectionPadding}px`
    }"
  >
    <MetronomeTempos :height="h" />

    <MetronomeGrid
      :width="w"
      :height="h"
      :cols="cols"
      :points="store.dragging !== null ? localPoints : store.gridPoints"
      :playhead-x="playheadX"
      :current-col="currentCol"
      @drag-start="handleDragStart"
      @drag-move="handleDragMove"
      @drag-end="handleDragEnd"
    />
  </div>
</template>

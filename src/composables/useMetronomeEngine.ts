import { ref } from "vue";
import highUrl from "@assets/metronomeSounds/high.wav";
import lowUrl from "@assets/metronomeSounds/low.wav";

export interface TempoPoint {
  bar: number; // This now represents the "Cell Index" from your UI
  bpm: number;
}

export function useMetronomeEngine() {
  const isRunning = ref(false);
  const currentBar = ref(0);
  const visualBar = ref(0);
  const currentBpm = ref(0);

  let ctx: AudioContext | null = null;
  let hiBuf: AudioBuffer | null = null;
  let loBuf: AudioBuffer | null = null;

  async function loadSample(url: string): Promise<AudioBuffer> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed loading sample: " + url);
    const arr = await res.arrayBuffer();
    if (!ctx) throw new Error("AudioContext not initialized");
    return await ctx.decodeAudioData(arr);
  }

  async function load() {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    hiBuf = await loadSample(highUrl);
    loBuf = await loadSample(lowUrl);
  }

  /**
   * Calculates BPM.
   * 'pts' contain cell indices, so we multiply by barsPerCell
   * to get the actual target bars.
   */
  function bpmAtBar(
    bar: number,
    pts: [TempoPoint, TempoPoint, TempoPoint],
    barsPerCell: number
  ): number {
    // Map cell-based points to real-bar-based points
    const a = { bar: pts[0].bar * barsPerCell, bpm: pts[0].bpm };
    const b = { bar: pts[1].bar * barsPerCell, bpm: pts[1].bpm };
    const c = { bar: pts[2].bar * barsPerCell, bpm: pts[2].bpm };

    if (bar <= b.bar) {
      const t = (bar - a.bar) / (b.bar - a.bar || 1);
      return a.bpm + t * (b.bpm - a.bpm);
    }

    if (bar <= c.bar) {
      const t = (bar - b.bar) / (c.bar - b.bar || 1);
      return b.bpm + t * (c.bpm - b.bpm);
    }

    return c.bpm;
  }

  function buildTempoMap(
    pts: [TempoPoint, TempoPoint, TempoPoint],
    barsPerCell: number = 1
  ): number[] {
    const lastCell = pts[2].bar;
    const lastBar = lastCell * barsPerCell;
    const out: number[] = [];

    for (let i = 0; i <= lastBar; i++) {
      const cellStart = Math.floor(i / barsPerCell) * barsPerCell;
      out.push(bpmAtBar(cellStart, pts, barsPerCell));
    }
    return out;
  }

  async function start(
    points: [TempoPoint, TempoPoint, TempoPoint],
    stopAtEnd: boolean,
    barsPerCell: number = 1
  ) {
    if (!ctx) await load();
    if (!ctx || !hiBuf || !loBuf) return;
    if (ctx.state === "suspended") await ctx.resume();

    isRunning.value = true;
    currentBar.value = 0;
    visualBar.value = 0;

    const LOOK_AHEAD_MS = 25;
    const SCHEDULE_AHEAD_TIME = 0.1;

    // --- FIX: Ensure we play until the END of the last cell ---
    // If your points[2].bar is index 8, and barsPerCell is 3,
    // the total bars should be 27 (0-26) to finish that 9th cell.
    const totalCells = points[2].bar + 1;
    const totalBars = totalCells * barsPerCell;
    const lastBarIndex = totalBars - 1;

    let nextBeatTime = ctx.currentTime;
    let beatInBar = 0;

    const scheduler = setInterval(() => {
      if (!ctx || !isRunning.value) {
        clearInterval(scheduler);
        return;
      }

      while (nextBeatTime < ctx.currentTime + SCHEDULE_AHEAD_TIME) {
        // Updated stop condition to include the full final cell
        if (stopAtEnd && currentBar.value > lastBarIndex) {
          stop();
          break;
        }

        const cellStart =
          Math.floor(currentBar.value / barsPerCell) * barsPerCell;
        const activeBpm = bpmAtBar(cellStart, points, barsPerCell);
        const secondsPerBeat = 60 / activeBpm / 2;

        const source = ctx.createBufferSource();
        source.buffer = beatInBar === 0 ? hiBuf! : loBuf!;
        source.connect(ctx.destination);
        source.start(nextBeatTime);

        if (beatInBar === 0) {
          visualBar.value = currentBar.value;
          if (currentBar.value === cellStart) {
            currentBpm.value = activeBpm;
          }
        }

        nextBeatTime += secondsPerBeat;
        beatInBar++;

        if (beatInBar > 3) {
          beatInBar = 0;
          currentBar.value++;
        }
      }
    }, LOOK_AHEAD_MS);
  }

  function stop() {
    isRunning.value = false;
  }

  return {
    start,
    stop,
    isRunning,
    currentBar,
    visualBar,
    currentBpm,
    buildTempoMap,
  };
}

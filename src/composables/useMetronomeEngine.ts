import { ref } from "vue";
import highUrl from "@assets/metronomeSounds/high.wav";
import lowUrl from "@assets/metronomeSounds/low.wav";

// Define the shape of your tempo points
export interface TempoPoint {
  bar: number;
  bpm: number;
}

export function useMetronomeEngine() {
  const isRunning = ref(false);
  const currentBar = ref(0);

  // Use types for Web Audio API objects
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
    // Standard AudioContext initialization
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    hiBuf = await loadSample(highUrl);
    loBuf = await loadSample(lowUrl);
  }

  // function play(buf: AudioBuffer) {
  //   if (!ctx) return;
  //   const s = ctx.createBufferSource();
  //   s.buffer = buf;
  //   s.connect(ctx.destination);
  //   s.start();
  // }

  function bpmAtBar(bar: number, pts: TempoPoint[]): number {
    // We cast pts to a Tuple of 3 elements so TS knows a, b, and c are defined
    const [a, b, c] = pts as [TempoPoint, TempoPoint, TempoPoint];

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

  function buildTempoMap(pts: TempoPoint[]): number[] {
    if (!pts[2]) return [];

    const last = pts[2].bar;
    const out: number[] = [];
    for (let i = 0; i <= last; i++) {
      out.push(bpmAtBar(i, pts));
    }
    return out;
  }

  async function start(
    points: [TempoPoint, TempoPoint, TempoPoint],
    infinite: boolean
  ) {
    if (!ctx) await load();
    if (!ctx || !hiBuf || !loBuf) return;

    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    isRunning.value = true;
    currentBar.value = 0;

    const LOOK_AHEAD_MS = 25.0; // How often to check for new beats
    const SCHEDULE_AHEAD_TIME = 0.1; // How far into the future to schedule (seconds)

    let nextBeatTime = ctx.currentTime;
    let beatInBar = 0; // 0, 1, 2, 3 for a 4/4 time signature
    const lastBar = points[2].bar;

    const scheduler = setInterval(() => {
      if (!ctx) return;

      // While there are beats to schedule within our window...
      while (nextBeatTime < ctx.currentTime + SCHEDULE_AHEAD_TIME) {
        // 1. Check if we should stop
        if (!infinite && currentBar.value > lastBar) {
          stop();
          clearInterval(scheduler);
          return;
        }

        // 2. Schedule the sound
        const bpm = bpmAtBar(currentBar.value, points);
        const secondsPerBeat = 60.0 / bpm / 2; // Your "eighthMs" logic converted to seconds

        const source = ctx!.createBufferSource();
        source.buffer = beatInBar === 0 ? hiBuf! : loBuf!;
        source.connect(ctx!.destination);

        // This is the magic: precise hardware timing
        source.start(nextBeatTime);

        // 3. Advance to the next beat
        nextBeatTime += secondsPerBeat;
        beatInBar++;

        if (beatInBar > 3) {
          beatInBar = 0;
          currentBar.value++;
        }
      }

      if (!isRunning.value) {
        clearInterval(scheduler);
      }
    }, LOOK_AHEAD_MS);
  }

  function stop() {
    isRunning.value = false;
    // Note: Sounds already scheduled in the next 100ms will still play.
    // This is usually preferred for a "natural" stop.
  }

  return {
    start,
    stop,
    isRunning,
    currentBar,
    buildTempoMap,
  };
}

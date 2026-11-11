<script setup lang="ts">
/**
 * Incline son contenu en 3D (10° max) selon la souris ou le gyroscope, avec reflet et ombre.
 * Émet « swipe » (-1 / 1) sur un glissé horizontal, et « tap » sur un appui court.
 */
const emit = defineEmits<{ swipe: [dir: -1 | 1]; tap: [] }>();

const MAX = 10;
const stage = ref<HTMLElement>();
const tilt = ref<HTMLElement>();
let target = { x: 0, y: 0 };
const cur = { x: 0, y: 0 };
let lastInput = 0;
let raf = 0;
let baseBeta: number | null = null;
let downX: number | null = null;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function onPointerMove(e: PointerEvent) {
  const r = stage.value?.getBoundingClientRect();
  if (!r) return;
  const nx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1.4, 1.4);
  const ny = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1.4, 1.4);
  target = { x: -ny * MAX, y: nx * MAX };
  lastInput = performance.now();
}
function onOrient(e: DeviceOrientationEvent) {
  if (e.gamma == null || e.beta == null) return;
  if (baseBeta == null) baseBeta = e.beta;
  target = { x: clamp(-(e.beta - baseBeta) * 0.7, -MAX, MAX), y: clamp(e.gamma * 0.7, -MAX, MAX) };
  lastInput = performance.now();
}

/** iOS n'autorise le gyroscope qu'après un geste de l'utilisateur. */
let asked = false;
async function askGyro() {
  if (asked) return;
  asked = true;
  const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } })
    .DeviceOrientationEvent;
  if (DOE?.requestPermission) {
    try {
      if ((await DOE.requestPermission()) === "granted") baseBeta = null;
    } catch {
      /* refusé : la souris / le repos restent actifs */
    }
  }
}

function onDown(e: PointerEvent) {
  downX = e.clientX;
}
function onUp(e: PointerEvent) {
  if (downX == null) return;
  const dx = e.clientX - downX;
  downX = null;
  if (Math.abs(dx) > 50) emit("swipe", dx < 0 ? 1 : -1);
  else {
    askGyro();
    emit("tap");
  }
}

function frame(t: number) {
  let tx = target.x;
  let ty = target.y;
  if (t - lastInput > 2500) {
    tx = Math.sin(t / 1400) * 3;
    ty = Math.cos(t / 1800) * 4;
  }
  cur.x += (tx - cur.x) * 0.1;
  cur.y += (ty - cur.y) * 0.1;
  const el = tilt.value;
  if (el) {
    el.style.transform = `rotateX(${cur.x.toFixed(2)}deg) rotateY(${cur.y.toFixed(2)}deg)`;
    el.style.setProperty("--gx", `${(50 + cur.y * 4.8).toFixed(1)}%`);
    el.style.setProperty("--gy", `${(40 - cur.x * 4.8).toFixed(1)}%`);
    el.style.setProperty("--sp", `${(50 + cur.y * 6).toFixed(1)}%`);
    el.style.setProperty("--shx", `${(-cur.y * 3).toFixed(1)}px`);
    el.style.setProperty("--shy", `${(40 + cur.x * 3).toFixed(1)}px`);
    // Angle des finitions de la carte (holo, paillettes, métal…), de 0 à 1.
    el.style.setProperty("--tx", clamp(0.5 + cur.y / 14, 0, 1).toFixed(3));
    el.style.setProperty("--ty", clamp(0.5 - cur.x / 14, 0, 1).toFixed(3));
  }
  raf = requestAnimationFrame(frame);
}

onMounted(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("deviceorientation", onOrient);
  raf = requestAnimationFrame(frame);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("deviceorientation", onOrient);
});
</script>

<template>
  <div
    ref="stage"
    class="stage"
    @pointerdown="onDown"
    @pointerup="onUp"
    @pointerleave="target = { x: 0, y: 0 }"
  >
    <div ref="tilt" class="tilt">
      <slot />
      <div class="glare" />
      <div class="sheen" />
    </div>
  </div>
</template>

<style scoped>
.stage { perspective: 1100px; width: 100%; touch-action: pan-y; user-select: none; -webkit-user-select: none; cursor: grab; }
.tilt { position: relative; transform-style: preserve-3d; will-change: transform; }
.tilt > :slotted(*) { box-shadow: var(--shx, 0px) var(--shy, 40px) 70px -18px rgb(0 0 0 / 0.85); }
/* Finition Néon : on garde son halo en plus de l'ombre portée. */
.tilt > :slotted(.fx-neon) {
  box-shadow: 0 0 10px hsl(var(--hue) 100% 60% / 0.9), 0 0 34px hsl(var(--hue) 100% 55% / 0.55),
    var(--shx, 0px) var(--shy, 40px) 70px -18px rgb(0 0 0 / 0.85);
}
.glare {
  position: absolute; inset: 0; pointer-events: none; mix-blend-mode: soft-light;
  background: radial-gradient(circle at var(--gx, 50%) var(--gy, 30%), rgb(255 255 255 / 0.75), rgb(255 255 255 / 0) 58%);
}
.sheen {
  position: absolute; inset: 0; pointer-events: none; mix-blend-mode: overlay; opacity: 0.5;
  background: linear-gradient(115deg, transparent calc(var(--sp, 50%) - 18%), rgb(255 255 255 / 0.55) var(--sp, 50%), transparent calc(var(--sp, 50%) + 18%));
}
</style>

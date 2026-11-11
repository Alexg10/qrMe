<script setup lang="ts">
/**
 * Joue l'animation d'apparition choisie sur la carte (`card.intro`) : Donne, Flip, Révélation, Éclat.
 * Se joue au montage et quand la carte change ; `play()` la relance (plein écran, appui…).
 */
const props = defineProps<{ card: Partial<Card> }>();

const intro = computed<CardIntro>(() => props.card.intro || "none");
const flipper = ref<HTMLElement>();
const canvas = ref<HTMLCanvasElement>();
let timer: ReturnType<typeof setTimeout> | undefined;
let raf = 0;

function play() {
  const el = flipper.value;
  if (!el) return;
  el.classList.remove("in-deal", "in-flip", "in-reveal", "in-burst");
  if (intro.value === "none") return;
  void el.offsetWidth; // relance l'animation CSS
  el.classList.add(`in-${intro.value}`);
  clearTimeout(timer);
  if (intro.value === "burst") timer = setTimeout(burst, 140);
}

/* Éclat : une gerbe de petits carrés et anneaux, comme le logo qrMe. */
function burst() {
  const cv = canvas.value;
  if (!cv || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = cv.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  cv.width = r.width * dpr;
  cv.height = r.height * dpr;
  const g = cv.getContext("2d");
  if (!g) return;
  g.scale(dpr, dpr);
  const css = getComputedStyle(document.documentElement);
  const pal = ["--c-jaune", "--paper", "--c-corail", "--c-ciel", "--c-lilas", "--c-menthe"].map((v) => css.getPropertyValue(v).trim() || "#fff");
  const unit = r.width / 160;
  const ps = Array.from({ length: 80 }, () => {
    const a = Math.random() * Math.PI * 2;
    const v = (4 + Math.random() * 9) * unit;
    return {
      x: r.width / 2, y: r.height / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2 * unit,
      s: (4 + Math.random() * 7) * unit, c: pal[Math.floor(Math.random() * pal.length)],
      ring: Math.random() < 0.35, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, life: 1,
    };
  });
  cancelAnimationFrame(raf);
  let last = performance.now();
  const step = (t: number) => {
    const dt = Math.min(2, (t - last) / 16.7);
    last = t;
    g.clearRect(0, 0, r.width, r.height);
    let alive = false;
    for (const p of ps) {
      p.vx *= 0.97;
      p.vy = p.vy * 0.97 + 0.25 * unit * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.life -= 0.014 * dt;
      if (p.life <= 0) continue;
      alive = true;
      g.save();
      g.globalAlpha = Math.min(1, p.life * 1.6);
      g.translate(p.x, p.y);
      g.rotate(p.rot);
      if (p.ring) {
        g.strokeStyle = p.c;
        g.lineWidth = p.s * 0.3;
        g.strokeRect(-p.s / 2, -p.s / 2, p.s, p.s);
      } else {
        g.fillStyle = p.c;
        g.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
      }
      g.restore();
    }
    if (alive) raf = requestAnimationFrame(step);
    else g.clearRect(0, 0, r.width, r.height);
  };
  raf = requestAnimationFrame(step);
}

onMounted(play);
watch(() => [props.card.id, props.card.slug, intro.value], () => nextTick(play));
onBeforeUnmount(() => {
  clearTimeout(timer);
  cancelAnimationFrame(raf);
});
defineExpose({ play });
</script>

<template>
  <div class="intro">
    <div ref="flipper" class="flipper">
      <div class="face front"><slot /></div>
      <div v-if="intro === 'flip'" class="face back"><QrCard :card="card" back /></div>
    </div>
    <canvas v-if="intro === 'burst'" ref="canvas" class="burst" aria-hidden="true" />
  </div>
</template>

<style scoped>
.intro { position: relative; perspective: 1200px; }
.flipper { position: relative; transform-style: preserve-3d; }
.face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.face.back { position: absolute; inset: 0; transform: rotateY(180deg); }
.burst { position: absolute; left: -30%; top: -20%; width: 160%; height: 140%; pointer-events: none; z-index: 5; }

/* Flip : la carte arrive de dos et se retourne. */
.in-flip { animation: flipIn 1.15s cubic-bezier(0.25, 1.15, 0.4, 1) both; }
@keyframes flipIn {
  0% { transform: rotateY(-180deg) scale(0.82); }
  100% { transform: none; }
}
/* Donne : la carte glisse depuis le bas comme une carte distribuée. */
.in-deal { animation: dealIn 0.85s cubic-bezier(0.2, 1.25, 0.35, 1) both; }
@keyframes dealIn {
  0% { transform: translateY(120%) rotate(-14deg) scale(0.9); opacity: 0; }
  15% { opacity: 1; }
  100% { transform: none; }
}
/* Éclat : apparition en pop avec un flash, puis les particules. */
.in-burst { animation: popIn 0.6s cubic-bezier(0.2, 1.4, 0.4, 1) both; }
.in-burst .front :deep(.qcard)::after {
  content: ""; position: absolute; inset: 0; z-index: 3; background: #fff; pointer-events: none;
  animation: flash 0.5s ease-out 0.15s both;
}
@keyframes popIn {
  0% { transform: scale(0.35); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: none; }
}
@keyframes flash { from { opacity: 0.85; } to { opacity: 0; } }
/* Révélation : le nom monte ligne par ligne, puis les infos, puis le QR se dessine. */
.in-reveal { animation: fadeIn 0.35s ease both; }
.in-reveal :deep(.ln), .in-reveal :deep(.ini), .in-reveal :deep(.who) { animation: lineIn 0.6s cubic-bezier(0.2, 1.2, 0.35, 1) 0.2s both; }
.in-reveal :deep(.ln + .ln) { animation-delay: 0.38s; }
.in-reveal :deep(:is(.job, .meta, .tags, .rule, .desc, .info, .city, .top-row)) { animation: fadeUp 0.45s ease 0.75s both; }
.in-reveal :deep(.qr) { animation: wipe 0.8s cubic-bezier(0.6, 0, 0.3, 1) 1s both; }
@keyframes fadeIn { from { opacity: 0; } }
@keyframes lineIn { from { opacity: 0; transform: translateY(45%) rotate(4deg); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(3cqw); } }
@keyframes wipe { from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0); } }

@media (prefers-reduced-motion: reduce) {
  .in-flip, .in-deal, .in-burst, .in-reveal, .in-reveal :deep(*) { animation: fadeIn 0.3s ease both !important; }
}
</style>

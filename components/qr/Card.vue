<script setup lang="ts">
/**
 * Rendu d'une carte qrMe (format 55 × 85). Tout le contenu est dimensionné en cqw,
 * donc la carte garde les mêmes proportions de 40 px (vignette) à plein écran.
 * `back` affiche le dos de la carte (vu pendant l'animation Flip).
 */
const props = defineProps<{
  card: Partial<Card> & { slug?: string };
  back?: boolean;
}>();

const root = ref<HTMLElement>();

const c = computed(() => props.card);
const tags = computed(() => (c.value.tags || []).slice(0, MAX_TAGS));
const initials = computed(
  () => ((c.value.first_name || "")[0] || "") + ((c.value.last_name || "")[0] || "") || "QR",
);
const nameLines = computed(() => [c.value.first_name, c.value.last_name].filter(Boolean) as string[]);
const contact = computed(() => [c.value.phone, c.value.email, c.value.website].filter(Boolean) as string[]);
const qr = computed(() => qrSvg(cardUrl(c.value.slug || "apercu")));
const label = computed(() => `Carte de ${fullName(c.value) || "sans nom"}`);

const col = computed(() => colorInfo(c.value.color));
const finish = computed(() => c.value.finish || "none");
const foil = computed(() => !!c.value.foil && !props.back);
const classes = computed(() => [
  `l-${c.value.layout || "affiche"}`,
  `fx-${finish.value}`,
  { dark: col.value.dark, metal: col.value.metal, foil: foil.value, moving: finish.value !== "none" || col.value.metal || foil.value, back: props.back },
]);
watch(finish, (f) => f === "glitter" && ensureSparkles(), { immediate: true });

/* Le nom tient toujours sur une ligne par mot : on réduit la taille s'il dépasse. */
const BASE: Partial<Record<CardLayout, number>> = { affiche: 19, typo: 24 };
function fit() {
  const el = root.value;
  const h = el?.querySelector<HTMLElement>(".disp");
  const base = BASE[c.value.layout || "affiche"];
  if (!h || !base) return;
  h.style.fontSize = `${base}cqw`;
  const avail = h.clientWidth;
  if (!avail) return;
  // offsetWidth et pas getBoundingClientRect : la largeur ne doit pas dépendre d'une rotation en cours (Flip, Donne).
  const widest = Math.max(0, ...[...h.querySelectorAll<HTMLElement>(".ln")].map((l) => l.offsetWidth));
  if (widest > avail) h.style.fontSize = `${((base * avail) / widest) * 0.98}cqw`;
}

let ro: ResizeObserver | undefined;
onMounted(() => {
  fit();
  document.fonts?.ready.then(fit);
  ro = new ResizeObserver(() => fit());
  if (root.value) ro.observe(root.value);
});
onBeforeUnmount(() => ro?.disconnect());
watch(() => [c.value.first_name, c.value.last_name, c.value.layout], () => nextTick(fit));
</script>

<template>
  <article
    ref="root"
    lang="fr"
    class="qcard"
    :class="classes"
    :data-c="col.value"
    :aria-label="back ? undefined : label"
    :aria-hidden="back ? 'true' : undefined"
  >
    <div class="fx under" />
    <div class="ci">
      <!-- Dos de carte -->
      <template v-if="back">
        <div class="frame" />
        <div class="logo"><div class="marks"><i /><i /></div>qrMe</div>
      </template>

      <!-- A — Affiche -->
      <template v-else-if="(c.layout || 'affiche') === 'affiche'">
        <div class="top-row">
          <div class="marks"><i /><i /></div>
          <div class="meta">{{ c.city }}</div>
        </div>
        <div>
          <h3 class="disp"><span v-for="l in nameLines" :key="l" class="ln">{{ l }}</span></h3>
          <div v-if="c.job" class="job">{{ c.job }}</div>
        </div>
        <div v-if="tags.length" class="tags"><span v-for="t in tags" :key="t">{{ t }}</span></div>
        <div v-if="c.website" class="meta">{{ c.website }}</div>
        <div class="qr" v-html="qr" />
      </template>

      <!-- B — Monogramme -->
      <template v-else-if="c.layout === 'mono'">
        <p class="ini">{{ initials }}</p>
        <div class="panel">
          <div class="who">
            <b v-if="fullName(c)">{{ fullName(c) }}</b>{{ c.job }}
          </div>
          <div v-if="c.city" class="city">{{ c.city }}</div>
          <div v-if="tags.length" class="tags"><span v-for="t in tags" :key="t">{{ t }}</span></div>
          <div class="meta">
            <template v-for="(l, i) in contact" :key="l"><br v-if="i">{{ l }}</template>
          </div>
          <div class="bottom"><div class="qr" v-html="qr" /></div>
        </div>
      </template>

      <!-- C — Typo -->
      <template v-else>
        <h3 class="disp"><span v-for="l in nameLines" :key="l" class="ln">{{ l }}</span></h3>
        <div class="rule" />
        <p v-if="c.description" class="desc">{{ c.description }}</p>
        <div v-if="tags.length" class="tags"><span v-for="t in tags" :key="t">{{ t }}</span></div>
        <div class="foot">
          <div class="info">
            <span v-if="c.job">{{ c.job }}</span>
            <span v-if="c.city">{{ c.city }}</span>
          </div>
          <div class="qr" v-html="qr" />
        </div>
      </template>
    </div>
    <div class="fx over" />
  </article>
</template>

<style scoped>
.qcard {
  --bg: var(--c-jaune);
  --fg: var(--ink);
  /* Angle du reflet, de 0 à 1 : donné par QrTilt (--tx/--ty) ou, à défaut, une dérive lente (--ax/--ay). */
  --mx: var(--tx, var(--ax));
  --my: var(--ty, var(--ay));
  container-type: inline-size;
  aspect-ratio: 55 / 85;
  width: 100%;
  max-width: 100%;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background: var(--paint, var(--bg));
  color: var(--fg);
  font-family: var(--f-body);
  transition: background 0.35s ease, color 0.35s ease;
}
.qcard[data-c="vert"] { --bg: var(--c-vert); }
.qcard[data-c="bleu"] { --bg: var(--c-bleu); }
.qcard[data-c="lilas"] { --bg: var(--c-lilas); }
.qcard[data-c="rouge"] { --bg: var(--c-rouge); }
.qcard[data-c="papier"] { --bg: var(--c-papier); }
.qcard[data-c="noir"] { --bg: var(--c-noir); }
.qcard[data-c="corail"] { --bg: var(--c-corail); }
.qcard[data-c="menthe"] { --bg: var(--c-menthe); }
.qcard[data-c="ciel"] { --bg: var(--c-ciel); }
.qcard[data-c="rose"] { --bg: var(--c-rose); }
.qcard[data-c="sapin"] { --bg: var(--c-sapin); }
.qcard[data-c="nuit"] { --bg: var(--c-nuit); }
/* Dégradés et métaux : --paint peint le fond, --bg reste une teinte unie pour le texte du panneau Monogramme. */
.qcard[data-c="aurore"] { --bg: #a9c3d9; --paint: var(--c-aurore); }
.qcard[data-c="couchant"] { --bg: #ff9f6e; --paint: var(--c-couchant); }
.qcard[data-c="lagon"] { --bg: #4ab3c9; --paint: var(--c-lagon); }
.qcard[data-c="argent"] { --bg: #c9ccd1; --paint: var(--c-argent); }
.qcard[data-c="chrome"] { --bg: #b9c2cc; --paint: var(--c-chrome); }
.qcard[data-c="or"] { --bg: #e2b552; --paint: var(--c-or); }
.qcard.dark { --fg: var(--paper); }
.qcard.metal, .qcard.metal .bottom .qr { background-size: 250% 100%; background-position: calc(var(--mx) * 100%) 50%; transition: none; }
.qcard.moving { animation: drift 9s ease-in-out infinite alternate; }
@keyframes drift {
  0% { --ax: 0.2; --ay: 0.3; }
  50% { --ax: 0.8; --ay: 0.55; }
  100% { --ax: 0.35; --ay: 0.85; }
}

/* Le padding en cqw doit être sur un enfant : sur la carte elle-même, cqw viserait l'écran. */
.ci { position: absolute; inset: 0; z-index: 1; }
.fx { position: absolute; inset: 0; pointer-events: none; }
.fx.under { z-index: 0; }
.fx.over { z-index: 2; }
.qr :deep(svg) { display: block; width: 100%; height: auto; }
.disp {
  margin: 0;
  width: 100%;
  font-family: var(--f-display);
  font-weight: var(--w-display);
  font-stretch: var(--s-display);
  letter-spacing: -0.035em;
}
.disp .ln { display: block; white-space: nowrap; width: max-content; }
.meta { font-size: 5.2cqw; line-height: 1.25; font-weight: 500; }
.tags { display: flex; flex-wrap: wrap; gap: 1.6cqw; }
.tags span {
  border: 0.55cqw solid currentColor;
  border-radius: 99px;
  padding: 0.5cqw 2.8cqw;
  font-weight: 600;
  font-size: 4.6cqw;
}
.marks { display: flex; gap: 1.8cqw; flex: none; }
.marks i { display: block; width: 8cqw; height: 8cqw; background: currentColor; }
.marks i + i { background: transparent; border: 1.8cqw solid currentColor; }

/* A — Affiche */
.l-affiche .ci { display: flex; flex-direction: column; padding: 5.5cqw; gap: 3cqw; }
.l-affiche .ci > * { flex: none; }
.l-affiche .top-row { display: flex; justify-content: space-between; align-items: center; gap: 3cqw; margin-bottom: 1cqw; }
.l-affiche .disp { font-size: 19cqw; line-height: 0.92; }
.l-affiche .job { font-family: var(--f-body); font-weight: 600; font-size: 6.4cqw; line-height: 1; margin-top: 2.4cqw; }
/* Le QR prend toute la hauteur restante et reste carré. */
.l-affiche .ci > .qr { flex: 1 1 0; min-height: 0; display: flex; align-items: flex-end; margin-top: 1cqw; }
.l-affiche .qr :deep(svg) { height: 100%; width: auto; max-width: 100%; }

/* B — Monogramme */
.l-mono .ci { padding: 4cqw; display: flex; flex-direction: column; }
.l-mono .ini { margin: 0 -1cqw 0 0; font-family: var(--f-display); font-weight: 500; font-size: 34cqw; line-height: 0.74; letter-spacing: -0.06em; text-align: right; }
.l-mono .panel { background: var(--ink); color: var(--bg); flex: 1; display: flex; flex-direction: column; padding: 5cqw; gap: 2.6cqw; min-height: 0; }
.qcard.dark .panel { background: var(--paper); color: var(--ink); }
.l-mono .panel > * { flex: none; }
.l-mono .who { font-size: 7.4cqw; line-height: 1.05; font-weight: 500; }
.l-mono .who b { display: block; font-weight: 700; }
.l-mono .city { font-size: 7cqw; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.l-mono .panel > .bottom { flex: 1 1 0; min-height: 0; display: flex; justify-content: flex-end; align-items: flex-end; }
.l-mono .bottom .qr { height: 100%; max-height: 62cqw; aspect-ratio: 1; flex: none; background: var(--paint, var(--bg)); color: var(--ink); padding: 2.6cqw; margin: 0 -5cqw -5cqw 0; }
.qcard.dark .bottom .qr { color: var(--paper); }
.l-mono .bottom .qr :deep(svg) { width: 100%; height: 100%; }

/* C — Typo */
.l-typo .ci { padding: 5.5cqw; display: flex; flex-direction: column; gap: 2.2cqw; }
.l-typo .disp { font-size: 24cqw; line-height: 0.9; }
.l-typo .rule { border-top: 0.7cqw solid currentColor; }
.l-typo .desc { margin: 0; font-size: 5.2cqw; line-height: 1.15; font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.l-typo .foot { margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; gap: 3cqw; }
.l-typo .info { flex: 1; min-width: 0; font-weight: 600; font-size: 5cqw; line-height: 1.02; overflow-wrap: break-word; hyphens: auto; }
.l-typo .info span { display: block; }
.l-typo .info span + span { margin-top: 2cqw; }
.l-typo .foot .qr { width: 60cqw; flex: none; margin: 0 -1cqw -1cqw 0; }

/* Dos */
.back .ci { display: grid; place-items: center; padding: 8cqw; }
.back .frame { position: absolute; inset: 5cqw; border: 0.7cqw solid currentColor; }
.back .logo { display: flex; align-items: center; gap: 3cqw; font-family: var(--f-display); font-weight: var(--w-display); font-stretch: var(--s-display); font-size: 30cqw; line-height: 1; letter-spacing: -0.05em; }
.back .logo .marks i { width: 10cqw; height: 10cqw; }
.back .logo .marks i + i { border-width: 2.2cqw; }

/* ---------- Finitions : sous le texte et le QR, qui restent nets ---------- */
/* Brillance : un reflet balaie la carte toutes les 4,5 s, plus un halo qui suit l'inclinaison. */
.fx-shine .fx.over {
  background:
    linear-gradient(105deg, transparent 38%, rgb(255 255 255 / 0.75) 50%, transparent 62%) no-repeat,
    radial-gradient(circle at calc(var(--mx) * 100%) calc(var(--my) * 100%), rgb(255 255 255 / 0.28), transparent 55%);
  background-size: 300% 100%, 100% 100%;
  mix-blend-mode: overlay;
  animation: sheen 4.5s ease-in-out infinite;
}
@keyframes sheen {
  0% { background-position: 130% 0, 0 0; }
  35%, 100% { background-position: -30% 0, 0 0; }
}

/* Holographique : arc-en-ciel irisé qui glisse avec l'inclinaison. */
.fx-holo .fx.under {
  background-image:
    repeating-linear-gradient(115deg, #ff2d95 0%, #ffd400 7%, #22f5a8 14%, #19c3ff 21%, #a43bff 28%, #ff2d95 35%),
    repeating-linear-gradient(45deg, rgb(255 255 255 / 0.22) 0 1px, transparent 1px 5px);
  background-size: 400% 400%, auto;
  background-position: calc(var(--mx) * 100%) calc(var(--my) * 100%), 0 0;
  mix-blend-mode: overlay;
  opacity: 0.8;
}
.fx-holo .fx.over {
  background: radial-gradient(circle at calc(var(--mx) * 100%) calc(var(--my) * 100%), rgb(255 255 255 / 0.5), transparent 48%);
  mix-blend-mode: soft-light;
}

/* Paillettes : deux couches de grains qui s'allument tour à tour selon l'angle. */
.fx-glitter .fx.under::before,
.fx-glitter .fx.under::after {
  content: "";
  position: absolute;
  inset: 0;
  background-size: 46cqw 46cqw;
  mix-blend-mode: screen;
}
.fx-glitter .fx.under::before { background-image: var(--spark-a); opacity: calc(0.15 + var(--mx) * 0.85); }
.fx-glitter .fx.under::after { background-image: var(--spark-b); background-position: 13cqw 21cqw; opacity: calc(1 - var(--mx) * 0.85); }
.fx-glitter .fx.over {
  background: radial-gradient(circle at calc(var(--mx) * 100%) calc(var(--my) * 100%), rgb(255 255 255 / 0.3), transparent 40%);
  mix-blend-mode: soft-light;
}

/* Néon : un contour lumineux qui tourne et change de teinte. */
.qcard.fx-neon {
  animation: drift 9s ease-in-out infinite alternate, hue 6s linear infinite;
  box-shadow: 0 0 10px hsl(var(--hue) 100% 60% / 0.9), 0 0 34px hsl(var(--hue) 100% 55% / 0.55);
}
.fx-neon .fx.over {
  padding: 2.2%;
  background: conic-gradient(from calc(var(--hue) * 1deg), #ff2d95, #ffd400, #22f5a8, #19c3ff, #a43bff, #ff2d95);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
@keyframes hue { to { --hue: 360; } }

/* Foil sur le nom */
.foil .disp .ln,
.foil .ini {
  background: linear-gradient(100deg, var(--fg) 0%, var(--fg) 28%, #fff7d1 40%, #ffcf4d 46%, #7af3ff 53%, #ff97de 59%, var(--fg) 72%, var(--fg) 100%);
  background-size: 320% 100%;
  background-position: calc(var(--mx) * 100%) 0;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

@media (prefers-reduced-motion: reduce) {
  .qcard { transition: none; }
  .qcard.moving, .qcard.fx-neon, .fx-shine .fx.over { animation: none; }
}
</style>

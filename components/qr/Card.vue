<script setup lang="ts">
import { Instagram, Linkedin, Twitch, Youtube } from "lucide-vue-next";

/**
 * Rendu d'une carte qrMe (format 55 × 85). Tout le contenu est dimensionné en cqw,
 * donc la carte garde les mêmes proportions de 40 px (vignette) à plein écran.
 */
const props = defineProps<{
  card: Partial<Card> & { slug?: string };
}>();

const root = ref<HTMLElement>();

/* Les infos masquées par l'utilisateur (champ display) sont vidées avant le rendu. */
const c = computed(() => visibleCard(props.card));
const tags = computed(() => (c.value.tags || []).slice(0, MAX_TAGS));
const initials = computed(
  () => ((c.value.first_name || "")[0] || "") + ((c.value.last_name || "")[0] || "") || "QR",
);
const nameLines = computed(() => [c.value.first_name, c.value.last_name].filter(Boolean) as string[]);
const contact = computed(() => [c.value.phone, c.value.email, c.value.website, c.value.address].filter(Boolean) as string[]);
const ICONS = { linkedin: Linkedin, instagram: Instagram, youtube: Youtube, twitch: Twitch };
const socials = computed(() => cardSocials(c.value).map((s) => ({ ...s, icon: ICONS[s.key] })));
const qr = computed(() => qrSvg(cardUrl(c.value.slug || "apercu")));
const label = computed(() => `Carte de ${fullName(c.value) || "sans nom"}`);

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
  const widest = Math.max(0, ...[...h.querySelectorAll<HTMLElement>(".ln")].map((l) => l.getBoundingClientRect().width));
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
  <article ref="root" lang="fr" class="qcard" :class="`l-${c.layout || 'affiche'}`" :data-c="c.color || 'jaune'" :aria-label="label">
    <div class="ci">
      <!-- A — Affiche -->
      <template v-if="(c.layout || 'affiche') === 'affiche'">
        <div class="top-row">
          <div class="marks"><i /><i /></div>
          <div class="meta">{{ c.city }}</div>
        </div>
        <div>
          <h3 class="disp"><span v-for="l in nameLines" :key="l" class="ln">{{ l }}</span></h3>
          <div v-if="c.job" class="job">{{ c.job }}</div>
        </div>
        <div v-if="tags.length" class="tags"><span v-for="t in tags" :key="t">{{ t }}</span></div>
        <div v-if="contact.length" class="meta lines"><span v-for="l in contact" :key="l">{{ l }}</span></div>
        <ul v-if="socials.length" class="soc">
          <li v-for="s in socials" :key="s.key"><component :is="s.icon" aria-hidden="true" /><span>{{ s.handle }}</span><span class="sr">{{ s.label }}</span></li>
        </ul>
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
          <div v-if="contact.length" class="meta lines"><span v-for="l in contact" :key="l">{{ l }}</span></div>
          <ul v-if="socials.length" class="soc">
            <li v-for="s in socials" :key="s.key"><component :is="s.icon" aria-hidden="true" /><span>{{ s.handle }}</span><span class="sr">{{ s.label }}</span></li>
          </ul>
          <div class="bottom"><div class="qr" v-html="qr" /></div>
        </div>
      </template>

      <!-- C — Typo -->
      <template v-else>
        <h3 class="disp"><span v-for="l in nameLines" :key="l" class="ln">{{ l }}</span></h3>
        <div class="rule" />
        <p v-if="c.description" class="desc">{{ c.description }}</p>
        <div v-if="tags.length" class="tags"><span v-for="t in tags" :key="t">{{ t }}</span></div>
        <div v-if="contact.length" class="meta lines"><span v-for="l in contact" :key="l">{{ l }}</span></div>
        <ul v-if="socials.length" class="soc">
          <li v-for="s in socials" :key="s.key"><component :is="s.icon" aria-hidden="true" /><span>{{ s.handle }}</span><span class="sr">{{ s.label }}</span></li>
        </ul>
        <div class="foot">
          <div class="info">
            <span v-if="c.job">{{ c.job }}</span>
            <span v-if="c.city">{{ c.city }}</span>
          </div>
          <div class="qr" v-html="qr" />
        </div>
      </template>
    </div>
  </article>
</template>

<style scoped>
.qcard {
  --bg: var(--c-jaune);
  --fg: var(--ink);
  container-type: inline-size;
  aspect-ratio: 55 / 85;
  width: 100%;
  max-width: 100%;
  position: relative;
  overflow: hidden;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--f-body);
  transition: background 0.35s ease, color 0.35s ease;
}
.qcard[data-c="vert"] { --bg: var(--c-vert); }
.qcard[data-c="bleu"] { --bg: var(--c-bleu); }
.qcard[data-c="lilas"] { --bg: var(--c-lilas); }
.qcard[data-c="rouge"] { --bg: var(--c-rouge); }
.qcard[data-c="papier"] { --bg: var(--c-papier); }
.qcard[data-c="noir"] { --bg: var(--c-noir); --fg: var(--paper); }

/* Le padding en cqw doit être sur un enfant : sur la carte elle-même, cqw viserait l'écran. */
.ci { position: absolute; inset: 0; }
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
.meta.lines span { display: block; overflow-wrap: anywhere; }
.tags { display: flex; flex-wrap: wrap; gap: 1.6cqw; }
/* Réseaux : pictogramme + pseudo. */
.soc { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 1.2cqw 3.4cqw; font-size: 4.6cqw; line-height: 1.1; font-weight: 600; }
.soc li { display: inline-flex; align-items: center; gap: 1.2cqw; min-width: 0; max-width: 100%; }
.soc li > span:not(.sr) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.soc :deep(svg) { width: 5cqw; height: 5cqw; flex: none; stroke-width: 2.2; }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.tags span {
  border: 0.55cqw solid currentColor;
  border-radius: 99px;
  padding: 0.5cqw 2.8cqw;
  font-weight: 600;
  font-size: 4.6cqw;
}

/* A — Affiche */
.l-affiche .ci { display: flex; flex-direction: column; padding: 5.5cqw; gap: 3cqw; }
.l-affiche .ci > * { flex: none; }
.l-affiche .top-row { display: flex; justify-content: space-between; align-items: center; gap: 3cqw; margin-bottom: 1cqw; }
.l-affiche .marks { display: flex; gap: 1.8cqw; flex: none; }
.l-affiche .marks i { display: block; width: 8cqw; height: 8cqw; background: currentColor; }
.l-affiche .marks i + i { background: transparent; border: 1.8cqw solid currentColor; }
.l-affiche .disp { font-size: 19cqw; line-height: 0.92; }
.l-affiche .job { font-family: var(--f-body); font-weight: 600; font-size: 6.4cqw; line-height: 1; margin-top: 2.4cqw; }
/* Le QR prend toute la hauteur restante et reste carré. */
.l-affiche .ci > .qr { flex: 1 1 0; min-height: 0; display: flex; align-items: flex-end; margin-top: 1cqw; }
.l-affiche .qr :deep(svg) { height: 100%; width: auto; max-width: 100%; }

/* B — Monogramme */
.l-mono .ci { padding: 4cqw; display: flex; flex-direction: column; }
.l-mono .ini { margin: 0 -1cqw 0 0; font-family: var(--f-display); font-weight: 500; font-size: 34cqw; line-height: 0.74; letter-spacing: -0.06em; text-align: right; }
.l-mono .panel { background: var(--ink); color: var(--bg); flex: 1; display: flex; flex-direction: column; padding: 5cqw; gap: 2.6cqw; min-height: 0; }
.qcard[data-c="noir"] .panel { background: var(--paper); color: var(--ink); }
.l-mono .panel > * { flex: none; }
.l-mono .who { font-size: 7.4cqw; line-height: 1.05; font-weight: 500; }
.l-mono .who b { display: block; font-weight: 700; }
.l-mono .city { font-size: 7cqw; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.l-mono .panel > .bottom { flex: 1 1 0; min-height: 0; display: flex; justify-content: flex-end; align-items: flex-end; }
.l-mono .bottom .qr { height: 100%; max-height: 62cqw; aspect-ratio: 1; flex: none; background: var(--bg); color: var(--ink); padding: 2.6cqw; margin: 0 -5cqw -5cqw 0; }
.qcard[data-c="noir"] .bottom .qr { color: var(--paper); }
.l-mono .bottom .qr :deep(svg) { width: 100%; height: 100%; }

/* C — Typo */
.l-typo .ci { padding: 5.5cqw; display: flex; flex-direction: column; gap: 2.2cqw; }
.l-typo .disp { font-size: 24cqw; line-height: 0.9; }
.l-typo .rule { border-top: 0.7cqw solid currentColor; }
.l-typo .desc { margin: 0; font-size: 5.2cqw; line-height: 1.15; font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
/* Le pied prend la hauteur restante ; le QR rétrécit si la carte affiche beaucoup d'infos. */
.l-typo .ci > * { flex: none; }
.l-typo .ci > .foot { flex: 1 1 0; min-height: 0; display: flex; justify-content: space-between; align-items: flex-end; gap: 3cqw; }
.l-typo .info { flex: 1; min-width: 0; font-weight: 600; font-size: 5cqw; line-height: 1.02; overflow-wrap: break-word; hyphens: auto; }
.l-typo .info span { display: block; }
.l-typo .info span + span { margin-top: 2cqw; }
.l-typo .foot .qr { height: 100%; max-height: 60cqw; aspect-ratio: 1; flex: none; margin: 0 -1cqw -1cqw 0; }
.l-typo .foot .qr :deep(svg) { width: 100%; height: 100%; }

@media (prefers-reduced-motion: reduce) {
  .qcard { transition: none; }
}
</style>

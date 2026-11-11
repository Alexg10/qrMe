<script setup lang="ts">
/* SHOWme : la première chose qu'on voit, sa carte en grand, prête à être scannée. */
definePageMeta({ layout: "dashboard" });
useHead({ title: "SHOWme · qrMe" });

const { cards: allCards, loaded } = useMyCards();
// Une carte désactivée a un QR mort : on ne la propose pas à montrer.
const cards = computed(() => allCards.value.filter((c) => c.is_active));
const idx = ref(0);
const anim = ref<"" | "out-l" | "out-r" | "in">("");
const present = ref<HTMLElement>();
const fsError = ref(false);
const intro = ref<{ play: () => void }>();

onMounted(() => {
  try {
    idx.value = Number(localStorage.getItem("qrme-card")) || 0;
  } catch {
    /* rien */
  }
});
const current = computed(() => cards.value[Math.min(idx.value, cards.value.length - 1)]);

function setCard(i: number, dir = 0) {
  const n = cards.value.length;
  if (!n) return;
  i = (i + n) % n;
  if (i === idx.value) return;
  const apply = () => {
    idx.value = i;
    try {
      localStorage.setItem("qrme-card", String(i));
    } catch {
      /* rien */
    }
  };
  if (!dir || matchMedia("(prefers-reduced-motion: reduce)").matches) return apply();
  anim.value = dir > 0 ? "out-l" : "out-r";
  setTimeout(() => {
    apply();
    anim.value = "in";
    setTimeout(() => (anim.value = ""), 320);
  }, 210);
}

function onKey(e: KeyboardEvent) {
  if ((e.target as HTMLElement)?.matches?.("input, textarea")) return;
  if (e.key === "ArrowRight") setCard(idx.value + 1, 1);
  if (e.key === "ArrowLeft") setCard(idx.value - 1, -1);
}
onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

async function fullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else {
      await present.value?.requestFullscreen();
      intro.value?.play();
    }
  } catch {
    fsError.value = true;
  }
  try {
    await (navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<unknown> } }).wakeLock?.request("screen");
  } catch {
    /* écran de veille non bloqué : pas grave */
  }
}
</script>

<template>
  <div ref="present" class="present">
    <template v-if="current">
      <div v-if="cards.length > 1" class="pick">
        <button
          v-for="(c, i) in cards"
          :key="c.id"
          type="button"
          class="q-pill"
          :class="{ on: c.id === current.id }"
          @click="setCard(i, i > idx ? 1 : -1)"
        >
          {{ c.label }}
        </button>
      </div>

      <div class="holder" :class="anim">
        <QrIntro ref="intro" :card="current">
          <QrTilt @swipe="(d) => setCard(idx + d, d)">
            <QrCard :card="current" />
          </QrTilt>
        </QrIntro>
      </div>

      <div v-if="cards.length > 1" class="dots" aria-hidden="true">
        <i v-for="c in cards" :key="c.id" :class="{ on: c.id === current.id }" />
      </div>
      <p class="q-note hint">
        {{ cards.length > 1 ? "Glisse pour changer de carte · " : "" }}touche la carte pour activer le mouvement
      </p>
      <button type="button" class="q-pill" @click="fullscreen">{{ fsError ? "Plein écran indisponible" : "Plein écran" }}</button>
    </template>

    <div v-else-if="loaded" class="empty">
      <h1 class="q-h1">Crée ta première carte</h1>
      <p>Un nom, un QR code, et c'est prêt à montrer. Tout le reste est optionnel.</p>
      <NuxtLink to="/dashboard/cards/new" class="q-pill solid big">+ Créer ma carte</NuxtLink>
    </div>
    <p v-else class="q-note">Chargement de tes cartes…</p>
  </div>
</template>

<style scoped>
.present { display: grid; justify-items: center; gap: 18px; padding-block: 8px 24px; background: var(--ink); }
.present:fullscreen { align-content: center; padding: 24px; }
.pick { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.holder { width: min(380px, 100%); padding-block: 12px; }
.present:fullscreen .holder { width: min(420px, 100%, calc((100vh - 200px) * 55 / 85)); }
.holder.out-l { animation: outL 0.22s ease-in forwards; }
.holder.out-r { animation: outR 0.22s ease-in forwards; }
.holder.in { animation: inC 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes outL { to { translate: -40% 0; opacity: 0; } }
@keyframes outR { to { translate: 40% 0; opacity: 0; } }
@keyframes inC { from { opacity: 0; scale: 0.94; } }
.dots { display: flex; gap: 8px; }
.dots i { width: 8px; height: 8px; border-radius: 99px; background: var(--line); transition: width 0.25s ease, background 0.25s ease; }
.dots i.on { width: 24px; background: var(--paper); }
.hint { margin: 0; text-align: center; max-width: 36ch; }
.empty { display: grid; gap: 18px; justify-items: start; max-width: 520px; justify-self: start; padding-top: 24px; }
.empty p { margin: 0; color: var(--mute); }
</style>

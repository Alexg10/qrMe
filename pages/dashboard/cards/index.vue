<script setup lang="ts">
import { Plus } from "lucide-vue-next";

definePageMeta({ layout: "dashboard" });
useHead({ title: "Mes cartes · qrMe" });

const { cards, loaded } = useMyCards();
const { totals, load: loadStats } = useCardStats();

function show(i: number) {
  try {
    const active = cards.value.filter((c) => c.is_active);
    localStorage.setItem("qrme-card", String(Math.max(0, active.findIndex((c) => c.id === cards.value[i].id))));
  } catch {
    /* rien */
  }
  navigateTo("/dashboard");
}

onMounted(() => loadStats().catch(() => {}));
</script>

<template>
  <div>
    <div class="q-head">
      <h1 class="q-h1">Mes cartes<sup class="sup">{{ String(cards.length).padStart(2, "0") }}</sup></h1>
      <p>Une carte par contexte, chacune avec son QR et sa page. Clique sur une carte pour la modifier.</p>
    </div>

    <NuxtLink v-if="cards.length" to="/dashboard/cards/new" class="q-pill solid new-btn top"><Plus aria-hidden="true" />Nouvelle carte</NuxtLink>

    <div class="mine">
      <figure v-for="(c, i) in cards" :key="c.id" :class="{ off: !c.is_active }">
        <NuxtLink :to="`/dashboard/cards/${c.id}`" class="tap" :aria-label="`Modifier la carte ${c.label}`">
          <QrCard :card="c" />
        </NuxtLink>
        <figcaption>
          <b>{{ c.label }}</b>
          <span>
            {{ totals[c.id]?.scans ?? 0 }} scans ·
            <button v-if="c.is_active" type="button" class="lnk" @click="show(i)">SHOWme</button>
            <span v-else>désactivée</span>
          </span>
        </figcaption>
      </figure>
      <NuxtLink to="/dashboard/cards/new" class="new">
        <strong>+</strong>
        <span class="q-note">Nouvelle carte</span>
      </NuxtLink>
    </div>

    <NuxtLink v-if="cards.length" to="/dashboard/cards/new" class="q-pill solid new-btn bottom"><Plus aria-hidden="true" />Nouvelle carte</NuxtLink>
    <p v-if="!loaded && !cards.length" class="q-note">Chargement…</p>
  </div>
</template>

<style scoped>
.sup { font-size: 0.26em; font-weight: 500; vertical-align: top; margin-left: 0.2em; letter-spacing: 0; font-family: var(--f-body); }
.mine { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); gap: 24px; }
figure { margin: 0; display: grid; gap: 10px; align-content: start; }
figure.off .tap { opacity: 0.4; }
figcaption { display: flex; justify-content: space-between; gap: 8px; font-family: var(--f-body); font-size: 12px; color: var(--mute); }
figcaption b { color: var(--paper); font-weight: 500; }
.lnk { color: var(--paper); text-decoration: underline; background: none; border: 0; padding: 0; cursor: pointer; font: inherit; }
.tap { display: block; transition: transform 0.25s ease; }
.tap:hover { transform: translateY(-6px) rotate(-1deg); }
.new { aspect-ratio: 55 / 85; border: 1.5px dashed var(--line); display: grid; place-content: center; gap: 8px; text-align: center; color: var(--mute); }
.new strong { font-family: var(--f-display); font-weight: var(--w-display); font-size: 64px; line-height: 0.8; color: var(--paper); }
.new:hover { border-color: var(--paper); }
.new-btn { display: none; }

/* mobile : carrousel horizontal, chaque carte fait 3/4 de la largeur */
@media (max-width: 860px) {
  .mine {
    display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; overscroll-behavior-x: contain;
    margin-inline: -16px; padding: 8px 16px 4px; scroll-padding-inline: 16px; scrollbar-width: none;
  }
  .mine::-webkit-scrollbar { display: none; }
  .mine > * { flex: 0 0 75vw; scroll-snap-align: center; }
  /* la tuile « + » ne reste que si aucune carte (les boutons prennent le relais) */
  .mine > figure ~ .new { display: none; }
  .tap:hover { transform: none; }
  .new-btn { display: inline-flex; width: fit-content; }
  .new-btn.top { margin-bottom: 20px; }
  .new-btn.bottom { margin-top: 20px; }
}
</style>

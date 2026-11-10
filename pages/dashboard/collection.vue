<script setup lang="ts">
import { Star, Search, Download, NotebookPen } from "lucide-vue-next";

definePageMeta({ layout: "dashboard" });
useHead({ title: "Collection · qrMe" });

const { entries, loaded, load, update } = useCollection();
const route = useRoute();
const router = useRouter();

const mode = ref<"grid" | "list">("grid");
const filter = ref<string | null>(null); // null = tout, "__fav" = favoris, sinon un tag
const q = ref("");
const sortBy = ref<"recent" | "old" | "nom" | "ville">("recent");
const exportOpen = ref(false);

onMounted(() => {
  try {
    if (localStorage.getItem("qrme-coll-mode") === "list") mode.value = "list";
  } catch {
    /* rien */
  }
  load().catch(() => {});
});
watch(mode, (m) => {
  try {
    localStorage.setItem("qrme-coll-mode", m);
  } catch {
    /* rien */
  }
});

const norm = (s: unknown) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Numéro dans la collection : #001 pour la première carte récupérée. */
const numbers = computed(() => {
  const m = new Map<string, number>();
  [...entries.value].sort((a, b) => a.created_at.localeCompare(b.created_at)).forEach((e, i) => m.set(e.id, i + 1));
  return m;
});
const allTags = computed(() => [...new Set(entries.value.flatMap((e) => e.card.tags || []))].slice(0, 8));
const nFav = computed(() => entries.value.filter((e) => e.is_favorite).length);
const weekCount = computed(() => entries.value.filter((e) => Date.now() - new Date(e.created_at).getTime() < 7 * 864e5).length);

const visible = computed(() => {
  const nq = norm(q.value.trim());
  const list = entries.value.filter((e) => {
    if (filter.value === "__fav" && !e.is_favorite) return false;
    if (filter.value && filter.value !== "__fav" && !e.card.tags?.includes(filter.value)) return false;
    if (!nq) return true;
    const c = e.card;
    return norm([c.first_name, c.last_name, c.job, c.city, c.description, ...(c.tags || []), e.note].join(" ")).includes(nq);
  });
  const by: Record<typeof sortBy.value, (a: CollectionEntry, b: CollectionEntry) => number> = {
    recent: (a, b) => b.created_at.localeCompare(a.created_at),
    old: (a, b) => a.created_at.localeCompare(b.created_at),
    nom: (a, b) => (a.card.last_name || a.card.first_name || "").localeCompare(b.card.last_name || b.card.first_name || "", "fr"),
    ville: (a, b) => (a.card.city || "").localeCompare(b.card.city || "", "fr"),
  };
  return list.sort(by[sortBy.value]);
});

const emptyMsg = computed(() => {
  if (!entries.value.length) return "";
  if (q.value.trim()) return `Aucune carte ne correspond à « ${q.value.trim()} ».`;
  if (filter.value === "__fav") return "Aucune carte en favori. Touche l'étoile d'une carte pour l'ajouter ici.";
  return "Aucune carte avec ce tag.";
});

/* Fiche détail : ?carte=<id d'entrée> pour pouvoir y revenir. */
const openId = computed(() => (route.query.carte as string) || null);
const openEntry = computed(() => entries.value.find((e) => e.id === openId.value) || null);
const pos = computed(() => visible.value.findIndex((e) => e.id === openId.value));
const open = (id: string | null) => router.replace({ query: { ...route.query, carte: id || undefined } });
function step(d: number) {
  const n = visible.value.length;
  if (!n) return;
  open(visible.value[(pos.value + d + n) % n].id);
}

const toggleFav = (e: CollectionEntry) => update(e.id, { is_favorite: !e.is_favorite }).catch(() => {});

function exportAs(fmt: "csv" | "vcf") {
  const rows = visible.value;
  if (fmt === "csv") downloadFile("qrme-collection.csv", "﻿" + toCsv(rows), "text/csv;charset=utf-8");
  else downloadFile("qrme-collection.vcf", rows.map((e) => toVcard(e.card, e.note)).join("\r\n"), "text/vcard");
  exportOpen.value = false;
}
</script>

<template>
  <div>
    <div class="q-head">
      <h1 class="q-h1">Collection</h1>
      <p>Les cartes que tu as scannées, numérotées dans l'ordre où tu les as récupérées. Clique sur une carte pour l'ouvrir.</p>
    </div>

    <div class="bar">
      <div class="count-wrap">
        <span class="count">{{ entries.length }}</span>
        <span class="q-note">carte{{ entries.length > 1 ? "s" : "" }} collectée{{ entries.length > 1 ? "s" : "" }}<br >{{ weekCount }} cette semaine</span>
      </div>
      <div class="toggle" role="group" aria-label="Affichage">
        <button type="button" class="q-pill" :class="{ on: mode === 'grid' }" @click="mode = 'grid'">Cartes</button>
        <button type="button" class="q-pill" :class="{ on: mode === 'list' }" @click="mode = 'list'">Liste</button>
        <div class="exp">
          <button type="button" class="q-pill" :aria-expanded="exportOpen" :disabled="!visible.length" @click="exportOpen = !exportOpen">
            <Download aria-hidden="true" />Exporter
          </button>
          <div v-if="exportOpen" class="exp-menu">
            <span class="q-note">{{ visible.length }} carte{{ visible.length > 1 ? "s" : "" }}{{ q || filter ? " · selon la recherche et les filtres" : "" }}</span>
            <button type="button" class="q-pill" @click="exportAs('csv')">CSV · tableur</button>
            <button type="button" class="q-pill" @click="exportAs('vcf')">Contacts · .vcf</button>
          </div>
        </div>
      </div>
    </div>

    <div class="tools">
      <label class="search" for="q">
        <Search aria-hidden="true" :size="18" />
        <input id="q" v-model="q" type="search" placeholder="Rechercher un nom, une ville, un tag, une note…" autocomplete="off" >
      </label>
      <select id="sort" v-model="sortBy" class="sort" aria-label="Trier la collection">
        <option value="recent">Plus récentes</option>
        <option value="old">Plus anciennes</option>
        <option value="nom">Nom A → Z</option>
        <option value="ville">Ville A → Z</option>
      </select>
    </div>

    <div class="filters">
      <button type="button" class="q-pill" :class="{ on: !filter }" @click="filter = null">Tout</button>
      <button type="button" class="q-pill" :class="{ on: filter === '__fav' }" @click="filter = '__fav'">
        <Star aria-hidden="true" fill="currentColor" />Favoris ({{ nFav }})
      </button>
      <button v-for="t in allTags" :key="t" type="button" class="q-pill" :class="{ on: filter === t }" @click="filter = t">{{ t }}</button>
    </div>

    <!-- vide -->
    <div v-if="loaded && !entries.length" class="empty">
      <p>Ta collection est vide. Scanne la carte de quelqu'un pour commencer.</p>
      <NuxtLink to="/dashboard/scanner" class="q-pill solid big">Ouvrir le scanner</NuxtLink>
    </div>
    <p v-else-if="!visible.length && emptyMsg" class="q-note pad">{{ emptyMsg }}</p>

    <!-- grille -->
    <div v-else-if="mode === 'grid'" class="binder">
      <div v-for="e in visible" :key="e.id" class="slot">
        <NuxtLink :to="{ query: { ...route.query, carte: e.id } }" replace class="tap" :aria-label="`Ouvrir la carte de ${fullName(e.card)}`">
          <QrCard :card="e.card" />
        </NuxtLink>
        <button type="button" class="fav" :aria-pressed="e.is_favorite" :aria-label="e.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'" @click="toggleFav(e)">
          <Star :size="18" :fill="e.is_favorite ? 'currentColor' : 'none'" aria-hidden="true" />
        </button>
        <div class="cap">
          <span class="no">#{{ String(numbers.get(e.id)).padStart(3, "0") }}</span>
          <span class="nm">{{ fullName(e.card) || e.card.label }}</span>
          <span v-if="e.note" class="has-note" :title="e.note" aria-label="A une note"><NotebookPen :size="14" /></span>
        </div>
      </div>
    </div>

    <!-- liste -->
    <div v-else class="list">
      <div v-for="e in visible" :key="e.id" class="row">
        <NuxtLink :to="{ query: { ...route.query, carte: e.id } }" replace class="row-btn">
          <span class="row-in">
            <span class="mini"><QrCard :card="e.card" /></span>
            <span class="who">
              <span class="nm">{{ fullName(e.card) || e.card.label }}</span>
              <span class="sub">{{ [e.card.job, e.card.city].filter(Boolean).join(" · ") }}</span>
              <span v-if="e.note" class="memo">“{{ e.note }}”</span>
            </span>
            <span class="t"><span v-for="t in e.card.tags" :key="t">{{ t }}</span></span>
            <time>{{ formatDate(e.created_at) }}</time>
          </span>
        </NuxtLink>
        <button type="button" class="fav" :aria-pressed="e.is_favorite" :aria-label="e.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'" @click="toggleFav(e)">
          <Star :size="20" :fill="e.is_favorite ? 'currentColor' : 'none'" aria-hidden="true" />
        </button>
      </div>
    </div>

    <QrDetail
      :entry="openEntry"
      :position="pos >= 0 ? `${pos + 1} / ${visible.length}` : undefined"
      @close="open(null)"
      @prev="step(-1)"
      @next="step(1)"
    />
  </div>
</template>

<style scoped>
.bar { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
.count-wrap { display: flex; align-items: flex-end; gap: 12px; }
.count { font-family: var(--f-display); font-weight: 900; font-stretch: 66%; font-size: 72px; line-height: 0.8; }
.toggle { display: flex; gap: 6px; flex-wrap: wrap; }
.exp { position: relative; }
.exp-menu { position: absolute; right: 0; top: calc(100% + 8px); z-index: 10; display: grid; gap: 8px; padding: 14px; background: var(--ink-2); border: 1px solid var(--line); min-width: 220px; }
.tools { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 14px; }
.search { flex: 1 1 260px; min-width: 0; display: flex; align-items: center; gap: 10px; border-bottom: 1.5px solid var(--line); padding: 6px 0; color: var(--mute); }
.search:focus-within { border-color: var(--paper); }
.search input { flex: 1; min-width: 0; background: transparent; border: 0; outline: none; font-size: 16px; color: var(--paper); }
.search input::placeholder { color: var(--faint); }
.sort { background: var(--ink-2); border: 1.5px solid var(--line); color: var(--paper); padding: 7px 10px; font-family: var(--f-mono); font-size: 12px; }
.filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
.empty { display: grid; gap: 16px; justify-items: start; padding-top: 12px; }
.empty p { margin: 0; color: var(--mute); }
.pad { padding: 20px 8px; }

.binder { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 160px), 1fr)); gap: 28px 20px; padding-top: 6px; }
.slot { position: relative; display: grid; gap: 8px; min-width: 0; align-content: start; }
.tap { display: block; transition: transform 0.25s ease; }
.tap:hover { transform: translateY(-6px) rotate(-1deg); }
.tap > :deep(*) { box-shadow: 0 16px 30px -14px rgb(0 0 0 / 0.8); }
.fav { flex: none; width: 40px; height: 40px; display: grid; place-content: center; border: 0; background: transparent; cursor: pointer; color: var(--mute); border-radius: 99px; }
.fav:hover { color: var(--paper); }
.fav[aria-pressed="true"] { color: var(--c-jaune); }
.slot .fav { position: absolute; top: 8px; right: 8px; width: 34px; height: 34px; background: rgb(13 13 11 / 0.72); color: var(--paper); z-index: 1; }
.slot .fav[aria-pressed="true"] { color: var(--c-jaune); }
.cap { display: flex; gap: 8px; align-items: baseline; min-width: 0; }
.no { flex: none; font-family: var(--f-mono); font-size: 11px; color: var(--mute); font-variant-numeric: tabular-nums; }
.cap .nm { min-width: 0; font-family: var(--f-display); font-weight: 800; font-stretch: 72%; font-size: 18px; line-height: 1; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.has-note { flex: none; color: var(--mute); align-self: center; }

.list { border-top: 1.5px solid var(--paper); }
.row { display: flex; align-items: center; gap: 4px; border-bottom: 1px solid var(--line); }
.row:hover { background: var(--ink-2); }
.row-btn { display: block; flex: 1; min-width: 0; padding: 12px 8px; }
.row-in { display: grid; grid-template-columns: 40px minmax(0, 1.4fr) minmax(0, 1fr) auto; gap: 16px; align-items: center; }
.mini { display: block; width: 40px; overflow: hidden; }
.who { min-width: 0; }
.who .nm { display: block; font-family: var(--f-display); font-weight: 800; font-stretch: 72%; font-size: 26px; line-height: 0.95; text-transform: uppercase; }
.sub { color: var(--mute); font-size: 13px; }
.memo { display: block; margin-top: 3px; opacity: 0.75; font-size: 13px; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.t { display: flex; gap: 6px; flex-wrap: wrap; }
.t span { font-family: var(--f-mono); font-size: 11px; border: 1px solid var(--line); border-radius: 99px; padding: 2px 8px; }
time { font-family: var(--f-mono); font-size: 12px; color: var(--mute); font-variant-numeric: tabular-nums; white-space: nowrap; }
@media (max-width: 520px) {
  .row-in { grid-template-columns: 40px minmax(0, 1fr) auto; }
  .t { display: none; }
}
</style>

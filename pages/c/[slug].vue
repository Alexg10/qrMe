<script setup lang="ts">
/* Page publique ouverte par le QR code : lisible sans compte. */
const route = useRoute();
const slug = String(route.params.slug).toLowerCase();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { add, update, findByCard, load: loadCollection, fetchBySlug } = useCollection();
const { load: loadCards } = useMyCards();

const { data: card } = await useAsyncData(`card-${slug}`, () => fetchBySlug(slug));
const name = computed(() => (card.value ? fullName(card.value) || card.value.label : ""));
useHead({ title: () => (card.value ? `${name.value} · qrMe` : "Carte introuvable · qrMe") });
useSeoMeta({
  description: () => (card.value ? [card.value.job, card.value.city].filter(Boolean).join(" · ") || "Carte de visite qrMe" : undefined),
  robots: "noindex",
});

const isMine = computed(() => !!card.value && card.value.user_id === user.value?.id);
const entry = ref<CollectionEntry | null>(null);
const busy = ref(false);
const note = ref("");
const noteSaved = ref(false);
const errorMsg = ref("");

onMounted(async () => {
  if (!card.value) return;
  // Un scan compte une fois par session, et jamais pour son propre propriétaire.
  try {
    const key = `qrme-scan-${slug}`;
    if (!isMine.value && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      await supabase.rpc("record_scan", { p_slug: slug } as never);
    }
  } catch {
    /* stats non critiques */
  }
  if (user.value && !isMine.value) {
    await Promise.all([loadCollection().catch(() => {}), loadCards()]);
    entry.value = findByCard(card.value.id) || null;
    note.value = entry.value?.note || "";
  }
});

async function addIt() {
  if (!card.value) return;
  if (!user.value) {
    await navigateTo({ path: "/login", query: { redirect: route.fullPath } });
    return;
  }
  busy.value = true;
  try {
    entry.value = await add(card.value.id, "public");
  } catch (e) {
    errorMsg.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
}
async function saveNote() {
  if (!entry.value || !note.value.trim()) return;
  await update(entry.value.id, { note: note.value.trim() });
  noteSaved.value = true;
}
function saveContact() {
  if (card.value) downloadFile(`${name.value || slug}.vcf`, toVcard(card.value), "text/vcard");
}

const rows = computed(() => {
  const c = card.value;
  if (!c) return [];
  return [
    { k: "Titre", v: c.job },
    { k: "Ville", v: c.city },
    { k: "Téléphone", v: c.phone, href: c.phone && `tel:${c.phone.replace(/\s/g, "")}` },
    { k: "E-mail", v: c.email, href: c.email && `mailto:${c.email}` },
    { k: "Site", v: c.website, href: c.website && (/^https?:/.test(c.website) ? c.website : `https://${c.website}`) },
    { k: "Adresse", v: c.address },
    ...cardSocials(c).map((s) => ({ k: s.label, v: s.handle, href: s.url })),
    { k: "Tags", v: c.tags?.join(", ") },
  ].filter((r) => r.v);
});
</script>

<template>
  <div class="pub">
    <div v-if="card" class="wrap">
      <div class="card"><QrCard :card="card" /></div>

      <div class="info">
        <p v-if="card.description" class="desc">{{ card.description }}</p>
        <dl>
          <template v-for="r in rows" :key="r.k">
            <dt>{{ r.k }}</dt>
            <dd><a v-if="r.href" :href="r.href" target="_blank" rel="noopener">{{ r.v }}</a><span v-else>{{ r.v }}</span></dd>
          </template>
        </dl>

        <div class="cta">
          <p v-if="isMine" class="mine">C'est ta carte. Voilà ce que voient les personnes qui la scannent.</p>
          <template v-else>
            <button v-if="!entry" type="button" class="btn main" :disabled="busy" @click="addIt">
              {{ busy ? "Ajout…" : "+ Ajouter à ma collection" }}
            </button>
            <button v-else type="button" class="btn done" disabled>Dans ta collection</button>
            <p v-if="!user" class="hint">Tu seras invité à te connecter ou à créer un compte, puis tu reviendras ici.</p>

            <template v-if="entry">
              <div class="noteform">
                <label for="pnote">Ajouter une note · optionnel</label>
                <textarea id="pnote" v-model="note" placeholder="Où vous êtes-vous rencontrés ? De quoi avez-vous parlé ?" />
                <button type="button" class="btn main" :disabled="!note.trim()" @click="saveNote">{{ noteSaved ? "Note enregistrée" : "Enregistrer la note" }}</button>
              </div>
              <QrReturnCard :their-card="card" light />
            </template>
          </template>
          <p v-if="errorMsg" class="err">{{ errorMsg }}</p>
          <button type="button" class="btn alt" @click="saveContact">Enregistrer le contact</button>
        </div>

        <NuxtLink to="/" class="brand"><i /><i />Fait avec qrMe</NuxtLink>
      </div>
    </div>

    <div v-else class="missing">
      <h1>Carte introuvable</h1>
      <p>Ce QR code ne mène plus à une carte : elle a été supprimée ou désactivée par son propriétaire.</p>
      <NuxtLink to="/" class="btn main">Découvrir qrMe</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.pub { min-height: 100vh; background: var(--paper); color: var(--ink); padding: max(16px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) 40px max(16px, env(safe-area-inset-left, 0px)); }
.wrap { max-width: 860px; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 360px) minmax(0, 1fr); gap: 36px; align-items: start; padding-top: 24px; }
.card > :deep(*) { box-shadow: 0 30px 60px -24px rgb(0 0 0 / 0.45); }
.info { display: grid; gap: 18px; min-width: 0; }
.desc { margin: 0; font-size: 17px; max-width: 42ch; }
dl { margin: 0; display: grid; grid-template-columns: auto minmax(0, 1fr); border-top: 1.5px solid var(--ink); }
dt, dd { margin: 0; padding: 10px 0; border-bottom: 1px solid rgb(13 13 11 / 0.15); }
dt { font-family: var(--f-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #77746a; padding-right: 18px; padding-top: 13px; }
dd { overflow-wrap: anywhere; user-select: text; }
dd a { text-decoration: underline; text-underline-offset: 3px; }
.cta { display: grid; gap: 10px; }
.btn { display: block; text-align: center; border-radius: 999px; padding: 13px; font-family: var(--f-display); font-weight: 800; font-stretch: 80%; text-transform: uppercase; font-size: 15px; letter-spacing: 0.02em; cursor: pointer; border: 1.5px solid var(--ink); background: transparent; color: var(--ink); }
.btn.main { background: var(--ink); color: var(--paper); }
.btn.main:disabled { opacity: 0.5; cursor: default; }
.btn.done { background: var(--c-vert); border-color: var(--c-vert); color: var(--ink); cursor: default; }
.hint, .mine { margin: 0; font-size: 13px; color: #5d5b54; }
.err { margin: 0; font-family: var(--f-mono); font-size: 12px; color: #b3261e; }
.noteform { display: grid; gap: 8px; padding-top: 4px; }
.noteform label { font-family: var(--f-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #77746a; }
.noteform textarea { border: 1.5px solid var(--ink); background: transparent; color: var(--ink); padding: 10px; font-size: 15px; min-height: 66px; resize: vertical; width: 100%; }
.noteform textarea:focus { outline: none; box-shadow: 0 0 0 2px var(--c-jaune); }
.brand { display: inline-flex; align-items: center; gap: 6px; font-family: var(--f-mono); font-size: 11px; color: #77746a; margin-top: 8px; }
.brand i { width: 10px; height: 10px; background: var(--ink); display: block; }
.brand i + i { background: transparent; border: 2.5px solid var(--ink); margin-right: 4px; }
.missing { max-width: 520px; margin: 0 auto; padding-top: 80px; display: grid; gap: 16px; }
.missing h1 { margin: 0; font-family: var(--f-display); font-weight: 900; font-stretch: 66%; text-transform: uppercase; font-size: 64px; line-height: 0.85; }
.missing p { margin: 0; }
.missing .btn { justify-self: start; padding-inline: 22px; }
@media (max-width: 720px) {
  .wrap { grid-template-columns: minmax(0, 1fr); padding-top: 0; }
  .card { max-width: 340px; width: 100%; margin: 0 auto; }
}
</style>

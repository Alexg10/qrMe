<script setup lang="ts">
/* Fiche détail d'une carte collectée, dans une modale. */
import { Star, X } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast/use-toast";

const props = defineProps<{ entry: CollectionEntry | null; position?: string }>();
const emit = defineEmits<{ close: []; prev: []; next: [] }>();

const { update, remove } = useCollection();
const { toast } = useToast();
const dlg = ref<HTMLDialogElement>();
const note = ref("");
const savedMsg = ref("");
const confirmRemove = ref(false);

watch(
  () => props.entry?.id,
  async (id) => {
    note.value = props.entry?.note || "";
    savedMsg.value = "";
    confirmRemove.value = false;
    await nextTick();
    if (id && !dlg.value?.open) dlg.value?.showModal();
    if (!id && dlg.value?.open) dlg.value.close();
  },
  { immediate: true },
);
onMounted(() => {
  if (props.entry && !dlg.value?.open) dlg.value?.showModal();
});

const c = computed(() => props.entry?.card);
const rows = computed(() => {
  const x = c.value;
  if (!x || !props.entry) return [];
  return [
    { k: "Téléphone", v: x.phone, copy: true },
    { k: "E-mail", v: x.email, copy: true },
    { k: "Site", v: x.website, copy: true },
    { k: "Adresse", v: x.address, copy: true },
    { k: "Ville", v: x.city },
    { k: "Tags", v: x.tags?.join(", ") },
    { k: props.entry.source === "return" ? "Reçue le" : "Ajoutée le", v: formatDate(props.entry.created_at) + (props.entry.source === "return" ? " · en retour" : "") },
  ].filter((r) => r.v);
});

async function saveNote() {
  if (!props.entry) return;
  try {
    await update(props.entry.id, { note: note.value.trim() || null });
    savedMsg.value = note.value.trim() ? "Note enregistrée" : "Note supprimée";
  } catch (e) {
    savedMsg.value = (e as Error).message;
  }
}
async function toggleFav() {
  if (props.entry) await update(props.entry.id, { is_favorite: !props.entry.is_favorite }).catch(() => {});
}
async function copy(v: string) {
  try {
    await navigator.clipboard.writeText(v);
    toast({ title: "Copié", description: v });
  } catch {
    /* le texte reste sélectionnable */
  }
}
function saveContact() {
  if (!c.value) return;
  downloadFile(`${fullName(c.value) || c.value.slug}.vcf`, toVcard(c.value, props.entry?.note), "text/vcard");
}
async function removeEntry() {
  if (!props.entry) return;
  if (!confirmRemove.value) {
    confirmRemove.value = true;
    return;
  }
  await remove(props.entry.id);
  toast({ title: "Carte retirée de ta collection" });
  emit("close");
}
function onKey(e: KeyboardEvent) {
  if ((e.target as HTMLElement).matches("textarea, input")) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      saveNote();
    }
    return;
  }
  if (e.key === "ArrowRight") emit("next");
  if (e.key === "ArrowLeft") emit("prev");
}
</script>

<template>
  <dialog
    ref="dlg"
    class="detail"
    aria-label="Carte collectée"
    @close="emit('close')"
    @click.self="dlg?.close()"
    @keydown="onKey"
  >
    <template v-if="entry && c">
      <button type="button" class="close" aria-label="Fermer" @click="dlg?.close()"><X :size="20" /></button>
      <div class="in">
        <div class="card-col">
          <QrCard :card="c" />
          <div v-if="position" class="navs">
            <button type="button" class="q-pill" @click="emit('prev')">← Préc.</button>
            <span class="q-note">{{ position }}</span>
            <button type="button" class="q-pill" @click="emit('next')">Suiv. →</button>
          </div>
        </div>
        <div class="info">
          <span class="q-note">{{ cardUrl(c.slug) }}</span>
          <h2>{{ c.first_name }}<br >{{ c.last_name }}</h2>
          <div v-if="c.job" class="job">{{ c.job }}</div>
          <p v-if="c.description" class="desc">{{ c.description }}</p>
          <dl>
            <template v-for="r in rows" :key="r.k">
              <dt>{{ r.k }}</dt>
              <dd>
                <span>{{ r.v }}</span>
                <button v-if="r.copy" type="button" class="copy" @click="copy(r.v!)">Copier</button>
              </dd>
            </template>
          </dl>
          <div class="note-box">
            <label for="dnote" class="q-lbl">Ma note <span class="opt">· visible par toi seul</span></label>
            <textarea
              id="dnote"
              v-model="note"
              class="q-textarea"
              rows="3"
              placeholder="Où vous êtes-vous rencontrés ? De quoi avez-vous parlé ?"
            />
            <div class="row">
              <button type="button" class="q-pill" @click="saveNote">{{ entry.note ? "Mettre à jour la note" : "Enregistrer la note" }}</button>
              <span class="q-note">{{ savedMsg }}</span>
            </div>
          </div>
          <div class="acts">
            <button type="button" class="q-pill" :class="{ fav: entry.is_favorite }" :aria-pressed="entry.is_favorite" @click="toggleFav">
              <Star aria-hidden="true" :fill="entry.is_favorite ? 'currentColor' : 'none'" />{{ entry.is_favorite ? "En favori" : "Ajouter aux favoris" }}
            </button>
            <button type="button" class="q-pill solid" @click="saveContact">Enregistrer le contact</button>
            <button type="button" class="q-pill" @click="removeEntry">{{ confirmRemove ? "Confirmer le retrait" : "Retirer de la collection" }}</button>
          </div>
        </div>
      </div>
    </template>
  </dialog>
</template>

<style scoped>
.detail {
  border: 0; padding: 0; background: var(--ink); color: var(--paper); width: min(920px, calc(100% - 32px)); max-height: calc(100% - 32px); overflow: auto;
  box-shadow: 0 0 0 1px var(--line), 0 40px 120px rgb(0 0 0 / 0.8);
}
.detail::backdrop { background: rgb(5 5 4 / 0.82); }
.in { display: grid; grid-template-columns: minmax(0, 340px) minmax(0, 1fr); gap: 36px; padding: 28px; }
.card-col > :first-child { box-shadow: 0 30px 60px -20px rgb(0 0 0 / 0.9); }
.navs { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 14px; }
.info { min-width: 0; }
h2 { margin: 0; font-family: var(--f-display); font-weight: 900; font-stretch: 64%; text-transform: uppercase; font-size: clamp(44px, 7vw, 76px); line-height: 0.84; letter-spacing: -0.02em; overflow-wrap: anywhere; }
.job { font-family: var(--f-display); font-weight: 700; font-stretch: 85%; text-transform: uppercase; margin-top: 10px; }
.desc { margin: 16px 0 0; max-width: 42ch; }
dl { margin: 22px 0 0; display: grid; grid-template-columns: auto minmax(0, 1fr); border-top: 1.5px solid var(--paper); }
dt, dd { margin: 0; padding: 10px 0; border-bottom: 1px solid var(--line); }
dt { font-family: var(--f-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--mute); padding-right: 20px; padding-top: 13px; }
dd { overflow-wrap: anywhere; display: flex; justify-content: space-between; gap: 10px; align-items: center; }
.copy { flex: none; border: 1px solid var(--line); background: transparent; border-radius: 99px; font-family: var(--f-mono); font-size: 11px; padding: 2px 9px; cursor: pointer; color: var(--mute); }
.copy:hover { color: var(--paper); border-color: var(--paper); }
.note-box { margin-top: 22px; display: grid; gap: 8px; }
.opt { text-transform: none; letter-spacing: 0; color: var(--faint); }
.row { display: flex; gap: 10px; align-items: center; }
.acts { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 22px; }
.fav { background: var(--c-jaune); border-color: var(--c-jaune); color: var(--ink); }
.close { position: absolute; top: 14px; right: 14px; width: 40px; height: 40px; display: grid; place-content: center; border-radius: 99px; border: 1.5px solid var(--paper); background: var(--ink); color: var(--paper); cursor: pointer; z-index: 1; }
.close:hover { background: var(--paper); color: var(--ink); }
@media (max-width: 860px) {
  .in { grid-template-columns: minmax(0, 1fr); padding: 20px; }
  .card-col { max-width: 300px; width: 100%; margin: 0 auto; }
}
</style>

<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast";

const props = defineProps<{ card?: Card }>();

const { save, remove, setActive } = useMyCards();
const { toast } = useToast();

const draft = reactive<CardDraft>(emptyDraft());
const tagsInput = ref("");
const saving = ref(false);
const errorMsg = ref("");
const confirmDelete = ref(false);
const isActive = ref(true);

function fill(c?: Card) {
  const base = emptyDraft();
  const d = draft as Record<string, unknown>;
  const src = (c ?? {}) as Record<string, unknown>;
  const def = base as Record<string, unknown>;
  for (const k of EDITABLE_FIELDS) d[k] = src[k] ?? def[k];
  tagsInput.value = (draft.tags || []).join(", ");
  isActive.value = c ? c.is_active : true;
}
fill(props.card);
watch(() => props.card?.id, () => fill(props.card));
watch(tagsInput, (v) => (draft.tags = parseTags(v)));

const tagCount = computed(() => parseTags(tagsInput.value).length);
const preview = computed(() => ({ ...draft, slug: props.card?.slug }));

const FIELDS: { key: keyof CardDraft; label: string; full?: boolean; type?: string; placeholder?: string; auto?: string }[] = [
  { key: "first_name", label: "Prénom", auto: "given-name" },
  { key: "last_name", label: "Nom", auto: "family-name" },
  { key: "job", label: "Titre", full: true, auto: "organization-title" },
  { key: "city", label: "Ville", auto: "address-level2" },
  { key: "phone", label: "Téléphone", type: "tel", auto: "tel" },
  { key: "email", label: "E-mail", type: "email", auto: "email" },
  { key: "website", label: "Site web", placeholder: "monsite.fr", auto: "url" },
  { key: "address", label: "Adresse", full: true, auto: "street-address" },
];

async function submit() {
  errorMsg.value = "";
  if (tagCount.value > MAX_TAGS) {
    errorMsg.value = `5 tags maximum : retire-en ${tagCount.value - MAX_TAGS}.`;
    return;
  }
  saving.value = true;
  try {
    const saved = await save({ ...draft, label: draft.label?.trim() || "Ma carte" }, props.card?.id);
    toast({ title: props.card ? "Carte enregistrée" : "Carte créée" });
    if (!props.card) await navigateTo(`/dashboard/cards/${saved.id}`);
  } catch (e) {
    errorMsg.value = (e as Error).message;
  } finally {
    saving.value = false;
  }
}

async function toggleActive() {
  if (!props.card) return;
  try {
    await setActive(props.card.id, !isActive.value);
    isActive.value = !isActive.value;
    toast({ title: isActive.value ? "Carte réactivée" : "Carte désactivée", description: isActive.value ? "Son QR fonctionne de nouveau." : "Son QR ne mène plus nulle part." });
  } catch (e) {
    errorMsg.value = (e as Error).message;
  }
}

async function destroy() {
  if (!props.card) return;
  if (!confirmDelete.value) {
    confirmDelete.value = true;
    return;
  }
  try {
    await remove(props.card.id);
    toast({ title: "Carte supprimée" });
    await navigateTo("/dashboard/cards");
  } catch (e) {
    errorMsg.value = (e as Error).message;
  }
}

// Mobile : quand le grand aperçu sort de l'écran, une mini-carte fixe prend le relais.
const previewEl = ref<HTMLElement>();
const previewHidden = ref(false);
let io: IntersectionObserver | undefined;
onMounted(() => {
  if (!previewEl.value || !("IntersectionObserver" in window)) return;
  io = new IntersectionObserver(([e]) => (previewHidden.value = !e.isIntersecting && e.boundingClientRect.top < 0));
  io.observe(previewEl.value);
});
onBeforeUnmount(() => io?.disconnect());
function scrollToPreview() {
  previewEl.value?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const link = computed(() => (props.card ? cardUrl(props.card.slug) : ""));
async function copyLink() {
  try {
    await navigator.clipboard.writeText(link.value);
    toast({ title: "Lien copié" });
  } catch {
    /* le lien reste affiché et sélectionnable */
  }
}
</script>

<template>
  <div class="editor">
    <form class="form" autocomplete="on" @submit.prevent="submit">
      <div class="q-field full">
        <label for="f-label">Nom de la carte <span class="opt">· visible par toi seul, ex. Pro, Perso</span></label>
        <input id="f-label" v-model="draft.label" maxlength="30" >
      </div>
      <div v-for="f in FIELDS" :key="f.key" class="q-field" :class="{ full: f.full }">
        <label :for="`f-${f.key}`">{{ f.label }}</label>
        <input
          :id="`f-${f.key}`"
          v-model="(draft as any)[f.key]"
          :type="f.type || 'text'"
          :placeholder="f.placeholder"
          :autocomplete="f.auto"
        >
      </div>
      <div class="socials full">
        <span class="q-lbl">Réseaux <span class="opt">· pas affichés sur la carte, visibles une fois scannée</span></span>
        <div class="soc-grid">
          <div v-for="s in SOCIALS" :key="s.key" class="q-field">
            <label :for="`f-${s.key}`">{{ s.label }}</label>
            <input
              :id="`f-${s.key}`"
              v-model="draft[s.key]"
              :placeholder="s.placeholder"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
            >
          </div>
        </div>
      </div>
      <div class="q-field full">
        <label for="f-desc">Description <span class="opt">· {{ (draft.description || "").length }}/140</span></label>
        <textarea id="f-desc" v-model="draft.description" rows="2" maxlength="140" />
      </div>
      <div class="q-field full">
        <label for="f-tags">
          Tags <span class="opt">· séparés par des virgules ·
            <span :style="{ color: tagCount > MAX_TAGS ? 'var(--c-rouge)' : undefined }">{{ tagCount }}/{{ MAX_TAGS }}</span></span>
        </label>
        <input id="f-tags" v-model="tagsInput" placeholder="design, print, culture" >
      </div>

      <div class="choices">
        <div>
          <span class="q-lbl">Couleur</span>
          <div class="swatches">
            <button
              v-for="col in CARD_COLORS"
              :key="col.value"
              type="button"
              class="sw"
              :style="{ background: `var(--c-${col.value})` }"
              :aria-label="col.label"
              :aria-pressed="draft.color === col.value"
              @click="draft.color = col.value"
            />
          </div>
        </div>
        <div>
          <span class="q-lbl">Mise en page</span>
          <div class="layouts">
            <button
              v-for="l in CARD_LAYOUTS"
              :key="l.value"
              type="button"
              class="q-pill"
              :class="{ on: draft.layout === l.value }"
              @click="draft.layout = l.value"
            >
              {{ l.label }}
            </button>
          </div>
        </div>
      </div>

      <p v-if="errorMsg" class="q-error full" role="alert">{{ errorMsg }}</p>
      <div class="acts full">
        <button type="submit" class="q-pill solid big" :disabled="saving">
          {{ saving ? "Enregistrement…" : card ? "Enregistrer" : "Créer la carte" }}
        </button>
        <template v-if="card">
          <button type="button" class="q-pill" @click="toggleActive">{{ isActive ? "Désactiver" : "Réactiver" }}</button>
          <button type="button" class="q-pill danger" @click="destroy">{{ confirmDelete ? "Confirmer la suppression" : "Supprimer" }}</button>
        </template>
      </div>
    </form>

    <div ref="previewEl" class="preview-col">
      <QrCard :card="preview" />
      <div class="meta">
        <template v-if="card">
          <span class="q-note link">{{ link }}</span>
          <button type="button" class="q-pill" @click="copyLink">Copier le lien</button>
        </template>
        <span v-else class="q-note">Aperçu en direct · le QR définitif est créé à l'enregistrement</span>
      </div>
      <p v-if="card && !isActive" class="q-error">Carte désactivée : son QR ne mène plus nulle part.</p>
    </div>

    <Transition name="mini">
      <button v-if="previewHidden" type="button" class="mini" aria-label="Revenir à l'aperçu de la carte" @click="scrollToPreview">
        <QrCard :card="preview" />
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.editor { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 360px); gap: 40px; align-items: start; }
.form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 16px; }
.full { grid-column: 1 / -1; }
.socials { display: grid; gap: 10px; }
.socials .opt { text-transform: none; letter-spacing: 0; color: var(--faint); }
.soc-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 16px; }
.choices { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; padding-top: 12px; border-top: 1px solid var(--line); margin-top: 6px; }
.swatches, .layouts { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.sw { width: 34px; height: 34px; border: 0; padding: 0; cursor: pointer; position: relative; box-shadow: inset 0 0 0 1px var(--line); }
.sw[aria-pressed="true"]::after { content: ""; position: absolute; inset: -5px; border: 2px solid var(--paper); }
.acts { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.danger:hover { border-color: var(--c-rouge); color: var(--c-rouge); }
.preview-col { position: sticky; top: 24px; display: grid; gap: 12px; }
.preview-col > :first-child { box-shadow: 0 30px 60px -20px rgb(0 0 0 / 0.8); }
.meta { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.link { overflow-wrap: anywhere; user-select: all; }
.mini { display: none; }
@media (max-width: 1000px) {
  .editor { grid-template-columns: minmax(0, 1fr); }
  .mini {
    display: block; position: fixed; z-index: 40; top: calc(12px + env(safe-area-inset-top, 0px)); right: max(12px, env(safe-area-inset-right, 0px));
    width: 108px; padding: 0; border: 0; background: none; cursor: pointer; box-shadow: 0 12px 30px -8px rgb(0 0 0 / 0.85);
  }
  .mini-enter-active, .mini-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
  .mini-enter-from, .mini-leave-to { opacity: 0; transform: translateY(-8px) scale(0.92); }
  .preview-col { position: static; max-width: 340px; width: 100%; margin: 0 auto; order: -1; }
}
@media (max-width: 520px) {
  .form, .choices { grid-template-columns: minmax(0, 1fr); }
}
</style>

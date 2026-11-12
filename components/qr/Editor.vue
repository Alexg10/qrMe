<script setup lang="ts">
import { Eye, EyeOff, Loader2, Lock, Plus, Power, Save, Trash2 } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast/use-toast";

const props = defineProps<{ card?: Card }>();

const { save, remove, setActive } = useMyCards();
const progress = useProgress();
onMounted(() => progress.load(true).then(applyTrial).catch(() => {}));
const lockTitle = (label: string, level: number) =>
  progress.isUnlocked(level) ? label : `${label} · se débloque au Niv. ${level}`;
const colorGroups = computed(() =>
  [...new Set(CARD_COLORS.map((c) => c.group))].map((g) => ({ name: g, colors: CARD_COLORS.filter((c) => c.group === g) })),
);
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
  draft.display = { ...(c?.display || {}) }; // copie : ne pas modifier la carte en cache avant l'enregistrement
  tagsInput.value = (draft.tags || []).join(", ");
  isActive.value = c ? c.is_active : true;
}
fill(props.card);
watch(() => props.card?.id, () => {
  fill(props.card);
  applyTrial();
});

/* « Essayer sur ma carte » depuis la fenêtre de niveau : ?essai=finish:holo pré-sélectionne la nouveauté. */
const route = useRoute();
function applyTrial() {
  const [kind, value] = String(route.query.essai || "").split(":");
  const u = UNLOCKS.find((x) => x.kind === kind && x.value === value);
  if (!u || !progress.isUnlocked(u.level)) return;
  if (u.kind === "color") draft.color = u.value as CardColor;
  if (u.kind === "finish") draft.finish = u.value as CardFinish;
  if (u.kind === "foil") draft.foil = true;
  if (u.kind === "intro") draft.intro = u.value as CardIntro;
}
watch(tagsInput, (v) => (draft.tags = parseTags(v)));

const tagCount = computed(() => parseTags(tagsInput.value).length);
const preview = computed(() => ({ ...draft, slug: props.card?.slug }));

/* Œil à côté de chaque info : visible ou non sur la carte. On ne garde que les écarts au défaut. */
const shown = (k: DisplayKey) => isShown(draft, k);
function toggleShown(k: DisplayKey) {
  const next = !shown(k);
  const d = { ...draft.display, [k]: next };
  if (next === isShown({}, k)) delete d[k];
  draft.display = d;
}

const FIELDS: { key: DisplayKey; label: string; full?: boolean; type?: string; placeholder?: string; auto?: string }[] = [
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

const intro = ref<{ play: () => void }>();
const replay = () => nextTick(() => intro.value?.play());

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
      <div v-for="f in FIELDS" :key="f.key" class="q-field" :class="{ full: f.full, off: !shown(f.key) }">
        <div class="lbl-row">
          <label :for="`f-${f.key}`">{{ f.label }}</label>
          <button
            type="button"
            class="vis"
            :aria-pressed="shown(f.key)"
            :aria-label="`${f.label} : ${shown(f.key) ? 'visible' : 'masqué'} sur la carte`"
            :title="shown(f.key) ? 'Visible sur la carte' : 'Masqué sur la carte'"
            @click="toggleShown(f.key)"
          >
            <component :is="shown(f.key) ? Eye : EyeOff" aria-hidden="true" />
          </button>
        </div>
        <input
          :id="`f-${f.key}`"
          v-model="(draft as any)[f.key]"
          :type="f.type || 'text'"
          :placeholder="f.placeholder"
          :autocomplete="f.auto"
        >
      </div>
      <div class="socials full">
        <span class="q-lbl">Réseaux <span class="opt">· masqués sur la carte sauf si tu les affiches, toujours visibles une fois scannée</span></span>
        <div class="soc-grid">
          <div v-for="s in SOCIALS" :key="s.key" class="q-field" :class="{ off: !shown(s.key) }">
            <div class="lbl-row">
              <label :for="`f-${s.key}`">{{ s.label }}</label>
              <button
                type="button"
                class="vis"
                :aria-pressed="shown(s.key)"
                :aria-label="`${s.label} : ${shown(s.key) ? 'visible' : 'masqué'} sur la carte`"
                :title="shown(s.key) ? 'Visible sur la carte' : 'Masqué sur la carte'"
                @click="toggleShown(s.key)"
              >
                <component :is="shown(s.key) ? Eye : EyeOff" aria-hidden="true" />
              </button>
            </div>
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
        <NuxtLink to="/dashboard/stats" class="lvl">
          <b>Niv. {{ progress.level.value }}</b>
          <span class="bar"><i :style="{ width: `${progress.ratio.value * 100}%` }" /></span>
          <span class="q-note">
            {{ progress.nextAt.value == null ? "Tout est débloqué" : `encore ${progress.nextAt.value - progress.best.value} échange${progress.nextAt.value - progress.best.value > 1 ? "s" : ""} pour le Niv. ${progress.level.value + 1}` }}
          </span>
        </NuxtLink>

        <div>
          <span class="q-lbl">Couleur · {{ colorInfo(draft.color).label }}</span>
          <div v-for="g in colorGroups" :key="g.name" class="sw-group">
            <span class="grp">{{ g.name }}</span>
            <div class="swatches">
              <button
                v-for="col in g.colors"
                :key="col.value"
                type="button"
                class="sw"
                :class="{ metal: col.metal }"
                :style="{ background: `var(--c-${col.value})` }"
                :aria-label="lockTitle(col.label, col.level)"
                :title="lockTitle(col.label, col.level)"
                :aria-pressed="draft.color === col.value"
                :disabled="!progress.isUnlocked(col.level)"
                @click="draft.color = col.value"
              >
                <Lock v-if="!progress.isUnlocked(col.level)" class="lock" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div>
          <span class="q-lbl">Mise en page</span>
          <div class="pills">
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

        <div>
          <span class="q-lbl">Finition</span>
          <div class="pills">
            <button
              v-for="f in CARD_FINISHES"
              :key="f.value"
              type="button"
              class="q-pill"
              :class="{ on: draft.finish === f.value, locked: !progress.isUnlocked(f.level) }"
              :title="lockTitle(f.label, f.level)"
              :disabled="!progress.isUnlocked(f.level)"
              @click="draft.finish = f.value"
            >
              <Lock v-if="!progress.isUnlocked(f.level)" aria-hidden="true" />{{ f.label }}<span v-if="!progress.isUnlocked(f.level)" class="need">Niv. {{ f.level }}</span>
            </button>
          </div>
          <label class="toggle" :class="{ locked: !progress.isUnlocked(FOIL_LEVEL) }">
            <input v-model="draft.foil" type="checkbox" :disabled="!progress.isUnlocked(FOIL_LEVEL) && !draft.foil">
            Foil sur le nom
            <span v-if="!progress.isUnlocked(FOIL_LEVEL)" class="need"><Lock aria-hidden="true" />Niv. {{ FOIL_LEVEL }}</span>
          </label>
        </div>

        <div>
          <span class="q-lbl">Animation SHOWme · quand tu montres ta carte</span>
          <div class="pills">
            <button
              v-for="a in CARD_INTROS"
              :key="a.value"
              type="button"
              class="q-pill"
              :class="{ on: draft.intro === a.value, locked: !progress.isUnlocked(a.level) }"
              :title="lockTitle(a.label, a.level)"
              :disabled="!progress.isUnlocked(a.level)"
              @click="draft.intro = a.value; replay()"
            >
              <Lock v-if="!progress.isUnlocked(a.level)" aria-hidden="true" />{{ a.label }}<span v-if="!progress.isUnlocked(a.level)" class="need">Niv. {{ a.level }}</span>
            </button>
          </div>
        </div>
      </div>

      <p v-if="errorMsg" class="q-error full" role="alert">{{ errorMsg }}</p>
      <div class="acts full">
        <button type="submit" class="q-pill save" :disabled="saving">
          <Loader2 v-if="saving" class="spin" aria-hidden="true" />
          <Save v-else-if="card" aria-hidden="true" />
          <Plus v-else aria-hidden="true" />
          {{ saving ? "Enregistrement…" : card ? "Enregistrer" : "Créer la carte" }}
        </button>
        <div v-if="card" class="sec">
          <button type="button" class="q-pill" @click="toggleActive"><Power aria-hidden="true" />{{ isActive ? "Désactiver" : "Réactiver" }}</button>
          <button type="button" class="q-pill danger" :class="{ armed: confirmDelete }" @click="destroy"><Trash2 aria-hidden="true" />{{ confirmDelete ? "Confirmer" : "Supprimer" }}</button>
        </div>
      </div>
    </form>

    <div ref="previewEl" class="preview-col">
      <QrIntro ref="intro" :card="preview" class="pv"><QrCard :card="preview" /></QrIntro>
      <div class="meta">
        <template v-if="card">
          <span class="q-note link">{{ link }}</span>
          <button type="button" class="q-pill" @click="copyLink">Copier le lien</button>
        </template>
        <button v-if="draft.intro !== 'none'" type="button" class="q-pill" @click="replay">Rejouer l'animation</button>
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
.lbl-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.vis { display: grid; place-items: center; width: 26px; height: 26px; margin: -4px -4px -4px 0; padding: 0; border: 0; background: none; color: var(--paper); cursor: pointer; border-radius: 4px; }
.vis svg { width: 16px; height: 16px; }
.vis[aria-pressed="false"] { color: var(--faint); }
.vis:hover { background: var(--line); }
.vis:focus-visible { outline: 2px solid var(--paper); outline-offset: 1px; }
.off input { color: var(--mute); }
.soc-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 16px; }
.choices { grid-column: 1 / -1; display: grid; gap: 20px; padding-top: 14px; border-top: 1px solid var(--line); margin-top: 6px; }
.lvl { display: grid; grid-template-columns: auto minmax(60px, 160px) minmax(0, 1fr); align-items: center; gap: 12px; justify-self: start; }
.lvl b { font-family: var(--f-display); font-weight: var(--w-display); font-stretch: var(--s-display); font-size: 22px; line-height: 1; }
.lvl .bar { height: 6px; background: var(--line); border-radius: 99px; overflow: hidden; }
.lvl .bar i { display: block; height: 100%; background: var(--c-jaune); border-radius: 99px; }
.lvl:hover .q-note { color: var(--paper); }
.sw-group { display: grid; grid-template-columns: 84px minmax(0, 1fr); align-items: center; gap: 10px; margin-top: 8px; }
.grp { font-size: 12px; color: var(--faint); }
.swatches, .pills { display: flex; gap: 8px; flex-wrap: wrap; }
.pills { margin-top: 8px; }
.sw { width: 34px; height: 34px; border: 0; padding: 0; cursor: pointer; position: relative; box-shadow: inset 0 0 0 1px var(--line); display: grid; place-items: center; }
.sw.metal { background-size: 250% 100% !important; background-position: 30% 50% !important; }
.sw[aria-pressed="true"]::after { content: ""; position: absolute; inset: -5px; border: 2px solid var(--paper); }
.sw:disabled { cursor: not-allowed; filter: grayscale(0.85) brightness(0.45); }
.sw .lock { width: 14px; height: 14px; color: var(--paper); }
.q-pill.locked { border-style: dashed; border-color: var(--faint); color: var(--faint); opacity: 1; cursor: not-allowed; }
.need { font-size: 11px; font-weight: 600; color: var(--faint); display: inline-flex; align-items: center; gap: 3px; }
.need svg { width: 11px; height: 11px; }
.toggle { display: inline-flex; align-items: center; gap: 10px; margin-top: 12px; font-weight: 600; font-size: 14px; cursor: pointer; }
.toggle.locked { color: var(--faint); cursor: not-allowed; }
.toggle input { appearance: none; width: 36px; height: 20px; margin: 0; border-radius: 99px; background: var(--line); position: relative; cursor: inherit; flex: none; transition: background 0.15s ease; }
.toggle input::after { content: ""; position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; border-radius: 50%; background: var(--paper); transition: transform 0.15s ease; }
.toggle input:checked { background: var(--c-jaune); }
.toggle input:checked::after { transform: translateX(16px); background: var(--ink); }
/* Les trois boutons ont la même hauteur ; Enregistrer se distingue par sa couleur, pas par sa taille. */
.acts { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 8px; }
.acts .q-pill { height: 52px; justify-content: center; }
.sec { display: flex; gap: 10px; }
.sec .q-pill { padding: 0 20px; font-size: 15px; gap: 8px; }
.sec .q-pill svg { width: 17px; height: 17px; }
.danger.armed { background: var(--c-rouge); border-color: var(--c-rouge); color: var(--paper); }
.q-pill.save {
  padding: 0 28px; gap: 10px; font-size: 17px; font-weight: 700;
  background: var(--c-jaune); border-color: var(--c-jaune); color: var(--ink);
  box-shadow: 0 10px 24px -10px rgb(0 0 0 / 0.8);
  transition: transform 0.12s ease, filter 0.12s ease;
}
.q-pill.save:hover:not(:disabled) { background: var(--c-jaune); filter: brightness(1.08); transform: translateY(-1px); }
.q-pill.save:active:not(:disabled) { transform: translateY(0); }
.q-pill.save svg { width: 20px; height: 20px; }
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.danger:hover { border-color: var(--c-rouge); color: var(--c-rouge); }
.q-pill.danger.armed:hover:not(:disabled) { background: var(--c-rouge); color: var(--paper); filter: brightness(1.08); }
.preview-col { position: sticky; top: 24px; display: grid; gap: 12px; }
.pv :deep(.qcard:not(.fx-neon)) { box-shadow: 0 30px 60px -20px rgb(0 0 0 / 0.8); }
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
  .form { grid-template-columns: minmax(0, 1fr); }
  .acts { display: grid; grid-template-columns: minmax(0, 1fr); }
  .sec { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sec .q-pill { padding: 0 12px; }
  .sw-group { grid-template-columns: minmax(0, 1fr); gap: 6px; }
  .lvl { grid-template-columns: auto minmax(60px, 1fr); }
  .lvl .q-note { grid-column: 1 / -1; }
}
</style>

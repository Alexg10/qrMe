<script setup lang="ts">
import jsQR from "jsqr";

definePageMeta({ layout: "dashboard" });
useHead({ title: "Scanner · qrMe" });

const user = useSupabaseUser();
const { add, update, findByCard, fetchBySlug, load: loadCollection, loaded } = useCollection();

const video = ref<HTMLVideoElement>();
const camState = ref<"idle" | "starting" | "on" | "denied" | "unsupported">("idle");
const found = ref<Card | null>(null);
const entry = ref<CollectionEntry | null>(null);
const status = ref("");
const note = ref("");
const noteSaved = ref(false);
const busy = ref(false);

let stream: MediaStream | null = null;
let timer = 0;
let lastText = "";
const canvas = import.meta.client ? document.createElement("canvas") : null;
/* BarcodeDetector (Chrome/Android, Safari récent) est plus rapide ; jsQR prend le relais ailleurs. */
type Detector = { detect: (src: HTMLVideoElement) => Promise<{ rawValue: string }[]> };
const DetectorCtor = import.meta.client
  ? (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }).BarcodeDetector
  : undefined;
const detector = DetectorCtor ? new DetectorCtor({ formats: ["qr_code"] }) : null;

async function start() {
  if (!navigator.mediaDevices?.getUserMedia) {
    camState.value = "unsupported";
    return;
  }
  camState.value = "starting";
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    if (!video.value) return stop();
    video.value.srcObject = stream;
    await video.value.play();
    camState.value = "on";
    loop();
  } catch {
    camState.value = "denied";
  }
}
function stop() {
  clearTimeout(timer);
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  if (camState.value === "on" || camState.value === "starting") camState.value = "idle";
}

async function readFrame(): Promise<string | null> {
  const v = video.value;
  if (!v || v.readyState < 2) return null;
  if (detector) {
    const codes = await detector.detect(v).catch(() => []);
    return codes[0]?.rawValue ?? null;
  }
  if (!canvas) return null;
  const w = 480;
  const h = Math.round((v.videoHeight / v.videoWidth) * w) || 640;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(v, 0, 0, w, h);
  return jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "attemptBoth" })?.data ?? null;
}

async function loop() {
  if (camState.value !== "on" || found.value) return;
  const text = await readFrame();
  if (text && text !== lastText) {
    lastText = text;
    await handle(text);
  }
  timer = window.setTimeout(loop, 160);
}

async function handle(text: string) {
  const slug = slugFromScan(text);
  if (!slug) {
    status.value = "Ce QR code n'est pas une carte qrMe.";
    return;
  }
  status.value = "Carte détectée…";
  try {
    const card = await fetchBySlug(slug);
    if (!card) {
      status.value = "Cette carte n'existe plus ou a été désactivée.";
      return;
    }
    if (card.user_id === user.value?.id) {
      status.value = "C'est ta propre carte.";
      return;
    }
    if (!loaded.value) await loadCollection();
    found.value = card;
    entry.value = findByCard(card.id) || null;
    note.value = entry.value?.note || "";
    status.value = "";
    navigator.vibrate?.(40);
    stop();
  } catch (e) {
    status.value = (e as Error).message;
  }
}

async function addIt() {
  if (!found.value) return;
  busy.value = true;
  try {
    entry.value = await add(found.value.id, "scan");
  } catch (e) {
    status.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
}
async function saveNote() {
  if (!entry.value) return;
  await update(entry.value.id, { note: note.value.trim() || null });
  noteSaved.value = true;
}
function again() {
  found.value = null;
  entry.value = null;
  note.value = "";
  noteSaved.value = false;
  lastText = "";
  status.value = "";
  start();
}

onMounted(start);
onBeforeUnmount(stop);
</script>

<template>
  <div>
    <div class="q-head">
      <h1 class="q-h1">Scanner</h1>
      <p>Vise le QR d'une carte qrMe. Elle s'ajoute à ta collection sans passer par le navigateur.</p>
    </div>

    <div class="scanner">
      <div class="cam">
        <video ref="video" playsinline muted :hidden="camState !== 'on'" />
        <div v-if="camState === 'on'" class="frame"><i /><i /><i /><i /><div class="line" /></div>
        <div v-else-if="found" class="cam-card"><QrCard :card="found" /></div>
        <div v-else class="cam-msg">
          <p v-if="camState === 'starting'">Ouverture de la caméra…</p>
          <template v-else-if="camState === 'denied'">
            <p>Accès à la caméra refusé. Autorise-le dans les réglages du navigateur, puis réessaie.</p>
            <button type="button" class="q-pill" @click="start">Réessayer</button>
          </template>
          <p v-else-if="camState === 'unsupported'">
            Ce navigateur ne donne pas accès à la caméra. Utilise l'appareil photo du téléphone : le QR ouvre la carte, avec un bouton pour l'ajouter.
          </p>
          <button v-else type="button" class="q-pill solid big" @click="start">Ouvrir la caméra</button>
        </div>
      </div>

      <div class="side">
        <p v-if="!found" class="q-note" role="status">{{ status || "Vise le QR code d'une carte. La détection est automatique." }}</p>

        <template v-else>
          <span class="q-note">Carte détectée · {{ cardUrl(found.slug) }}</span>
          <h2 class="fname">{{ found.first_name }}<br >{{ found.last_name }}</h2>
          <div class="fjob">{{ [found.job, found.city].filter(Boolean).join(" · ") }}</div>

          <button v-if="!entry" type="button" class="q-pill solid big" :disabled="busy" @click="addIt">
            {{ busy ? "Ajout…" : "+ Ajouter à ma collection" }}
          </button>
          <p v-else class="q-note">Dans ta collection depuis le {{ formatDate(entry.created_at) }}.</p>

          <template v-if="entry">
            <div class="note-box">
              <label for="snote" class="q-lbl">Ma note <span class="opt">· optionnel</span></label>
              <textarea id="snote" v-model="note" class="q-textarea" rows="2" placeholder="Où vous êtes-vous rencontrés ? De quoi avez-vous parlé ?" />
              <div class="row">
                <button type="button" class="q-pill" @click="saveNote">Enregistrer la note</button>
                <span v-if="noteSaved" class="q-note">Note enregistrée</span>
              </div>
            </div>
            <QrReturnCard :their-card="found" />
          </template>

          <p v-if="status" class="q-error">{{ status }}</p>
          <div class="acts">
            <NuxtLink v-if="entry" :to="{ path: '/dashboard/collection', query: { carte: entry.id } }" class="q-pill">Voir dans la collection</NuxtLink>
            <button type="button" class="q-pill" @click="again">Scanner une autre carte</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scanner { display: grid; grid-template-columns: minmax(0, 400px) minmax(0, 1fr); gap: 40px; align-items: start; }
.cam { position: relative; aspect-ratio: 3 / 4; max-width: 100%; overflow: hidden; background: radial-gradient(120% 80% at 50% 30%, #3b3934, #121210 72%); display: grid; place-items: center; }
video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.frame { position: absolute; inset: 18% 12%; }
.frame i { position: absolute; width: 30px; height: 30px; border: 3px solid var(--c-jaune); }
.frame i:nth-child(1) { top: 0; left: 0; border-right: 0; border-bottom: 0; }
.frame i:nth-child(2) { top: 0; right: 0; border-left: 0; border-bottom: 0; }
.frame i:nth-child(3) { bottom: 0; left: 0; border-right: 0; border-top: 0; }
.frame i:nth-child(4) { bottom: 0; right: 0; border-left: 0; border-top: 0; }
.line { position: absolute; left: 0; right: 0; top: 0; height: 2px; background: var(--c-jaune); box-shadow: 0 0 14px 2px rgb(243 210 58 / 0.6); animation: scanl 2.2s ease-in-out infinite alternate; }
@keyframes scanl { to { top: 100%; } }
.cam-card { width: 52%; transform: rotate(-4deg); }
.cam-msg { display: grid; gap: 14px; justify-items: center; text-align: center; padding: 24px; color: var(--mute); }
.cam-msg p { margin: 0; max-width: 32ch; }
.side { display: grid; gap: 16px; align-content: start; justify-items: start; }
.fname { margin: 0; font-family: var(--f-display); font-weight: 900; font-stretch: 64%; text-transform: uppercase; font-size: clamp(44px, 6vw, 72px); line-height: 0.84; overflow-wrap: anywhere; }
.fjob { font-family: var(--f-display); font-weight: 700; font-stretch: 85%; text-transform: uppercase; }
.note-box { display: grid; gap: 8px; width: 100%; }
.opt { text-transform: none; letter-spacing: 0; color: var(--faint); }
.row, .acts { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
@media (max-width: 760px) { .scanner { grid-template-columns: minmax(0, 1fr); } }
@media (prefers-reduced-motion: reduce) { .line { animation: none; top: 50%; } }
</style>

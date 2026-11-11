<script setup lang="ts">
/**
 * Fenêtre « Niveau débloqué » : s'ouvre quand le niveau dépasse le dernier niveau vu sur cet appareil.
 * Montre une carte de l'utilisateur avec la nouveauté la plus visible déjà appliquée.
 */
const route = useRoute();
const progress = useProgress();
const { cards } = useMyCards();

const open = ref(false);
const from = ref(1);
const to = ref(1);

const unlocked = computed(() => UNLOCKS.filter((u) => u.level > from.value && u.level <= to.value));
/* La nouveauté à mettre en avant : la plus haute, et à niveau égal finition > animation > foil > couleur. */
const RANK = { finish: 3, intro: 2, foil: 1, color: 0 } as const;
const star = computed(() =>
  [...unlocked.value].sort((a, b) => b.level - a.level || RANK[b.kind] - RANK[a.kind])[0],
);
const baseCard = computed<Partial<Card>>(
  () => cards.value.find((c) => c.is_active) ?? cards.value[0] ?? { slug: "apercu", first_name: "Ta", last_name: "Carte", job: "Ce que tu fais", color: "jaune", layout: "affiche" },
);
const preview = computed<Partial<Card>>(() => {
  const c: Partial<Card> = { ...baseCard.value };
  const s = star.value;
  if (s?.kind === "color") c.color = s.value as CardColor;
  if (s?.kind === "finish") c.finish = s.value as CardFinish;
  if (s?.kind === "foil") c.foil = true;
  if (s?.kind === "intro") c.intro = s.value as CardIntro;
  return c;
});
const tryLink = computed(() => {
  const id = (baseCard.value as Card).id;
  if (!id || !star.value) return "/dashboard/cards";
  return { path: `/dashboard/cards/${id}`, query: { essai: `${star.value.kind}:${star.value.value}` } };
});

async function check() {
  try {
    await progress.load();
  } catch {
    return; // migration pas encore passée ou hors ligne : pas de fenêtre
  }
  const seen = progress.seenLevel();
  if (progress.level.value > seen) {
    from.value = seen;
    to.value = progress.level.value;
    open.value = true;
  }
}
function close() {
  progress.markSeen(to.value);
  open.value = false;
}

onMounted(check);
watch(() => route.path, check);
function onKey(e: KeyboardEvent) {
  if (open.value && e.key === "Escape") close();
}
onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="lu" @click.self="close">
      <div class="box" role="dialog" aria-modal="true" aria-labelledby="lu-title">
        <span class="eyebrow">{{ to - from > 1 ? `Niv. ${from + 1} à ${to}` : `Niv. ${to}` }}</span>
        <div class="card">
          <QrIntro :card="preview"><QrCard :card="preview" /></QrIntro>
        </div>
        <h2 id="lu-title">{{ to - from > 1 ? `Tu es Niv. ${to}` : `Niv. ${to} atteint` }}</h2>
        <p>{{ unlocked.length > 1 ? `${unlocked.length} nouveautés débloquées :` : "Nouveauté débloquée :" }} {{ unlocked.map((u) => u.label).join(", ") }}</p>
        <div class="acts">
          <NuxtLink :to="tryLink" class="q-pill solid" @click="close">Essayer sur ma carte</NuxtLink>
          <button type="button" class="q-pill" @click="close">Plus tard</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.lu { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 16px; background: rgb(13 13 11 / 0.85); }
.box {
  width: min(380px, 100%); max-height: 100%; overflow: auto; display: grid; justify-items: center; gap: 14px; text-align: center;
  padding: 24px; background: var(--ink-2); border: 1px solid var(--line);
  animation: pop 0.5s cubic-bezier(0.2, 1.4, 0.4, 1) both;
}
.eyebrow { font-size: 12px; font-weight: 700; color: var(--ink); background: var(--c-jaune); border-radius: 99px; padding: 3px 10px; }
.card { width: 160px; }
h2 { margin: 0; font-family: var(--f-display); font-weight: var(--w-display); font-stretch: var(--s-display); font-size: 34px; line-height: 1; letter-spacing: -0.03em; text-wrap: balance; }
p { margin: 0; color: var(--mute); font-size: 14px; }
.acts { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
@keyframes pop { from { transform: scale(0.6); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .box { animation: none; } }
</style>

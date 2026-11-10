<script setup lang="ts">
/* « Envoie-lui ta carte en retour » : ajoute une de mes cartes à la collection du propriétaire de theirCard. */
const props = defineProps<{ theirCard: Card; light?: boolean }>();

const { cards } = useMyCards();
const { sendBack } = useCollection();
const mine = computed(() => cards.value.filter((c) => c.is_active));
const chosen = ref<string>();
const state = ref<"idle" | "sending" | "sent" | "error">("idle");
const errorMsg = ref("");

watchEffect(() => {
  if (!chosen.value && mine.value.length) chosen.value = mine.value[0].id;
});
const who = computed(() => props.theirCard.first_name || fullName(props.theirCard) || "Cette personne");
const sentLabel = computed(() => mine.value.find((c) => c.id === chosen.value)?.label);

async function send() {
  if (!chosen.value) return;
  state.value = "sending";
  try {
    await sendBack(chosen.value, props.theirCard.id);
    state.value = "sent";
  } catch (e) {
    errorMsg.value = (e as Error).message;
    state.value = "error";
  }
}
</script>

<template>
  <div v-if="mine.length" class="return" :class="{ light }">
    <template v-if="state === 'sent'">
      <div class="h">Carte envoyée</div>
      <p>Ta carte {{ sentLabel }} est maintenant dans la collection de {{ who }}.</p>
    </template>
    <template v-else>
      <div class="h">Envoie-lui ta carte en retour</div>
      <p>{{ who }} la retrouvera directement dans sa collection.</p>
      <div v-if="mine.length > 1" class="pick">
        <button
          v-for="c in mine"
          :key="c.id"
          type="button"
          class="q-pill"
          :class="{ on: chosen === c.id }"
          @click="chosen = c.id"
        >
          {{ c.label }}
        </button>
      </div>
      <button type="button" class="q-pill solid" :disabled="state === 'sending'" @click="send">
        {{ state === "sending" ? "Envoi…" : "Envoyer ma carte" }}
      </button>
      <p v-if="state === 'error'" class="q-error">{{ errorMsg }}</p>
    </template>
  </div>
</template>

<style scoped>
.return { border: 1.5px solid currentColor; padding: 14px; display: grid; gap: 8px; justify-items: start; }
.h { font-family: var(--f-display); font-weight: 900; font-stretch: 70%; text-transform: uppercase; font-size: 20px; line-height: 1; }
p { margin: 0; font-size: 13px; opacity: 0.75; }
.pick { display: flex; gap: 6px; flex-wrap: wrap; }
.light .q-pill { border-color: var(--ink); color: var(--ink); }
.light .q-pill.on, .light .q-pill.solid { background: var(--ink); color: var(--paper); }
.light .q-pill:hover:not(.on):not(.solid) { background: rgb(0 0 0 / 0.08); }
</style>

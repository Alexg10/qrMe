<script setup lang="ts">
definePageMeta({ layout: "dashboard" });

const route = useRoute();
const { cards, loaded, load } = useMyCards();
const card = computed(() => cards.value.find((c) => c.id === route.params.id));
useHead({ title: () => `${card.value?.label || "Carte"} · qrMe` });

onMounted(() => {
  if (!loaded.value) load();
});
</script>

<template>
  <div>
    <div class="q-head">
      <h1 class="q-h1">{{ card?.label || "Carte" }}</h1>
      <p>Les changements s'appliquent aussi aux cartes déjà collectées : les personnes qui t'ont gardé voient toujours la dernière version.</p>
    </div>
    <QrEditor v-if="card" :card="card" />
    <p v-else-if="loaded" class="q-note">
      Cette carte n'existe pas ou ne t'appartient pas. <NuxtLink to="/dashboard/cards" class="underline">Retour à mes cartes</NuxtLink>
    </p>
    <p v-else class="q-note">Chargement…</p>
  </div>
</template>

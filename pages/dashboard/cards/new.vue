<script setup lang="ts">
definePageMeta({ layout: "dashboard" });
useHead({ title: "Nouvelle carte · qrMe" });
</script>

<template>
  <div>
    <div class="q-head">
      <h1 class="q-h1">Nouvelle carte</h1>
      <p>Tout est optionnel. Un champ vide disparaît de la carte. Tu choisis une couleur et une mise en page, la typo ne bouge pas.</p>
    </div>
    <QrEditor />
  </div>
</template>

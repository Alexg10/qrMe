<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>();

/* Carte d'exemple affichée à côté des formulaires. */
const sample = {
  slug: "exemple",
  first_name: "Ta",
  last_name: "Carte",
  job: "Ce que tu fais",
  city: "Ta ville",
  website: "qrme.app",
  tags: ["prêt", "à scanner"],
  color: "jaune" as const,
  layout: "affiche" as const,
};
</script>

<template>
  <div class="auth">
    <div class="form-col">
      <NuxtLink to="/" class="logo" aria-label="qrMe, accueil"><i /><i />qrMe</NuxtLink>
      <div class="body">
        <h1 class="q-h1">{{ title }}</h1>
        <p v-if="subtitle" class="sub">{{ subtitle }}</p>
        <slot />
      </div>
    </div>
    <div class="art" aria-hidden="true">
      <div class="art-card"><QrCard :card="sample" /></div>
    </div>
  </div>
</template>

<style scoped>
.auth { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.form-col {
  display: flex; flex-direction: column; gap: 48px;
  padding: max(24px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) 40px max(24px, env(safe-area-inset-left, 0px));
}
.logo { display: flex; align-items: center; gap: 8px; font-family: var(--f-display); font-weight: 900; font-stretch: 75%; font-size: 24px; text-transform: uppercase; }
.logo i { display: block; width: 18px; height: 18px; background: var(--c-jaune); }
.logo i + i { background: transparent; border: 4px solid var(--c-jaune); }
.body { display: grid; gap: 22px; max-width: 420px; width: 100%; margin-block: auto; align-self: center; }
.sub { margin: 0; color: var(--mute); }
.art { background: var(--c-jaune); display: grid; place-items: center; padding: 40px; overflow: hidden; }
.art-card { width: min(320px, 70%); transform: rotate(-6deg); box-shadow: 0 40px 80px -20px rgb(0 0 0 / 0.5); }
@media (max-width: 860px) {
  .auth { grid-template-columns: minmax(0, 1fr); }
  .art { display: none; }
}
</style>

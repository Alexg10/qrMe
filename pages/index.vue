<script setup lang="ts">
useHead({ title: "qrMe · cartes de visite à QR code" });

const user = useSupabaseUser();
const samples = [
  { slug: "demo-1", first_name: "Jeanne", last_name: "Morel", job: "Directrice artistique", city: "Lyon", website: "morel.studio", tags: ["design", "print"], color: "jaune" as const, layout: "affiche" as const },
  { slug: "demo-2", first_name: "Malik", last_name: "Benali", job: "Développeur", city: "Marseille", email: "malik@benali.dev", website: "benali.dev", tags: ["dev", "web"], color: "bleu" as const, layout: "mono" as const },
  { slug: "demo-3", first_name: "Inès", last_name: "Caradec", job: "Photographe", city: "Brest", description: "Portraits et reportage.", tags: ["photo"], color: "rouge" as const, layout: "typo" as const },
];
</script>

<template>
  <div class="home">
    <header class="top">
      <NuxtLink to="/" class="logo"><i /><i />qrMe</NuxtLink>
      <NuxtLink :to="user ? '/dashboard' : '/login'" class="q-pill">{{ user ? "Ouvrir l'app" : "Connexion" }}</NuxtLink>
    </header>
    <section class="hero">
      <div class="txt">
        <h1>Ta carte.<br >Un QR.<br >Une collection.</h1>
        <p>Crée ta carte de visite en une minute, montre-la en un geste, et garde celles des gens que tu rencontres.</p>
        <NuxtLink :to="user ? '/dashboard' : '/signup'" class="q-pill solid big">{{ user ? "Ouvrir l'app" : "Créer ma carte" }}</NuxtLink>
      </div>
      <div class="fan" aria-hidden="true">
        <div v-for="(s, i) in samples" :key="s.slug" class="f" :style="{ '--i': i }"><QrCard :card="s" /></div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home { min-height: 100vh; padding: max(20px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) 48px max(16px, env(safe-area-inset-left, 0px)); max-width: 1240px; margin: 0 auto; }
.top { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.logo { display: flex; align-items: center; gap: 8px; font-family: var(--f-display); font-weight: var(--w-display); font-size: 24px; }
.logo i { display: block; width: 18px; height: 18px; background: var(--c-jaune); }
.logo i + i { background: transparent; border: 4px solid var(--c-jaune); }
.hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 40px; align-items: center; padding-top: 64px; }
.txt { display: grid; gap: 24px; justify-items: start; }
h1 { margin: 0; font-family: var(--f-display); font-weight: var(--w-display); font-size: clamp(60px, 9vw, 124px); line-height: 0.92; letter-spacing: -0.03em; }
.txt p { margin: 0; max-width: 40ch; color: var(--mute); font-size: 17px; }
.fan { position: relative; height: min(70vw, 520px); }
.f { position: absolute; width: 46%; top: 6%; left: calc(8% + var(--i) * 22%); transform: rotate(calc(-8deg + var(--i) * 8deg)) translateY(calc(var(--i) * 4%)); box-shadow: 0 30px 60px -20px rgb(0 0 0 / 0.8); }
@media (max-width: 860px) {
  .hero { grid-template-columns: minmax(0, 1fr); padding-top: 40px; }
  .fan { height: 110vw; max-height: 520px; }
}
</style>

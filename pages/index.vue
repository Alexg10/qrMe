<script setup lang="ts">
useHead({ title: "qrMe · cartes de visite à QR code" });

const user = useSupabaseUser();
const cta = computed(() => (user.value ? { to: "/dashboard", label: "Ouvrir l'app" } : { to: "/signup", label: "Créer ma carte" }));
const year = new Date().getFullYear();

const steps = [
  { n: "1", title: "Crée ta carte", text: "Nom, métier, contacts, réseaux : tout est facultatif. Choisis une couleur et une mise en page, c'est prêt." },
  { n: "2", title: "Montre-la", text: "SHOWme affiche ta carte en plein écran avec son QR code. On la scanne avec n'importe quel appareil photo, sans app." },
  { n: "3", title: "Collectionne", text: "Scanne le QR des autres pour garder leur carte. Ajoute une note, des favoris, et retrouve-les en un clin d'œil." },
];
const perks = [
  { title: "Toujours à jour", text: "Tu modifies ta carte, toutes les copies déjà collectées se mettent à jour." },
  { title: "Plusieurs cartes", text: "Une pour le boulot, une pour les projets perso : tu choisis laquelle montrer." },
  { title: "Rien à installer", text: "Pour la personne en face, un simple scan ouvre ta carte dans le navigateur." },
  { title: "Fonctionne hors ligne", text: "Ta carte s'affiche même sans réseau, au fond d'une salle ou dans le métro." },
];

/* Aperçus des styles qui se gagnent en échangeant. Le seuil affiché vient des vrais niveaux de déblocage. */
const levelOf = (c: { color: string; finish: string; foil?: boolean }) =>
  Math.max(
    colorInfo(c.color).level,
    CARD_FINISHES.find((f) => f.value === c.finish)?.level ?? 1,
    c.foil ? FOIL_LEVEL : 1,
  );
const styles = [
  { title: "Brillance", text: "Un reflet qui suit le mouvement.", card: { slug: "demo-4", first_name: "Léa", last_name: "Roux", job: "Illustratrice", color: "corail" as const, layout: "affiche" as const, finish: "shine" as const } },
  { title: "Paillettes", text: "Des éclats qui scintillent.", card: { slug: "demo-5", first_name: "Hugo", last_name: "Lenoir", job: "DJ", color: "nuit" as const, layout: "typo" as const, finish: "glitter" as const } },
  { title: "Holographique", text: "Un dégradé irisé, façon carte rare.", card: { slug: "demo-6", first_name: "Sofia", last_name: "Diaz", job: "Product designer", color: "lagon" as const, layout: "mono" as const, finish: "holo" as const } },
  { title: "Or et néon", text: "Le métal, le néon, le nom en relief.", card: { slug: "demo-7", first_name: "Max", last_name: "Auber", job: "Fondateur", color: "or" as const, layout: "affiche" as const, finish: "neon" as const, foil: true } },
].map((s) => ({ ...s, n: xpFor(levelOf(s.card)) }));

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
        <NuxtLink :to="cta.to" class="q-pill solid big">{{ cta.label }}</NuxtLink>
      </div>
      <div class="fan" aria-hidden="true">
        <div v-for="(s, i) in samples" :key="s.slug" class="f" :style="{ '--i': i }"><QrCard :card="s" /></div>
      </div>
    </section>

    <section class="block">
      <h2>Comment ça marche</h2>
      <ol class="steps">
        <li v-for="s in steps" :key="s.n">
          <span class="n">{{ s.n }}</span>
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </li>
      </ol>
    </section>

    <section class="block styles">
      <div class="lead">
        <h2>Plus tu échanges,<br >plus ta carte brille.</h2>
        <p>Chaque carte que tu scannes, chaque personne qui garde la tienne : c'est un échange. Au fil des rencontres, tu débloques de nouvelles couleurs, des finitions et des animations pour ta carte.</p>
      </div>
      <ul class="looks">
        <li v-for="s in styles" :key="s.title">
          <div class="pv" aria-hidden="true"><QrCard :card="s.card" /></div>
          <span class="cnt">{{ s.n }} échanges</span>
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </li>
      </ul>
    </section>

    <section class="block">
      <h2>Pourquoi qrMe</h2>
      <ul class="perks">
        <li v-for="p in perks" :key="p.title">
          <h3>{{ p.title }}</h3>
          <p>{{ p.text }}</p>
        </li>
      </ul>
    </section>

    <section class="block end">
      <h2>Prêt à échanger ta carte ?</h2>
      <p>Gratuit, en une minute.</p>
      <NuxtLink :to="cta.to" class="q-pill solid big">{{ cta.label }}</NuxtLink>
    </section>

    <footer class="foot">
      <NuxtLink to="/" class="logo small"><i /><i />qrMe</NuxtLink>
      <nav>
        <template v-if="user"><NuxtLink to="/dashboard">Ouvrir l'app</NuxtLink></template>
        <template v-else>
          <NuxtLink to="/signup">Créer un compte</NuxtLink>
          <NuxtLink to="/login">Connexion</NuxtLink>
        </template>
      </nav>
      <span class="q-note">© {{ year }} qrMe</span>
    </footer>
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

.block { padding-top: 96px; }
h2 { margin: 0 0 32px; font-family: var(--f-display); font-weight: var(--w-display); font-size: clamp(36px, 5vw, 56px); line-height: 1; letter-spacing: -0.02em; }
h3 { margin: 0; font-family: var(--f-display); font-weight: var(--w-display); font-size: 22px; line-height: 1.1; }
.block p { margin: 0; color: var(--mute); }
.steps, .perks { list-style: none; margin: 0; padding: 0; display: grid; gap: 16px; }
.steps { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.steps li { display: grid; gap: 10px; align-content: start; padding: 24px; background: var(--ink-2); }
.n { display: grid; place-items: center; width: 36px; height: 36px; margin-bottom: 8px; background: var(--c-jaune); color: var(--ink); font-family: var(--f-display); font-weight: var(--w-display); font-size: 18px; }
.steps li:nth-child(2) .n { background: var(--c-bleu); color: var(--paper); }
.steps li:nth-child(3) .n { background: var(--c-rouge); color: var(--paper); }
.perks { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 40px; }
.perks li { display: grid; gap: 6px; padding: 20px 0; border-top: 1.5px solid var(--line); }
.lead { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px 40px; align-items: end; margin-bottom: 40px; }
.lead h2 { margin: 0; }
.lead p { max-width: 46ch; font-size: 17px; }
.looks { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; }
.looks li { display: grid; gap: 8px; align-content: start; justify-items: start; }
.pv { width: 100%; margin-bottom: 8px; box-shadow: 0 24px 48px -20px rgb(0 0 0 / 0.8); transition: transform 0.3s ease; }
.looks li:nth-child(odd) .pv { transform: rotate(-2deg); }
.looks li:nth-child(even) .pv { transform: rotate(2deg) translateY(12px); }
.looks li:hover .pv { transform: rotate(0) translateY(-6px); }
.cnt { padding: 3px 10px; background: var(--ink-2); border: 1.5px solid var(--line); border-radius: 999px; font-size: 13px; color: var(--mute); }
.end { display: grid; justify-items: center; gap: 16px; text-align: center; }
.end h2 { margin: 0; }
.foot { display: flex; align-items: center; justify-content: space-between; gap: 16px 24px; flex-wrap: wrap; margin-top: 96px; padding-top: 24px; border-top: 1.5px solid var(--line); }
.foot nav { display: flex; gap: 20px; font-size: 14px; }
.foot nav a { color: var(--mute); }
.foot nav a:hover { color: var(--paper); }
.logo.small { font-size: 18px; }
.logo.small i { width: 14px; height: 14px; }
.logo.small i + i { border-width: 3px; }
@media (max-width: 860px) {
  .hero { grid-template-columns: minmax(0, 1fr); padding-top: 40px; }
  .fan { height: 110vw; max-height: 520px; }
  .block { padding-top: 72px; }
  .steps, .perks { grid-template-columns: minmax(0, 1fr); }
  .lead { grid-template-columns: minmax(0, 1fr); }
  .looks { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px 16px; }
  .foot { margin-top: 72px; }
}
</style>

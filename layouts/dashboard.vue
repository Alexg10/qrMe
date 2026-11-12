<script setup lang="ts">
import { QrCode, ScanLine, Layers, WalletCards, ChartColumn, Plus } from "lucide-vue-next";

const route = useRoute();
const user = useSupabaseUser();
const { entries, loaded: collLoaded, load: loadCollection } = useCollection();
const { load: loadCards } = useMyCards();

const NAV = [
  { to: "/dashboard", icon: QrCode, label: "SHOWme", sub: "Montrer ma carte", exact: true },
  { to: "/dashboard/scanner", icon: ScanLine, label: "Scanner", sub: "Ajouter une carte" },
  { to: "/dashboard/collection", icon: Layers, label: "Collection", badge: true },
  { to: "/dashboard/cards", icon: WalletCards, label: "Mes cartes" },
  // En mobile, Stats passe dans la page Compte pour garder 5 onglets.
  { to: "/dashboard/stats", icon: ChartColumn, label: "Stats", sub: "Scans et ajouts", desktopOnly: true },
];
const isActive = (item: (typeof NAV)[number]) =>
  item.exact ? route.path === item.to : route.path.startsWith(item.to);

const initials = computed(() => {
  const email = user.value?.email || "";
  return email.slice(0, 2).toUpperCase() || "QR";
});

onMounted(() => {
  loadCards();
  if (!collLoaded.value) loadCollection().catch(() => {});
});
</script>

<template>
  <div class="app">
    <aside class="side">
      <NuxtLink class="logo" to="/dashboard" aria-label="qrMe, accueil"><i /><i /></NuxtLink>
      <nav class="nav" aria-label="Dashboard">
        <NuxtLink
          v-for="item in NAV"
          :key="item.to"
          :to="item.to"
          :aria-label="item.label"
          :aria-current="isActive(item) ? 'page' : undefined"
          :class="{ 'desk-only': item.desktopOnly }"
        >
          <component :is="item.icon" :size="22" :stroke-width="2" aria-hidden="true" />
          <span v-if="item.badge && entries.length" class="badge">{{ entries.length }}</span>
          <span class="lbl" aria-hidden="true">{{ item.label }}</span>
          <span class="tip">{{ item.label }}<small v-if="item.sub">{{ item.sub }}</small></span>
        </NuxtLink>
      </nav>
      <NuxtLink class="new-btn" to="/dashboard/cards/new" aria-label="Nouvelle carte">
        <Plus :size="22" :stroke-width="2" aria-hidden="true" />
        <span class="tip">Nouvelle carte</span>
      </NuxtLink>
      <NuxtLink
        class="me"
        to="/dashboard/account"
        aria-label="Mon compte"
        :aria-current="route.path.startsWith('/dashboard/account') ? 'page' : undefined"
      >
        <span class="av">{{ initials }}</span>
        <span class="lbl" aria-hidden="true">Compte</span>
        <span class="tip">Compte<small>{{ user?.email }}</small></span>
      </NuxtLink>
    </aside>

    <main>
      <slot />
    </main>
    <QrLevelUp />
  </div>
</template>

<style scoped>
/* Rail d'icônes jaune collé au bord gauche (desktop), barre d'onglets en bas (mobile). */
.app { display: grid; grid-template-columns: calc(72px + env(safe-area-inset-left, 0px)) minmax(0, 1fr); min-height: 100vh; }
.side {
  position: sticky; top: 0; height: 100vh; align-self: start; z-index: 20;
  display: flex; flex-direction: column; align-items: center; gap: 22px;
  padding-block: calc(20px + env(safe-area-inset-top, 0px)) 20px; padding-left: env(safe-area-inset-left, 0px);
  background: var(--c-jaune); color: var(--ink);
}
.logo { display: flex; gap: 4px; padding: 4px; }
.logo i { display: block; width: 14px; height: 14px; background: var(--ink); }
.logo i + i { background: transparent; border: 3.5px solid var(--ink); }
.nav { display: flex; flex-direction: column; gap: 6px; }
.nav a, .new-btn {
  position: relative; width: 46px; height: 46px; display: grid; place-content: center;
  color: var(--ink); transition: background 0.15s ease, color 0.15s ease;
}
.nav a:hover { background: rgb(13 13 11 / 0.12); }
.nav a[aria-current="page"] { background: var(--ink); color: var(--c-jaune); }
.new-btn { border: 2px solid var(--ink); border-radius: 99px; width: 42px; height: 42px; }
.new-btn:hover, .new-btn.router-link-active { background: var(--ink); color: var(--c-jaune); }
.badge {
  position: absolute; top: 3px; right: 1px; min-width: 18px; height: 18px; padding: 0 4px; border-radius: 99px;
  background: var(--ink); color: var(--c-jaune); font-family: var(--f-body); font-size: 10px; line-height: 18px; text-align: center;
  box-shadow: 0 0 0 2px var(--c-jaune);
}
.nav a[aria-current="page"] .badge { background: var(--c-jaune); color: var(--ink); box-shadow: 0 0 0 2px var(--ink); }
.tip {
  position: absolute; left: calc(100% + 14px); top: 50%; translate: -4px -50%; white-space: nowrap; pointer-events: none;
  background: var(--paper); color: var(--ink); padding: 6px 10px; opacity: 0; transition: opacity 0.15s ease, translate 0.15s ease;
  font-family: var(--f-body); font-weight: 600; font-size: 13px; line-height: 1;
}
.tip::before { content: ""; position: absolute; right: 100%; top: 50%; translate: 0 -50%; border: 5px solid transparent; border-right-color: var(--paper); }
.tip small { display: block; margin-top: 3px; font-family: var(--f-body); font-weight: 400; font-size: 11px; text-transform: none; letter-spacing: 0; color: var(--faint); }
.nav a:hover .tip, .nav a:focus-visible .tip, .new-btn:hover .tip, .new-btn:focus-visible .tip,
.me:hover .tip, .me:focus-visible .tip { opacity: 1; translate: 0 -50%; }
.side :focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.me { margin-top: auto; position: relative; display: grid; justify-items: center; gap: 4px; color: var(--ink); }
.me[aria-current="page"] .av { background: var(--paper); color: var(--ink); box-shadow: 0 0 0 2px var(--ink); }
.lbl { display: none; }
.av {
  width: 36px; height: 36px; display: grid; place-content: center;
  background: var(--ink); color: var(--c-jaune); font-family: var(--f-display); font-weight: var(--w-display); font-size: 15px;
}
main {
  min-width: 0;
  padding: calc(28px + env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) 64px 36px;
}
main > :deep(*) { max-width: 1180px; }

@media (max-width: 860px) {
  .app { grid-template-columns: minmax(0, 1fr); }
  .side {
    position: fixed; inset: auto 0 0 0; top: auto; height: auto; flex-direction: row; justify-content: space-around; gap: 4px;
    padding: 8px max(12px, env(safe-area-inset-right, 0px)) calc(8px + env(safe-area-inset-bottom, 0px)) max(12px, env(safe-area-inset-left, 0px));
  }
  /* 5 onglets avec libellé (ordre fixé plus bas). */
  .side { justify-content: stretch; gap: 0; padding-top: 6px; }
  .nav { display: contents; }
  /* Ordre mobile : Scanner, Mes cartes, SHOWme (au milieu), Collection, Compte. */
  .nav a:nth-child(2) { order: 1; }
  .nav a:nth-child(4) { order: 2; }
  .nav a:nth-child(1) { order: 3; }
  .nav a:nth-child(3) { order: 4; }
  .me { order: 5; }
  .nav a, .me { flex: 1 1 0; min-width: 0; }
  .nav a, .me {
    width: auto; height: 54px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  }
  .nav a[aria-current="page"], .me[aria-current="page"] { background: var(--ink); color: var(--c-jaune); }
  .me[aria-current="page"] .av { background: var(--c-jaune); color: var(--ink); box-shadow: none; }
  .av { width: 24px; height: 24px; font-size: 11px; }
  .lbl {
    display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font-family: var(--f-body); font-weight: 600; font-size: 11px; line-height: 1;
  }
  .badge { top: 4px; right: calc(50% - 22px); }
  .logo, .tip, .new-btn, .nav a.desk-only { display: none; }
  .me { margin-top: 0; }
  main {
    padding-left: max(16px, env(safe-area-inset-left, 0px));
    padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
  }
}
</style>

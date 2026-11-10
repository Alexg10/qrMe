<script setup lang="ts">
/* Retour du lien de confirmation e-mail : le module Supabase ouvre la session, on redirige ensuite. */
useHead({ title: "Confirmation · qrMe" });

const user = useSupabaseUser();
const route = useRoute();
const cookieRedirect = useCookie<string | null>("sb-redirect-path");

const target = computed(() => {
  const r = String(route.query.redirect || cookieRedirect.value || "");
  return r.startsWith("/") && !r.startsWith("//") ? r : "/dashboard";
});

watch(
  user,
  (u) => {
    if (!u) return;
    cookieRedirect.value = null;
    navigateTo(target.value, { replace: true });
  },
  { immediate: true },
);
</script>

<template>
  <AuthShell title="Compte confirmé" subtitle="Connexion en cours…">
    <p class="q-note">
      Si rien ne se passe, <NuxtLink :to="{ path: '/login', query: route.query }" class="lnk">connecte-toi ici</NuxtLink>.
    </p>
  </AuthShell>
</template>

<style scoped>
.lnk { color: var(--paper); text-decoration: underline; text-underline-offset: 3px; }
</style>

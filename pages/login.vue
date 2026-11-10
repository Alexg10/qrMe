<script setup lang="ts">
useHead({ title: "Connexion · qrMe" });

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const route = useRoute();
const email = ref("");
const password = ref("");
const busy = ref(false);
const errorMsg = ref("");

/* Retour après connexion : ?redirect=/c/abc (page publique) ou /dashboard. */
const target = computed(() => {
  const r = String(route.query.redirect || "");
  return r.startsWith("/") && !r.startsWith("//") ? r : "/dashboard";
});

watch(user, (u) => u && navigateTo(target.value), { immediate: true });

async function submit() {
  busy.value = true;
  errorMsg.value = "";
  const { error } = await supabase.auth.signInWithPassword({ email: email.value.trim(), password: password.value });
  busy.value = false;
  if (error) {
    errorMsg.value =
      error.message === "Invalid login credentials"
        ? "E-mail ou mot de passe incorrect."
        : error.message === "Email not confirmed"
          ? "Confirme d'abord ton adresse : clique sur le lien reçu par e-mail."
          : error.message;
  }
}
</script>

<template>
  <AuthShell title="Connexion" subtitle="Retrouve tes cartes et ta collection.">
    <form class="form" @submit.prevent="submit">
      <div class="q-field">
        <label for="email">E-mail</label>
        <input id="email" v-model="email" type="email" autocomplete="email" required >
      </div>
      <div class="q-field">
        <div class="pw-row">
          <label for="password">Mot de passe</label>
          <NuxtLink :to="{ path: '/forgot', query: email ? { email } : {} }" class="lnk small">Mot de passe oublié ?</NuxtLink>
        </div>
        <input id="password" v-model="password" type="password" autocomplete="current-password" required >
      </div>
      <p v-if="errorMsg" class="q-error" role="alert">{{ errorMsg }}</p>
      <button type="submit" class="q-pill solid big" :disabled="busy">{{ busy ? "Connexion…" : "Se connecter" }}</button>
    </form>
    <p class="q-note">
      Pas encore de compte ?
      <NuxtLink :to="{ path: '/signup', query: route.query }" class="lnk">Créer un compte</NuxtLink>
    </p>
  </AuthShell>
</template>

<style scoped>
.form { display: grid; gap: 18px; justify-items: stretch; }
.form .q-pill { justify-self: start; }
.pw-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.lnk { color: var(--paper); text-decoration: underline; text-underline-offset: 3px; }
.lnk.small { font-size: 12px; color: var(--mute); }
</style>

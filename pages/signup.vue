<script setup lang="ts">
useHead({ title: "Créer un compte · qrMe" });

const supabase = useSupabaseClient();
const route = useRoute();
const email = ref("");
const password = ref("");
const busy = ref(false);
const errorMsg = ref("");
const sent = ref(false);

async function submit() {
  busy.value = true;
  errorMsg.value = "";
  const redirect = String(route.query.redirect || "");
  const back = redirect.startsWith("/") && !redirect.startsWith("//") ? `?redirect=${encodeURIComponent(redirect)}` : "";
  const { error } = await supabase.auth.signUp({
    email: email.value.trim(),
    password: password.value,
    options: { emailRedirectTo: `${window.location.origin}/confirm${back}` },
  });
  busy.value = false;
  if (error) errorMsg.value = error.message;
  else sent.value = true;
}
</script>

<template>
  <AuthShell title="Créer un compte" subtitle="Un e-mail, un mot de passe, et ta carte est prête en une minute.">
    <div v-if="sent" class="sent">
      <p>On t'a envoyé un lien de confirmation à <b>{{ email }}</b>. Clique dessus pour activer ton compte.</p>
      <p class="q-note">Rien reçu ? Regarde dans les indésirables.</p>
    </div>
    <form v-else class="form" @submit.prevent="submit">
      <div class="q-field">
        <label for="email">E-mail</label>
        <input id="email" v-model="email" type="email" autocomplete="email" required >
      </div>
      <div class="q-field">
        <label for="password">Mot de passe <span class="opt">· 8 caractères minimum</span></label>
        <input id="password" v-model="password" type="password" autocomplete="new-password" minlength="8" required >
      </div>
      <p v-if="errorMsg" class="q-error" role="alert">{{ errorMsg }}</p>
      <button type="submit" class="q-pill solid big" :disabled="busy">{{ busy ? "Création…" : "Créer mon compte" }}</button>
    </form>
    <p class="q-note">
      Déjà un compte ?
      <NuxtLink :to="{ path: '/login', query: route.query }" class="lnk">Se connecter</NuxtLink>
    </p>
  </AuthShell>
</template>

<style scoped>
.form { display: grid; gap: 18px; }
.form .q-pill { justify-self: start; }
.sent { display: grid; gap: 8px; }
.sent p { margin: 0; }
.lnk { color: var(--paper); text-decoration: underline; text-underline-offset: 3px; }
</style>

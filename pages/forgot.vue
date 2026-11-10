<script setup lang="ts">
/* Demande de réinitialisation : Supabase envoie un lien qui ouvre /reset. */
useHead({ title: "Mot de passe oublié · qrMe" });

const supabase = useSupabaseClient();
const route = useRoute();
const email = ref(String(route.query.email || ""));
const busy = ref(false);
const sent = ref(false);
const errorMsg = ref("");

async function submit() {
  busy.value = true;
  errorMsg.value = "";
  const { error } = await supabase.auth.resetPasswordForEmail(email.value.trim(), {
    redirectTo: `${window.location.origin}/reset`,
  });
  busy.value = false;
  // On ne dit pas si l'adresse a un compte : même message dans tous les cas, sauf vraie erreur (ex. trop de demandes).
  if (error && error.status !== 400 && error.status !== 404) errorMsg.value = error.message;
  else sent.value = true;
}
</script>

<template>
  <AuthShell title="Mot de passe oublié" subtitle="On t'envoie un lien pour en choisir un nouveau.">
    <div v-if="sent" class="form">
      <p class="done">
        Si un compte existe pour <strong>{{ email.trim() }}</strong>, un e-mail vient de partir. Ouvre le lien
        <strong>sur cet appareil, dans ce navigateur</strong> : il expire au bout d'une heure.
      </p>
      <button type="button" class="q-pill" @click="sent = false">Renvoyer un lien</button>
    </div>
    <form v-else class="form" @submit.prevent="submit">
      <div class="q-field">
        <label for="email">E-mail</label>
        <input id="email" v-model="email" type="email" autocomplete="email" required >
      </div>
      <p v-if="errorMsg" class="q-error" role="alert">{{ errorMsg }}</p>
      <button type="submit" class="q-pill solid big" :disabled="busy">{{ busy ? "Envoi…" : "Envoyer le lien" }}</button>
    </form>
    <p class="q-note">
      Ça te revient ? <NuxtLink to="/login" class="lnk">Se connecter</NuxtLink>
    </p>
  </AuthShell>
</template>

<style scoped>
.form { display: grid; gap: 18px; justify-items: stretch; }
.form .q-pill { justify-self: start; }
.done { margin: 0; line-height: 1.5; }
.lnk { color: var(--paper); text-decoration: underline; text-underline-offset: 3px; }
</style>

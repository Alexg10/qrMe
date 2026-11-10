<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast";

/* Arrivée depuis le lien de réinitialisation : Supabase ouvre une session, on choisit le nouveau mot de passe. */
useHead({ title: "Nouveau mot de passe · qrMe" });

const MIN = 8;
const { toast } = useToast();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const route = useRoute();
const password = ref("");
const confirm = ref("");
const busy = ref(false);
const errorMsg = ref("");
const expired = ref(false);

// Le lien porte une erreur (expiré, déjà utilisé) ou la session n'arrive pas : on propose d'en redemander un.
onMounted(() => {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  if (route.query.error || hash.get("error")) expired.value = true;
  else setTimeout(() => (expired.value = !user.value), 4000);
});

async function submit() {
  errorMsg.value = "";
  if (password.value.length < MIN) return (errorMsg.value = `Au moins ${MIN} caractères.`);
  if (password.value !== confirm.value) return (errorMsg.value = "Les deux mots de passe ne correspondent pas.");
  busy.value = true;
  const { error } = await supabase.auth.updateUser({ password: password.value });
  busy.value = false;
  if (error) {
    errorMsg.value =
      error.code === "same_password" ? "Choisis un mot de passe différent de l'ancien." : error.message;
    return;
  }
  toast({ title: "Mot de passe changé" });
  navigateTo("/dashboard", { replace: true });
}
</script>

<template>
  <AuthShell title="Nouveau mot de passe" :subtitle="user ? `Pour ${user.email}` : undefined">
    <form v-if="user" class="form" @submit.prevent="submit">
      <div class="q-field">
        <label for="password">Nouveau mot de passe</label>
        <AuthPassword id="password" v-model="password" autocomplete="new-password" :minlength="MIN" required />
      </div>
      <div class="q-field">
        <label for="confirm">Confirme-le</label>
        <AuthPassword id="confirm" v-model="confirm" autocomplete="new-password" :minlength="MIN" required />
      </div>
      <p v-if="errorMsg" class="q-error" role="alert">{{ errorMsg }}</p>
      <button type="submit" class="q-pill solid big" :disabled="busy">{{ busy ? "Enregistrement…" : "Enregistrer" }}</button>
    </form>
    <template v-else-if="expired">
      <p class="q-error" role="alert">
        Ce lien ne marche plus : il a expiré, a déjà servi, ou a été ouvert dans un autre navigateur que celui de la demande.
      </p>
      <NuxtLink to="/forgot" class="q-pill solid big">Demander un nouveau lien</NuxtLink>
    </template>
    <p v-else class="q-note">Vérification du lien…</p>
  </AuthShell>
</template>

<style scoped>
.form { display: grid; gap: 18px; justify-items: stretch; }
.form .q-pill { justify-self: start; }
</style>

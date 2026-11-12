<script setup lang="ts">
import { ChartColumn, ChevronRight, LogOut } from "lucide-vue-next";

definePageMeta({ layout: "dashboard" });
useHead({ title: "Compte · qrMe" });

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const progress = useProgress();
const { level, best, nextAt, ratio } = progress;
const toNext = computed(() => (nextAt.value == null ? 0 : nextAt.value - best.value));

onMounted(() => progress.load().catch(() => {}));

const initials = computed(() => (user.value?.email || "").slice(0, 2).toUpperCase() || "QR");
const since = computed(() => {
  const d = user.value?.created_at ? new Date(user.value.created_at) : null;
  return d ? d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : "";
});

const leaving = ref(false);
async function logout() {
  leaving.value = true;
  await supabase.auth.signOut();
  useState("my-cards").value = [];
  useState("collection").value = [];
  try {
    localStorage.removeItem("qrme-my-cards");
  } catch {
    /* rien */
  }
  await navigateTo("/login");
}
</script>

<template>
  <div class="acc">
    <div class="q-head">
      <h1 class="q-h1">Compte</h1>
    </div>

    <section class="who">
      <span class="av" aria-hidden="true">{{ initials }}</span>
      <div class="who-txt">
        <b>{{ user?.email }}</b>
        <span v-if="since" class="q-note">Membre depuis {{ since }}</span>
      </div>
    </section>

    <NuxtLink to="/dashboard/stats" class="lvl">
      <div class="lvl-head">
        <span class="lvl-n">Niv. {{ level }}</span>
        <div class="lvl-txt">
          <b>{{ best }} échange{{ best > 1 ? "s" : "" }}</b>
          <span v-if="nextAt != null" class="q-note">encore {{ toNext }} pour le Niv. {{ level + 1 }}</span>
          <span v-else class="q-note">Niveau maximum : tout est débloqué.</span>
        </div>
        <ChevronRight class="chev" :size="20" aria-hidden="true" />
      </div>
      <div class="lvl-bar" role="progressbar" :aria-valuenow="Math.round(ratio * 100)" aria-valuemin="0" aria-valuemax="100" aria-label="Progression vers le niveau suivant"><i :style="{ width: `${ratio * 100}%` }" /></div>
    </NuxtLink>

    <nav class="rows" aria-label="Mon compte">
      <NuxtLink to="/dashboard/stats" class="row">
        <ChartColumn :size="20" aria-hidden="true" />
        <span class="rt"><b>Stats</b><span class="q-note">Scans et ajouts de tes cartes</span></span>
        <ChevronRight class="chev" :size="18" aria-hidden="true" />
      </NuxtLink>
    </nav>

    <button type="button" class="q-pill big out" :disabled="leaving" @click="logout">
      <LogOut aria-hidden="true" />Se déconnecter
    </button>
  </div>
</template>

<style scoped>
.acc { max-width: 560px; display: grid; gap: 20px; }
.acc .q-head { margin-bottom: 0; }
.who { display: flex; align-items: center; gap: 14px; min-width: 0; }
.av {
  flex: none; width: 52px; height: 52px; display: grid; place-content: center;
  background: var(--c-jaune); color: var(--ink); font-family: var(--f-display); font-weight: var(--w-display); font-size: 20px;
}
.who-txt { display: grid; gap: 2px; min-width: 0; }
.who-txt b { font-size: 16px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lvl { display: grid; gap: 12px; padding: 16px; border: 1px solid var(--line); background: var(--ink-2); color: inherit; text-decoration: none; }
.lvl:hover { border-color: var(--faint); }
.lvl-head { display: flex; align-items: center; gap: 16px; }
.lvl-n { font-family: var(--f-display); font-weight: var(--w-display); font-stretch: var(--s-display); font-size: 40px; line-height: 0.85; letter-spacing: -0.03em; color: var(--c-jaune); white-space: nowrap; }
.lvl-txt { display: grid; gap: 2px; min-width: 0; flex: 1; }
.lvl-txt b { font-size: 16px; font-variant-numeric: tabular-nums; }
.lvl-bar { height: 8px; background: var(--line); border-radius: 99px; overflow: hidden; }
.lvl-bar i { display: block; height: 100%; background: var(--c-jaune); border-radius: 99px; transition: width 0.6s ease; }
.rows { display: grid; border-top: 1px solid var(--line); }
.row { display: flex; align-items: center; gap: 14px; padding: 14px 4px; border-bottom: 1px solid var(--line); color: inherit; text-decoration: none; }
.row:hover { background: var(--ink-2); }
.rt { display: grid; gap: 2px; flex: 1; min-width: 0; }
.rt b { font-size: 15px; }
.chev { flex: none; color: var(--mute); }
.out { justify-self: start; }
@media (max-width: 860px) {
  .out { justify-self: stretch; justify-content: center; }
}
</style>

<script setup lang="ts">
import CardPreview from "@/components/dashboard/CardPreview.vue";

import DashboardStatsViews from "@/components/dashboard/DashboardStatsViews.vue";

definePageMeta({
  layout: false,
});

const supabase = useSupabaseClient();

const cards = ref([]);
const loading = ref(true);

const fetchUserCards = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error: cardsError } = await supabase
      .from("Cards")
      .select("*")
      .eq("user_id", user.id);

    if (cardsError) throw cardsError;
    cards.value = data;
  } catch (e) {
    error.value = e;
    useToast().toast({
      title: "Erreur",
      description: "Impossible de charger les cartes",
      variant: "destructive",
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUserCards();
  console.log(cards.value);
});
</script>

<template>
  <NuxtLayout name="dashboard">
    <div
      class="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3"
    >
      <div class="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <div
          class="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
        >
          <DashboardWelcomeCards />
          <DashboardCreateCard />
          <DashboardStatsViews />
        </div>
        <DashboardStats />
      </div>
      <div>
        <div v-if="loading">Chargement des cartes...</div>

        <CardPreview
          v-else
          :id="cards[0].id"
          :card-name="cards[0].name"
          :color="cards[0].color"
          :name-preview="cards[0].name"
          :job-preview="cards[0].job"
          :button="`edit`"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

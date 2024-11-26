<script setup lang="ts">
import CardPreview from "@/components/dashboard/CardPreview.vue";

import DashboardStatsViews from "@/components/dashboard/DashboardStatsViews.vue";

definePageMeta({
  layout: false,
});

const supabase = useSupabaseClient();

const cards = ref([]);

const fetchUserCards = async () => {
  const { data, error } = await supabase.from("Cards").select("*");
  if (error) {
    console.error("Error fetching cards:", error.message);
    return;
  }
  cards.value = data;
};

onMounted(() => {
  fetchUserCards();
  console.log(cards);
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
        <CardPreview
          :card-name="cardName"
          :color="color"
          :name-preview="namePreview"
          :job-preview="jobPreview"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

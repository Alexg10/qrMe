<script lang="ts" setup>
import { useToast } from "@/components/ui/toast/use-toast";
import CardPreview from "@/components/dashboard/CardPreview.vue";

definePageMeta({
  layout: false,
});

const supabase = useSupabaseClient();

const cards = ref([]);
const loading = ref(true);
const error = ref(null);

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

    console.log(cards.value);
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
  console.log(cards);
});
</script>

<template>
  <NuxtLayout name="dashboard">
    <div
      class="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3"
    >
      <div v-if="loading">Chargement des cartes...</div>

      <template v-else>
        <Card class="sm:col-span-2 md:col-span-3">
          <CardHeader class="pb-3">
            <CardTitle>Create new card !</CardTitle>
            <CardDescription class="max-w-lg text-balance leading-relaxed">
              Introducing Our Dynamic Orders Dashboard for Seamless Management
              and Insightful Analysis.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <NuxtLink to="/dashboard/cards/create">
              <Button>Create new card</Button>
            </NuxtLink>
          </CardFooter>
        </Card>

        <div class="col-span-3 grid lg:grid-cols-3 gap-4">
          <template v-if="cards.length > 0">
            <Card
              v-for="card in cards"
              :key="card.id"
              class="sm:col-span-2 md:col-span-1"
            >
              <CardPreview
                :id="card.id"
                :card-name="card.name"
                :color="card.color"
                :name-preview="card.name"
                :job-preview="card.job"
                :button="`edit`"
              />
            </Card>
          </template>
        </div>
      </template>
    </div>
  </NuxtLayout>
</template>

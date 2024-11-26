<script lang="ts" setup>
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast/use-toast";
import CardPreview from "@/components/dashboard/CardPreview.vue";
const { toast } = useToast();

definePageMeta({
  layout: false,
});

const supabase = useSupabaseClient();

const color = ref("yellow");
const namePreview = ref("John Doe");
const jobPreview = ref("CTO @company");
const cardName = ref("My card");
const route = useRoute();
const id = ref(route.params.id);
const loading = ref(true);

console.log(id);

const handleCardNameChange = (value: string) => {
  cardName.value = value;
};
const handleColorChange = (value: string) => {
  color.value = value;
};
const handleNameChange = (value: string) => {
  namePreview.value = value;
};
const handleJobChange = (value: string) => {
  jobPreview.value = value;
};

const handleUpdateCard = async () => {
  const { data, error } = await supabase
    .from("Cards")
    .update({
      name: cardName.value,
      color: color.value,
      job: jobPreview.value,
      name: namePreview.value,
    })
    .eq("id", id.value);
  if (error) {
    console.error("Error creating card:", error.message);
    return;
  }
  console.log("Card created:", data);
};

const fetchCard = async () => {
  const { data, error } = await supabase
    .from("Cards")
    .select("*")
    .eq("id", id.value)
    .single();

  if (error) {
    toast({
      title: "Erreur",
      description: "Impossible de charger la carte",
      variant: "destructive",
    });
    return;
  }

  cardName.value = data.name;
  color.value = data.color;
  namePreview.value = data.name;
  jobPreview.value = data.job;

  loading.value = false;
};

onMounted(() => {
  fetchCard();
});
</script>

<template>
  <NuxtLayout name="dashboard">
    <div
      class="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3"
    >
      <Card class="sm:col-span-2">
        <CardHeader class="pb-3">
          <CardTitle>Edit card</CardTitle>
        </CardHeader>
        <CardContent class="max-w-lg text-balance leading-relaxed">
          <form>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <Label>Card name</Label>
                <Input
                  v-model="cardName"
                  label="Name"
                  @update:model-value="handleCardNameChange"
                />
              </div>
              <div class="flex flex-col gap-2">
                <Label>Name</Label>
                <Input
                  v-model="namePreview"
                  label="Name"
                  @update:model-value="handleNameChange"
                />
              </div>
              <div class="flex flex-col gap-2">
                <Label>Job</Label>
                <Input
                  v-model="jobPreview"
                  label="Job"
                  @update:model-value="handleJobChange"
                />
              </div>
              <div class="flex flex-col gap-2">
                <Label>Color</Label>
                <Select v-model="color" @update:model-value="handleColorChange">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="yellow"> Yellow </SelectItem>
                      <SelectItem value="green"> Green </SelectItem>
                      <SelectItem value="black"> Black </SelectItem>
                      <SelectItem value="red"> Red </SelectItem>
                      <SelectItem value="blue"> Blue </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Toaster />
          <Button
            @click="
              () => {
                handleUpdateCard();
                toast({
                  description: 'Your card has been updated!',
                });
              }
            "
            >Save</Button
          >
        </CardFooter>
      </Card>
      <div v-if="loading">Chargement des cartes...</div>

      <CardPreview
        v-else
        :card-name="cardName"
        :color="color"
        :name-preview="namePreview"
        :job-preview="jobPreview"
      />
    </div>
  </NuxtLayout>
</template>

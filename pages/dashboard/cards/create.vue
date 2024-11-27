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

const handleCreateCard = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log(user);

  const { data, error } = await supabase.from("Cards").insert({
    name: cardName.value,
    color: color.value,
    job: jobPreview.value,
    name: namePreview.value,
    user_id: user.id,
  });
  if (error) {
    console.error("Error creating card:", error.message);
    return;
  }
  console.log("Card created:", data);
};
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
                <Select @update:model-value="handleColorChange">
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
                handleCreateCard();
                toast({
                  description: 'Your card has been created!',
                });
              }
            "
            >Save</Button
          >
        </CardFooter>
      </Card>
      <CardPreview
        :card-name="cardName"
        :color="color"
        :name-preview="namePreview"
        :job-preview="jobPreview"
      />
    </div>
  </NuxtLayout>
</template>

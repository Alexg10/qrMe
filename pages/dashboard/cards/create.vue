<script lang="ts" setup>
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast/use-toast";

const { toast } = useToast();

definePageMeta({
  layout: false,
});

const supabase = useSupabaseClient();

const color = ref("yellow");
const namePreview = ref("John Doe");
const jobPreview = ref("CTO @company");
const cardName = ref("My card");

const colorOptions = {
  yellow: "#fec76f",
  green: "#4caf50",
  black: "#000000",
  red: "#f44336",
  blue: "#2196f3",
};

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
          <CardTitle>Create new card !</CardTitle>
          <CardDescription class="max-w-lg text-balance leading-relaxed">
            Introducing Our Dynamic Orders Dashboard for Seamless Management and
            Insightful Analysis.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button>Create new card</Button>
        </CardFooter>
      </Card>
      <Card class="overflow-hidden row-span-3">
        <CardHeader class="flex flex-row items-start bg-muted/50">
          <div class="grid gap-0.5">
            <CardTitle class="group flex items-center gap-2 text-lg">
              Card preview
            </CardTitle>
            <CardDescription>{{ cardName }}</CardDescription>
          </div>
        </CardHeader>
        <CardContent class="p-6 text-sm">
          <div class="grid gap-3">
            <div
              :style="{ backgroundColor: colorOptions[color] }"
              class="rounded-md aspect-[9/16] py-10 text-black flex justify-between flex-col transition-all duration-300"
            >
              <div class="flex items-center justify-center">
                <NuxtImg
                  src="/images/qrCode2.png"
                  alt="card background"
                  class="w-1/2 object-cover"
                />
              </div>
              <div class="flex items-center justify-center flex-col">
                <div class="uppercase">{{ namePreview }}</div>
                <div class="uppercase">{{ jobPreview }}</div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter
          class="flex flex-row items-center border-t bg-muted/50 px-6 py-3"
        >
          <Button>Save</Button>
        </CardFooter>
      </Card>
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
                  label="Name"
                  @update:model-value="handleCardNameChange"
                />
              </div>
              <div class="flex flex-col gap-2">
                <Label>Name</Label>
                <Input label="Name" @update:model-value="handleNameChange" />
              </div>
              <div class="flex flex-col gap-2">
                <Label>Job</Label>
                <Input label="Job" @update:model-value="handleJobChange" />
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
    </div>
  </NuxtLayout>
</template>

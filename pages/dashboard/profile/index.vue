<script lang="ts" setup>
import { Link } from "lucide-vue-next";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
const bio = ref("");
const job = ref("");
const mail = ref("");
const phone = ref("");
const instagram = ref("");
const linkedin = ref("");
const facebook = ref("");
const youtube = ref("");

const colorOptions = {
  yellow: "#fec76f",
  green: "#4caf50",
  black: "#000000",
  red: "#f44336",
  blue: "#2196f3",
};

const handleNameChange = (value: string) => {
  namePreview.value = value;
};
const handleJobChange = (value: string) => {
  jobPreview.value = value;
};
const handleBioChange = (value: string) => {
  bio.value = value;
};
const handleMailChange = (value: string) => {
  mail.value = value;
};
const handlePhoneChange = (value: string) => {
  phone.value = value;
};
const handleInstagramChange = (value: string) => {
  instagram.value = value;
};
const handleLinkedinChange = (value: string) => {
  linkedin.value = value;
};
const handleFacebookChange = (value: string) => {
  facebook.value = value;
};
const handleYoutubeChange = (value: string) => {
  youtube.value = value;
};
const handlePinterestChange = (value: string) => {
  pinterest.value = value;
};
const handleTwitchChange = (value: string) => {
  twitch.value = value;
};

const handleEditUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log(user);

  const { data, error } = await supabase
    .from("Users")
    .update({
      name: namePreview.value,
      bio: bio.value,
      job: job.value,
      mail: mail.value,
      phone: phone.value,
      instagram: instagram.value,
      linkedin: linkedin.value,
      facebook: facebook.value,
      youtube: youtube.value,
      pinterest: pinterest.value,
      twitch: twitch.value,
    })
    .eq("id", user.id);
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
          <CardTitle>Edit your profile</CardTitle>
          <CardDescription class="max-w-lg text-balance leading-relaxed">
            Add some information to customize your card
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <Label>Name</Label>
                <Input label="Name" @update:model-value="handleNameChange" />
              </div>
              <div class="flex flex-col gap-2">
                <Label>Bio</Label>
                <Textarea label="Bio" @update:model-value="handleBioChange" />
              </div>
              <div class="flex flex-col gap-2">
                <Label>Job</Label>
                <Input label="Job" @update:model-value="handleJobChange" />
              </div>
              <div class="flex flex-col gap-2">
                <Label>Mail</Label>
                <Input label="Mail" @update:model-value="handleMailChange" />
              </div>
              <div class="flex flex-col gap-2">
                <Label>Phone</Label>
                <Input label="Phone" @update:model-value="handlePhoneChange" />
              </div>
              <h3 class="text-lg font-medium">Socials media</h3>
              <p class="text-sm text-muted-foreground">
                Add your social media links to your card
              </p>
              <div class="flex flex-col gap-2">
                <Label>Instagram</Label>
                <div class="relative w-full items-center">
                  <Input
                    id="instagram"
                    label="Instagram"
                    type="text"
                    class="pl-10"
                    @update:model-value="handleInstagramChange"
                  />
                  <span
                    class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
                  >
                    <Link class="size-4 text-muted-foreground" />
                  </span>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <Label>Linkedin</Label>
                <div class="relative w-full items-center">
                  <Input
                    id="linkedin"
                    label="Linkedin"
                    type="text"
                    class="pl-10"
                    @update:model-value="handleLinkedinChange"
                  />
                  <span
                    class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
                  >
                    <Link class="size-4 text-muted-foreground" />
                  </span>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <Label>Facebook</Label>
                <div class="relative w-full items-center">
                  <Input
                    id="facebook"
                    label="Facebook"
                    type="text"
                    class="pl-10"
                    @update:model-value="handleFacebookChange"
                  />
                  <span
                    class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
                  >
                    <Link class="size-4 text-muted-foreground" />
                  </span>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <Label>Youtube</Label>
                <div class="relative w-full items-center">
                  <Input
                    id="youtube"
                    label="Youtube"
                    type="text"
                    class="pl-10"
                    @update:model-value="handleYoutubeChange"
                  />
                  <span
                    class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
                  >
                    <Link class="size-4 text-muted-foreground" />
                  </span>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <Label>Pinterest</Label>
                <div class="relative w-full items-center">
                  <Input
                    id="pinterest"
                    label="Pinterest"
                    type="text"
                    class="pl-10"
                    @update:model-value="handlePinterestChange"
                  />
                  <span
                    class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
                  >
                    <Link class="size-4 text-muted-foreground" />
                  </span>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <Label>Twitch</Label>
                <div class="relative w-full items-center">
                  <Input
                    id="twitch"
                    label="Twitch"
                    type="text"
                    class="pl-10"
                    @update:model-value="handleTwitchChange"
                  />
                  <span
                    class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
                  >
                    <Link class="size-4 text-muted-foreground" />
                  </span>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button @click="handleEditUser">Save my profile</Button>
        </CardFooter>
      </Card>
      <Card class="overflow-hidden row-span-3">
        <CardHeader class="flex flex-row items-start bg-muted/50">
          <div class="grid gap-0.5">
            <CardTitle class="group flex items-center gap-2 text-lg">
              Profile preview
            </CardTitle>
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
      </Card>
    </div>
  </NuxtLayout>
</template>

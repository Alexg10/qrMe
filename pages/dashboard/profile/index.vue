<script lang="ts" setup>
import { ref, onMounted } from "vue";
import {
  Link,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
  Twitch,
} from "lucide-vue-next";
import { Textarea } from "@/components/ui/textarea";

definePageMeta({
  layout: false,
});

const supabase = useSupabaseClient();

const color = ref("yellow");
const name = ref("");
const bio = ref("");
const job = ref("");
const email = ref("");
const phone = ref("");
const instagram = ref("");
const linkedin = ref("");
const facebook = ref("");
const youtube = ref("");

const fetchUserData = async () => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data: userData, error: fetchError } = await supabase
      .from("Users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (fetchError) throw fetchError;

    if (userData) {
      name.value = userData.name || "";
      job.value = userData.job || "";
      bio.value = userData.bio || "";
      email.value = userData.email || "";
      phone.value = userData.phone || "";
      instagram.value = userData.instagram || "";
      linkedin.value = userData.linkedin || "";
      facebook.value = userData.facebook || "";
      youtube.value = userData.youtube || "";
    }
  } catch (error) {
    console.error("Error in fetchUserData:", error);
  }
};

const colorOptions = {
  yellow: "#fec76f",
  green: "#4caf50",
  black: "#000000",
  red: "#f44336",
  blue: "#2196f3",
};

const handleNameChange = (value: string) => {
  name.value = value;
};
const handleJobChange = (value: string) => {
  job.value = value;
};
const handleBioChange = (value: string) => {
  bio.value = value;
};
const handleEmailChange = (value: string) => {
  email.value = value;
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
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;

  const { error } = await supabase
    .from("Users")
    .update({
      name: name.value,
      bio: bio.value,
      job: job.value,
      email: email.value,
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
  await fetchUserData();
};

onMounted(() => {
  fetchUserData();
});
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
                <Input
                  v-model="name"
                  label="Name"
                  @update:model-value="handleNameChange"
                />
              </div>
              <div class="flex flex-col gap-2">
                <Label>Bio</Label>
                <Textarea
                  v-model="bio"
                  label="Bio"
                  @update:model-value="handleBioChange"
                />
              </div>
              <div class="flex flex-col gap-2">
                <Label>Job</Label>
                <Input
                  v-model="job"
                  label="Job"
                  @update:model-value="handleJobChange"
                />
              </div>
              <div class="flex flex-col gap-2">
                <Label>Email</Label>
                <Input
                  v-model="email"
                  label="Email"
                  @update:model-value="handleEmailChange"
                />
              </div>
              <div class="flex flex-col gap-2">
                <Label>Phone</Label>
                <Input
                  v-model="phone"
                  label="Phone"
                  @update:model-value="handlePhoneChange"
                />
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
                    v-model="instagram"
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
                    v-model="linkedin"
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
                    v-model="facebook"
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
                    v-model="youtube"
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
                    v-model="pinterest"
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
                    v-model="twitch"
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
              class="rounded-md px-8 aspect-[9/16] py-10 text-black flex justify-between flex-col transition-all duration-300"
            >
              <div class="flex justify-center flex-col gap-2">
                <div class="text-2xl font-bold">{{ name }}</div>
                <div class="">{{ job }}</div>
                <div class="">{{ email }}</div>
                <div class="">{{ phone }}</div>
                <div class="flex items-center gap-2">
                  <NuxtLink v-if="instagram" :href="instagram">
                    <Instagram />
                  </NuxtLink>
                  <NuxtLink v-if="linkedin" :href="linkedin">
                    <Linkedin />
                  </NuxtLink>
                  <NuxtLink v-if="facebook" :href="facebook">
                    <Facebook />
                  </NuxtLink>
                  <NuxtLink v-if="youtube" :href="youtube">
                    <Youtube />
                  </NuxtLink>
                  <NuxtLink v-if="pinterest" :href="pinterest"> P </NuxtLink>
                  <NuxtLink v-if="twitch" :href="twitch">
                    <Twitch />
                  </NuxtLink>
                </div>
                <div>
                  <Button variant="outline" class="text-white">
                    Save Card
                  </Button>
                </div>
                <div>
                  <div class="uppercase font-bold">Bio</div>
                  <div class="">{{ bio }}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </NuxtLayout>
</template>

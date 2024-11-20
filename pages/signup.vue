<script setup lang="ts">
import { ref } from "vue";
const supabase = useSupabaseClient();
const email = ref("");
const password = ref("");
const firstName = ref("");
const lastName = ref("");
const successMessage = ref("");

const handleSubmit = async () => {
  const { user, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  });

  if (error) {
    console.error("Error creating user:", error.message);
    return;
  }
};
</script>

<template>
  <div
    class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] lg:h-screen"
  >
    <div class="flex items-center justify-center py-12">
      <div class="mx-auto grid w-[350px] gap-6">
        <div class="grid gap-4">
          <div class="grid gap-2 text-center">
            <h1 class="text-3xl font-bold">Sign Up</h1>
            <p class="text-balance text-muted-foreground">
              Enter your information to create an account
            </p>
          </div>
          <form class="grid gap-4" @submit.prevent="handleSubmit">
            <div class="grid grid-cols-2 gap-4">
              <div class="grid gap-2">
                <Label for="first-name">First name</Label>
                <Input
                  id="first-name"
                  v-model="firstName"
                  placeholder="Max"
                  required
                />
              </div>
              <div class="grid gap-2">
                <Label for="last-name">Last name</Label>
                <Input
                  id="last-name"
                  v-model="lastName"
                  placeholder="Robinson"
                  required
                />
              </div>
            </div>
            <div class="grid gap-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div class="grid gap-2">
              <Label for="password">Password</Label>
              <Input id="password" v-model="password" type="password" />
            </div>
            <Button type="submit" class="w-full"> Create an account </Button>
            <p v-if="successMessage" class="text-green-500 text-center">
              {{ successMessage }}
            </p>
          </form>
          <Button variant="outline" class="w-full">
            Sign up with GitHub
          </Button>
        </div>
        <div class="mt-4 text-center text-sm">
          Already have an account?
          <NuxtLink href="/login" class="underline"> Log in </NuxtLink>
        </div>
      </div>
    </div>
    <div class="hidden bg-muted lg:block">
      <NuxtImg
        fit="cover"
        src="https://images.unsplash.com/photo-1707906799973-0437e0accfab?q=80&w=2187&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Image"
        width="1920"
        height="1080"
        class="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  </div>
</template>

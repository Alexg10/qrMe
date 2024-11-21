<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
const supabase = useSupabaseClient();
const router = useRouter();

const email = ref("");
const password = ref("");

const handleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error) {
    console.error("Error logging in:", error.message);
    // Vous pouvez également afficher un message d'erreur à l'utilisateur ici
  }
  const userLogged = data.user;
  console.log(userLogged);

  if (data.user && data.user.email_confirmed_at) {
    const { data, insertError } = await supabase.from("Users").insert([
      {
        id: userLogged.id,
        email: userLogged.email,
      },
    ]);

    if (insertError) {
      console.error("Error inserting user into database:", insertError.message);
    } else {
      console.log("User created in database:", userLogged);
      router.push("/dashboard");
    }
  } else {
    console.log("User has not confirmed their email yet.");
  }
};
</script>

<template>
  <div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
    <div class="flex items-center justify-center py-12">
      <div class="mx-auto grid w-[350px] gap-6">
        <div class="grid gap-2 text-center">
          <h1 class="text-3xl font-bold">Login</h1>
          <p class="text-balance text-muted-foreground">
            Enter your email and password to login
          </p>
        </div>
        <form class="grid gap-4" @submit.prevent="handleLogin">
          <div class="grid gap-4">
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
              <Input
                id="password"
                v-model="password"
                type="password"
                required
              />
            </div>
            <Button type="submit" class="w-full"> Login </Button>
          </div>
        </form>
        <Separator />
        <Button variant="outline" class="w-full"> Login with Google </Button>
        <div class="mt-4 text-center text-sm">
          Don't have an account?
          <NuxtLink href="/signup" class="underline"> Sign up </NuxtLink>
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

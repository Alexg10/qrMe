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
        <Input id="password" v-model="password" type="password" required />
      </div>
      <Button type="submit" class="w-full"> Login </Button>
    </div>
  </form>
</template>

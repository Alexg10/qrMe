<script setup lang="ts">
import { ref } from "vue";
const supabase = useSupabaseClient();
const email = ref("");
const password = ref("");
const firstName = ref("");
const lastName = ref("");
const successMessage = ref("");
const errorMessage = ref("");

const handleSubmit = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        first_name: firstName.value,
        last_name: lastName.value,
      },
    },
  });

  if (error) {
    console.error("Error creating user:", error.message);
    errorMessage.value = "erro: " + error.message;
    return;
  } else {
    console.log("User created:", data);
    successMessage.value =
      "User created successfully, please check your email to validate";
  }
};
</script>

<template>
  <form class="grid gap-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="grid gap-2">
        <Label for="first-name">First name</Label>
        <Input id="first-name" v-model="firstName" placeholder="Max" required />
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
    <p v-if="errorMessage" class="text-red-500 text-center">
      {{ errorMessage }}
    </p>
  </form>
</template>

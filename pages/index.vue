<script setup lang="ts">
import { CreditCard } from "lucide-vue-next";
</script>

<template>
  <section class="py-32">
    <div class="container text-center">
      <div class="mx-auto flex max-w-screen-lg flex-col gap-6 mb-10">
        <h1 class="text-3xl font-extrabold lg:text-6xl">
          Your Digital Business Card Hub
        </h1>
        <p class="text-balance text-muted-foreground lg:text-lg">
          Effortlessly create, share, and manage your digital business cards
          with QR codes. Scan to connect, save profiles to your wallet, and
          build your professional network—all in one place.
        </p>
      </div>
      <NuxtLink to="/login" size="lg" class="">
        <Button
          >Create your card now
          <CreditCard />
        </Button>
      </NuxtLink>
      <div
        class="mx-auto mt-10 flex w-fit flex-col items-center gap-4 sm:flex-row"
      >
        <StarRating :rating="5" :total-reviews="200" :size="5" />
      </div>
    </div>
  </section>
</template>

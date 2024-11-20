<template>
  <section class="py-32">
    <div class="container text-center">
      <div class="mx-auto flex max-w-screen-lg flex-col gap-6">
        <h1 class="text-3xl font-extrabold lg:text-6xl">
          A Collection of Components Built With Shadcn & Tailwind
        </h1>
        <p class="text-balance text-muted-foreground lg:text-lg">
          Finely crafted components built with React, Tailwind and Shadcn UI.
          Developers can copy and paste these blocks directly into their
          project.
        </p>
      </div>
      <NuxtLink to="/login" size="lg" class="mt-10"> Try it </NuxtLink>
      <div
        class="mx-auto mt-10 flex w-fit flex-col items-center gap-4 sm:flex-row"
      >
        <div>
          <div class="flex items-center gap-1">
            <Star class="size-5 fill-yellow-400 text-yellow-400" />
            <Star class="size-5 fill-yellow-400 text-yellow-400" />
            <Star class="size-5 fill-yellow-400 text-yellow-400" />
            <Star class="size-5 fill-yellow-400 text-yellow-400" />
            <Star class="size-5 fill-yellow-400 text-yellow-400" />
            <span class="font-semibold">5.0</span>
          </div>
          <p class="text-left font-medium text-muted-foreground">
            from 200+ reviews
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Star } from "lucide-vue-next";
</script>

<script setup lang="ts">
import { Toaster } from "@/components/ui/toast";
</script>

<template>
  <div>
    <NuxtPwaManifest />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster />
  </div>
</template>

<!-- components/form/FormHeader.vue -->
<script setup lang="ts">
interface Props {
  title: string;
  description?: string;
}

defineProps<Props>();
</script>

<template>
  <div class="grid gap-2 text-center">
    <h1 class="text-3xl font-bold">{{ title }}</h1>
    <p v-if="description" class="text-balance text-muted-foreground">
      {{ description }}
    </p>
  </div>
</template>

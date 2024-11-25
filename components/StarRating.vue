<!-- components/StarRating.vue -->
<script setup lang="ts">
import { Star } from "lucide-vue-next";

interface Props {
  rating?: number;
  totalReviews?: number;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  rating: 5.0,
  totalReviews: 200,
  size: 5,
});
</script>

<template>
  <div>
    <div class="flex items-center gap-1">
      <Star
        v-for="index in 5"
        :key="index"
        :class="`size-${props.size}  ${
          index <= props.rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-yellow-400'
        }`"
      />
      <span class="font-semibold">{{ props.rating.toFixed(1) }}</span>
    </div>
    <p class="text-left font-medium text-muted-foreground">
      from {{ props.totalReviews }}+ reviews
    </p>
  </div>
</template>

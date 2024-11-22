<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
const config = useRuntimeConfig();
const baseUrl = config.public.baseURL;
const router = useRouter();

const breadcrumbItems = ref([]);

const buildUrl = (items: string[], currentIndex: number) => {
  return baseUrl + items.slice(0, currentIndex + 1).join("/");
};

onMounted(() => {
  breadcrumbItems.value = router.currentRoute.value.path.split("/");

  console.log(breadcrumbItems.value);
});
</script>

<template>
  <Breadcrumb class="hidden md:flex">
    <BreadcrumbList>
      <BreadcrumbItem v-for="(item, index) in breadcrumbItems" :key="item">
        <template v-if="index !== breadcrumbItems.length - 1">
          <BreadcrumbLink as-child class="capitalize">
            <NuxtLink :to="buildUrl(breadcrumbItems, index)">{{
              item
            }}</NuxtLink>
          </BreadcrumbLink>
        </template>
        <template v-else>
          <div class="capitalize text-white">{{ item }}</div>
        </template>
        <BreadcrumbSeparator
          v-if="index !== 0 && index !== breadcrumbItems.length - 1"
        />
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</template>

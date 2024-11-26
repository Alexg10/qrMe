<script setup lang="ts">
const props = defineProps<{
  id: string;
  cardName: string;
  color: string;
  namePreview: string;
  jobPreview: string;
  button?: string;
}>();

const colorOptions = {
  yellow: "#fec76f",
  green: "#4caf50",
  black: "#000000",
  red: "#f44336",
  blue: "#2196f3",
};
</script>

<template>
  <Card class="overflow-hidden row-span-3">
    <CardHeader class="flex flex-row items-start bg-muted/50">
      <div class="grid gap-0.5">
        <CardTitle class="group flex items-center gap-2 text-lg">
          Card preview
        </CardTitle>
        <CardDescription>{{ props.cardName }}</CardDescription>
      </div>
    </CardHeader>
    <CardContent class="p-6 text-sm">
      <div class="grid gap-3">
        <div
          :style="{ backgroundColor: colorOptions[color] }"
          class="rounded-md aspect-[9/16] py-10 text-black flex justify-between flex-col transition-all duration-300"
        >
          <div class="flex items-center justify-center">
            <NuxtImg
              src="/images/qrCode2.png"
              alt="card background"
              class="w-1/2 object-cover"
            />
          </div>
          <div class="flex items-center justify-center flex-col">
            <div class="uppercase">{{ props.namePreview }}</div>
            <div class="uppercase">{{ props.jobPreview }}</div>
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter
      class="flex flex-row items-center border-t bg-muted/50 px-6 py-3"
    >
      <NuxtLink
        v-if="props.button === 'edit'"
        :to="`/dashboard/cards/edit/${props.id}`"
      >
        <Button>Edit</Button>
      </NuxtLink>
      <Button v-else>Save</Button>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts"></script>

<template>
  <Card class="sm:col-span-2">
    <CardHeader class="pb-3">
      <CardTitle>Let's create your first card !</CardTitle>
      <CardDescription class="max-w-lg text-balance leading-relaxed">
        Your card will be used to generate your QR code. You can edit it later.
      </CardDescription>
    </CardHeader>
    <CardFooter>
      <NuxtLink to="/dashboard/cards/create">
        <Button>Create new card</Button>
      </NuxtLink>
    </CardFooter>
  </Card>
</template>

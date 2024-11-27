<script setup lang="ts"></script>

<template>
  <Card class="sm:col-span-2">
    <CardHeader class="pb-3">
      <CardTitle>Welcome !</CardTitle>
      <CardDescription class="max-w-lg text-balance leading-relaxed">
        Let's start by creating your profile ! Everyone want to know who you are
        !
      </CardDescription>
    </CardHeader>
    <CardFooter>
      <NuxtLink to="/dashboard/profile">
        <Button>Edit my profile</Button>
      </NuxtLink>
    </CardFooter>
  </Card>
</template>

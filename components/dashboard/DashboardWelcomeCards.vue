<script setup lang="ts"></script>

<template>
  <Card class="sm:col-span-2">
    <CardHeader class="pb-3">
      <CardTitle>Welcome !</CardTitle>
      <CardDescription class="max-w-lg text-balance leading-relaxed">
        Introducing Our Dynamic Orders Dashboard for Seamless Management and
        Insightful Analysis.
      </CardDescription>
    </CardHeader>
    <CardFooter>
      <NuxtLink to="/dashboard/profile">
        <Button>Edit my profile</Button>
      </NuxtLink>
    </CardFooter>
  </Card>
</template>

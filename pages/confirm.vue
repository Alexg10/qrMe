<script setup lang="ts"></script>

<template>
  <div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 lg:h-screen">
    <div class="flex items-center justify-center">
      <div class="mx-auto grid w-[450px] gap-6">
        <div class="grid gap-2 text-center">
          <h1 class="text-3xl font-bold">Confirmed</h1>
          <p class="text-balance text-muted-foreground">
            Your account has been confirmed. You can now login.
          </p>

          <NuxtLink to="/login" class="w-full bg-[white] text-black">
            <Button class="w-full"> Login </Button>
          </NuxtLink>
        </div>
      </div>
    </div>
    <div class="hidden bg-muted lg:block h-screen overflow-hidden">
      <NuxtImg
        fit="cover"
        src="https://images.unsplash.com/photo-1707906799973-0437e0accfab?q=80&w=2187&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Image"
        class="h-screen w-full object-cover"
      />
    </div>
  </div>
</template>

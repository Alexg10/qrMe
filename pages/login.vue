<script setup lang="ts">
import FormHeader from "@/components/form/FormHeader.vue";
import LoginForm from "@/components/form/LoginForm.vue";
</script>

<template>
  <div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
    <div class="flex items-center justify-center py-12">
      <div class="mx-auto grid w-[350px] gap-6">
        <FormHeader
          title="Login"
          description="Enter your email and password to login"
        />
        <LoginForm />
        <Separator />
        <Button variant="outline" class="w-full"> Login with Google </Button>
        <div class="mt-4 text-center text-sm">
          Don't have an account?
          <NuxtLink href="/signup" class="underline"> Sign up </NuxtLink>
        </div>
      </div>
    </div>
    <div class="hidden bg-muted lg:block">
      <NuxtImg
        fit="cover"
        src="https://images.unsplash.com/photo-1707906799973-0437e0accfab?q=80&w=2187&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Image"
        width="1920"
        height="1080"
        class="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  </div>
</template>

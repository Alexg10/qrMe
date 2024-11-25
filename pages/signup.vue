<script setup lang="ts">
import SignupForm from "@/components/form/SignupForm.vue";
</script>

<template>
  <div
    class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] lg:h-screen"
  >
    <div class="flex items-center justify-center py-12">
      <div class="mx-auto grid w-[350px] gap-6">
        <div class="grid gap-4">
          <div class="grid gap-2 text-center">
            <FormHeader
              title="Sign Up"
              description="Enter your information to create an account"
            />
          </div>
          <SignupForm />
          <Separator />
          <Button variant="outline" class="w-full">
            Sign up with Google
          </Button>
        </div>
        <div class="mt-4 text-center text-sm">
          Already have an account?
          <NuxtLink href="/login" class="underline"> Log in </NuxtLink>
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

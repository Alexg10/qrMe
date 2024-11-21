<script setup lang="ts">
import { Copy, CreditCard, MoreVertical, Truck } from "lucide-vue-next";
import DashboardGraph from "@/components/DashboardGraph.vue";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

definePageMeta({
  layout: false,
});

definePageMeta({
  layout: false,
});
</script>

<template>
  <NuxtLayout name="dashboard">
    <div
      class="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3"
    >
      <div class="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <div
          class="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
        >
          <Card class="sm:col-span-2">
            <CardHeader class="pb-3">
              <CardTitle>Welcome !</CardTitle>
              <CardDescription class="max-w-lg text-balance leading-relaxed">
                Introducing Our Dynamic Orders Dashboard for Seamless Management
                and Insightful Analysis.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <NuxtLink to="/dashboard/cards/create">
                <Button>Create new card</Button>
              </NuxtLink>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardDescription>This Week</CardDescription>
              <CardTitle class="text-4xl"> $1329 </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-xs text-muted-foreground">
                +25% from last week
              </div>
            </CardContent>
            <CardFooter>
              <Progress :model-value="25" aria-label="25% increase" />
            </CardFooter>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardDescription>This Month</CardDescription>
              <CardTitle class="text-3xl"> $5,329 </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-xs text-muted-foreground">
                +10% from last month
              </div>
            </CardContent>
            <CardFooter>
              <Progress :model-value="12" aria-label="12% increase" />
            </CardFooter>
          </Card>
        </div>
        <Card>
          <CardHeader class="px-7">
            <CardTitle>My stats</CardTitle>
            <CardDescription> Recent stats from your cards. </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardGraph />
          </CardContent>
        </Card>
      </div>
      <div>
        <Card class="overflow-hidden">
          <CardHeader class="flex flex-row items-start bg-muted/50">
            <div class="grid gap-0.5">
              <CardTitle class="group flex items-center gap-2 text-lg">
                Order ID: Oe31b70H
                <Button
                  size="icon"
                  variant="outline"
                  class="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Copy class="h-3 w-3" />
                  <span class="sr-only">Copy Order ID</span>
                </Button>
              </CardTitle>
              <CardDescription>Date: November 23, 2023</CardDescription>
            </div>
            <div class="ml-auto flex items-center gap-1">
              <Button size="sm" variant="outline" class="h-8 gap-1">
                <Truck class="h-3.5 w-3.5" />
                <span class="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                  Track Order
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button size="icon" variant="outline" class="h-8 w-8">
                    <MoreVertical class="h-3.5 w-3.5" />
                    <span class="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Export</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Trash</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent class="p-6 text-sm">
            <div class="grid gap-3">
              <div class="font-semibold">Order Details</div>
              <ul class="grid gap-3">
                <li class="flex items-center justify-between">
                  <span class="text-muted-foreground">
                    Glimmer Lamps x <span>2</span>
                  </span>
                  <span>$250.00</span>
                </li>
                <li class="flex items-center justify-between">
                  <span class="text-muted-foreground">
                    Aqua Filters x <span>1</span>
                  </span>
                  <span>$49.00</span>
                </li>
              </ul>
              <Separator class="my-2" />
              <ul class="grid gap-3">
                <li class="flex items-center justify-between">
                  <span class="text-muted-foreground">Subtotal</span>
                  <span>$299.00</span>
                </li>
                <li class="flex items-center justify-between">
                  <span class="text-muted-foreground">Shipping</span>
                  <span>$5.00</span>
                </li>
                <li class="flex items-center justify-between">
                  <span class="text-muted-foreground">Tax</span>
                  <span>$25.00</span>
                </li>
                <li class="flex items-center justify-between font-semibold">
                  <span class="text-muted-foreground">Total</span>
                  <span>$329.00</span>
                </li>
              </ul>
            </div>
            <Separator class="my-4" />
            <div class="grid grid-cols-2 gap-4">
              <div class="grid gap-3">
                <div class="font-semibold">Shipping Information</div>
                <address class="grid gap-0.5 not-italic text-muted-foreground">
                  <span>Liam Johnson</span>
                  <span>1234 Main St.</span>
                  <span>Anytown, CA 12345</span>
                </address>
              </div>
              <div class="grid auto-rows-max gap-3">
                <div class="font-semibold">Billing Information</div>
                <div class="text-muted-foreground">
                  Same as shipping address
                </div>
              </div>
            </div>
            <Separator class="my-4" />
            <div class="grid gap-3">
              <div class="font-semibold">Customer Information</div>
              <dl class="grid gap-3">
                <div class="flex items-center justify-between">
                  <dt class="text-muted-foreground">Customer</dt>
                  <dd>Liam Johnson</dd>
                </div>
                <div class="flex items-center justify-between">
                  <dt class="text-muted-foreground">Email</dt>
                  <dd>
                    <a href="mailto:">liam@acme.com</a>
                  </dd>
                </div>
                <div class="flex items-center justify-between">
                  <dt class="text-muted-foreground">Phone</dt>
                  <dd>
                    <a href="tel:">+1 234 567 890</a>
                  </dd>
                </div>
              </dl>
            </div>
            <Separator class="my-4" />
            <div class="grid gap-3">
              <div class="font-semibold">Payment Information</div>
              <dl class="grid gap-3">
                <div class="flex items-center justify-between">
                  <dt class="flex items-center gap-1 text-muted-foreground">
                    <CreditCard class="h-4 w-4" />
                    Visa
                  </dt>
                  <dd>**** **** **** 4532</dd>
                </div>
              </dl>
            </div>
          </CardContent>
          <CardFooter
            class="flex flex-row items-center border-t bg-muted/50 px-6 py-3"
          >
            Card footer
          </CardFooter>
        </Card>
      </div>
    </div>
  </NuxtLayout>
</template>

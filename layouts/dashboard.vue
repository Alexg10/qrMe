<script setup lang="ts">
import {
  CircleUser,
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  Settings,
  ShoppingCart,
  WalletCards,
  CreditCard,
  Users2,
} from "lucide-vue-next";
import { Icon } from "@iconify/vue";

import Breadcrumb from "@/components/dashboard/Breadcrumb.vue";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const router = useRouter();
const colorMode = useColorMode();
const supabase = useSupabaseClient();
const config = useRuntimeConfig();
const baseUrl = config.public.baseURL;

onMounted(() => {
  console.log(baseUrl);
  console.log(router.currentRoute.value.path);
});

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push("/");
};
</script>

<template>
  <div class="flex min-h-screen w-full flex-col bg-muted/40">
    <aside
      class="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex"
    >
      <nav class="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger as-child>
            <NuxtLink
              to="/dashboard"
              :class="
                router.currentRoute.value.path === '/dashboard'
                  ? 'bg-primary text-primary-foreground hover:text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              "
              class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Home class="h-5 w-5" />
              <span class="sr-only">Dashboard</span>
            </NuxtLink>
          </TooltipTrigger>
          <TooltipContent side="right"> Dashboard </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger as-child>
            <NuxtLink
              to="/dashboard/cards/create"
              :class="
                router.currentRoute.value.path === '/dashboard/cards/create' ||
                router.currentRoute.value.path === '/dashboard/cards'
                  ? 'bg-primary text-primary-foreground hover:text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              "
              class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 hover:bg-accent"
            >
              <CreditCard class="h-5 w-5" />
              <span class="sr-only">Cards</span>
            </NuxtLink>
          </TooltipTrigger>
          <TooltipContent side="right">Cards</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger as-child>
            <NuxtLink
              to="/dashboard/wallet"
              :class="
                router.currentRoute.value.path === '/dashboard/wallet'
                  ? 'bg-primary text-primary-foreground hover:text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              "
              class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <WalletCards class="h-5 w-5" />
              <span class="sr-only">Wallet</span>
            </NuxtLink>
          </TooltipTrigger>
          <TooltipContent side="right"> Wallet </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger as-child>
            <NuxtLink
              to="/dashboard/profile"
              :class="
                router.currentRoute.value.path === '/dashboard/profile'
                  ? 'bg-primary text-primary-foreground hover:text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              "
              class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Users2 class="h-5 w-5" />
              <span class="sr-only">Profil</span>
            </NuxtLink>
          </TooltipTrigger>
          <TooltipContent side="right"> Profil </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger as-child>
            <NuxtLink
              to="/dashboard/analytics"
              :class="
                router.currentRoute.value.path === '/dashboard/analytics'
                  ? 'bg-primary text-primary-foreground hover:text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              "
              class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <LineChart class="h-5 w-5" />
              <span class="sr-only">Analytics</span>
            </NuxtLink>
          </TooltipTrigger>
          <TooltipContent side="right"> Analytics </TooltipContent>
        </Tooltip>
      </nav>
      <nav class="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger as-child>
            <a
              href="#"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Settings class="h-5 w-5" />
              <span class="sr-only">Settings</span>
            </a>
          </TooltipTrigger>
          <TooltipContent side="right"> Settings </TooltipContent>
        </Tooltip>
      </nav>
    </aside>
    <div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
      <header
        class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
      >
        <Sheet>
          <SheetTrigger as-child>
            <Button size="icon" variant="outline" class="sm:hidden">
              <PanelLeft class="h-5 w-5" />
              <span class="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" class="sm:max-w-xs">
            <nav class="grid gap-6 text-lg font-medium">
              <a
                href="#"
                class="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <Package2
                  class="h-5 w-5 transition-all group-hover:scale-110"
                />
                <span class="sr-only">Acme Inc</span>
              </a>
              <a
                href="#"
                class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Home class="h-5 w-5" />
                Dashboard
              </a>
              <a
                href="#"
                class="flex items-center gap-4 px-2.5 text-foreground"
              >
                <ShoppingCart class="h-5 w-5" />
                Orders
              </a>
              <a
                href="#"
                class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Package class="h-5 w-5" />
                Products
              </a>
              <a
                href="#"
                class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Users2 class="h-5 w-5" />
                Customers
              </a>
              <a
                href="#"
                class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <LineChart class="h-5 w-5" />
                Settings
              </a>
            </nav>
          </SheetContent>
        </Sheet>
        <div
          class="flex items-center gap-4 lg:justify-between w-full justify-end"
        >
          <Breadcrumb />
          <div class="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline">
                  <Icon
                    icon="radix-icons:moon"
                    class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                  />
                  <Icon
                    icon="radix-icons:sun"
                    class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                  />
                  <span class="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="colorMode.preference = 'light'">
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem @click="colorMode.preference = 'dark'">
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem @click="colorMode.preference = 'system'">
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="secondary" size="icon" class="rounded-full">
                  <CircleUser class="h-5 w-5" />
                  <span class="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="handleLogout"
                  >Logout</DropdownMenuItem
                >
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main class="p-4 sm:px-6 sm:py-0">
        <slot />
      </main>
    </div>
  </div>
</template>

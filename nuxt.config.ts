// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    "@nuxt/image",
    "@nuxtjs/supabase",
  ],
  runtimeConfig: {
    public: {
      baseURL: process.env.BASE_URL || "http://localhost:3000",
    },
  },
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  compatibilityDate: "2024-04-03",
  colorMode: {
    classSuffix: "",
    preference: "system",
    fallback: "dark",
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  eslint: {
    config: {
      stylistic: false,
    },
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },
  supabase: {
    redirect: false,
  },
});

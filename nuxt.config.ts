// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    "@nuxt/image",
    "@nuxtjs/supabase",
    "@vite-pwa/nuxt",
  ],
  runtimeConfig: {
    public: {
      // Domaine encodé dans les QR. Vide = le domaine courant (pratique pour les previews Vercel).
      baseURL: process.env.BASE_URL || "",
    },
  },
  app: {
    head: {
      title: "qrMe",
      htmlAttrs: { lang: "fr" },
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
        { name: "theme-color", content: "#0d0d0b" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/icons/icon.svg" },
        { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..900&family=IBM+Plex+Mono:wght@400;500&display=swap",
        },
      ],
    },
  },
  devtools: { enabled: true },
  vite: {
    server: {
      // Autorise l'accès au serveur de dev via un tunnel HTTPS (test sur téléphone).
      allowedHosts: [".ngrok-free.app", ".ngrok-free.dev", ".ngrok.app", ".ngrok.io", ".trycloudflare.com"],
    },
  },
  css: ["~/assets/css/main.css"],
  compatibilityDate: "2024-04-03",
  colorMode: {
    classSuffix: "",
    preference: "dark",
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
    prefix: "",
    componentDir: "./components/ui",
  },
  supabase: {
    // Seules les pages du dashboard demandent un compte ; /c/:slug reste public.
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      include: ["/dashboard(/*)?"],
      exclude: [],
      saveRedirectToCookie: true,
    },
  },
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "qrMe",
      short_name: "qrMe",
      description: "Tes cartes de visite à QR code, et celles que tu collectionnes.",
      lang: "fr",
      start_url: "/dashboard",
      scope: "/",
      display: "standalone",
      orientation: "portrait",
      background_color: "#0d0d0b",
      theme_color: "#0d0d0b",
      icons: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    workbox: {
      // Rendu serveur : pas de page de repli précachée, on garde la dernière version de chaque page.
      navigateFallback: null,
      globPatterns: ["**/*.{js,css,svg,png,woff2}"],
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.mode === "navigate",
          handler: "NetworkFirst",
          options: { cacheName: "qrme-pages", networkTimeoutSeconds: 3 },
        },
        {
          urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
          handler: "CacheFirst",
          options: { cacheName: "qrme-fonts", expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
        },
      ],
    },
    devOptions: { enabled: false },
  },
});

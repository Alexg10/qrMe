// Google Analytics 4 (gtag.js). Inactif tant que GA_ID n'est pas défini.
export default defineNuxtPlugin(() => {
  const id = useRuntimeConfig().public.gaId as string;
  if (!id) return;

  const w = window as unknown as { dataLayer: unknown[]; gtag: (...args: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // gtag.js attend l'objet `arguments` tel quel, pas un tableau.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
  w.gtag("js", new Date());
  // Page vues envoyées à la main : la navigation est côté client (SPA).
  w.gtag("config", id, { send_page_view: false });

  useHead({ script: [{ src: `https://www.googletagmanager.com/gtag/js?id=${id}`, async: true }] });

  const router = useRouter();
  const sendPageView = () =>
    w.gtag("event", "page_view", {
      page_path: router.currentRoute.value.fullPath,
      page_location: window.location.href,
      page_title: document.title,
    });

  router.afterEach((to, from) => {
    // Ignore les changements de query seuls (ex. ?carte= qui ouvre la fiche en modale).
    if (from.name && to.path === from.path) return;
    // Attend que le titre de la nouvelle page soit appliqué.
    nextTick(() => setTimeout(sendPageView, 0));
  });
  sendPageView();
});

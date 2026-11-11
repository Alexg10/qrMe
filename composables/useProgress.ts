let lastLoad = 0;

/** Ma progression (échanges et niveau). Le niveau suit le meilleur score atteint. */
export function useProgress() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const xp = useState("progress-xp", () => 0);
  const best = useState("progress-best", () => 0);
  const loaded = useState("progress-loaded", () => false);

  async function load(force = false) {
    if (!force && loaded.value && Date.now() - lastLoad < 15_000) return;
    lastLoad = Date.now();
    const { data, error } = await supabase.rpc("my_progress");
    if (error) throw new Error(error.message);
    const row = ((data as { xp: number; best_xp: number }[]) || [])[0];
    if (!row) return;
    xp.value = row.xp;
    best.value = row.best_xp;
    loaded.value = true;
  }

  const level = computed(() => levelFor(best.value));
  const nextAt = computed(() => (level.value < MAX_LEVEL ? xpFor(level.value + 1) : null));
  /** Part du chemin parcouru vers le niveau suivant, de 0 à 1. */
  const ratio = computed(() => {
    if (nextAt.value == null) return 1;
    const from = xpFor(level.value);
    return Math.min(1, Math.max(0, (best.value - from) / (nextAt.value - from)));
  });
  const isUnlocked = (lvl: number) => level.value >= lvl;

  /* Dernier niveau dont on a montré la fenêtre « débloqué », par compte. */
  const seenKey = () => `qrme-level-seen:${user.value?.id ?? ""}`;
  function seenLevel() {
    try {
      return Number(localStorage.getItem(seenKey())) || 1;
    } catch {
      return level.value;
    }
  }
  function markSeen(lvl = level.value) {
    try {
      localStorage.setItem(seenKey(), String(lvl));
    } catch {
      /* rien */
    }
  }

  return { xp, best, loaded, level, nextAt, ratio, isUnlocked, load, seenLevel, markSeen };
}

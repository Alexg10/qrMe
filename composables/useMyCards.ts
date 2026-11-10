const CACHE_KEY = "qrme-my-cards";

/** Mes cartes, partagées entre les pages. Une copie locale permet d'ouvrir SHOWme hors connexion. */
export function useMyCards() {
  const supabase = useSupabaseClient();
  const cards = useState<Card[]>("my-cards", () => []);
  const loaded = useState("my-cards-loaded", () => false);
  const error = ref<string | null>(null);

  function readCache() {
    if (!import.meta.client || cards.value.length) return;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) cards.value = JSON.parse(raw);
    } catch {
      /* stockage indisponible : on attend le réseau */
    }
  }
  function writeCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cards.value));
    } catch {
      /* rien */
    }
  }

  async function load() {
    readCache();
    const { data, error: e } = await supabase.from("cards").select("*").order("created_at");
    if (e) {
      error.value = e.message;
      return;
    }
    cards.value = (data as Card[]) || [];
    loaded.value = true;
    writeCache();
  }

  async function save(draft: CardDraft, id?: string) {
    const payload = {
      ...draft,
      tags: draft.tags.slice(0, MAX_TAGS),
      description: draft.description ? draft.description.slice(0, 140) : draft.description,
    };
    const query = id
      ? supabase.from("cards").update(payload as never).eq("id", id).select().single()
      : supabase.from("cards").insert(payload as never).select().single();
    const { data, error: e } = await query;
    if (e) throw new Error(e.message);
    const saved = data as Card;
    const i = cards.value.findIndex((c) => c.id === saved.id);
    if (i >= 0) cards.value.splice(i, 1, saved);
    else cards.value.push(saved);
    writeCache();
    return saved;
  }

  async function remove(id: string) {
    const { error: e } = await supabase.from("cards").delete().eq("id", id);
    if (e) throw new Error(e.message);
    cards.value = cards.value.filter((c) => c.id !== id);
    writeCache();
  }

  /** Désactiver une carte coupe son QR sans la supprimer. */
  async function setActive(id: string, active: boolean) {
    const { data, error: e } = await supabase.from("cards").update({ is_active: active } as never).eq("id", id).select().single();
    if (e) throw new Error(e.message);
    const i = cards.value.findIndex((c) => c.id === id);
    if (i >= 0) cards.value.splice(i, 1, data as Card);
    writeCache();
  }

  return { cards, loaded, error, load, save, remove, setActive };
}

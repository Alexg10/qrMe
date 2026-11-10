const CACHE_KEY = "qrme-my-cards";

/** Mes cartes, partagées entre les pages. Une copie locale permet d'ouvrir SHOWme hors connexion. */
export function useMyCards() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const cards = useState<Card[]>("my-cards", () => []);
  const loaded = useState("my-cards-loaded", () => false);
  const error = ref<string | null>(null);

  /* Le cache est lié au compte : on n'affiche jamais les cartes d'un autre compte ou d'une ancienne base. */
  function readCache() {
    if (!import.meta.client || cards.value.length) return;
    try {
      const raw = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (raw && !Array.isArray(raw) && raw.uid && raw.uid === user.value?.id) cards.value = raw.cards;
    } catch {
      /* stockage indisponible : on attend le réseau */
    }
  }
  function writeCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ uid: user.value?.id, cards: cards.value }));
    } catch {
      /* rien */
    }
  }

  async function load() {
    readCache();
    // Les cartes actives des autres sont lisibles (RLS publique pour les QR) : on filtre explicitement sur le propriétaire.
    const uid = user.value?.id ?? (await supabase.auth.getUser()).data.user?.id;
    if (!uid) {
      error.value = "Pas de session";
      return;
    }
    const { data, error: e } = await supabase.from("cards").select("*").eq("user_id", uid).order("created_at");
    if (e) {
      error.value = e.message;
      return;
    }
    cards.value = (data as Card[]) || [];
    loaded.value = true;
    writeCache();
  }

  /** Une modification n'a touché aucune ligne : session expirée, ou carte qui n'existe plus en base. */
  async function noRowError(id: string) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return new Error("Ta session a expiré : reconnecte-toi pour enregistrer.");
    cards.value = cards.value.filter((c) => c.id !== id);
    writeCache();
    load();
    return new Error("Cette carte n'existe plus (base recréée ou carte supprimée ailleurs). Crée-en une nouvelle.");
  }

  async function save(draft: CardDraft, id?: string) {
    const payload = {
      ...draft,
      tags: draft.tags.slice(0, MAX_TAGS),
      description: draft.description ? draft.description.slice(0, 140) : draft.description,
    };
    const query = id
      ? supabase.from("cards").update(payload as never).eq("id", id).select().maybeSingle()
      : supabase.from("cards").insert(payload as never).select().single();
    const { data, error: e } = await query;
    if (e) throw new Error(e.message);
    if (!data) throw await noRowError(id!);
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
    const { data, error: e } = await supabase.from("cards").update({ is_active: active } as never).eq("id", id).select().maybeSingle();
    if (e) throw new Error(e.message);
    if (!data) throw await noRowError(id);
    const i = cards.value.findIndex((c) => c.id === id);
    if (i >= 0) cards.value.splice(i, 1, data as Card);
    writeCache();
  }

  return { cards, loaded, error, load, save, remove, setActive };
}

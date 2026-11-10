/** Ma collection : les cartes des autres que j'ai gardées. */
export function useCollection() {
  const supabase = useSupabaseClient();
  const entries = useState<CollectionEntry[]>("collection", () => []);
  const loaded = useState("collection-loaded", () => false);

  async function load() {
    const { data, error } = await supabase
      .from("collection")
      .select("id, card_id, note, is_favorite, source, created_at, card:cards(*)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    // Une carte supprimée par son propriétaire disparaît (cascade) ; une carte désactivée revient à null.
    entries.value = ((data as unknown as CollectionEntry[]) || []).filter((e) => e.card);
    loaded.value = true;
  }

  async function add(cardId: string, source: CollectionEntry["source"] = "scan") {
    const { data, error } = await supabase
      .from("collection")
      .insert({ card_id: cardId, source } as never)
      .select("id, card_id, note, is_favorite, source, created_at, card:cards(*)")
      .single();
    if (error) {
      if (error.code === "23505") return findByCard(cardId) ?? (await load(), findByCard(cardId));
      throw new Error(error.message);
    }
    const entry = data as unknown as CollectionEntry;
    entries.value = [entry, ...entries.value];
    return entry;
  }

  const findByCard = (cardId: string) => entries.value.find((e) => e.card_id === cardId);

  async function update(id: string, patch: Partial<Pick<CollectionEntry, "note" | "is_favorite">>) {
    const e = entries.value.find((x) => x.id === id);
    const before = e ? { ...e } : null;
    if (e) Object.assign(e, patch);
    const { error } = await supabase.from("collection").update(patch as never).eq("id", id);
    if (error) {
      if (e && before) Object.assign(e, before);
      throw new Error(error.message);
    }
  }

  async function remove(id: string) {
    const { error } = await supabase.from("collection").delete().eq("id", id);
    if (error) throw new Error(error.message);
    entries.value = entries.value.filter((e) => e.id !== id);
  }

  async function sendBack(myCardId: string, theirCardId: string) {
    const { error } = await supabase.rpc("send_card_back", { p_my_card: myCardId, p_their_card: theirCardId } as never);
    if (error) throw new Error(error.message);
  }

  /** Charge une carte publique à partir de son slug (page /c/:slug et scanner). */
  async function fetchBySlug(slug: string) {
    const { data, error } = await supabase.from("cards").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
    if (error) throw new Error(error.message);
    return data as Card | null;
  }

  return { entries, loaded, load, add, update, remove, sendBack, findByCard, fetchBySlug };
}

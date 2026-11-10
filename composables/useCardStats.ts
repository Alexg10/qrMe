export const STATS_DAYS = 30;

export interface DaySeries {
  scans: number[];
  adds: number[];
}

/** Clé jour (AAAA-MM-JJ) des N derniers jours, du plus ancien à aujourd'hui. */
export function lastDays(n = STATS_DAYS) {
  const out: string[] = [];
  const d = new Date();
  for (let k = n - 1; k >= 0; k--) {
    const x = new Date(d);
    x.setDate(d.getDate() - k);
    out.push(x.toLocaleDateString("sv-SE")); // format ISO local
  }
  return out;
}

/** Stats de mes cartes sur 30 jours : séries par jour, totaux, cartes reçues en retour. */
export function useCardStats() {
  const supabase = useSupabaseClient();
  const byCard = useState<Record<string, DaySeries>>("stats-by-card", () => ({}));
  const received = useState("stats-received", () => 0);
  const days = useState("stats-days", () => lastDays());

  async function load() {
    days.value = lastDays();
    const [{ data, error }, ret] = await Promise.all([
      supabase.rpc("my_card_stats", { p_days: STATS_DAYS } as never),
      supabase.rpc("my_received_returns", { p_days: STATS_DAYS } as never),
    ]);
    if (error) throw new Error(error.message);
    const index = new Map(days.value.map((d, i) => [d, i]));
    const out: Record<string, DaySeries> = {};
    for (const row of (data as { card_id: string; day: string; scans: number; adds: number; returns: number }[]) || []) {
      const i = index.get(row.day);
      if (i === undefined) continue;
      const s = (out[row.card_id] ||= { scans: Array(STATS_DAYS).fill(0), adds: Array(STATS_DAYS).fill(0) });
      s.scans[i] += row.scans;
      s.adds[i] += row.adds + row.returns;
    }
    byCard.value = out;
    received.value = (ret.data as number) || 0;
  }

  const totals = computed(() => {
    const t: Record<string, { scans: number; adds: number; last: number }> = {};
    for (const [id, s] of Object.entries(byCard.value)) {
      let last = -1;
      s.scans.forEach((v, k) => v && (last = k));
      t[id] = { scans: s.scans.reduce((a, b) => a + b, 0), adds: s.adds.reduce((a, b) => a + b, 0), last };
    }
    return t;
  });

  return { byCard, totals, received, days, load };
}

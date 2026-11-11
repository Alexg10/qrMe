<script setup lang="ts">
definePageMeta({ layout: "dashboard" });
useHead({ title: "Stats · qrMe" });

const { cards } = useMyCards();
const { byCard, totals, received, days, load } = useCardStats();
const progress = useProgress();
const { level, best, xp, nextAt, ratio } = progress;
const toNext = computed(() => (nextAt.value == null ? 0 : nextAt.value - best.value));
const ladder = computed(() =>
  LEVELS.map((at, i) => ({ n: i + 1, at, items: i === 0 ? "Les 7 couleurs classiques" : unlockSummary(i + 1) })),
);
const sel = ref<string | null>(null); // null = toutes les cartes
const loading = ref(true);
const errorMsg = ref("");

onMounted(async () => {
  progress.load(true).catch(() => {});
  try {
    await load();
  } catch (e) {
    errorMsg.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
});

const zero = () => Array(STATS_DAYS).fill(0) as number[];
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const series = computed<DaySeries>(() => {
  if (sel.value) return byCard.value[sel.value] || { scans: zero(), adds: zero() };
  const s = { scans: zero(), adds: zero() };
  for (const v of Object.values(byCard.value)) v.scans.forEach((n, k) => { s.scans[k] += n; s.adds[k] += v.adds[k]; });
  return s;
});
const S = computed(() => sum(series.value.scans));
const A = computed(() => sum(series.value.adds));
const trend = computed(() => {
  const p1 = sum(series.value.scans.slice(0, 15));
  const p2 = sum(series.value.scans.slice(15));
  return p1 ? Math.round(((p2 - p1) / p1) * 100) : null;
});
const label = (k: number) => {
  const [, m, d] = (days.value[k] || "").split("-");
  return `${d}.${m}`;
};
const peak = computed(() => {
  const mx = Math.max(...series.value.scans);
  return mx ? `Pic : ${mx} scan${mx > 1 ? "s" : ""} le ${label(series.value.scans.indexOf(mx))}` : "";
});

/* ---------- histogramme ---------- */
const chart = ref<HTMLElement>();
const W = ref(720);
const H = 240, L = 34, R = 8, T = 14, B = 28;
let ro: ResizeObserver | undefined;
onMounted(() => {
  ro = new ResizeObserver(([e]) => (W.value = Math.max(320, Math.round(e.contentRect.width))));
  if (chart.value) ro.observe(chart.value);
});
onBeforeUnmount(() => ro?.disconnect());

const geo = computed(() => {
  const mx = [2, 4, 5, 10, 15, 20, 25, 30, 40, 50, 100].find((s) => s >= Math.max(1, ...series.value.scans)) || Math.ceil(Math.max(...series.value.scans) / 50) * 50;
  const iw = W.value - L - R, ih = H - T - B, bw = iw / STATS_DAYS;
  const y = (v: number) => T + ih - (v / mx) * ih;
  const bars = series.value.scans.map((v, k) => {
    const x = L + k * bw + 1, w = Math.max(2, bw - 2), h = (ih * v) / mx, r = Math.min(4, w / 2, h);
    return { k, v, x, w, d: v ? `M${x},${T + ih} v${-(h - r)} q0,${-r} ${r},${-r} h${w - 2 * r} q${r},0 ${r},${r} v${h - r} z` : "" };
  });
  return { mx, ih, bw, y, bars, ticks: [0, mx / 2, mx] };
});
const hover = ref<number | null>(null);
const tip = computed(() => {
  if (hover.value == null) return null;
  const k = hover.value, g = geo.value;
  const v = series.value.scans[k], a = series.value.adds[k];
  const left = Math.min(Math.max(L + k * g.bw + g.bw / 2, 60), W.value - 60);
  return { left, top: g.y(v), text: `${v} scan${v > 1 ? "s" : ""} · ${a} ajout${a > 1 ? "s" : ""}`, day: label(k) };
});

function spark(a: number[]) {
  const w = 84, h = 22, m = Math.max(1, ...a);
  const pts = a.map((v, k) => [((k / (a.length - 1)) * (w - 6) + 3).toFixed(1), (h - 3 - (v / m) * (h - 6)).toFixed(1)]);
  return { line: pts.map((p) => p.join(",")).join(" "), end: pts[pts.length - 1] };
}
</script>

<template>
  <div>
    <div class="q-head">
      <h1 class="q-h1">Stats</h1>
      <p>Ton niveau, combien de fois tes cartes ont été scannées, et combien de personnes les ont gardées.</p>
    </div>

    <section class="lvlbox" aria-labelledby="lvl-title">
      <div class="lvl-head">
        <h2 id="lvl-title" class="lvl-n">Niv. {{ level }}</h2>
        <div class="lvl-txt">
          <b>{{ best }} échange{{ best > 1 ? "s" : "" }}</b>
          <span v-if="nextAt != null" class="q-note">encore {{ toNext }} pour le Niv. {{ level + 1 }} : {{ unlockSummary(level + 1) }}</span>
          <span v-else class="q-note">Niveau maximum : tout est débloqué.</span>
        </div>
      </div>
      <div class="lvl-bar" role="progressbar" :aria-valuenow="Math.round(ratio * 100)" aria-valuemin="0" aria-valuemax="100" aria-label="Progression vers le niveau suivant"><i :style="{ width: `${ratio * 100}%` }" /></div>
      <p class="q-note">
        1 échange = 1 carte dans ta collection, ou 1 personne qui a ajouté ta carte. Ton niveau ne redescend jamais<template v-if="xp < best"> (tu es à {{ xp }} aujourd'hui, ton meilleur score est gardé)</template>.
      </p>
      <details class="ladder">
        <summary>Voir les 10 niveaux</summary>
        <ol>
          <li v-for="l in ladder" :key="l.n" :class="{ ok: level >= l.n, cur: level === l.n }">
            <span class="ln">Niv. {{ l.n }}</span>
            <span class="at">{{ l.at }}</span>
            <span class="it">{{ l.items }}</span>
          </li>
        </ol>
      </details>
    </section>

    <div class="pick">
      <button type="button" class="q-pill" :class="{ on: !sel }" @click="sel = null">Toutes les cartes</button>
      <button v-for="c in cards" :key="c.id" type="button" class="q-pill" :class="{ on: sel === c.id }" @click="sel = c.id">{{ c.label }}</button>
    </div>

    <p v-if="errorMsg" class="q-error">{{ errorMsg }}</p>

    <div class="kpis">
      <div class="kpi">
        <span class="q-lbl">Scans</span><span class="v">{{ S }}</span>
        <span class="q-note">{{ trend == null ? "30 derniers jours" : `${trend >= 0 ? "+" : ""}${trend} % sur les 15 derniers jours` }}</span>
      </div>
      <div class="kpi"><span class="q-lbl">Ajouts</span><span class="v">{{ A }}</span><span class="q-note">à une collection</span></div>
      <div class="kpi"><span class="q-lbl">Taux d'ajout</span><span class="v">{{ S ? Math.round((A / S) * 100) + " %" : "–" }}</span><span class="q-note">ajouts ÷ scans</span></div>
      <div class="kpi"><span class="q-lbl">Reçues</span><span class="v">{{ received }}</span><span class="q-note">cartes en retour</span></div>
    </div>

    <div class="chart-h">
      <span class="q-lbl">Scans par jour · 30 derniers jours</span>
      <span class="q-note">{{ loading ? "Chargement…" : peak || "Aucun scan sur la période" }}</span>
    </div>
    <div ref="chart" class="chart" @pointerleave="hover = null">
      <svg :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="Scans par jour sur les 30 derniers jours">
        <g v-for="t in geo.ticks" :key="t">
          <line class="grid" :class="{ base: t === 0 }" :x1="L" :x2="W - R" :y1="geo.y(t)" :y2="geo.y(t)" />
          <text :x="L - 8" :y="geo.y(t) + 4" text-anchor="end">{{ t }}</text>
        </g>
        <path v-for="b in geo.bars.filter((b) => b.v)" :key="b.k" class="bar" :class="{ hot: hover === b.k, dim: hover != null && hover !== b.k }" :d="b.d" />
        <template v-for="b in geo.bars" :key="`x${b.k}`">
          <text v-if="b.k % 7 === 1 || b.k === STATS_DAYS - 1" :x="b.x + b.w / 2" :y="H - 8" text-anchor="middle">{{ label(b.k) }}</text>
        </template>
        <rect
          v-for="b in geo.bars"
          :key="`h${b.k}`"
          :x="L + b.k * geo.bw"
          :y="T"
          :width="geo.bw"
          :height="geo.ih"
          fill="transparent"
          @pointerenter="hover = b.k"
        />
      </svg>
      <div v-if="tip" class="tt" :style="{ left: `${(tip.left / W) * 100}%`, top: `${(tip.top / H) * 100}%` }">
        <b>{{ tip.day }}</b><br >{{ tip.text }}
      </div>
    </div>

    <div class="tbl-wrap">
      <table class="tbl">
        <thead>
          <tr><th>Carte</th><th class="num">Scans</th><th class="num">Ajouts</th><th class="num">Taux</th><th>30 jours</th><th>Dernier scan</th></tr>
        </thead>
        <tbody>
          <tr v-for="c in cards" :key="c.id" :class="{ sel: sel === c.id }">
            <td><span class="cname"><span class="dot" :style="{ background: `var(--c-${c.color})` }" />{{ c.label }}</span></td>
            <td class="num">{{ totals[c.id]?.scans ?? 0 }}</td>
            <td class="num">{{ totals[c.id]?.adds ?? 0 }}</td>
            <td class="num">{{ totals[c.id]?.scans ? Math.round((totals[c.id].adds / totals[c.id].scans) * 100) : 0 }} %</td>
            <td>
              <svg class="spark" viewBox="0 0 84 22" width="84" height="22" aria-hidden="true">
                <polyline :points="spark(byCard[c.id]?.scans || zero()).line" fill="none" stroke="var(--paper)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
                <circle :cx="spark(byCard[c.id]?.scans || zero()).end[0]" :cy="spark(byCard[c.id]?.scans || zero()).end[1]" r="2.6" fill="var(--c-jaune)" />
              </svg>
            </td>
            <td class="q-note">{{ (totals[c.id]?.last ?? -1) >= 0 ? label(totals[c.id].last) : "–" }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.lvlbox { display: grid; gap: 12px; padding: 18px; margin-bottom: 28px; border: 1px solid var(--line); background: var(--ink-2); }
.lvl-head { display: flex; align-items: flex-end; gap: 18px; flex-wrap: wrap; }
.lvl-n { margin: 0; font-family: var(--f-display); font-weight: var(--w-display); font-stretch: var(--s-display); font-size: 56px; line-height: 0.85; letter-spacing: -0.03em; color: var(--c-jaune); }
.lvl-txt { display: grid; gap: 2px; min-width: 0; }
.lvl-txt b { font-size: 17px; font-variant-numeric: tabular-nums; }
.lvl-bar { height: 8px; background: var(--line); border-radius: 99px; overflow: hidden; }
.lvl-bar i { display: block; height: 100%; background: var(--c-jaune); border-radius: 99px; transition: width 0.6s ease; }
.lvlbox > .q-note { margin: 0; }
.ladder summary { cursor: pointer; font-weight: 600; font-size: 14px; }
.ladder ol { list-style: none; margin: 10px 0 0; padding: 0; display: grid; }
.ladder li { display: grid; grid-template-columns: 56px 40px minmax(0, 1fr); gap: 10px; padding: 7px 0; border-top: 1px solid var(--line); font-size: 14px; color: var(--faint); }
.ladder li.ok { color: var(--paper); }
.ladder li.cur .ln { color: var(--c-jaune); }
.ladder .ln { font-weight: 700; }
.ladder .at { text-align: right; font-variant-numeric: tabular-nums; }
.pick { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
.kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1px; background: var(--line); border: 1px solid var(--line); margin-bottom: 32px; }
.kpi { background: var(--ink); padding: 16px; display: grid; gap: 6px; min-width: 0; }
.v { font-family: var(--f-display); font-weight: var(--w-display); font-size: 56px; line-height: 0.9; font-variant-numeric: tabular-nums; }
.chart-h { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 10px; }
.chart { position: relative; margin-bottom: 32px; }
.chart svg { display: block; width: 100%; height: auto; }
.chart text { fill: var(--mute); font-family: var(--f-body); font-size: 12px; }
.grid { stroke: var(--line); stroke-width: 1; }
.grid.base { stroke: var(--faint); }
.bar { fill: var(--c-jaune); transition: opacity 0.12s ease; }
.bar.dim { opacity: 0.4; }
.tt { position: absolute; pointer-events: none; background: var(--paper); color: var(--ink); padding: 8px 10px; font-size: 12px; line-height: 1.4; white-space: nowrap; transform: translate(-50%, calc(-100% - 10px)); z-index: 2; }
.tt b { font-family: var(--f-body); font-weight: 600; }
.tbl-wrap { overflow-x: auto; }
.tbl { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; min-width: 560px; }
th { font-family: var(--f-body); font-size: 13px; color: var(--mute); font-weight: 500; text-align: left; padding: 8px; border-bottom: 1.5px solid var(--paper); }
td { padding: 12px 8px; border-bottom: 1px solid var(--line); }
.num { text-align: right; }
tr.sel td { background: var(--ink-2); }
.cname { display: flex; align-items: center; gap: 10px; font-family: var(--f-display); font-weight: var(--w-display); font-size: 20px; }
.dot { width: 14px; height: 20px; flex: none; box-shadow: inset 0 0 0 1px var(--line); }
.spark { display: block; }
@media (max-width: 700px) { .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>

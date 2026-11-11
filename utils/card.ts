import qrcode from "qrcode-generator";

export type CardColor =
  | "jaune" | "vert" | "bleu" | "lilas" | "rouge" | "papier" | "noir"
  | "corail" | "menthe" | "ciel" | "rose" | "sapin" | "nuit"
  | "aurore" | "couchant" | "lagon" | "argent" | "chrome" | "or";
export type CardLayout = "affiche" | "mono" | "typo";
export type CardFinish = "none" | "shine" | "glitter" | "holo" | "neon";
export type CardIntro = "none" | "deal" | "flip" | "reveal" | "burst";

export interface Card {
  id: string;
  user_id: string;
  slug: string;
  label: string;
  first_name: string | null;
  last_name: string | null;
  job: string | null;
  description: string | null;
  tags: string[];
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  linkedin: string | null;
  instagram: string | null;
  youtube: string | null;
  twitch: string | null;
  address: string | null;
  display: CardDisplay;
  color: CardColor;
  layout: CardLayout;
  finish: CardFinish;
  foil: boolean;
  intro: CardIntro;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectionEntry {
  id: string;
  card_id: string;
  note: string | null;
  is_favorite: boolean;
  source: "scan" | "public" | "return";
  created_at: string;
  card: Card;
}

/**
 * Couleurs de carte. `level` = niveau qui la débloque (voir utils/levels.ts), `dark` = texte clair.
 * Les teintes sont dans assets/css/main.css (--c-<valeur>) ; dégradés et métaux y sont des gradients.
 */
export const CARD_COLORS: { value: CardColor; label: string; level: number; group: string; dark?: boolean; metal?: boolean }[] = [
  { value: "jaune", label: "Jaune", level: 1, group: "Classiques" },
  { value: "vert", label: "Vert", level: 1, group: "Classiques" },
  { value: "bleu", label: "Bleu", level: 1, group: "Classiques" },
  { value: "lilas", label: "Lilas", level: 1, group: "Classiques" },
  { value: "rouge", label: "Rouge", level: 1, group: "Classiques" },
  { value: "papier", label: "Papier", level: 1, group: "Classiques" },
  { value: "noir", label: "Noir", level: 1, group: "Classiques", dark: true },
  { value: "corail", label: "Corail", level: 2, group: "Unies" },
  { value: "menthe", label: "Menthe", level: 2, group: "Unies" },
  { value: "ciel", label: "Ciel", level: 2, group: "Unies" },
  { value: "rose", label: "Rose", level: 2, group: "Unies" },
  { value: "sapin", label: "Sapin", level: 4, group: "Unies", dark: true },
  { value: "nuit", label: "Nuit", level: 4, group: "Unies", dark: true },
  { value: "aurore", label: "Aurore", level: 6, group: "Dégradés" },
  { value: "couchant", label: "Couchant", level: 6, group: "Dégradés" },
  { value: "lagon", label: "Lagon", level: 6, group: "Dégradés" },
  { value: "argent", label: "Argent", level: 9, group: "Métal", metal: true },
  { value: "chrome", label: "Chrome", level: 9, group: "Métal", metal: true },
  { value: "or", label: "Or", level: 10, group: "Métal", metal: true },
];
export const colorInfo = (c?: string | null) => CARD_COLORS.find((x) => x.value === c) ?? CARD_COLORS[0];

export const CARD_FINISHES: { value: CardFinish; label: string; level: number }[] = [
  { value: "none", label: "Aucune", level: 1 },
  { value: "shine", label: "Brillance", level: 3 },
  { value: "glitter", label: "Paillettes", level: 5 },
  { value: "holo", label: "Holographique", level: 7 },
  { value: "neon", label: "Néon", level: 10 },
];
export const FOIL_LEVEL = 8;

export const CARD_INTROS: { value: CardIntro; label: string; level: number }[] = [
  { value: "none", label: "Aucune", level: 1 },
  { value: "deal", label: "Donne", level: 4 },
  { value: "flip", label: "Flip", level: 6 },
  { value: "reveal", label: "Révélation", level: 8 },
  { value: "burst", label: "Éclat", level: 10 },
];

export const CARD_LAYOUTS: { value: CardLayout; label: string }[] = [
  { value: "affiche", label: "Affiche" },
  { value: "mono", label: "Monogramme" },
  { value: "typo", label: "Typo" },
];

export const MAX_TAGS = 5;

/** Réseaux sociaux : on accepte un pseudo (@nom) ou un lien complet. Masqués sur la carte par défaut (voir isShown), toujours sur la page publique. */
export const SOCIALS = [
  { key: "linkedin", label: "LinkedIn", base: "https://www.linkedin.com/in/", placeholder: "prenom-nom ou lien" },
  { key: "instagram", label: "Instagram", base: "https://www.instagram.com/", placeholder: "@pseudo" },
  { key: "youtube", label: "YouTube", base: "https://www.youtube.com/@", placeholder: "@chaine" },
  { key: "twitch", label: "Twitch", base: "https://www.twitch.tv/", placeholder: "pseudo" },
] as const;
export type SocialKey = (typeof SOCIALS)[number]["key"];

/** Lien complet vers le profil. */
export function socialUrl(key: SocialKey, value?: string | null) {
  const v = (value || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+\//i.test(v)) return `https://${v}`;
  const base = SOCIALS.find((s) => s.key === key)!.base;
  return base + encodeURI(v.replace(/^@/, "").replace(/^in\//, ""));
}

/** Version courte à afficher : @pseudo, ou le chemin du lien. */
export function socialHandle(key: SocialKey, value?: string | null) {
  const v = (value || "").trim();
  if (!v) return "";
  try {
    let path = decodeURI(new URL(socialUrl(key, v)).pathname).replace(/^\/+|\/+$/g, "");
    if (key === "linkedin") path = path.replace(/^in\//, "");
    if (key === "instagram" && path && !path.includes("/")) path = `@${path}`;
    return path || v;
  } catch {
    return v;
  }
}

/** Réseaux renseignés d'une carte, dans l'ordre d'affichage. */
export function cardSocials(c: Partial<Card>) {
  return SOCIALS.filter((s) => (c[s.key] || "").trim()).map((s) => ({
    key: s.key,
    label: s.label,
    url: socialUrl(s.key, c[s.key]),
    handle: socialHandle(s.key, c[s.key]),
  }));
}

/* ---------- visibilité sur la carte ---------- */

/** Infos qu'on peut afficher ou masquer sur la face de la carte. La page publique et les exports gardent tout. */
export const DISPLAY_KEYS = [
  "first_name", "last_name", "city", "job", "phone", "email", "website", "address",
  "linkedin", "instagram", "youtube", "twitch",
] as const;
export type DisplayKey = (typeof DISPLAY_KEYS)[number];
/** Seuls les choix différents du défaut sont stockés : { linkedin: true, phone: false }. */
export type CardDisplay = Partial<Record<DisplayKey, boolean>>;

const isSocial = (k: DisplayKey) => SOCIALS.some((s) => s.key === k);

/** Par défaut, les infos de profil sont visibles et les réseaux masqués. */
export function isShown(c: Partial<Card>, k: DisplayKey) {
  return c.display?.[k] ?? !isSocial(k);
}

/** Copie de la carte où les infos masquées sont vidées : c'est ce que dessine la carte. */
export function visibleCard<T extends Partial<Card>>(c: T): T {
  const out = { ...c } as Record<string, unknown>;
  for (const k of DISPLAY_KEYS) if (!isShown(c, k)) out[k] = null;
  return out as T;
}

export const EDITABLE_FIELDS = [
  "label", "first_name", "last_name", "job", "description", "tags",
  "city", "phone", "email", "website", "address",
  "linkedin", "instagram", "youtube", "twitch", "display", "color", "layout", "finish", "foil", "intro",
] as const;

export type CardDraft = Pick<Card, (typeof EDITABLE_FIELDS)[number]>;

export function emptyDraft(): CardDraft {
  return {
    label: "Ma carte", first_name: "", last_name: "", job: "", description: "", tags: [],
    city: "", phone: "", email: "", website: "", address: "",
    linkedin: "", instagram: "", youtube: "", twitch: "", display: {}, color: "jaune", layout: "affiche",
    finish: "none", foil: false, intro: "none",
  };
}

export const fullName = (c: Partial<Card>) => [c.first_name, c.last_name].filter(Boolean).join(" ");

let baseUrl = "";
/** Adresse publique d'une carte. BASE_URL si défini, sinon le domaine sur lequel tourne l'app (local, ngrok, Vercel…). */
export function cardUrl(slug: string) {
  let base = baseUrl;
  if (!base) {
    try {
      base = String(useRuntimeConfig().public.baseURL || "") || useRequestURL().origin;
    } catch {
      // Appelé hors d'un contexte Nuxt (ex. gestionnaire d'événement) : on se rabat sur l'origine.
      base = import.meta.client ? window.location.origin : "";
    }
    base = base.replace(/\/$/, "");
    if (import.meta.client) baseUrl = base;
  }
  return `${base}/c/${slug}`;
}

/** QR code en SVG ; les modules prennent currentColor pour suivre la couleur de la carte. */
const qrCache = new Map<string, string>();
export function qrSvg(text: string) {
  const hit = qrCache.get(text);
  if (hit) return hit;
  const q = qrcode(0, "M");
  q.addData(text);
  q.make();
  const n = q.getModuleCount();
  let path = "";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) if (q.isDark(y, x)) path += `M${x} ${y}h1v1h-1z`;
  }
  const svg = `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="${path}"/></svg>`;
  qrCache.set(text, svg);
  return svg;
}

/** Extrait le slug d'une URL qrMe scannée (…/c/abc1234), sinon null. */
export function slugFromScan(text: string): string | null {
  const m = text.trim().match(/\/c\/([a-z0-9]{4,32})\/?(?:[?#].*)?$/i);
  return m ? m[1].toLowerCase() : null;
}

export function parseTags(input: string) {
  return input.split(",").map((t) => t.trim()).filter(Boolean);
}

/* ---------- export ---------- */

const vEsc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

export function toVcard(c: Card, note?: string | null) {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${vEsc(c.last_name || "")};${vEsc(c.first_name || "")};;;`,
    `FN:${vEsc(fullName(c) || c.label)}`,
    c.job && `TITLE:${vEsc(c.job)}`,
    c.phone && `TEL;TYPE=CELL:${c.phone}`,
    c.email && `EMAIL:${c.email}`,
    c.website && `URL:${c.website}`,
    ...cardSocials(c).map((s) => `X-SOCIALPROFILE;TYPE=${s.key}:${s.url}`),
    (c.address || c.city) && `ADR:;;${vEsc(c.address || "")};${vEsc(c.city || "")};;;`,
    note && `NOTE:${vEsc(note)}`,
    `X-QRME:${cardUrl(c.slug)}`,
    "END:VCARD",
  ].filter(Boolean).join("\r\n");
}

const csvCell = (v: unknown) => {
  const s = String(v ?? "");
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCsv(entries: CollectionEntry[]) {
  const head = ["Prénom", "Nom", "Titre", "Ville", "Téléphone", "E-mail", "Site", "Adresse", ...SOCIALS.map((s) => s.label), "Tags", "Note", "Favori", "Ajoutée le", "Lien"];
  const rows = entries.map(({ card: c, note, is_favorite, created_at }) => [
    c.first_name, c.last_name, c.job, c.city, c.phone, c.email, c.website, c.address, ...SOCIALS.map((s) => socialUrl(s.key, c[s.key])),
    c.tags.join(", "), note, is_favorite ? "oui" : "", new Date(created_at).toLocaleDateString("fr-FR"), cardUrl(c.slug),
  ]);
  return [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
}

export function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });

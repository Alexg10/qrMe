import qrcode from "qrcode-generator";

export type CardColor = "jaune" | "vert" | "bleu" | "lilas" | "rouge" | "papier" | "noir";
export type CardLayout = "affiche" | "mono" | "typo";

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
  address: string | null;
  color: CardColor;
  layout: CardLayout;
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

export const CARD_COLORS: { value: CardColor; label: string }[] = [
  { value: "jaune", label: "Jaune" },
  { value: "vert", label: "Vert" },
  { value: "bleu", label: "Bleu" },
  { value: "lilas", label: "Lilas" },
  { value: "rouge", label: "Rouge" },
  { value: "papier", label: "Papier" },
  { value: "noir", label: "Noir" },
];

export const CARD_LAYOUTS: { value: CardLayout; label: string }[] = [
  { value: "affiche", label: "Affiche" },
  { value: "mono", label: "Monogramme" },
  { value: "typo", label: "Typo" },
];

export const MAX_TAGS = 5;

export const EDITABLE_FIELDS = [
  "label", "first_name", "last_name", "job", "description", "tags",
  "city", "phone", "email", "website", "address", "color", "layout",
] as const;

export type CardDraft = Pick<Card, (typeof EDITABLE_FIELDS)[number]>;

export function emptyDraft(): CardDraft {
  return {
    label: "Ma carte", first_name: "", last_name: "", job: "", description: "", tags: [],
    city: "", phone: "", email: "", website: "", address: "", color: "jaune", layout: "affiche",
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
  const head = ["Prénom", "Nom", "Titre", "Ville", "Téléphone", "E-mail", "Site", "Adresse", "Tags", "Note", "Favori", "Ajoutée le", "Lien"];
  const rows = entries.map(({ card: c, note, is_favorite, created_at }) => [
    c.first_name, c.last_name, c.job, c.city, c.phone, c.email, c.website, c.address,
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

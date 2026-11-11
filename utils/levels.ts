/**
 * Niveaux : 1 échange = 1 carte dans ma collection ou 1 personne qui a ajouté une de mes cartes.
 * Le niveau se calcule sur le meilleur score atteint (table progress), il ne redescend jamais.
 * Les paliers et les niveaux requis doivent rester alignés avec level_for_xp / unlock_level (supabase/schema.sql).
 */
import { CARD_COLORS, CARD_FINISHES, CARD_INTROS, FOIL_LEVEL } from "./card";

export const LEVELS = [0, 3, 5, 10, 15, 25, 40, 50, 75, 100];
export const MAX_LEVEL = LEVELS.length;

export const levelFor = (xp: number) => LEVELS.filter((t) => t <= xp).length;
/** Échanges nécessaires pour atteindre ce niveau. */
export const xpFor = (level: number) => LEVELS[Math.min(Math.max(level, 1), MAX_LEVEL) - 1];

export interface Unlock {
  kind: "color" | "finish" | "foil" | "intro";
  value: string;
  label: string;
  level: number;
}

/** Tout ce qui se débloque, du niveau 2 au niveau 10. */
export const UNLOCKS: Unlock[] = [
  ...CARD_COLORS.map((c) => ({ kind: "color" as const, value: c.value, label: c.label, level: c.level })),
  ...CARD_FINISHES.map((f) => ({ kind: "finish" as const, value: f.value, label: f.label, level: f.level })),
  { kind: "foil", value: "true", label: "Foil sur le nom", level: FOIL_LEVEL },
  ...CARD_INTROS.map((i) => ({ kind: "intro" as const, value: i.value, label: `Animation ${i.label}`, level: i.level })),
].filter((u) => u.level > 1);

export const unlocksAt = (level: number) => UNLOCKS.filter((u) => u.level === level);

/** Résumé court d'un niveau : « Corail, Menthe, Ciel, Rose ». */
export const unlockSummary = (level: number) => unlocksAt(level).map((u) => u.label).join(", ");

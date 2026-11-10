-- Ajoute les réseaux sociaux aux cartes (base déjà créée avec schema.sql).
-- À exécuter une fois dans Supabase > SQL Editor.
alter table public.cards
  add column if not exists linkedin  text,
  add column if not exists instagram text,
  add column if not exists youtube   text,
  add column if not exists twitch    text;

notify pgrst, 'reload schema';

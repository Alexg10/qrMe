-- Choix des infos affichées sur la face de la carte (base déjà créée avec schema.sql).
-- Ne contient que les écarts au défaut : { "linkedin": true, "phone": false }.
-- Par défaut : infos de profil visibles, réseaux masqués.
-- À exécuter une fois dans Supabase > SQL Editor.
alter table public.cards
  add column if not exists display jsonb not null default '{}'::jsonb;

notify pgrst, 'reload schema';

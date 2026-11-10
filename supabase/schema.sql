-- qrMe — schéma Supabase
-- À exécuter en entier dans Supabase > SQL Editor sur un projet neuf.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Cartes : un utilisateur peut en avoir plusieurs. Tous les champs sont optionnels.
-- ---------------------------------------------------------------------------
create table public.cards (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slug        text not null unique default lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 7)),
  label       text not null default 'Ma carte',          -- nom interne : Pro, Perso…
  first_name  text,
  last_name   text,
  job         text,
  description text check (char_length(description) <= 140),
  tags        text[] not null default '{}' check (cardinality(tags) <= 5),
  city        text,
  phone       text,
  email       text,
  website     text,
  address     text,
  linkedin    text,                                    -- réseaux : pseudo ou lien complet
  instagram   text,
  youtube     text,
  twitch      text,
  color       text not null default 'jaune'
              check (color in ('jaune', 'vert', 'bleu', 'lilas', 'rouge', 'papier', 'noir')),
  layout      text not null default 'affiche'
              check (layout in ('affiche', 'mono', 'typo')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index cards_user_idx on public.cards (user_id);

-- ---------------------------------------------------------------------------
-- Collection : les cartes des autres qu'un utilisateur a gardées.
-- ---------------------------------------------------------------------------
create table public.collection (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  card_id     uuid not null references public.cards (id) on delete cascade,
  note        text,
  is_favorite boolean not null default false,
  source      text not null default 'scan' check (source in ('scan', 'public', 'return')),
  created_at  timestamptz not null default now(),
  unique (user_id, card_id)
);
create index collection_user_idx on public.collection (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Événements pour les stats : scan (page publique vue), add (ajout), return (envoi en retour).
-- ---------------------------------------------------------------------------
create table public.card_events (
  id         bigint generated always as identity primary key,
  card_id    uuid not null references public.cards (id) on delete cascade,
  type       text not null check (type in ('scan', 'add', 'return')),
  created_at timestamptz not null default now()
);
create index card_events_card_idx on public.card_events (card_id, created_at);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

create trigger cards_touch before update on public.cards
  for each row execute function public.touch_updated_at();

-- Chaque ajout à une collection compte comme un événement « add » (ou « return »).
create function public.log_collection_add() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into card_events (card_id, type)
  values (new.card_id, case when new.source = 'return' then 'return' else 'add' end);
  return new;
end $$;

create trigger collection_log after insert on public.collection
  for each row execute function public.log_collection_add();

-- On ne peut pas collectionner sa propre carte.
create function public.forbid_own_card() returns trigger language plpgsql as $$
begin
  if exists (select 1 from cards where id = new.card_id and user_id = new.user_id) then
    raise exception 'Tu ne peux pas ajouter ta propre carte à ta collection';
  end if;
  return new;
end $$;

create trigger collection_not_own before insert on public.collection
  for each row execute function public.forbid_own_card();

-- ---------------------------------------------------------------------------
-- Fonctions appelées par l'app
-- ---------------------------------------------------------------------------

-- Compte un scan de la page publique (appelable sans compte).
create function public.record_scan(p_slug text) returns void
language sql security definer set search_path = public as $$
  insert into card_events (card_id, type)
  select id, 'scan' from cards where slug = p_slug and is_active;
$$;

-- Envoie ma carte en retour : l'ajoute à la collection du propriétaire de la carte que je viens de garder.
create function public.send_card_back(p_my_card uuid, p_their_card uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_target uuid;
begin
  if not exists (select 1 from cards where id = p_my_card and user_id = auth.uid()) then
    raise exception 'Cette carte ne t''appartient pas';
  end if;
  select user_id into v_target from cards where id = p_their_card;
  if v_target is null or v_target = auth.uid() then
    raise exception 'Destinataire introuvable';
  end if;
  insert into collection (user_id, card_id, source)
  values (v_target, p_my_card, 'return')
  on conflict (user_id, card_id) do nothing;
end $$;

-- Stats par jour pour mes cartes.
create function public.my_card_stats(p_days int default 30)
returns table (card_id uuid, day date, scans int, adds int, returns int)
language sql stable security definer set search_path = public as $$
  select e.card_id,
         (e.created_at at time zone 'Europe/Paris')::date as day,
         count(*) filter (where e.type = 'scan')::int,
         count(*) filter (where e.type = 'add')::int,
         count(*) filter (where e.type = 'return')::int
  from card_events e
  join cards c on c.id = e.card_id and c.user_id = auth.uid()
  where e.created_at >= now() - make_interval(days => p_days)
  group by 1, 2
  order by 2;
$$;

-- Nombre de cartes reçues en retour par l'utilisateur.
create function public.my_received_returns(p_days int default 30) returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from collection
  where user_id = auth.uid() and source = 'return'
    and created_at >= now() - make_interval(days => p_days);
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.cards       enable row level security;
alter table public.collection  enable row level security;
alter table public.card_events enable row level security;

-- Une carte active est publique (c'est le but du QR). Le propriétaire voit aussi ses cartes désactivées.
create policy cards_read on public.cards for select
  using (is_active or user_id = auth.uid());
create policy cards_insert on public.cards for insert
  with check (user_id = auth.uid());
create policy cards_update on public.cards for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy cards_delete on public.cards for delete
  using (user_id = auth.uid());

create policy collection_own on public.collection for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Les événements ne sont lisibles que via my_card_stats ; aucune écriture directe.
create policy events_owner_read on public.card_events for select
  using (exists (select 1 from cards c where c.id = card_id and c.user_id = auth.uid()));

grant execute on function public.record_scan(text) to anon, authenticated;
grant execute on function public.send_card_back(uuid, uuid) to authenticated;
grant execute on function public.my_card_stats(int) to authenticated;
grant execute on function public.my_received_returns(int) to authenticated;

-- Recharge le cache de l'API pour que les nouvelles tables soient visibles tout de suite.
notify pgrst, 'reload schema';

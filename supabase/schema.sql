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
  display     jsonb not null default '{}'::jsonb,          -- infos affichées sur la carte : écarts au défaut (profil visible, réseaux masqués)
  color       text not null default 'jaune'
              check (color in ('jaune', 'vert', 'bleu', 'lilas', 'rouge', 'papier', 'noir',
                               'corail', 'menthe', 'ciel', 'rose', 'sapin', 'nuit',
                               'aurore', 'couchant', 'lagon', 'argent', 'chrome', 'or')),
  layout      text not null default 'affiche'
              check (layout in ('affiche', 'mono', 'typo')),
  finish      text not null default 'none'                -- finition débloquée par niveau
              check (finish in ('none', 'shine', 'glitter', 'holo', 'neon')),
  foil        boolean not null default false,             -- foil sur le nom (Niv. 8)
  intro       text not null default 'none'                -- animation SHOWme
              check (intro in ('none', 'deal', 'flip', 'reveal', 'burst')),
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
-- Progression : meilleur score atteint (le niveau ne redescend jamais).
-- ---------------------------------------------------------------------------
create table public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  best_xp    int not null default 0,
  updated_at timestamptz not null default now()
);

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
-- Niveaux
-- ---------------------------------------------------------------------------
-- Échanges = cartes dans ma collection + ajouts de mes cartes par les autres (scan, page publique ou retour).
create function public.current_xp(p_user uuid) returns int
language sql stable security definer set search_path = public as $$
  select (select count(*) from collection where user_id = p_user)::int
       + (select count(*) from card_events e join cards c on c.id = e.card_id
          where c.user_id = p_user and e.type in ('add', 'return'))::int;
$$;

-- Paliers : Niv. 1 à 10. Doit rester aligné avec LEVELS dans utils/levels.ts.
create function public.level_for_xp(p_xp int) returns int
language sql immutable as $$
  select count(*)::int from unnest(array[0, 3, 5, 10, 15, 25, 40, 50, 75, 100]) t where t <= p_xp;
$$;

-- Niveau requis par un élément. Doit rester aligné avec utils/levels.ts.
create function public.unlock_level(p_kind text, p_value text) returns int
language sql immutable as $$
  select case p_kind
    when 'color' then case p_value
      when 'corail' then 2 when 'menthe' then 2 when 'ciel' then 2 when 'rose' then 2
      when 'sapin' then 4 when 'nuit' then 4
      when 'aurore' then 6 when 'couchant' then 6 when 'lagon' then 6
      when 'argent' then 9 when 'chrome' then 9
      when 'or' then 10
      else 1 end
    when 'finish' then case p_value
      when 'shine' then 3 when 'glitter' then 5 when 'holo' then 7 when 'neon' then 10
      else 1 end
    when 'foil' then case p_value when 'true' then 8 else 1 end
    when 'intro' then case p_value
      when 'deal' then 4 when 'flip' then 6 when 'reveal' then 8 when 'burst' then 10
      else 1 end
    else 1 end;
$$;

-- Recalcule le score et enregistre le meilleur. Interne : pas appelable depuis l'API.
create function public.refresh_progress(p_user uuid) returns int
language sql security definer set search_path = public as $$
  insert into progress (user_id, best_xp) values (p_user, current_xp(p_user))
  on conflict (user_id) do update
    set best_xp = greatest(progress.best_xp, excluded.best_xp),
        updated_at = case when excluded.best_xp > progress.best_xp then now() else progress.updated_at end
  returning best_xp;
$$;
revoke execute on function public.current_xp(uuid) from public, anon, authenticated;
revoke execute on function public.refresh_progress(uuid) from public, anon, authenticated;

-- Ma progression : échanges actuels et meilleur score (celui qui fixe le niveau).
create function public.my_progress() returns table (xp int, best_xp int)
language sql security definer set search_path = public as $$
  select current_xp(auth.uid()), refresh_progress(auth.uid()) where auth.uid() is not null;
$$;
grant execute on function public.my_progress() to authenticated;

-- 3. On ne peut pas choisir un élément au-dessus de son niveau (même en passant par l'API).
create function public.check_card_unlocks() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_level int;
  v_need int;
begin
  if tg_op = 'UPDATE'
     and new.color = old.color and new.finish = old.finish
     and new.foil = old.foil and new.intro = old.intro then
    return new;
  end if;
  v_level := level_for_xp(refresh_progress(new.user_id));
  v_need := greatest(
    case when tg_op = 'INSERT' or new.color  <> old.color  then unlock_level('color',  new.color)       else 1 end,
    case when tg_op = 'INSERT' or new.finish <> old.finish then unlock_level('finish', new.finish)      else 1 end,
    case when tg_op = 'INSERT' or new.foil   <> old.foil   then unlock_level('foil',   new.foil::text)  else 1 end,
    case when tg_op = 'INSERT' or new.intro  <> old.intro  then unlock_level('intro',  new.intro)       else 1 end
  );
  if v_need > v_level then
    raise exception 'Ce style se débloque au Niv. % (tu es Niv. %)', v_need, v_level;
  end if;
  return new;
end $$;

create trigger cards_unlocks before insert or update on public.cards
  for each row execute function public.check_card_unlocks();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.cards       enable row level security;
alter table public.collection  enable row level security;
alter table public.card_events enable row level security;
alter table public.progress    enable row level security;

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

-- La progression s'écrit seulement via my_progress / le trigger des cartes.
create policy progress_own_read on public.progress for select
  using (user_id = auth.uid());

grant execute on function public.record_scan(text) to anon, authenticated;
grant execute on function public.send_card_back(uuid, uuid) to authenticated;
grant execute on function public.my_card_stats(int) to authenticated;
grant execute on function public.my_received_returns(int) to authenticated;

-- Recharge le cache de l'API pour que les nouvelles tables soient visibles tout de suite.
notify pgrst, 'reload schema';

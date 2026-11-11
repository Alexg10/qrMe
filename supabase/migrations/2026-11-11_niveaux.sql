-- Niveaux : nouvelles couleurs, finitions et animations débloquées en échangeant des cartes.
-- À exécuter une fois dans Supabase > SQL Editor (base déjà créée avec schema.sql).

-- 1. Cartes : nouvelles couleurs, finition, foil sur le nom, animation SHOWme.
alter table public.cards drop constraint if exists cards_color_check;
alter table public.cards add constraint cards_color_check check (color in (
  'jaune', 'vert', 'bleu', 'lilas', 'rouge', 'papier', 'noir',
  'corail', 'menthe', 'ciel', 'rose', 'sapin', 'nuit',
  'aurore', 'couchant', 'lagon', 'argent', 'chrome', 'or'
));
alter table public.cards
  add column if not exists finish text not null default 'none'
    check (finish in ('none', 'shine', 'glitter', 'holo', 'neon')),
  add column if not exists foil boolean not null default false,
  add column if not exists intro text not null default 'none'
    check (intro in ('none', 'deal', 'flip', 'reveal', 'burst'));

-- 2. Progression : on garde le meilleur score atteint, le niveau ne redescend jamais.
create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  best_xp    int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.progress enable row level security;
drop policy if exists progress_own_read on public.progress;
create policy progress_own_read on public.progress for select using (user_id = auth.uid());

-- Échanges = cartes dans ma collection + ajouts de mes cartes par les autres (scan, page publique ou retour).
create or replace function public.current_xp(p_user uuid) returns int
language sql stable security definer set search_path = public as $$
  select (select count(*) from collection where user_id = p_user)::int
       + (select count(*) from card_events e join cards c on c.id = e.card_id
          where c.user_id = p_user and e.type in ('add', 'return'))::int;
$$;

-- Paliers : Niv. 1 à 10. Doit rester aligné avec LEVELS dans utils/levels.ts.
create or replace function public.level_for_xp(p_xp int) returns int
language sql immutable as $$
  select count(*)::int from unnest(array[0, 3, 5, 10, 15, 25, 40, 50, 75, 100]) t where t <= p_xp;
$$;

-- Niveau requis par un élément. Doit rester aligné avec utils/levels.ts.
create or replace function public.unlock_level(p_kind text, p_value text) returns int
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
create or replace function public.refresh_progress(p_user uuid) returns int
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
create or replace function public.my_progress() returns table (xp int, best_xp int)
language sql security definer set search_path = public as $$
  select current_xp(auth.uid()), refresh_progress(auth.uid()) where auth.uid() is not null;
$$;
grant execute on function public.my_progress() to authenticated;

-- 3. On ne peut pas choisir un élément au-dessus de son niveau (même en passant par l'API).
create or replace function public.check_card_unlocks() returns trigger
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

drop trigger if exists cards_unlocks on public.cards;
create trigger cards_unlocks before insert or update on public.cards
  for each row execute function public.check_card_unlocks();

notify pgrst, 'reload schema';

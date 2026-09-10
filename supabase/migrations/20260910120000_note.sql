-- Notas del proyecto
--
-- Apuntes propios: ideas, qué se cambió y por qué, qué queda pendiente. Un
-- número sin explicación envejece mal — dentro de seis meses, «en agosto
-- perdimos 47 seguidores» no dice nada, pero «en agosto pausamos los Reels dos
-- semanas» lo explica entero.
--
-- Atarlas a un mes o a una red es opcional: la mayoría de las notas hablan del
-- proyecto en general.

create table public.notes (
  id       bigint generated always as identity primary key,
  body     text not null check (length(btrim(body)) > 0),
  author   text not null check (length(btrim(author)) > 0),

  -- Todo opcional: una nota puede hablar del panel entero, de una red, de un
  -- mes, o de un mes de una red concreta.
  network  public.network,
  year     smallint check (year between 2000 and 2100),
  month    smallint check (month between 1 and 12),

  -- Una nota se desactiva cuando deja de aplicar, pero no se borra: el
  -- contexto de por qué pasó algo sigue teniendo valor meses después.
  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Un mes sin año no identifica nada.
  constraint notes_month_needs_year check (month is null or year is not null)
);

create index notes_period_idx on public.notes (year, month);
create index notes_recent_idx on public.notes (active, created_at desc);

create trigger notes_touch_updated_at
  before update on public.notes
  for each row execute function public.touch_updated_at();

comment on table public.notes is
  'Apuntes del proyecto. Opcionalmente atados a un mes y a una red.';


-- ---------------------------------------------------------------------------
-- Mismo trato que el resto: se escribe y se corrige, nunca se borra
-- ---------------------------------------------------------------------------

create table public.notes_history (
  id         bigint generated always as identity primary key,
  note_id    bigint not null,
  changed_at timestamptz not null default now(),
  operation  text not null check (operation in ('update', 'delete')),
  previous   jsonb not null
);

create index notes_history_note_idx on public.notes_history (note_id, changed_at desc);

create or replace function public.archive_note()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notes_history (note_id, operation, previous)
  values (old.id, lower(tg_op), to_jsonb(old));
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger notes_archive
  before update or delete on public.notes
  for each row execute function public.archive_note();


alter table public.notes         enable row level security;
alter table public.notes_history enable row level security;

create policy "note lectura fara login"
  on public.notes for select to anon, authenticated using (true);
create policy "note adaugare fara login"
  on public.notes for insert to anon, authenticated with check (true);
create policy "note editare fara login"
  on public.notes for update to anon, authenticated using (true) with check (true);

create policy "istoric note doar citire"
  on public.notes_history for select to anon, authenticated using (true);

-- Sin permiso de borrado, igual que las cifras. Corregir una nota conserva la
-- versión anterior en el histórico; hacerla desaparecer no se puede desde la
-- web, solo desde el panel de Supabase.
revoke delete on public.notes from anon, authenticated;
revoke insert, update, delete on public.notes_history from anon, authenticated;

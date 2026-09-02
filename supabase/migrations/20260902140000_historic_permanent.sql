-- Que los datos no se pierdan nunca
--
-- Hay dos formas de perder un dato: borrando la fila, o pisándola con una
-- corrección. Aquí se cierran las dos.
--
--   1. Se retira el permiso de borrado a nivel de tabla, no solo de política.
--      Aunque mañana alguien creara una política de `delete` por error, el
--      permiso ya no existe y Postgres seguiría denegándolo.
--
--   2. Cada modificación guarda la versión anterior completa en una tabla de
--      histórico. Corregir una cifra deja de destruir la anterior: queda
--      registrada con su fecha, y siempre se puede saber qué decía antes.
--
-- Las tablas de histórico son de solo lectura para la aplicación: se escriben
-- solas desde un disparador y nadie puede modificarlas ni vaciarlas.


-- ---------------------------------------------------------------------------
-- 1. Sin permiso de borrado
-- ---------------------------------------------------------------------------

revoke delete on public.campaigns     from anon, authenticated;
revoke delete on public.monthly_stats from anon, authenticated;

-- Borrar sigue siendo posible desde el panel de Supabase o con la clave
-- `service_role`, donde hace falta iniciar sesión de verdad. Eso es a
-- propósito: tiene que existir una forma de arreglar un desastre, pero no
-- desde la web.


-- ---------------------------------------------------------------------------
-- 2. Histórico de cambios
-- ---------------------------------------------------------------------------

create table public.monthly_stats_history (
  id          bigint generated always as identity primary key,
  stats_id    bigint not null,
  changed_at  timestamptz not null default now(),
  operation   text not null check (operation in ('update', 'delete')),
  previous    jsonb not null
);

create index monthly_stats_history_stats_idx
  on public.monthly_stats_history (stats_id, changed_at desc);

create table public.campaigns_history (
  id          bigint generated always as identity primary key,
  campaign_id bigint not null,
  changed_at  timestamptz not null default now(),
  operation   text not null check (operation in ('update', 'delete')),
  previous    jsonb not null
);

create index campaigns_history_campaign_idx
  on public.campaigns_history (campaign_id, changed_at desc);

comment on table public.monthly_stats_history is
  'Versión anterior de cada fila modificada o borrada. Solo escribe el disparador.';
comment on table public.campaigns_history is
  'Versión anterior de cada campaña modificada o borrada. Solo escribe el disparador.';


-- El disparador guarda la fila COMPLETA tal como estaba antes del cambio, en
-- JSON, para que siga sirviendo aunque mañana se añadan columnas nuevas.

create or replace function public.archive_monthly_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.monthly_stats_history (stats_id, operation, previous)
  values (old.id, lower(tg_op), to_jsonb(old));
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create or replace function public.archive_campaign()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.campaigns_history (campaign_id, operation, previous)
  values (old.id, lower(tg_op), to_jsonb(old));
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger monthly_stats_archive
  before update or delete on public.monthly_stats
  for each row execute function public.archive_monthly_stats();

create trigger campaigns_archive
  before update or delete on public.campaigns
  for each row execute function public.archive_campaign();


-- ---------------------------------------------------------------------------
-- 3. El histórico se lee, no se toca
-- ---------------------------------------------------------------------------

alter table public.monthly_stats_history enable row level security;
alter table public.campaigns_history     enable row level security;

create policy "istoric lunar doar citire"
  on public.monthly_stats_history for select to anon, authenticated using (true);
create policy "istoric campanii doar citire"
  on public.campaigns_history for select to anon, authenticated using (true);

-- Ni insertar, ni modificar, ni borrar: sin política, la seguridad a nivel de
-- fila lo deniega. El disparador escribe con `security definer`, así que no
-- necesita permisos de la aplicación.
revoke insert, update, delete on public.monthly_stats_history from anon, authenticated;
revoke insert, update, delete on public.campaigns_history     from anon, authenticated;

-- FrescoVerde · esquema inicial del panel de redes sociales
--
-- Dos orígenes de datos distintos, como en la realidad:
--
--   campaigns      lo que dice el administrador de anuncios (gasto y resultados)
--   monthly_stats  lo que dicen las apps de Instagram y TikTok cada mes
--
-- Nada se guarda dos veces. Todo lo que se puede deducir —los totales de
-- interacciones, la comunidad al inicio del mes, el gasto mensual de una red—
-- se calcula en la vista `monthly_metrics`, así que es imposible que el detalle
-- y el resumen se contradigan.
--
-- Los porcentajes se guardan tal como los muestra la app (es el dato de origen)
-- y la vista los convierte a recuentos, que son los que sí se pueden sumar
-- entre meses. Promediar porcentajes de meses distintos daría cifras falsas.

create type public.network as enum ('instagram', 'tiktok');

create type public.campaign_objective as enum (
  'urmaritori',    -- Urmăritori noi
  'interactiune',  -- Interacțiune
  'notorietate',   -- Notorietate
  'trafic'         -- Trafic
);

create type public.campaign_status as enum (
  'planificata',   -- Planificată
  'activa',        -- Activă
  'in_pauza',      -- În pauză
  'finalizata'     -- Finalizată
);

-- Marca de tiempo de última modificación, para saber qué se tocó y cuándo.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ---------------------------------------------------------------------------
-- Campañas de publicidad
-- ---------------------------------------------------------------------------

create table public.campaigns (
  id          bigint generated always as identity primary key,
  name        text not null check (length(btrim(name)) > 0),
  network     public.network not null,
  objective   public.campaign_objective not null,
  status      public.campaign_status not null default 'planificata',

  year        smallint not null check (year between 2000 and 2100),
  month       smallint not null check (month between 1 and 12),
  start_day   smallint not null default 1  check (start_day between 1 and 31),
  days        smallint not null default 14 check (days between 1 and 31),

  spend            numeric(12,2) not null default 0 check (spend >= 0),
  impressions      bigint        not null default 0 check (impressions >= 0),
  reach            bigint        not null default 0 check (reach >= 0),
  clicks           bigint        not null default 0 check (clicks >= 0),
  followers_gained integer       not null default 0 check (followers_gained >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Un embudo no puede ensancharse: menos gente alcanzada que impresiones,
  -- menos clics que impresiones y menos seguidores que clics.
  constraint campaigns_reach_within_impressions  check (reach <= impressions),
  constraint campaigns_clicks_within_impressions check (clicks <= impressions),
  constraint campaigns_followers_within_clicks   check (followers_gained <= clicks),

  -- Una campaña que aún no ha empezado no puede tener resultados.
  constraint campaigns_planned_has_no_results check (
    status <> 'planificata'
    or (spend = 0 and impressions = 0 and reach = 0 and clicks = 0 and followers_gained = 0)
  ),

  constraint campaigns_period_within_month check (start_day + days <= 32)
);

create index campaigns_period_idx on public.campaigns (network, year, month);

create trigger campaigns_touch_updated_at
  before update on public.campaigns
  for each row execute function public.touch_updated_at();

comment on table public.campaigns is
  'Campañas de publicidad. La inversión mensual de una red es la suma de sus campañas.';


-- ---------------------------------------------------------------------------
-- Estadísticas mensuales de las apps
-- ---------------------------------------------------------------------------
--
-- Cada red publica un conjunto de campos DISTINTO, así que las columnas que
-- solo reporta una van como NULL en la otra, y hay una restricción por red que
-- lo verifica. Es la misma regla que aplica el panel al agregar.

create table public.monthly_stats (
  id      bigint generated always as identity primary key,
  network public.network not null,
  year    smallint not null check (year between 2000 and 2100),
  month   smallint not null check (month between 1 and 12),

  -- Comunes a las dos redes
  views          bigint  not null check (views >= 0),
  profile_visits bigint  not null check (profile_visits >= 0),
  followers      integer not null check (followers >= 0),
  comments       integer not null check (comments >= 0),

  -- Solo Instagram
  views_followers_pct     numeric(5,2) check (views_followers_pct     between 0 and 100),
  views_non_followers_pct numeric(5,2) check (views_non_followers_pct between 0 and 100),
  views_posts_pct         numeric(5,2) check (views_posts_pct         between 0 and 100),
  views_reels_pct         numeric(5,2) check (views_reels_pct         between 0 and 100),
  views_stories_pct       numeric(5,2) check (views_stories_pct       between 0 and 100),
  link_taps         integer  check (link_taps >= 0),
  post_likes        integer  check (post_likes >= 0),
  post_shares       integer  check (post_shares >= 0),
  reel_likes        integer  check (reel_likes >= 0),
  reel_shares       integer  check (reel_shares >= 0),
  saves             integer  check (saves >= 0),
  content_published smallint check (content_published >= 0),
  follows           integer  check (follows >= 0),
  unfollows         integer  check (unfollows >= 0),

  -- Solo TikTok (publica los totales ya sumados y solo el neto de seguidores)
  views_for_you_pct numeric(5,2) check (views_for_you_pct between 0 and 100),
  views_search_pct  numeric(5,2) check (views_search_pct  between 0 and 100),
  viewers           bigint  check (viewers >= 0),
  new_viewers       bigint  check (new_viewers >= 0),
  likes             integer check (likes >= 0),
  shares            integer check (shares >= 0),
  net_growth        integer,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint monthly_stats_unique_period unique (network, year, month),

  -- Instagram: están todos sus campos y ninguno de los de TikTok.
  constraint monthly_stats_instagram_fields check (
    network <> 'instagram' or (
      views_followers_pct is not null and views_non_followers_pct is not null
      and views_posts_pct is not null and views_reels_pct is not null
      and views_stories_pct is not null and link_taps is not null
      and post_likes is not null and post_shares is not null
      and reel_likes is not null and reel_shares is not null
      and saves is not null and content_published is not null
      and follows is not null and unfollows is not null
      and views_for_you_pct is null and views_search_pct is null
      and viewers is null and new_viewers is null
      and likes is null and shares is null and net_growth is null
    )
  ),

  -- TikTok: están todos los suyos y ninguno de los de Instagram.
  constraint monthly_stats_tiktok_fields check (
    network <> 'tiktok' or (
      views_for_you_pct is not null and views_search_pct is not null
      and viewers is not null and new_viewers is not null
      and likes is not null and shares is not null and net_growth is not null
      and views_followers_pct is null and views_non_followers_pct is null
      and views_posts_pct is null and views_reels_pct is null
      and views_stories_pct is null and link_taps is null
      and post_likes is null and post_shares is null
      and reel_likes is null and reel_shares is null
      and saves is null and content_published is null
      and follows is null and unfollows is null
    )
  ),

  -- Seguidores y no seguidores son las dos únicas opciones: suman 100 %.
  constraint monthly_stats_follower_split check (
    views_followers_pct is null
    or abs(views_followers_pct + views_non_followers_pct - 100) <= 1
  ),

  -- Postări, Reels y Stories cubren todo el alcance de Instagram.
  constraint monthly_stats_format_split check (
    views_posts_pct is null
    or abs(views_posts_pct + views_reels_pct + views_stories_pct - 100) <= 1
  ),

  -- En TikTok el resto llega desde el perfil o el sonido: no suman 100.
  constraint monthly_stats_tiktok_source_split check (
    views_for_you_pct is null or views_for_you_pct + views_search_pct <= 100
  ),

  -- Nadie puede dejar de seguirte más veces de las que te siguieron
  -- históricamente; dentro del mes basta con que no supere la comunidad.
  constraint monthly_stats_unfollows_sane check (unfollows is null or unfollows <= followers),
  constraint monthly_stats_new_viewers_sane check (new_viewers is null or new_viewers <= viewers)
);

create trigger monthly_stats_touch_updated_at
  before update on public.monthly_stats
  for each row execute function public.touch_updated_at();

comment on table public.monthly_stats is
  'Cifras mensuales copiadas de las estadísticas de Instagram y TikTok.';


-- ---------------------------------------------------------------------------
-- Vista: la fila mensual tal como la consume el panel
-- ---------------------------------------------------------------------------
--
-- Aquí es donde se resuelven las diferencias entre redes: Instagram da los
-- componentes y TikTok los totales, así que cada total se toma del que lo
-- publique. Y aquí se juntan las campañas del mes con las estadísticas.

create or replace view public.monthly_metrics as
with campaign_totals as (
  select
    network,
    year,
    month,
    sum(spend)            as spend,
    sum(impressions)      as impressions,
    sum(clicks)           as clicks,
    sum(followers_gained) as paid_followers,
    count(*)              as campaign_count
  from public.campaigns
  group by network, year, month
)
select
  s.network,
  s.year,
  s.month,
  make_date(s.year, s.month, 1) as period,

  -- Audiencia
  s.views,
  s.profile_visits,
  round(s.views * s.views_followers_pct     / 100)::bigint as views_followers,
  round(s.views * s.views_non_followers_pct / 100)::bigint as views_non_followers,
  round(s.views * s.views_posts_pct         / 100)::bigint as views_posts,
  round(s.views * s.views_reels_pct         / 100)::bigint as views_reels,
  round(s.views * s.views_stories_pct       / 100)::bigint as views_stories,
  round(s.views * s.views_for_you_pct       / 100)::bigint as views_for_you,
  round(s.views * s.views_search_pct        / 100)::bigint as views_search,
  s.link_taps,
  s.viewers,
  s.new_viewers,

  -- Interacciones: Instagram las da desglosadas, TikTok ya sumadas.
  coalesce(s.likes,  s.post_likes  + s.reel_likes)  as likes,
  s.comments,
  coalesce(s.shares, s.post_shares + s.reel_shares) as shares,
  s.saves,
  s.post_likes,
  s.post_shares,
  s.reel_likes,
  s.reel_shares,
  s.content_published,
  coalesce(s.likes,  s.post_likes  + s.reel_likes)
    + s.comments
    + coalesce(s.shares, s.post_shares + s.reel_shares)
    + coalesce(s.saves, 0) as interactions,

  -- Crecimiento: TikTok solo publica el neto; Instagram lo deduce.
  s.followers,
  s.follows,
  s.unfollows,
  coalesce(s.net_growth, s.follows - s.unfollows) as net_growth,
  -- La comunidad al inicio del mes es la del cierre del mes anterior. En el
  -- primer mes registrado no hay anterior, así que se deduce hacia atrás.
  coalesce(
    lag(s.followers) over (partition by s.network order by s.year, s.month),
    s.followers - coalesce(s.net_growth, s.follows - s.unfollows)
  ) as followers_start,

  -- Publicidad: siempre la suma de las campañas del mes, nunca un dato aparte.
  coalesce(c.spend, 0)          as spend,
  coalesce(c.impressions, 0)    as impressions,
  coalesce(c.clicks, 0)         as clicks,
  coalesce(c.paid_followers, 0) as paid_followers,
  coalesce(c.campaign_count, 0) as campaign_count

from public.monthly_stats s
left join campaign_totals c
  on c.network = s.network and c.year = s.year and c.month = s.month;

comment on view public.monthly_metrics is
  'Fila mensual lista para el panel: totales derivados y campañas ya agregadas.';


-- ---------------------------------------------------------------------------
-- Seguridad a nivel de fila
-- ---------------------------------------------------------------------------
--
-- Por defecto solo puede leer y escribir quien haya iniciado sesión. Es lo
-- correcto para cifras de negocio: la clave `anon` viaja en el navegador y
-- cualquiera que la tenga podría leer la tabla si se le abre el acceso.
--
-- Mientras el panel no tenga login, si quieres que lea sin autenticarse,
-- descomenta el bloque del final. Léelo antes: abre la lectura a cualquiera
-- que tenga la clave `anon`.

alter table public.campaigns     enable row level security;
alter table public.monthly_stats enable row level security;

-- `for all` ya cubre la lectura: no hace falta una política aparte para select.
create policy "campaigns acceso de usuarios autenticados"
  on public.campaigns for all to authenticated using (true) with check (true);

create policy "monthly_stats acceso de usuarios autenticados"
  on public.monthly_stats for all to authenticated using (true) with check (true);

-- Lectura sin login (solo si aceptas la advertencia de arriba):
--
-- create policy "campaigns lectura publica"
--   on public.campaigns for select to anon using (true);
-- create policy "monthly_stats lectura publica"
--   on public.monthly_stats for select to anon using (true);

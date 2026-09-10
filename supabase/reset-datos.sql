-- Vaciar todos los datos y empezar de cero
--
-- Esto NO es una migración: no se ejecuta sola ni forma parte del esquema. Es
-- una herramienta manual que se pega en el SQL Editor de Supabase cuando se
-- quiere empezar limpio.
--
-- ⚠️  BORRA TODO Y NO SE PUEDE DESHACER. Se lleva por delante también el
--     histórico de cambios, así que después no queda ni rastro de lo anterior.
--
-- Recuerda que la aplicación NO puede hacer esto: el permiso de borrado está
-- retirado para `anon` y `authenticated` a propósito, para que nadie vacíe las
-- tablas desde la web. Aquí funciona porque el SQL Editor se ejecuta como
-- dueño de la base de datos, donde sí hay que iniciar sesión de verdad.
--
-- `restart identity` reinicia los contadores: la siguiente campaña vuelve a
-- ser C-0001.

truncate table
  public.campaigns,
  public.monthly_stats,
  public.campaigns_history,
  public.monthly_stats_history
restart identity;


-- Comprobación: las cuatro tablas deben quedar a cero.
select 'campaigns' as tabla, count(*) as filas from public.campaigns
union all
select 'monthly_stats', count(*) from public.monthly_stats
union all
select 'campaigns_history', count(*) from public.campaigns_history
union all
select 'monthly_stats_history', count(*) from public.monthly_stats_history;

-- Acceso sin inicio de sesión
--
-- El panel lo usan tres personas dentro de la empresa a través de un enlace
-- privado, y se ha decidido no poner login. Eso obliga a abrir el acceso a la
-- clave pública (`anon`), que viaja dentro del JavaScript de la página.
--
-- Conviene tenerlo claro: cualquiera que llegue a la web puede leer esa clave
-- y consultar la base de datos por su cuenta. El enlace privado no lo impide.
--
-- Lo que sí se puede evitar es que ese acceso destruya el histórico, así que
-- aquí se conceden leer, insertar y actualizar, pero NO borrar. Se pueden
-- corregir cifras equivocadas sin que nadie —ni por error ni a propósito—
-- pueda vaciar las tablas. Borrar sigue siendo posible desde el panel de
-- Supabase, donde hace falta iniciar sesión de verdad.

create policy "campaigns lectura sin login"
  on public.campaigns for select to anon using (true);
create policy "campaigns alta sin login"
  on public.campaigns for insert to anon with check (true);
create policy "campaigns edicion sin login"
  on public.campaigns for update to anon using (true) with check (true);

create policy "monthly_stats lectura sin login"
  on public.monthly_stats for select to anon using (true);
create policy "monthly_stats alta sin login"
  on public.monthly_stats for insert to anon with check (true);
create policy "monthly_stats edicion sin login"
  on public.monthly_stats for update to anon using (true) with check (true);

-- Nota: no se crea ninguna política de `delete` para `anon`. Sin política, la
-- seguridad a nivel de fila deniega la operación por defecto.

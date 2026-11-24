-- REBOX - Tabella UNICA per tutto quello che deve essere ONLINE
-- Prodotti, Aste, Pacchi, Password Admin e Impostazioni
-- Incolla in Supabase > SQL Editor > Run (puoi rifarlo, non cancella niente)
create table if not exists rebox_settings (
  id text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);
alter table rebox_settings enable row level security;
-- Rimuovi vecchie policy se ci sono, per non duplicarle
drop policy if exists "leggi quantitativi" on rebox_settings;
drop policy if exists "scrivi quantitativi" on rebox_settings;
drop policy if exists "aggiorna quantitativi" on rebox_settings;
drop policy if exists "leggi tutto" on rebox_settings;
drop policy if exists "scrivi tutto" on rebox_settings;
drop policy if exists "aggiorna tutto" on rebox_settings;
drop policy if exists "cancella tutto" on rebox_settings;
-- Permetti a tutti di LEGGERE (serve per far vedere sito e prodotti ai clienti)
create policy "leggi tutto" on rebox_settings for select using (true);
-- Permetti di SCRIVERE / AGGIORNARE / CANCELLARE con anon key (Admin salva da admin.html)
create policy "scrivi tutto" on rebox_settings for insert with check (true);
create policy "aggiorna tutto" on rebox_settings for update using (true);
create policy "cancella tutto" on rebox_settings for delete using (true);
-- Crea le righe se non esistono ancora (non cancella quelle che hai già)
insert into rebox_settings (id, value) values ('products', '[]'::jsonb) on conflict (id) do nothing;
insert into rebox_settings (id, value) values ('auctions', '[]'::jsonb) on conflict (id) do nothing;
insert into rebox_settings (id, value) values ('box_stocks', '{"small":48,"medium":42,"large":28}'::jsonb) on conflict (id) do nothing;
insert into rebox_settings (id, value) values ('admin_config', '{"pass":"REBOX2026","sbUrl":"","sbKey":"","ppId":"","savedAt":""}'::jsonb) on conflict (id) do nothing;

insert into rebox_settings (id, value) values ('lots', '[]'::jsonb) on conflict (id) do nothing;

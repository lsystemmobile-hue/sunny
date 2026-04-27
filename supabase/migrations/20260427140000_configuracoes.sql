-- Tabela de configurações do simulador (singleton: id sempre = 1)
create table if not exists public.configuracoes (
  id               integer primary key default 1 check (id = 1),
  tarifa_kwh       numeric not null default 0.95,
  kwh_por_modulo   numeric not null default 60,
  kwp_por_modulo   numeric not null default 0.55,
  percentual_economia numeric not null default 0.70,
  custo_por_modulo numeric not null default 2500,
  updated_at       timestamptz not null default now()
);

-- Garante que só exista uma linha
insert into public.configuracoes (id) values (1) on conflict (id) do nothing;

-- RLS
alter table public.configuracoes enable row level security;

-- Qualquer pessoa pode ler (o simulador público precisa dos valores)
create policy "Leitura pública de configuracoes"
  on public.configuracoes for select
  using (true);

-- Somente admin pode atualizar
create policy "Admin pode atualizar configuracoes"
  on public.configuracoes for update
  using (public.has_role(auth.uid(), 'admin'));

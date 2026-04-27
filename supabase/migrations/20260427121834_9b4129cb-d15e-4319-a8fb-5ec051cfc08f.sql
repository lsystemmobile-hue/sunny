-- Enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- user_roles table (separate from any profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- simulacoes table (lead capture)
CREATE TABLE public.simulacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  cidade_estado TEXT NOT NULL,
  tipo_imovel TEXT NOT NULL,
  possui_telhado BOOLEAN NOT NULL,
  valor_conta NUMERIC(10, 2) NOT NULL,
  consumo_kwh NUMERIC(10, 2) NOT NULL,
  modulos INTEGER NOT NULL,
  potencia_kwp NUMERIC(10, 2) NOT NULL,
  economia_mensal NUMERIC(10, 2) NOT NULL,
  economia_anual NUMERIC(10, 2) NOT NULL,
  investimento NUMERIC(10, 2) NOT NULL,
  payback NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.simulacoes ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can insert a simulation
CREATE POLICY "Anyone can create a simulation"
  ON public.simulacoes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read simulations
CREATE POLICY "Admins can view all simulations"
  ON public.simulacoes
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete simulations"
  ON public.simulacoes
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_simulacoes_created_at ON public.simulacoes(created_at DESC);
CREATE INDEX idx_simulacoes_cidade ON public.simulacoes(cidade_estado);
CREATE INDEX idx_simulacoes_tipo ON public.simulacoes(tipo_imovel);
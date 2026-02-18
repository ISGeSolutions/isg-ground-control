
-- ═══════════════════════════════════════════════════════════════
-- 1. ENUM & BASE TABLES
-- ═══════════════════════════════════════════════════════════════

CREATE TYPE public.app_role AS ENUM ('ops_manager', 'ops_exec');

CREATE TYPE public.activity_status AS ENUM (
  'not_started', 'in_progress', 'waiting', 'complete', 'overdue', 'not_applicable'
);

CREATE TYPE public.task_source AS ENUM ('GLOBAL', 'TG', 'TS', 'TD', 'CUSTOM');

CREATE TYPE public.sla_reference_date AS ENUM ('departure', 'return', 'ji_exists');

-- ── Profiles ─────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  locale_language TEXT NOT NULL DEFAULT 'en-GB',
  locale_currency TEXT NOT NULL DEFAULT 'GBP',
  locale_timezone TEXT NOT NULL DEFAULT 'Europe/London',
  locale_date_format TEXT DEFAULT 'dd/MM/yyyy',
  theme_palette TEXT NOT NULL DEFAULT 'ocean',
  theme_mode TEXT NOT NULL DEFAULT 'dark',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── User Roles ───────────────────────────────────────────────
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- ── Destinations ─────────────────────────────────────────────
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Series ───────────────────────────────────────────────────
CREATE TABLE public.series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Activity Templates ───────────────────────────────────────
CREATE TABLE public.activity_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT false,
  critical BOOLEAN NOT NULL DEFAULT false,
  sla_offset_days INT NOT NULL DEFAULT 0,
  reference_date public.sla_reference_date NOT NULL DEFAULT 'departure',
  source public.task_source NOT NULL DEFAULT 'GLOBAL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Departures ───────────────────────────────────────────────
CREATE TABLE public.departures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  return_date DATE,
  ji_sent_date DATE,
  destination_id UUID NOT NULL REFERENCES public.destinations(id),
  destination_code TEXT NOT NULL,
  series_id UUID NOT NULL REFERENCES public.series(id),
  series_code TEXT NOT NULL,
  tour_generic TEXT,
  pax_count INT NOT NULL DEFAULT 0,
  booking_count INT NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  gtd BOOLEAN NOT NULL DEFAULT false,
  ops_manager_id UUID REFERENCES auth.users(id),
  ops_exec_id UUID REFERENCES auth.users(id),
  travel_system_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Activities ───────────────────────────────────────────────
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  departure_id UUID NOT NULL REFERENCES public.departures(id) ON DELETE CASCADE,
  template_code TEXT NOT NULL,
  status public.activity_status NOT NULL DEFAULT 'not_started',
  notes TEXT NOT NULL DEFAULT '',
  due_date DATE NOT NULL,
  source public.task_source NOT NULL DEFAULT 'GLOBAL',
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 2. HELPER FUNCTIONS (SECURITY DEFINER — bypass RLS)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_ops_manager(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'ops_manager');
$$;

CREATE OR REPLACE FUNCTION public.can_access_departure(_departure_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_ops_manager(_user_id)
    OR EXISTS (
      SELECT 1 FROM public.departures
      WHERE id = _departure_id
        AND (ops_manager_id = _user_id OR ops_exec_id = _user_id)
    );
$$;

-- ═══════════════════════════════════════════════════════════════
-- 3. TRIGGERS
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_departures_updated_at BEFORE UPDATE ON public.departures
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_activities_updated_at BEFORE UPDATE ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- 4. ENABLE RLS
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- 5. RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Profiles: any authenticated can read, only owner can update
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- User Roles: own roles readable, managers can insert
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_ops_manager(auth.uid()));
CREATE POLICY "user_roles_insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_ops_manager(auth.uid()) AND user_id != auth.uid());
CREATE POLICY "user_roles_delete" ON public.user_roles FOR DELETE TO authenticated USING (public.is_ops_manager(auth.uid()));

-- Destinations & Series: read by any authenticated
CREATE POLICY "destinations_select" ON public.destinations FOR SELECT TO authenticated USING (true);
CREATE POLICY "destinations_manage" ON public.destinations FOR ALL TO authenticated USING (public.is_ops_manager(auth.uid())) WITH CHECK (public.is_ops_manager(auth.uid()));

CREATE POLICY "series_select" ON public.series FOR SELECT TO authenticated USING (true);
CREATE POLICY "series_manage" ON public.series FOR ALL TO authenticated USING (public.is_ops_manager(auth.uid())) WITH CHECK (public.is_ops_manager(auth.uid()));

-- Activity Templates: read by authenticated, managed by managers
CREATE POLICY "templates_select" ON public.activity_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "templates_manage" ON public.activity_templates FOR ALL TO authenticated USING (public.is_ops_manager(auth.uid())) WITH CHECK (public.is_ops_manager(auth.uid()));

-- Departures: managers see all, execs see assigned
CREATE POLICY "departures_select" ON public.departures FOR SELECT TO authenticated
  USING (public.is_ops_manager(auth.uid()) OR ops_manager_id = auth.uid() OR ops_exec_id = auth.uid());
CREATE POLICY "departures_manage" ON public.departures FOR ALL TO authenticated
  USING (public.is_ops_manager(auth.uid())) WITH CHECK (public.is_ops_manager(auth.uid()));

-- Activities: visible if user can access parent departure, updatable by manager or assigned exec
CREATE POLICY "activities_select" ON public.activities FOR SELECT TO authenticated
  USING (public.can_access_departure(departure_id, auth.uid()));
CREATE POLICY "activities_update" ON public.activities FOR UPDATE TO authenticated
  USING (
    public.is_ops_manager(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.departures d
      WHERE d.id = departure_id AND d.ops_exec_id = auth.uid()
    )
  );
CREATE POLICY "activities_manage" ON public.activities FOR INSERT TO authenticated
  WITH CHECK (public.is_ops_manager(auth.uid()));
CREATE POLICY "activities_delete" ON public.activities FOR DELETE TO authenticated
  USING (public.is_ops_manager(auth.uid()));

-- ═══════════════════════════════════════════════════════════════
-- 6. INDEXES
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX idx_departures_date ON public.departures(date);
CREATE INDEX idx_departures_ops_manager ON public.departures(ops_manager_id);
CREATE INDEX idx_departures_ops_exec ON public.departures(ops_exec_id);
CREATE INDEX idx_departures_series ON public.departures(series_id);
CREATE INDEX idx_activities_departure ON public.activities(departure_id);
CREATE INDEX idx_activities_status ON public.activities(status);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);

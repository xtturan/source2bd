CREATE TABLE public.system_errors (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  message text not null,
  detail text,
  user_id uuid,
  created_at timestamptz not null default now()
);
CREATE INDEX system_errors_created_idx ON public.system_errors (created_at DESC);
CREATE INDEX system_errors_scope_idx ON public.system_errors (scope, created_at DESC);
GRANT ALL ON public.system_errors TO service_role;
ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read system errors" ON public.system_errors FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
GRANT SELECT ON public.system_errors TO authenticated;
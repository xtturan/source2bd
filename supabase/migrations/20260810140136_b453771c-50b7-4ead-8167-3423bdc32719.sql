CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip text,
  user_agent text,
  detail text,
  allowed boolean NOT NULL DEFAULT true,
  reason text
);

CREATE INDEX activity_log_created_at_idx ON public.activity_log (created_at DESC);
CREATE INDEX activity_log_user_idx ON public.activity_log (user_id, created_at DESC);
CREATE INDEX activity_log_ip_idx ON public.activity_log (ip, created_at DESC);
CREATE INDEX activity_log_blocked_idx ON public.activity_log (allowed, created_at DESC);

GRANT SELECT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read activity log"
  ON public.activity_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.abuse_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type text NOT NULL CHECK (subject_type IN ('user', 'ip')),
  subject text NOT NULL,
  reason text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subject_type, subject)
);

GRANT SELECT ON public.abuse_blocks TO authenticated;
GRANT ALL ON public.abuse_blocks TO service_role;
ALTER TABLE public.abuse_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read blocks"
  ON public.abuse_blocks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_abuse_blocks_updated_at
  BEFORE UPDATE ON public.abuse_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.is_blocked(_user_id uuid, _ip text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.abuse_blocks b
    WHERE (b.expires_at IS NULL OR b.expires_at > now())
      AND (
        (b.subject_type = 'user' AND _user_id IS NOT NULL AND b.subject = _user_id::text)
        OR (b.subject_type = 'ip' AND _ip IS NOT NULL AND b.subject = _ip)
      )
  )
$$;